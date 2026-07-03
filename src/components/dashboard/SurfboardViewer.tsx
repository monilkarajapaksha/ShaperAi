import { useState, useRef, useCallback } from "react";
import { Ruler, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Surfboard3D from "./Surfboard3D";

interface SurfboardViewerProps {
  parameters: {
    length: number;
    width: number;
    thickness: number;
    noseWidth: number;
    tailWidth: number;
  };
  surfboardColor: string;
  isRefining?: boolean;
}

type ViewType = "3d" | "top" | "side" | "rails";

export default function SurfboardViewer({
  parameters,
  surfboardColor,
  isRefining = false,
}: SurfboardViewerProps) {
  const [activeView, setActiveView] = useState<ViewType>("3d");
  const exportFnRef = useRef<(() => void) | null>(null);

  const handleExportReady = useCallback((exportFn: () => void) => {
    exportFnRef.current = exportFn;
  }, []);

  const handleDownload = () => {
    if (exportFnRef.current) {
      exportFnRef.current();
    }
  };

  // Using placeholders or colored shapes if images are missing
  const getBoardStyle = (view: ViewType) => {
    // In a real app, you would swap images or 3D models here
    // For now we simulate the board with CSS shapes/gradients if images are missing
    return {
      filter: getColorFilter(surfboardColor),
    };
  };

  const getColorFilter = (color: string) => {
    switch (color) {
      case "#00bcd4":
        return "hue-rotate(180deg)";
      case "#ff6b35":
        return "hue-rotate(30deg)";
      case "#7fb069":
        return "hue-rotate(120deg)";
      case "#ff006e":
        return "hue-rotate(320deg)";
      case "#7209b7":
        return "hue-rotate(270deg)";
      case "#f72585":
        return "hue-rotate(340deg)";
      case "#52b788":
        return "hue-rotate(140deg)";
      default:
        return "hue-rotate(0deg)";
    }
  };

  const renderAnnotations = () => {
    switch (activeView) {
      case "top":
        return (
          <>
            {/* Width annotation - top */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 md:w-48 flex items-center text-xs font-mono text-muted-foreground">
              <span>&larr;</span>
              <div className="flex-1 border-t border-muted-foreground/50 mx-2"></div>
              {isRefining ? (
                <div className="h-3 w-6 bg-secondary animate-pulse rounded" />
              ) : (
                <span className="font-medium whitespace-nowrap bg-card/80 px-1 rounded">
                  {parameters.width}"
                </span>
              )}
              <div className="flex-1 border-t border-muted-foreground/50 mx-2"></div>
              <span>&rarr;</span>
            </div>
            {/* Length annotation - left */}
            <div className="absolute top-1/2 -translate-y-1/2 left-4 md:left-8 h-48 md:h-64 flex flex-col items-center justify-center text-xs font-mono text-muted-foreground">
              <span>&uarr;</span>
              <div className="flex-1 border-l border-muted-foreground/50 my-2"></div>
              {isRefining ? (
                <div className="h-3 w-6 bg-secondary animate-pulse rounded my-1" />
              ) : (
                <span className="font-medium whitespace-nowrap bg-card/80 px-1 rounded">
                  {parameters.length}'
                </span>
              )}
              <div className="flex-1 border-l border-muted-foreground/50 my-2"></div>
              <span>&darr;</span>
            </div>
          </>
        );
      case "side":
        return (
          <>
            {/* Length annotation - bottom */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 md:w-64 flex items-center text-xs font-mono text-muted-foreground">
              <span>&larr;</span>
              <div className="flex-1 border-t border-muted-foreground/50 mx-2"></div>
              {isRefining ? (
                <div className="h-3 w-6 bg-secondary animate-pulse rounded" />
              ) : (
                <span className="font-medium whitespace-nowrap bg-card/80 px-1 rounded">
                  {parameters.length}'
                </span>
              )}
              <div className="flex-1 border-t border-muted-foreground/50 mx-2"></div>
              <span>&rarr;</span>
            </div>
            {/* Thickness annotation - right */}
            <div className="absolute top-1/2 -translate-y-1/2 right-4 md:right-8 h-16 flex flex-col items-center justify-center text-xs font-mono text-muted-foreground">
              <span>&uarr;</span>
              <div className="flex-1 border-l border-muted-foreground/50 my-1"></div>
              {isRefining ? (
                <div className="h-3 w-6 bg-secondary animate-pulse rounded my-1" />
              ) : (
                <span className="font-medium whitespace-nowrap bg-card/80 px-1 rounded">
                  {parameters.thickness}"
                </span>
              )}
              <div className="flex-1 border-l border-muted-foreground/50 my-1"></div>
              <span>&darr;</span>
            </div>
          </>
        );
      case "rails":
        return (
          <>
            {/* Width annotation - bottom */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 md:w-48 flex items-center text-xs font-mono text-muted-foreground">
              <span>&larr;</span>
              <div className="flex-1 border-t border-muted-foreground/50 mx-2"></div>
              {isRefining ? (
                <div className="h-3 w-6 bg-secondary animate-pulse rounded" />
              ) : (
                <span className="font-medium whitespace-nowrap bg-card/80 px-1 rounded">
                  {parameters.width}"
                </span>
              )}
              <div className="flex-1 border-t border-muted-foreground/50 mx-2"></div>
              <span>&rarr;</span>
            </div>
            {/* Thickness annotation - right */}
            <div className="absolute top-1/2 -translate-y-1/2 right-4 md:right-8 h-16 flex flex-col items-center justify-center text-xs font-mono text-muted-foreground">
              <span>&uarr;</span>
              <div className="flex-1 border-l border-muted-foreground/50 my-1"></div>
              {isRefining ? (
                <div className="h-3 w-6 bg-secondary animate-pulse rounded my-1" />
              ) : (
                <span className="font-medium whitespace-nowrap bg-card/80 px-1 rounded">
                  {parameters.thickness}"
                </span>
              )}
              <div className="flex-1 border-l border-muted-foreground/50 my-1"></div>
              <span>&darr;</span>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const views = [
    {
      id: "3d",
      label: "3D Interactive",
      description: "Hyper-realistic 3D preview",
    },
    { id: "top", label: "Top", description: "Top-down view" },
    { id: "side", label: "Side", description: "Profile view" },
    { id: "rails", label: "Rails", description: "Edge profile" },
  ] as const;

  return (
    <div className="bg-card border border-border/50 rounded-2xl shadow-xl overflow-hidden">
      <div className="p-4">
        <div className="relative aspect-[4/3] bg-secondary/30 rounded-xl flex items-center justify-center overflow-hidden">
          {activeView === "3d" ? (
            <div className="absolute inset-0 z-10">
              <Surfboard3D
                parameters={parameters}
                surfboardColor={surfboardColor}
                onExportReady={handleExportReady}
              />
            </div>
          ) : (
            <>
              {/* Surfboard Representation */}
              <div className="w-full h-full p-8 flex items-center justify-center">
                {/* Fallback to CSS shape since images are missing from oldsrc logic */}
                <div
                  className={`relative transition-all duration-500 rounded-full shadow-2xl ${
                    activeView === "side" ? "w-full h-8" : "w-32 h-full"
                  }`}
                  style={{
                    backgroundColor: surfboardColor,
                    ...getBoardStyle(activeView),
                  }}
                >
                  {/* Stringer */}
                  {activeView === "top" && (
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-black/10" />
                  )}
                </div>
              </div>

              <div className="absolute bottom-4 right-4 text-xs text-muted-foreground/50">
                Visualization Mode
              </div>

              {/* Dynamic Annotations */}
              {renderAnnotations()}
            </>
          )}
        </div>
      </div>

      {/* View Tabs */}
      <div className="border-b border-border/50 px-6">
        <nav className="-mb-px flex space-x-6">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`inline-flex items-center gap-2 px-1 py-3 border-b-2 text-sm font-medium transition-colors ${
                activeView === view.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {view.label}
            </button>
          ))}
        </nav>
      </div>

      {/* View Description */}
      <div className="px-6 py-3 bg-secondary/20">
        <p className="text-xs text-muted-foreground">
          {activeView === "3d" && "Drag to rotate, scroll to zoom in/out"}
          {activeView === "top" &&
            "View board outline, nose/tail shapes, and overall dimensions"}
          {activeView === "side" &&
            "View board profile, rocker curve, and thickness distribution"}
          {activeView === "rails" &&
            "View rail shape, edge profile, and thickness taper"}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="p-4 flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          className="flex-1 gap-2 border-border/50 hover:bg-secondary"
          onClick={handleDownload}
          disabled={activeView !== "3d" || !exportFnRef.current}
        >
          <Download className="w-4 h-4" />
          Download 3D Model
        </Button>
        <Button
          variant="outline"
          className="flex-1 gap-2 border-border/50 hover:bg-secondary"
        >
          <Share2 className="w-4 h-4" />
          Share Design
        </Button>
      </div>
    </div>
  );
}
