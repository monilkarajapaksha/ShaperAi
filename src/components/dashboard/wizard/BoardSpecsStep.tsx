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

interface BoardSpecsStepProps {
  form: UseFormReturn<UserDetails>;
}

const ROCKER_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const SHAPE_OPTIONS = [
  "Squash",
  "Square",
  "Round",
  "Pin",
  "Swallow",
  "Bat",
  "Diamond",
];

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
        <div className="space-y-4">
          {/* Nose + Tail Shape */}
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="nose_shape"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-medium">
                    What nose shape do you prefer?
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-border text-heading">
                        <SelectValue placeholder="Select nose shape" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border text-heading">
                      {SHAPE_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s.toLowerCase()}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                        <SelectValue placeholder="Select tail shape" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border text-heading">
                      {SHAPE_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s.toLowerCase()}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Rocker */}
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="nose_rocker"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-medium">Nose Rocker</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-3 gap-2">
                      {ROCKER_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => field.onChange(opt.value)}
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

            <FormField
              control={form.control}
              name="tail_rocker"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-medium">Tail Rocker</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-3 gap-2">
                      {ROCKER_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => field.onChange(opt.value)}
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
          </div>

          {/* Rail Profile + Bottom Contour */}
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="rail_profile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-medium">
                    What rail feel do you prefer?
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-border text-heading">
                        <SelectValue placeholder="Select rail profile" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border text-heading">
                      <SelectItem value="soft-full">Soft / Full</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard-sharp">Hard / Sharp</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                        <SelectValue placeholder="Select bottom contour" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border text-heading">
                      <SelectItem value="flat">Flat</SelectItem>
                      <SelectItem value="single-concave">Single Concave</SelectItem>
                      <SelectItem value="double-concave">Double Concave</SelectItem>
                      <SelectItem value="vee">Vee</SelectItem>
                      <SelectItem value="channels">Channels</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
