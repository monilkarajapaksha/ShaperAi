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

export type Fitness = "low" | "average" | "athletic";
export type Skill = "learning" | "green_waves" | "linking_turns" | "advanced";
export type Frequency = "occasionally" | "weekly" | "several_per_week";
export type WaveSize = "knee-waist" | "waist-head" | "head-high-plus";
export type WaveType = "soft" | "punchy" | "hollow";
export type Goal = "easy-catching" | "glide" | "speed-flow" | "performance";
export type Complaint = "hard-to-paddle" | "hard-to-catch" | "unstable" | "slow" | "stiff" | "too-loose";

/**
 * What the surfer tells us: who they are, the waves, the goal, their current board.
 * Shape decisions (rocker, rails, dome, concave, fin size/cant…) are the AI's job;
 * the optional fields at the bottom are only filled in "Shaper mode".
 */
export interface UserDetails {
  // Step 1: The surfer (required)
  height_cm: number;
  weight_kg: number;
  fitness_level: Fitness;
  skill: Skill;
  surf_frequency: Frequency;

  // Step 2: Waves and goal (required)
  wave_size: WaveSize;
  wave_type: WaveType;
  /** One choice only, it replaces the old overlapping "style" and "feel" questions. */
  goal: Goal;

  // Step 3: Current board (optional, high value)
  current_length_in?: number;
  current_volume_l?: number;
  current_board_complaint?: Complaint;

  // Step 4: Optional extras (undefined = "Let AI choose")
  board_type_preference?: BoardTypeId;
  fin_configuration?: FinSetup;
  finish?: Finish;
  deck_color?: string;
  bottom_color?: string;
  fin_color?: string;
  units?: Units;
  additional_notes?: string;

  // Shaper mode (advanced, all optional; hidden for everyone else)
  shaper_mode?: boolean;
  age?: number;
  stance?: "regular" | "goofy";
  nose_shape?: "pointed" | "medium" | "round";
  tail_shape?: TailShape;
  wide_point?: "back" | "centered" | "forward";
  nose_rocker?: "low" | "medium" | "high";
  tail_rocker?: "low" | "medium" | "high";
  rail_profile?: RailProfile;
  rail_edge?: "soft" | "medium" | "hard";
  deck_dome?: "flat" | "moderate" | "domed";
  bottom_contour?: "flat" | "single-concave" | "double-concave" | "vee" | "channels";
  fin_size?: "small" | "medium" | "large";
  fin_placement?: string;
  stringer?: boolean;
  leash_plug?: boolean;
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
  feedback?: BoardFeedback;
  thumbnail?: string;
}

export type FeedbackArea = "nose" | "tail" | "rails" | "fins" | "bottom";

/** Beta feedback collected after the AI board appears. */
export interface BoardFeedback {
  looksReal?: boolean;
  wouldRide?: boolean;
  problemAreas?: FeedbackArea[];
  report?: string;
  submittedAt: string;
}
