import {
  SavedSurfboard,
  UserDetails,
  SurfboardSuggestion,
} from "@/types/userDetails";

export interface BoardData {
  parameters: {
    length: number;
    width: number;
    thickness: number;
    noseWidth: number;
    tailWidth: number;
  };
  appearance: {
    color: string;
    texture: string;
    fins: {
      center: boolean;
      side: boolean;
      thruster: boolean;
    };
  };
  userDetails?: UserDetails;
  suggestion?: SurfboardSuggestion;
}

const STORAGE_KEY = "savedSurfboards";

export const boardStorage = {
  // Get all saved boards
  getAll(): SavedSurfboard[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
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
      name: name || `Surfboard ${boards.length + 1}`,
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

  // Generate a default name based on board characteristics
  generateName(boardData: BoardData): string {
    const { parameters, appearance } = boardData;
    const volume =
      ((parameters.length * parameters.width * parameters.thickness) / 1000) *
      0.6;

    let name = "";

    // Size classification
    if (volume < 25) name += "Mini ";
    else if (volume > 45) name += "Big ";

    // Fin setup
    if (appearance.fins.thruster) name += "Thruster ";
    else if (appearance.fins.center && appearance.fins.side) name += "Hybrid ";
    else if (appearance.fins.center) name += "Single ";

    // Length classification
    if (parameters.length < 170) name += "Short";
    else if (parameters.length > 200) name += "Long";
    else name += "Mid";

    name += "board";

    return name;
  },
};
