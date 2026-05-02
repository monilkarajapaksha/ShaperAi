export interface UserDetails {
  // Section 1: Surfer Profile
  height_cm: number;
  weight_kg: number;
  age?: number;
  fitness_level: "sedentary" | "average" | "athletic";
  skill: "beginner" | "intermediate" | "advanced" | "pro";
  surf_frequency: "rarely" | "monthly" | "weekly" | "daily";
  stance: "regular" | "goofy";
  board_type_preference?: string;

  // Section 2: Surfing Style and Preferences
  surfing_style?: "cruising" | "progressive" | "high-performance" | "big-wave" | "retro";
  wave_type_preference?: string[];
  board_feel?: "loose-playful" | "stable-forgiving" | "fast-responsive";
  current_board_feedback?: string;

  // Section 3: Environmental Conditions
  home_break?: string;
  wave_size?: "0-2ft" | "2-4ft" | "4-6ft" | "6-10ft" | "10+ft";

  // Section 4: Current Board Dimensions (reference, all optional)
  current_length_ft?: number;
  current_width_in?: number;
  current_thickness_in?: number;
  current_volume_l?: number;
  current_nose_width_in?: number;
  current_tail_width_in?: number;

  // Section 5: Board Shape Features
  nose_shape?: string;
  tail_shape?: string;
  nose_rocker?: "low" | "medium" | "high";
  tail_rocker?: "low" | "medium" | "high";
  rail_profile?: "soft-full" | "medium" | "hard-sharp";
  bottom_contour?: "flat" | "single-concave" | "double-concave" | "vee" | "channels";

  // Section 6: Fin Setup
  fin_configuration?: "single" | "twin" | "thruster" | "quad" | "2+1" | "5-fin";
  fin_size?: "small" | "medium" | "large";
  fin_placement?: string;

  // Section 7: Materials and Construction
  core_material?: "PU" | "EPS";
  lamination_strength?: "standard-4+6oz" | "light-4+4oz" | "heavy-6+6oz";
  carbon_reinforcement?: boolean;
  carbon_placement?: "tail-patch" | "full-rail" | "none";

  // Section 8: Aesthetic Preferences
  color_preference?: string;
  finish?: "gloss" | "matte" | "satin";
  custom_graphics?: string;

  // Section 9: Additional Notes
  additional_notes?: string;
}

export interface SurfboardSuggestion {
  length: number;      // feet (e.g. 6.17 for 6'2")
  width: number;       // inches
  thickness: number;   // inches
  noseWidth: number;   // inches
  tailWidth: number;   // inches
  reasoning: string;
  boardVolume?: number; // liters
  boardType?: string;
}

export interface SavedSurfboard {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  parameters: {
    length: number;      // feet
    width: number;       // inches
    thickness: number;   // inches
    noseWidth: number;   // inches
    tailWidth: number;   // inches
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
  thumbnail?: string;
}
