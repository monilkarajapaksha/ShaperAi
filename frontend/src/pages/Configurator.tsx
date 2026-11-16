import { useParams, useNavigate } from "react-router-dom";
import SurfboardConfigurator from "@/components/dashboard/SurfboardConfigurator";

const Configurator = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <SurfboardConfigurator
      boardId={id}
      isEditMode={true}
      onBack={() => navigate("/dashboard")}
    />
  );
};

export default Configurator;
