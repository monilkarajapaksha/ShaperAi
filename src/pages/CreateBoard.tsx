import { useNavigate } from "react-router-dom";
import UserDetailsWizard from "@/components/dashboard/UserDetailsWizard";
import { UserDetails, SurfboardSuggestion } from "@/types/userDetails";
import { boardStorage, toStoredDesign } from "@/lib/boardStorage";
import { toast } from "sonner";
import Header from "@/components/Header";

const CreateBoard = () => {
  const navigate = useNavigate();

  const handleWizardComplete = async (
    userDetails: UserDetails,
    suggestion: SurfboardSuggestion
  ) => {
    try {
      // The builder completes any params the AI left out from the type's preset when it loads the board.
      const newBoard = boardStorage.save({
        design: toStoredDesign(suggestion.design),
        userDetails,
        suggestion,
      });

      toast.success("Board generated!", {
        description: "Opening the board builder for fine-tuning...",
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
