import { useNavigate } from "react-router-dom";
import UserDetailsWizard from "@/components/dashboard/UserDetailsWizard";
import { UserDetails, SurfboardSuggestion } from "@/types/userDetails";
import { boardStorage } from "@/lib/boardStorage";
import { toast } from "sonner";
import Header from "@/components/Header";

const CreateBoard = () => {
  const navigate = useNavigate();

  const handleWizardComplete = async (
    userDetails: UserDetails,
    suggestion: SurfboardSuggestion
  ) => {
    try {
      // Logic to save the initial board based on suggestion
      // We will redirect to configurator with this data
      
      const initialBoardData = {
        parameters: {
          length: suggestion.length,
          width: suggestion.width,
          thickness: suggestion.thickness,
          noseWidth: suggestion.noseWidth,
          tailWidth: suggestion.tailWidth,
        },
        appearance: {
          color: "#f5f5dc",
          texture: "classic",
          fins: {
            center: true,
            side: false,
            thruster: false,
          },
        },
        userDetails,
        suggestion,
      };

      const newBoard = boardStorage.save(initialBoardData);
      
      toast.success("Board generated!", {
        description: "Redirecting to configurator for fine-tuning...",
      });
      
      setTimeout(() => {
        navigate(`/configurator/${newBoard.id}`);
      }, 1000);

    } catch (error) {
      console.error("Error creating board:", error);
      toast.error("Failed to create board");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-24">
        <UserDetailsWizard onComplete={handleWizardComplete} />
      </div>
    </div>
  );
};

export default CreateBoard;
