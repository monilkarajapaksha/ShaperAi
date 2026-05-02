export interface UserDetails {
  // Required fields
  weight_kg: number;
  height_mm: number;
  skill: "beginner" | "novice" | "intermediate" | "advanced" | "expert";
  wave_power?: number;
  location?: string;

  // Optional fields with defaults
  fitness_level: "low" | "avg" | "high";
  goal_style: "performance" | "trim" | "noseride" | "all-rounder";
  stance_bias: "front-foot" | "back-foot" | "neutral";
  wetsuit: false; // Changed from boolean to false as default to match usage or interface
  swell_period_s?: number;
  wind_regime: "onshore" | "offshore" | "variable";
  water_temp_C?: number;
  board_type_preference?: string;
  construction_preference: "PU" | "EPS";
  rocker_profile_type: "continuous" | "staged";
}

// Fixing interface type for wetsuit to boolean as it was in original file
export interface UserDetails {
  // Required fields
  weight_kg: number;
  height_mm: number;
  skill: "beginner" | "novice" | "intermediate" | "advanced" | "expert";
  wave_power?: number;
  location?: string;

  // Optional fields with defaults
  fitness_level: "low" | "avg" | "high";
  goal_style: "performance" | "trim" | "noseride" | "all-rounder";
  stance_bias: "front-foot" | "back-foot" | "neutral";
  wetsuit: boolean;
  swell_period_s?: number;
  wind_regime: "onshore" | "offshore" | "variable";
  water_temp_C?: number;
  board_type_preference?: string;
  construction_preference: "PU" | "EPS";
  rocker_profile_type: "continuous" | "staged";
}

export interface SurfboardSuggestion {
  length: number;
  width: number;
  thickness: number;
  noseWidth: number;
  tailWidth: number;
  reasoning: string;
  boardVolume?: number;
}

export interface SavedSurfboard {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  parameters: {
    length: number;
    width: number;
    thickness: number;
    noseWidth: number;
    tailWidth: number;
    tailType?: string; // Added optional tailType if needed later
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
  thumbnail?: string; // Base64 encoded image
}
