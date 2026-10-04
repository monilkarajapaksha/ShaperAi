import {
  BoardDesign,
  BoardTypeId,
  FinSetup,
  Finish,
  RailProfile,
  TailShape,
  Units,
} from "./boardDesign";
import { BoardConfigurationResponse } from "./boardConfiguration";

export interface UserDetails {
  // Section 1: Surfer Profile
  height_cm: number;
  weight_kg: number;
  age?: number;
  fitness_level: "sedentary" | "average" | "athletic";
  skill: "beginner" | "intermediate" | "advanced" | "pro";
  surf_frequency: "rarely" | "monthly" | "weekly" | "daily";
  stance: "regular" | "goofy";
  board_type_preference?: BoardTypeId;

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

  // Section 5: Board Shape Features (builder options)
  nose_shape?: "pointed" | "medium" | "round";
  tail_shape?: TailShape;
  wide_point?: "back" | "centered" | "forward";
  nose_rocker?: "low" | "medium" | "high";
  tail_rocker?: "low" | "medium" | "high";
  rail_profile?: RailProfile;
  rail_edge?: "soft" | "medium" | "hard";
  deck_dome?: "flat" | "moderate" | "domed";
  bottom_contour?: "flat" | "single-concave" | "double-concave" | "vee" | "channels";

  // Section 6: Fin Setup (builder options)
  fin_configuration?: FinSetup;
  fin_size?: "small" | "medium" | "large";
  fin_placement?: string;

  // Section 7: Construction (builder options)
  stringer?: boolean;
  leash_plug?: boolean;
  finish?: Finish;

  // Section 8: Colors (builder swatches) and display units
  deck_color?: string;
  bottom_color?: string;
  fin_color?: string;
  units?: Units;

  // Section 9: Additional Notes
  additional_notes?: string;
}

/** AI result: the builder design plus the shaper's reasoning. */
export interface SurfboardSuggestion {
  design: BoardConfigurationResponse["design"];
  targetVolumeLiters?: number;
  reasoning: string;
}

export interface SavedSurfboard {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  /** Builder design. `computed` is filled in once the builder has rendered it. */
  design: Omit<BoardDesign, "computed"> & { computed?: BoardDesign["computed"] };
  userDetails?: UserDetails;
  suggestion?: SurfboardSuggestion;
  thumbnail?: string;
}
