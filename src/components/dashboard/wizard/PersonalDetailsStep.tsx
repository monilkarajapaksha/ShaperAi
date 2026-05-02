import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserDetails } from "@/types/userDetails";

interface PersonalDetailsStepProps {
  form: UseFormReturn<UserDetails>;
}

const BOARD_TYPES = [
  "Shortboard",
  "Groveler",
  "Fish",
  "Hybrid",
  "Step-up",
  "Gun",
  "Mid-length",
  "Egg",
  "Mini-Mal",
  "Longboard",
  "Noserider",
  "Performance Longboard",
  "Single Fin",
  "Twin Fin",
  "Thruster",
  "Quad",
  "Soft-top",
  "Foamie",
  "Retro board",
  "Log",
];

export default function PersonalDetailsStep({ form }: PersonalDetailsStepProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Height and Weight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField
          control={form.control}
          name="height_cm"
          rules={{
            required: "Height is required",
            min: { value: 100, message: "Must be at least 100cm" },
            max: { value: 220, message: "Must be less than 220cm" },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground font-medium">Height</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    type="number"
                    placeholder="175"
                    className="h-12 rounded-xl border-border bg-secondary/50 pr-12 text-heading"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  cm
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weight_kg"
          rules={{
            required: "Weight is required",
            min: { value: 30, message: "Must be at least 30kg" },
            max: { value: 200, message: "Must be less than 200kg" },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground font-medium">Weight</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    type="number"
                    placeholder="75"
                    className="h-12 rounded-xl border-border bg-secondary/50 pr-12 text-heading"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  kg
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground font-medium">Age</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    type="number"
                    placeholder="25"
                    className="h-12 rounded-xl border-border bg-secondary/50 pr-12 text-heading"
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                </FormControl>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  yrs
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Fitness Level */}
      <FormField
        control={form.control}
        name="fitness_level"
        rules={{ required: "Fitness level is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground font-medium">Fitness Level</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-border text-heading">
                  <SelectValue placeholder="Select fitness level" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-card border-border text-heading">
                <SelectItem value="sedentary">Sedentary</SelectItem>
                <SelectItem value="average">Average</SelectItem>
                <SelectItem value="athletic">Athletic</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Skill Level */}
      <FormField
        control={form.control}
        name="skill"
        rules={{ required: "Skill level is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground font-medium">
              What's your surfing ability?
            </FormLabel>
            <FormControl>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { value: "beginner", label: "Beginner" },
                  { value: "intermediate", label: "Intermediate" },
                  { value: "advanced", label: "Advanced" },
                  { value: "pro", label: "Pro" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => field.onChange(option.value)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      field.value === option.value
                        ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                        : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Surfing Frequency */}
      <FormField
        control={form.control}
        name="surf_frequency"
        rules={{ required: "Surfing frequency is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground font-medium">
              How often do you surf?
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-border text-heading">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-card border-border text-heading">
                <SelectItem value="rarely">Rarely</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Stance */}
      <FormField
        control={form.control}
        name="stance"
        rules={{ required: "Stance is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground font-medium">
              Are you regular or goofy footed?
            </FormLabel>
            <FormControl>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "regular", label: "Regular", sub: "Left foot forward" },
                  { value: "goofy", label: "Goofy", sub: "Right foot forward" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => field.onChange(option.value)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                      field.value === option.value
                        ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                        : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    <div className="font-semibold">{option.label}</div>
                    <div className={`text-xs mt-0.5 ${field.value === option.value ? "text-primary-foreground/70" : "text-muted-foreground/70"}`}>
                      {option.sub}
                    </div>
                  </button>
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Board Type Preference */}
      <FormField
        control={form.control}
        name="board_type_preference"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground font-medium">
              Board Type Preference <span className="text-muted-foreground font-normal">(optional)</span>
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-border text-heading">
                  <SelectValue placeholder="Select board type (optional)" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-card border-border text-heading">
                {BOARD_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
