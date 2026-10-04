import { useMutation } from "@tanstack/react-query";
import { boardConfigurationService } from "@/services/boardConfigurationService";
import { UserDetails, SurfboardSuggestion } from "@/types/userDetails";

const BOARD_CONFIGURATION_QUERY_KEY = ["board-configuration"];

export const useBoardConfiguration = () =>
  useMutation<SurfboardSuggestion, Error, UserDetails>({
    mutationKey: BOARD_CONFIGURATION_QUERY_KEY,
    mutationFn: async (userDetails: UserDetails) => {
      const { design, targetVolumeLiters, reasoning } =
        await boardConfigurationService.generate(userDetails);
      return { design, targetVolumeLiters, reasoning };
    },
  });

export type UseBoardConfigurationResult = ReturnType<
  typeof useBoardConfiguration
>;
export const boardConfigurationKey = BOARD_CONFIGURATION_QUERY_KEY;
