import httpClient from "@/lib/httpClient";
import { UserDetails } from "@/types/userDetails";
import { BoardConfigurationResponse } from "@/types/boardConfiguration";

const BOARD_CONFIGURATION_ENDPOINT = "/api/board-configuration";

export const boardConfigurationService = {
  generate: (userDetails: UserDetails) =>
    httpClient.post<BoardConfigurationResponse>(BOARD_CONFIGURATION_ENDPOINT, {
      data: { userDetails },
      timeout: 60_000, // LLM generation regularly exceeds the 10s default
      retries: 0,
    }),
};

export default boardConfigurationService;
