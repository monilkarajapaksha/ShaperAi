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
import { RAIL_PROFILES, TAIL_SHAPES } from "@/types/boardDesign";

interface BoardSpecsStepProps {
  form: UseFormReturn<UserDetails>;
}

type Option = { value: string; label: string };

const LEVEL_OPTIONS: Option[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const NOSE_OPTIONS: Option[] = [
  { value: "pointed", label: "Pointed" },
  { value: "medium", label: "Medium" },
  { value: "round", label: "Round" },
];

const WIDE_POINT_OPTIONS: Option[] = [
  { value: "back", label: "Back" },
  { value: "centered", label: "Centered" },
  { value: "forward", label: "Forward" },
];

const RAIL_EDGE_OPTIONS: Option[] = [
  { value: "soft", label: "Soft" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const DECK_DOME_OPTIONS: Option[] = [
  { value: "flat", label: "Flat" },
  { value: "moderate", label: "Moderate" },
  { value: "domed", label: "Domed" },
];

const BOTTOM_OPTIONS: Option[] = [
  { value: "flat", label: "Flat" },
  { value: "single-concave", label: "Single Concave" },
  { value: "double-concave", label: "Double Concave" },
  { value: "vee", label: "Vee off tail" },
  { value: "channels", label: "Channels" },
];

type ShapeField =
  | "nose_shape" | "wide_point" | "nose_rocker" | "tail_rocker"
  | "rail_profile" | "rail_edge" | "deck_dome";

/** Segmented single-choice field; clicking the active option clears it (no preference). */
function ChoiceField({ form, name, label, options }: { form: UseFormReturn<UserDetails>; name: ShapeField; label: string; options: Option[] }) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-foreground font-medium">{label}</FormLabel>
          <FormControl>
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => field.onChange(field.value === opt.value ? undefined : opt.value)}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                    field.value === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default function BoardSpecsStep({ form }: BoardSpecsStepProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Current Board Dimensions */}
      <div>
        <h3 className="text-base font-semibold text-heading mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">4</span>
          Current Board Dimensions
          <span className="text-xs text-muted-foreground font-normal">(optional – for reference)</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="current_length_ft"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-muted-foreground">Length</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="6.17"
                      className="h-11 rounded-xl bg-secondary/50 border-border text-heading pr-10"
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value ? Number(e.target.value) : undefined)
                      }
                    />
                  </FormControl>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">ft</span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="current_width_in"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-muted-foreground">Width</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type="number"
                      step="0.25"
                      placeholder="20.5"
                      className="h-11 rounded-xl bg-secondary/50 border-border text-heading pr-10"
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value ? Number(e.target.value) : undefined)
                      }
                    />
                  </FormControl>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">in</span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="current_thickness_in"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-muted-foreground">Thickness</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type="number"
                      step="0.125"
                      placeholder="2.75"
                      className="h-11 rounded-xl bg-secondary/50 border-border text-heading pr-10"
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value ? Number(e.target.value) : undefined)
                      }
                    />
                  </FormControl>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">in</span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="current_volume_l"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-muted-foreground">Volume</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type="number"
                      step="0.5"
                      placeholder="32.0"
                      className="h-11 rounded-xl bg-secondary/50 border-border text-heading pr-10"
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value ? Number(e.target.value) : undefined)
                      }
                    />
                  </FormControl>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">L</span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="current_nose_width_in"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-muted-foreground">Nose Width</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type="number"
                      step="0.25"
                      placeholder="14.5"
                      className="h-11 rounded-xl bg-secondary/50 border-border text-heading pr-10"
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value ? Number(e.target.value) : undefined)
                      }
                    />
                  </FormControl>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">in</span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="current_tail_width_in"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-muted-foreground">Tail Width</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type="number"
                      step="0.25"
                      placeholder="16.0"
                      className="h-11 rounded-xl bg-secondary/50 border-border text-heading pr-10"
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value ? Number(e.target.value) : undefined)
                      }
                    />
                  </FormControl>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">in</span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Board Shape Features */}
      <div>
        <h3 className="text-base font-semibold text-heading mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">5</span>
          Board Shape Features
        </h3>
        <div className="space-y-5">
          {/* Outline */}
          <div className="grid md:grid-cols-2 gap-4">
            <ChoiceField form={form} name="nose_shape" label="Nose tip" options={NOSE_OPTIONS} />
            <ChoiceField form={form} name="wide_point" label="Wide point" options={WIDE_POINT_OPTIONS} />
          </div>

          <FormField
            control={form.control}
            name="tail_shape"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-medium">
                  What tail shape do you want?
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-border text-heading">
                      <SelectValue placeholder="Let the AI choose" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-card border-border text-heading">
                    {TAIL_SHAPES.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Rocker */}
          <div className="grid md:grid-cols-2 gap-4">
            <ChoiceField form={form} name="nose_rocker" label="Nose rocker" options={LEVEL_OPTIONS} />
            <ChoiceField form={form} name="tail_rocker" label="Tail rocker" options={LEVEL_OPTIONS} />
          </div>

          {/* Rails & deck */}
          <ChoiceField
            form={form}
            name="rail_profile"
            label="Rail profile (upper / lower)"
            options={RAIL_PROFILES.map((r) => ({ value: r, label: r }))}
          />
          <div className="grid md:grid-cols-2 gap-4">
            <ChoiceField form={form} name="rail_edge" label="Rail edge" options={RAIL_EDGE_OPTIONS} />
            <ChoiceField form={form} name="deck_dome" label="Deck dome" options={DECK_DOME_OPTIONS} />
          </div>

          {/* Bottom contours */}
          <FormField
            control={form.control}
            name="bottom_contour"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-medium">
                  Any preference for bottom contour?
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-border text-heading">
                      <SelectValue placeholder="Let the AI choose" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-card border-border text-heading">
                    {BOTTOM_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
