import { useMutation } from "@tanstack/react-query";
import { boardConfigurationService } from "@/services/boardConfigurationService";
import { UserDetails, SurfboardSuggestion } from "@/types/userDetails";
import { BoardConfigurationResponse } from "@/types/boardConfiguration";

const BOARD_CONFIGURATION_QUERY_KEY = ["board-configuration"];

const mapToSurfboardSuggestion = (
  response: BoardConfigurationResponse
): SurfboardSuggestion => ({
  length: response.boardLength,
  width: response.boardWidth,
  thickness: response.boardThickness,
  noseWidth: response.boardNoseWidth,
  tailWidth: response.boardTailWidth,
  reasoning: response.reasoning,
  boardVolume: response.boardVolume,
});

export const useBoardConfiguration = () =>
  useMutation<SurfboardSuggestion, Error, UserDetails>({
    mutationKey: BOARD_CONFIGURATION_QUERY_KEY,
    mutationFn: async (userDetails: UserDetails) => {
      const response =
        await boardConfigurationService.generate(userDetails);
      return mapToSurfboardSuggestion(response);
    },
  });

export type UseBoardConfigurationResult = ReturnType<
  typeof useBoardConfiguration
>;
export const boardConfigurationKey = BOARD_CONFIGURATION_QUERY_KEY;
