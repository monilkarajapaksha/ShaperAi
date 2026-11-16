import {
  SavedSurfboard,
  UserDetails,
  SurfboardSuggestion,
} from "@/types/userDetails";
import { BoardDesignInput, BoardTypeId, boardTypeName } from "@/types/boardDesign";

export interface BoardData {
  design: SavedSurfboard["design"];
  userDetails?: UserDetails;
  suggestion?: SurfboardSuggestion;
}

const STORAGE_KEY = "savedSurfboards";

// Builder preset values (inches) used to complete partial designs before the builder renders them.
const PRESET_DIMS: Record<BoardTypeId, [number, number, number]> = {
  shortboard: [70, 19, 2.4375], fish: [66, 21, 2.5], hybrid: [84, 21.5, 2.75], longboard: [110, 22.75, 3],
  minimal: [90, 22, 2.875], gun: [88, 19.5, 2.875], groveler: [64, 20.5, 2.5], egg: [76, 21.5, 2.75],
  softtop: [96, 23, 3.25], sup: [126, 32, 4.5], bodyboard: [42, 21.5, 2.5], skim: [48, 20.5, 0.55],
};

/** Build a storable design from a partial (AI or legacy) design. The builder fills the rest on load. */
export function toStoredDesign(input: BoardDesignInput): SavedSurfboard["design"] {
  const type = input.type ?? "shortboard";
  const [length, width, thickness] = PRESET_DIMS[type];
  return {
    version: 1,
    type,
    typeName: boardTypeName(type),
    lengthUnit: "in",
    units: input.units ?? "imperial",
    params: { length, width, thickness, ...input.params } as SavedSurfboard["design"]["params"],
    colors: { deck: "#f4f2ee", bottom: "#f4f2ee", fins: "#3a3634", ...input.colors },
  };
}

// Boards saved before the builder migration: { parameters: { length (ft), width/thickness/nose/tail (in) }, appearance }
interface LegacyBoard {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  parameters: { length: number; width: number; thickness: number; noseWidth: number; tailWidth: number };
  appearance?: { fins?: { center?: boolean; side?: boolean; thruster?: boolean } };
  userDetails?: UserDetails;
  thumbnail?: string;
}

function migrateLegacy(b: LegacyBoard): SavedSurfboard {
  const p = b.parameters;
  const lengthIn = p.length * 12;
  const type: BoardTypeId =
    lengthIn >= 106 ? "longboard" : lengthIn >= 84 ? "minimal" : lengthIn >= 76 ? "hybrid" : p.width >= 20.5 ? "fish" : "shortboard";
  const f = b.appearance?.fins;
  const fins = f?.thruster ? "thruster" : f?.center && f?.side ? "twoplus1" : f?.side ? "twin" : "single";
  return {
    id: b.id,
    name: b.name,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
    userDetails: b.userDetails,
    thumbnail: b.thumbnail,
    design: toStoredDesign({
      type,
      params: { length: lengthIn, width: p.width, thickness: p.thickness, noseWidth: p.noseWidth, tailWidth: p.tailWidth, fins },
    }),
  };
}

export const boardStorage = {
  // Get all saved boards (legacy entries are migrated in place)
  getAll(): SavedSurfboard[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const raw: (SavedSurfboard | LegacyBoard)[] = saved ? JSON.parse(saved) : [];
      let migrated = false;
      const boards = raw.map((b) => {
        if ("design" in b && b.design) return b;
        migrated = true;
        return migrateLegacy(b as LegacyBoard);
      });
      if (migrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
      return boards;
    } catch (error) {
      console.error("Error loading saved boards:", error);
      return [];
    }
  },

  // Get a specific board by ID
  getById(id: string): SavedSurfboard | null {
    const boards = this.getAll();
    return boards.find((board) => board.id === id) || null;
  },

  // Save a new board
  save(boardData: BoardData, name?: string): SavedSurfboard {
    const boards = this.getAll();
    const now = new Date().toISOString();

    const newBoard: SavedSurfboard = {
      id: crypto.randomUUID(),
      name: name || this.generateName(boardData),
      createdAt: now,
      updatedAt: now,
      ...boardData,
    };

    boards.unshift(newBoard); // Add to beginning for latest first
    localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));

    return newBoard;
  },

  // Update an existing board
  update(
    id: string,
    boardData: Partial<BoardData>,
    name?: string
  ): SavedSurfboard | null {
    const boards = this.getAll();
    const boardIndex = boards.findIndex((board) => board.id === id);

    if (boardIndex === -1) return null;

    const updatedBoard: SavedSurfboard = {
      ...boards[boardIndex],
      ...boardData,
      updatedAt: new Date().toISOString(),
    };

    if (name) {
      updatedBoard.name = name;
    }

    boards[boardIndex] = updatedBoard;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));

    return updatedBoard;
  },

  // Delete a board
  delete(id: string): boolean {
    const boards = this.getAll();
    const filteredBoards = boards.filter((board) => board.id !== id);

    if (filteredBoards.length === boards.length) {
      return false; // Board not found
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredBoards));
    return true;
  },

  // Generate a default name based on board characteristics, e.g. "6'2" Squash Shortboard"
  generateName({ design }: Pick<BoardData, "design">): string {
    const { params, typeName } = design;
    const i = Math.round(params.length);
    const tail = params.tailShape ? params.tailShape.charAt(0).toUpperCase() + params.tailShape.slice(1) + " " : "";
    return `${Math.floor(i / 12)}'${i % 12}" ${tail}${typeName}`;
  },
};
