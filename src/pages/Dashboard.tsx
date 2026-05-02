import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SavedSurfboard } from "@/types/userDetails";
import { boardStorage } from "@/lib/boardStorage";
import { Plus, Search, Filter, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const Dashboard = () => {
  const [savedBoards, setSavedBoards] = useState<SavedSurfboard[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Auth Check
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      } else {
        loadSavedBoards();
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const loadSavedBoards = () => {
    try {
      const boards = boardStorage.getAll();
      setSavedBoards(boards);
    } catch (error) {
      console.error("Error loading saved boards:", error);
      toast.error("Failed to load saved boards");
    }
  };

  const deleteBoard = (boardId: string) => {
    try {
      if (boardStorage.delete(boardId)) {
        setSavedBoards(boardStorage.getAll());
        toast.success("Board deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting board:", error);
      toast.error("Failed to delete board");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateVolume = (params: SavedSurfboard["parameters"]) => {
    return (
      ((params.length * params.width * params.thickness) / 1000) *
      0.6
    ).toFixed(1);
  };

  const getSkillLevel = (volume: number, length: number) => {
    const ratio = volume / (length / 100);
    if (ratio < 0.3) return { level: "Advanced", percentage: 85, color: "bg-red-500" };
    if (ratio < 0.5) return { level: "Intermediate", percentage: 55, color: "bg-yellow-500" };
    return { level: "Beginner", percentage: 30, color: "bg-green-500" };
  };

  const getBoardImage = (boardId: string) => {
    // Array of surfboard images - matching the aesthetic
    const boardImages = [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBs4PUYLgagYBXEroEJVsQdvPadedPeRyfYTdywfpudK_L14i4Mc57vNZXGap3fyylrXGVi5byCT4VaXr1WFELPyowlBzIlM2I1-qxBERu7y2Zkn7WYLRbsp0kmzYjwXKEea5oQ6Wjhizu6zWlC2IvlcvNF_Mo-rr3A6_GuLQwkIpd1RGCGMA4HUiSU9Po6jjuT9b-HPK03ZprdcC68jxW0AgN60RbtZurygmKgi_7UZFd6yfctcBLqsWYL4T3JulbBfv5UZsw0aAm-",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB0KZkFBFYZLw2E-odvZqGH_H6ZaF-8gCw5M9pN0g5UDxVy7xCivh4SZdd5v2xRNgkhFGuKNEetxq8n0M89WiSfnlYo-f6uhVRDA6-mknCQEb8-4OSO6Dt9zTfzjni5QNr8tKin0zJpEF_-SoNvCiBv-aOSyJed3vWylYCSlPlJSX89F5zoCs8fXNrYLoL3_pBMkO-nZBaYjcdzJqG5M2Xc49H62YmBqXu8UtKeTuTLvQtAyX3T9X71wNp8pQy14fkBc9mLSSV5wdxK",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA7vwXKs-XmnEUyyD71gzIKStFFx3tBBCiD0LfFC3AO45RVMh029NOy_nuLwnd9hDwaJkGHnN4wMp2ZUBWJaDI1jGcI_hVoCJEIYoMkPr5YRjElH5i2DXRMcWK02op-rfPZ0gzVFu50yJ7Kwi7QedPg67L2pxPcyvMS6l4Spja3yAtPV0U_znfhGDMMuYzkg7zuw39nl8h1_Z9Pbll8aJJJyCqIkD4MubGRDzLwAEYFpMTH5ME-w_tJhkLTwEO3YZG2a04uBeWMAaxm",
    ];

    const hash = boardId.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

    return boardImages[Math.abs(hash) % boardImages.length];
  };

  // Filter boards based on search query
  const filteredBoards = savedBoards.filter((board) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const volume = calculateVolume(board.parameters);
    const skillData = getSkillLevel(parseFloat(volume), board.parameters.length);

    return (
      board.name.toLowerCase().includes(query) ||
      board.appearance.texture.toLowerCase().includes(query) ||
      board.appearance.color.toLowerCase().includes(query) ||
      volume.includes(query) ||
      skillData.level.toLowerCase().includes(query)
    );
  });

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-heading">Loading...</div>;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="container mx-auto px-6 lg:px-12 py-24">
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 border-b border-white/10 pb-8"
        >
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-heading mb-2">My Surfboards</h1>
            <p className="text-body text-lg">Manage your custom designs and AI-generated shapes.</p>
          </div>
          <Link to="/create">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
              <Plus className="w-4 h-4 mr-2" />
              New Design
            </Button>
          </Link>
        </motion.div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, volume, style..."
              className="pl-10 bg-secondary/50 border-white/10 text-heading focus:border-primary/50"
            />
          </div>
          <Button variant="outline" className="border-white/10 text-body hover:text-heading hover:bg-white/5">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* content */}
        {savedBoards.length === 0 ? (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-2xl bg-secondary/20"
           >
             <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
               <Plus className="w-8 h-8 text-muted-foreground" />
             </div>
             <h3 className="text-xl font-semibold text-heading mb-2">No boards yet</h3>
             <p className="text-body mb-6 text-center max-w-sm">
               Start your journey by creating your first AI-optimized surfboard design.
             </p>
             <Link to="/create">
               <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                 Create Board
               </Button>
             </Link>
           </motion.div>
        ) : filteredBoards.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No boards match your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBoards.map((board, index) => {
              const volume = parseFloat(calculateVolume(board.parameters));
              const skillData = getSkillLevel(volume, board.parameters.length);
              
              return (
                <motion.div
                  key={board.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-card border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                >
                  <div className="relative aspect-[4/3] bg-secondary/50 overflow-hidden">
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url('${getBoardImage(board.id)}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-60" />
                    <button
                      onClick={() => deleteBoard(board.id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-4 left-4 right-4">
                       <h3 className="text-xl font-bold text-white mb-1">{board.name}</h3>
                       <div className="flex items-center gap-2 text-xs text-white/80">
                         <span>{formatDate(board.createdAt)}</span>
                         <span>•</span>
                         <span>{volume}L</span>
                       </div>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex gap-2 mb-4">
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded bg-white/5 text-white`}>
                        {board.appearance.texture}
                      </span>
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded bg-white/5 text-white`}>
                        {skillData.level}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-6">
                      <div className="flex flex-col">
                        <span className="text-white/40 mb-1">Length</span>
                        <span className="font-mono text-heading">{board.parameters.length}cm</span>
                      </div>
                      <div className="flex flex-col">
                         <span className="text-white/40 mb-1">Width</span>
                         <span className="font-mono text-heading">{board.parameters.width}cm</span>
                      </div>
                      <div className="flex flex-col">
                         <span className="text-white/40 mb-1">Thick</span>
                         <span className="font-mono text-heading">{board.parameters.thickness}cm</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        className="flex-1 border-white/10 hover:bg-white/5 text-heading"
                        onClick={() => navigate(`/configurator/${board.id}`)}
                      >
                        Details
                      </Button>
                      <Button 
                        className="flex-1 bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20"
                        onClick={() => navigate(`/configurator/${board.id}`)}
                      >
                        Refine <ArrowRight className="w-3 h-3 ml-2" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
