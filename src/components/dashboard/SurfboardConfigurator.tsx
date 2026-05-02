import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserDetails, SurfboardSuggestion } from "@/types/userDetails";
import { boardStorage } from "@/lib/boardStorage";
import {
  ArrowLeft,
  CheckCircle,
  HelpCircle,
  User,
  Settings,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import boardReconfigurationService from "@/services/boardReconfigurationService";
import SurfboardViewer from "./SurfboardViewer";

interface SurfboardConfiguratorProps {
  userDetails?: UserDetails;
  suggestion?: SurfboardSuggestion;
  onBack?: () => void;
  boardId?: string;
  isEditMode?: boolean;
}

export default function SurfboardConfigurator({
  userDetails,
  suggestion,
  onBack,
  boardId,
  isEditMode = false,
}: SurfboardConfiguratorProps) {
  const navigate = useNavigate();
  const [boardName, setBoardName] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalBoardData, setOriginalBoardData] = useState<any>(null);
  const [parameters, setParameters] = useState({
    length: suggestion?.length || 180, // cm
    width: suggestion?.width || 50, // cm
    thickness: suggestion?.thickness || 6, // cm
    noseWidth: suggestion?.noseWidth || 30, // cm
    tailWidth: suggestion?.tailWidth || 35, // cm
  });

  const [boardVolume, setBoardVolume] = useState<number | null>(
    suggestion?.boardVolume || null
  );

  const [surfboardColor, setSurfboardColor] = useState("#f5f5dc");
  const [surfboardTexture, setSurfboardTexture] = useState("classic");
  const [fins, setFins] = useState({
    center: true,
    side: false,
    thruster: false,
  });

  // New state for refinement input
  const [refinementInput, setRefinementInput] = useState("");
  const [isRefining, setIsRefining] = useState(false);

  // Load existing board data if in edit mode
  useEffect(() => {
    if (isEditMode && boardId) {
      const savedBoard = boardStorage.getById(boardId);
      if (savedBoard) {
        setBoardName(savedBoard.name);
        setParameters(savedBoard.parameters);
        setSurfboardColor(savedBoard.appearance.color);
        setSurfboardTexture(savedBoard.appearance.texture);
        setFins(savedBoard.appearance.fins);

        // Set board volume if available from suggestion
        if (savedBoard.suggestion?.boardVolume) {
          setBoardVolume(savedBoard.suggestion.boardVolume);
        }

        // Store original data for comparison
        setOriginalBoardData({
          name: savedBoard.name,
          parameters: savedBoard.parameters,
          appearance: savedBoard.appearance,
        });
      }
    } else if (!isEditMode) {
      // Generate default name for new boards only once
      const defaultName = boardStorage.generateName({
        parameters,
        appearance: { color: surfboardColor, texture: surfboardTexture, fins },
      });
      setBoardName(defaultName);
    }
  }, [isEditMode, boardId]);

  // Check for unsaved changes
  useEffect(() => {
    if (isEditMode && originalBoardData) {
      const currentData = {
        name: boardName,
        parameters,
        appearance: { color: surfboardColor, texture: surfboardTexture, fins },
      };

      const hasChanges =
        JSON.stringify(currentData) !== JSON.stringify(originalBoardData);
      setHasUnsavedChanges(hasChanges);
    } else if (!isEditMode) {
      // For new boards, always show as having changes if there's content
      setHasUnsavedChanges(!!boardName.trim());
    }
  }, [
    boardName,
    parameters,
    surfboardColor,
    surfboardTexture,
    fins,
    originalBoardData,
    isEditMode,
  ]);

  const handleSave = () => {
    if (!boardName.trim()) {
      toast.error("Please enter a board name");
      return;
    }

    try {
      const boardData = {
        parameters,
        appearance: {
          color: surfboardColor,
          texture: surfboardTexture,
          fins,
        },
        userDetails,
        suggestion,
      };

      if (isEditMode && boardId) {
        // Update existing board
        const updatedBoard = boardStorage.update(boardId, boardData, boardName);
        if (updatedBoard) {
          toast.success("Board updated successfully!");
          // Update original data to reflect the save
          setOriginalBoardData({
            name: boardName,
            parameters,
            appearance: {
              color: surfboardColor,
              texture: surfboardTexture,
              fins,
            },
          });
          setHasUnsavedChanges(false);
        } else {
          toast.error("Failed to update board");
        }
      } else {
        // Save new board
        const savedBoard = boardStorage.save(boardData, boardName);
        toast.success(`"${boardName}" saved to your collection!`);
        // Navigate to edit mode for this board
        navigate(`/configurator/${savedBoard.id}`);
      }
    } catch (error) {
      console.error("Error saving board:", error);
      toast.error("Failed to save board");
    }
  };

  const handleQuickSave = () => {
    if (hasUnsavedChanges) {
      handleSave();
    }
  };

  const handleRefineBoard = async () => {
    if (!refinementInput.trim()) {
      toast.error("Please enter your refinement requirements");
      return;
    }

    setIsRefining(true);
    try {
      const initialSpecs = {
        boardLength: parameters.length,
        boardWidth: parameters.width,
        boardThickness: parameters.thickness,
        boardType: parameters.length > 210 ? "longboard" : "shortboard", // basic heuristic
      };

      const refinedConfig = await boardReconfigurationService.reconfigure({
        initialSpecs,
        additionalInfo: {
          preference: refinementInput,
        },
      });

      // Update parameters with refined configuration based on the API response format
      const newParameters = { ...parameters };
      let hasChanges = false;

      // Helper to update if value exists
      const updateIfPresent = (key: keyof typeof parameters, val: number | undefined) => {
        if (val !== undefined && val !== null) {
          newParameters[key] = val;
          hasChanges = true;
        }
      };

      updateIfPresent('length', refinedConfig.boardLength);
      updateIfPresent('width', refinedConfig.boardWidth);
      updateIfPresent('thickness', refinedConfig.boardThickness);
      updateIfPresent('noseWidth', refinedConfig.boardNoseWidth);
      updateIfPresent('tailWidth', refinedConfig.boardTailWidth);

      // Update board volume if provided
      if (
        refinedConfig.boardVolume !== undefined &&
        refinedConfig.boardVolume !== null
      ) {
        setBoardVolume(refinedConfig.boardVolume);
        hasChanges = true;
      }

      if (hasChanges) {
        setParameters(newParameters);
        toast.success("Board configuration refined successfully!");
      } else {
        toast.info("No changes were made to the board configuration");
      }

      // Clear the input
      setRefinementInput("");
    } catch (error) {
      console.error("Error refining board:", error);
      toast.error(
        "Failed to refine board via AI. Make sure the backend is connected."
      );
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl py-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="rounded-full border-border/50 hover:bg-white/5 bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <div className="h-6 w-px bg-white/10" />
              <h1 className="text-xl font-bold text-heading">
                {isEditMode ? "Edit Configuration" : "New Configuration"}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Quick Save Button */}
              {boardName.trim() && (
                <Button
                  onClick={handleQuickSave}
                  disabled={isEditMode && !hasUnsavedChanges}
                  className={`flex items-center gap-2 rounded-full h-10 px-6 transition-all ${
                    isEditMode && !hasUnsavedChanges
                      ? "bg-green-500/10 text-green-500 border border-green-500/20"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  {isEditMode && !hasUnsavedChanges ? "Saved" : "Save Changes"}
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Main Grid Layout */}
        <main className="grid lg:grid-cols-12 gap-8 py-8 md:py-12">
          {/* Left Column - Board Display */}
          <div className="lg:col-span-8 space-y-6">
            {/* Board Image Viewer */}
            <SurfboardViewer
              parameters={parameters}
              surfboardColor={surfboardColor}
              isRefining={isRefining}
            />

            {/* AI Refinement Tools */}
             <div className="bg-card border border-border/50 rounded-2xl shadow-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                   <RefreshCw className="w-5 h-5 text-primary" />
                   <h3 className="text-lg font-bold text-heading">AI Refinement</h3>
                </div>
                <div className="flex gap-3">
                   <Input 
                      placeholder="e.g. 'Make it faster for steep waves' or 'Increase stability'"
                      value={refinementInput}
                      onChange={(e) => setRefinementInput(e.target.value)}
                      className="bg-secondary/50 border-border/50 text-heading h-12 rounded-xl"
                   />
                   <Button 
                     onClick={handleRefineBoard}
                     disabled={isRefining || !refinementInput.trim()}
                     className="h-12 px-6 rounded-xl bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20 whitespace-nowrap"
                   >
                     {isRefining ? "Optimizing..." : "Refine Shape"}
                   </Button>
                </div>
             </div>

            {/* Dimensions & Tolerances Table */}
            <div className="bg-card border border-border/50 rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-heading mb-4">
                Dimensions & Tolerances
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-muted-foreground border-b border-white/5">
                      <th className="p-3 font-medium">Dimension</th>
                      <th className="p-3 font-medium">Value</th>
                      <th className="p-3 font-medium">Tolerance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {[
                       { label: 'Length', val: parameters.length, tol: '± 1"' },
                       { label: 'Width', val: parameters.width, tol: '± 0.5"' },
                       { label: 'Thickness', val: parameters.thickness, tol: '± 0.25"', isDecimal: true },
                       { label: 'Nose Width', val: parameters.noseWidth, tol: '± 0.5"', isDecimal: true },
                       { label: 'Tail Width', val: parameters.tailWidth, tol: '± 0.5"', isDecimal: true },
                     ].map((item) => (
                       <tr key={item.label} className="hover:bg-white/5 transition-colors">
                         <td className="p-3 text-heading">{item.label}</td>
                         <td className="p-3 text-primary font-mono">
                           {isRefining ? (
                             <div className="h-4 w-12 bg-secondary animate-pulse rounded" />
                           ) : (
                             `${item.isDecimal ? (item.val / 2.54).toFixed(1) : Math.round(item.val / 2.54)}"`
                           )}
                         </td>
                         <td className="p-3 text-muted-foreground opacity-70">{item.tol}</td>
                       </tr>
                     ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Board Details & Controls */}
          <div className="lg:col-span-4 space-y-6">
            {/* Board Identity Card */}
            <div className="bg-card border border-border/50 rounded-2xl shadow-xl p-6 space-y-6">
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">
                  Design Name
                </label>
                <Input
                  className="w-full h-12 px-4 rounded-xl border border-white/10 bg-secondary/50 focus:border-primary text-lg font-bold text-heading placeholder:text-muted-foreground/50 transition-all"
                  placeholder="Enter board name"
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                />
              </div>

               <div className="grid grid-cols-2 gap-4 pt-2">
                 <div className="bg-secondary/30 rounded-xl p-4 text-center border border-white/5">
                   <div className="text-xs text-muted-foreground mb-1">Volume</div>
                   <div className="text-2xl font-bold text-primary font-mono">
                     {isRefining ? "..." : boardVolume?.toFixed(1) || ((parameters.length * parameters.width * parameters.thickness / 1000 * 0.6).toFixed(1))}L
                   </div>
                 </div>
                 <div className="bg-secondary/30 rounded-xl p-4 text-center border border-white/5">
                   <div className="text-xs text-muted-foreground mb-1">Price Est.</div>
                   <div className="text-2xl font-bold text-heading font-mono">
                     ${Math.round(parameters.length * 0.45 + 400)}
                   </div>
                 </div>
               </div>

               <div className="space-y-4 pt-4 border-t border-white/5">
                 <div>
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3 block">Color</label>
                    <div className="flex flex-wrap gap-2">
                      {['#f5f5dc', '#00bcd4', '#ff6b35', '#7fb069', '#ff006e', '#7209b7'].map((c) => (
                        <button
                          key={c}
                          onClick={() => setSurfboardColor(c)}
                          className={`w-8 h-8 rounded-full border-2 transition-transform ${surfboardColor === c ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                 </div>
               </div>
            </div>

            {/* Suitability Analysis */}
            <div className="bg-card border border-border/50 rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-heading mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" />
                Performance Specs
              </h3>
              
              <div className="space-y-4">
                <div>
                   <div className="flex justify-between text-xs mb-2">
                     <span className="text-muted-foreground">Stability vs Performance</span>
                     <span className="text-heading font-medium">{parameters.width > 52 ? "High Stability" : "High Performance"}</span>
                   </div>
                   <div className="h-2 bg-secondary rounded-full overflow-hidden">
                     <div 
                       className="h-full bg-primary transition-all duration-500"
                       style={{ width: `${Math.min(100, (parameters.width / 65) * 100)}%` }} 
                     />
                   </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>Best for <strong className="text-heading">{parameters.length > 200 ? "Longboard/Cruising" : "Shortboard/Maneuvers"}</strong> style.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>Tail shape optimized for <strong className="text-heading">{parameters.tailWidth > 37 ? "small, mushy waves" : "steep, hollow waves"}</strong>.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
