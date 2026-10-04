import type React from "react";
import type { BoardDesign, BoardDesignInput, Units } from "./boardDesign";

type SetResult = { applied: string[]; ignored: string[]; design: BoardDesign };

/** <surfboard-builder> element API (src/lib/surfboard-builder/surfboard-builder.js). */
export interface SurfboardBuilderElement extends HTMLElement {
  ready: Promise<SurfboardBuilderElement>;
  saveHandler: ((design: BoardDesign) => unknown | Promise<unknown>) | null;
  getDesign(opts?: { lengthUnit?: "in" | "cm" | "mm" | "m" }): Promise<BoardDesign>;
  setDesign(design: BoardDesignInput): Promise<SetResult>;
  setParams(params: BoardDesignInput["params"]): Promise<SetResult>;
  setUnits(units: Units): Promise<Units>;
  reset(): Promise<BoardDesign>;
  resetView(): Promise<boolean>;
  save(): Promise<{ ok: boolean; result?: unknown; error?: string; cancelled?: boolean; design?: BoardDesign }>;
  download(format?: "glb" | "obj"): Promise<boolean>;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "surfboard-builder": React.DetailedHTMLProps<React.HTMLAttributes<SurfboardBuilderElement>, SurfboardBuilderElement> & {
        type?: string;
        units?: Units;
        hide?: string;
        "storage-key"?: string;
      };
    }
  }
}
