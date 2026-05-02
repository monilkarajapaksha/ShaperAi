import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { UserDetails } from "@/types/userDetails";

interface PersonalDetailsStepProps {
  form: UseFormReturn<UserDetails>;
}

export default function PersonalDetailsStep({
  form,
}: PersonalDetailsStepProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Weight and Height */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="weight_kg"
          rules={{
            required: "Weight is required",
            min: { value: 30, message: "Weight must be at least 30kg" },
            max: { value: 200, message: "Weight must be less than 200kg" },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground font-medium">
                Weight
              </FormLabel>
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
          name="height_mm"
          rules={{
            required: "Height is required",
            min: { value: 150, message: "Height must be at least 150cm" },
            max: { value: 220, message: "Height must be less than 220cm" },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground font-medium">
                Height
              </FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    type="number"
                    placeholder="180"
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
      </div>

      {/* Skill Level */}
      <FormField
        control={form.control}
        name="skill"
        rules={{ required: "Skill level is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground font-medium">
              Skill Level
            </FormLabel>
            <FormControl>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { value: "beginner", label: "Beginner" },
                  { value: "intermediate", label: "Intermediate" },
                  { value: "advanced", label: "Advanced" },
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

      {/* Wave Power Slider */}
      <FormField
        control={form.control}
        name="wave_power"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground font-medium">
              Wave Power Preference
            </FormLabel>
            <FormControl>
              <div className="space-y-4 pt-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={field.value || 5}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer slider-thumb-glow"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Soft (1)</span>
                  <span className="text-primary font-bold">{field.value || 5}</span>
                  <span>Powerful (10)</span>
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Primary Surf Location */}
      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground font-medium">
              Primary Surf Location
            </FormLabel>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <FormControl>
                <Input
                  placeholder="e.g., Santa Cruz, CA"
                  className="h-12 pl-10 rounded-xl border-border bg-secondary/50 text-heading"
                  {...field}
                />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
