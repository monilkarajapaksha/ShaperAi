import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin } from "lucide-react";
import { UserDetails } from "@/types/userDetails";

interface SurfingPreferencesStepProps {
  form: UseFormReturn<UserDetails>;
}

const WAVE_TYPE_OPTIONS = [
  { value: "small-mushy", label: "Small mushy waves" },
  { value: "steep-fast", label: "Steep fast waves" },
  { value: "reef-breaks", label: "Reef breaks" },
];

export default function SurfingPreferencesStep({ form }: SurfingPreferencesStepProps) {
  const waveTypeValue: string[] = form.watch("wave_type_preference") || [];

  const toggleWaveType = (value: string, checked: boolean) => {
    const current = waveTypeValue;
    if (checked) {
      form.setValue("wave_type_preference", [...current, value]);
    } else {
      form.setValue(
        "wave_type_preference",
        current.filter((v) => v !== value)
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Surfing Style */}
      <FormField
        control={form.control}
        name="surfing_style"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground font-medium">
              What's your surfing style?
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-border text-heading">
                  <SelectValue placeholder="Select surfing style" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-card border-border text-heading">
                <SelectItem value="cruising">Cruising</SelectItem>
                <SelectItem value="progressive">Progressive</SelectItem>
                <SelectItem value="high-performance">High-Performance</SelectItem>
                <SelectItem value="big-wave">Big Wave</SelectItem>
                <SelectItem value="retro">Retro</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Wave Type Preference (multi-select) */}
      <FormItem>
        <FormLabel className="text-foreground font-medium">
          What type of waves do you surf most often?
        </FormLabel>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {WAVE_TYPE_OPTIONS.map((option) => {
            const checked = waveTypeValue.includes(option.value);
            return (
              <label
                key={option.value}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all border ${
                  checked
                    ? "bg-primary/10 border-primary text-heading"
                    : "bg-secondary/50 border-border text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                }`}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(val) => toggleWaveType(option.value, !!val)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <span className="text-sm font-medium">{option.label}</span>
              </label>
            );
          })}
        </div>
      </FormItem>

      {/* Desired Board Feel */}
      <FormField
        control={form.control}
        name="board_feel"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground font-medium">
              How do you want the board to feel?
            </FormLabel>
            <FormControl>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { value: "loose-playful", label: "Loose & Playful" },
                  { value: "stable-forgiving", label: "Stable & Forgiving" },
                  { value: "fast-responsive", label: "Fast & Responsive" },
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

      {/* Current Board Feedback */}
      <FormField
        control={form.control}
        name="current_board_feedback"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground font-medium">
              What do you like or dislike about your current board?{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder='e.g. "Too slow to paddle" or "Great for turns"'
                className="rounded-xl border-border bg-secondary/50 text-heading min-h-[80px] resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Home Break */}
      <FormField
        control={form.control}
        name="home_break"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground font-medium">
              Where do you surf most often?{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </FormLabel>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <FormControl>
                <Input
                  placeholder='e.g. "Huntington Beach, CA" or "Snapper Rocks, AUS"'
                  className="h-12 pl-10 rounded-xl border-border bg-secondary/50 text-heading"
                  {...field}
                />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Wave Size */}
      <FormField
        control={form.control}
        name="wave_size"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-foreground font-medium">
              What's the average wave height you surf?
            </FormLabel>
            <FormControl>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  { value: "0-2ft", label: "0–2 ft" },
                  { value: "2-4ft", label: "2–4 ft" },
                  { value: "4-6ft", label: "4–6 ft" },
                  { value: "6-10ft", label: "6–10 ft" },
                  { value: "10+ft", label: "10+ ft" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => field.onChange(option.value)}
                    className={`px-3 py-3 rounded-xl text-sm font-medium transition-all ${
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
    </div>
  );
}
