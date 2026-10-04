import { BoardDesignInput } from "./boardDesign";

/** POST /api/board-configuration response — a builder design (lengths in inches). */
export interface BoardConfigurationResponse {
  design: BoardDesignInput & Required<Pick<BoardDesignInput, "type" | "params">>;
  targetVolumeLiters?: number;
  reasoning: string;
}
