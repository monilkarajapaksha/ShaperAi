import { BoardDesignInput } from "./boardDesign";
import { BoardConfigurationResponse } from "./boardConfiguration";

/** POST /api/reconfigure-board request — the current builder design plus a free-text request. */
export interface ReconfigureBoardRequest {
  design: BoardDesignInput;
  preference: string;
}

/** Full merged design: unchanged params are carried over by the backend. */
export type ReconfigureBoardResponse = BoardConfigurationResponse;
