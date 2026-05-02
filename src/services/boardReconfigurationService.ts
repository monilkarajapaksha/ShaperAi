import httpClient from "@/lib/httpClient";
import {
  ReconfigureBoardRequest,
  ReconfigureBoardResponse,
} from "@/types/boardReconfiguration";

const BOARD_RECONFIGURATION_ENDPOINT = "/api/reconfigure-board";

export const boardReconfigurationService = {
  reconfigure: (request: ReconfigureBoardRequest) =>
    httpClient.post<ReconfigureBoardResponse>(BOARD_RECONFIGURATION_ENDPOINT, {
      data: request,
    }),
};

export default boardReconfigurationService;
