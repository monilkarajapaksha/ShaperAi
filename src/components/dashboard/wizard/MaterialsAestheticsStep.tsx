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
import { Switch } from "@/components/ui/switch";
import { UserDetails } from "@/types/userDetails";

interface MaterialsAestheticsStepProps {
  form: UseFormReturn<UserDetails>;
}

export default function MaterialsAestheticsStep({ form }: MaterialsAestheticsStepProps) {
  const carbonOn = form.watch("carbon_reinforcement");

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Fin Setup */}
      <div>
        <h3 className="text-base font-semibold text-heading mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">6</span>
          Fin Setup
        </h3>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="fin_configuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-medium">
                    What fin setup do you want?
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-border text-heading">
                        <SelectValue placeholder="Select fin configuration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border text-heading">
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="twin">Twin</SelectItem>
                      <SelectItem value="thruster">Thruster (3-fin)</SelectItem>
                      <SelectItem value="quad">Quad (4-fin)</SelectItem>
                      <SelectItem value="2+1">2+1</SelectItem>
                      <SelectItem value="5-fin">5-Fin Option</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fin_size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-medium">
                    What size fins do you prefer?
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: "small", label: "Small" },
                        { value: "medium", label: "Medium" },
                        { value: "large", label: "Large" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => field.onChange(opt.value)}
                          className={`py-3 rounded-xl text-sm font-medium transition-all ${
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

          <FormField
            control={form.control}
            name="fin_placement"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-medium">
                  Any specific fin placement preference?{" "}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder='e.g. "Move fins back 1/4 inch for more drive"'
                    className="h-12 rounded-xl border-border bg-secondary/50 text-heading"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Materials and Construction */}
      <div>
        <h3 className="text-base font-semibold text-heading mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">7</span>
          Materials &amp; Construction
        </h3>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="core_material"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-medium">
                    What core material do you prefer?
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-border text-heading">
                        <SelectValue placeholder="Select core material" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border text-heading">
                      <SelectItem value="PU">PU (Polyurethane)</SelectItem>
                      <SelectItem value="EPS">EPS (Epoxy)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lamination_strength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-medium">
                    What lamination strength do you want?
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-border text-heading">
                        <SelectValue placeholder="Select lamination" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border text-heading">
                      <SelectItem value="standard-4+6oz">Standard (4+6 oz)</SelectItem>
                      <SelectItem value="light-4+4oz">Light (4+4 oz)</SelectItem>
                      <SelectItem value="heavy-6+6oz">Heavy (6+6 oz)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Carbon Reinforcement */}
          <div className="flex flex-col sm:flex-row gap-4">
            <FormField
              control={form.control}
              name="carbon_reinforcement"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 bg-secondary/30 rounded-xl px-4 py-3 border border-border/50 flex-1">
                  <FormControl>
                    <Switch
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="m-0 cursor-pointer text-heading text-sm font-medium">
                    Carbon Fiber Reinforcement
                  </FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            {carbonOn && (
              <FormField
                control={form.control}
                name="carbon_placement"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-border text-heading">
                          <SelectValue placeholder="Carbon placement" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card border-border text-heading">
                        <SelectItem value="tail-patch">Tail Patch</SelectItem>
                        <SelectItem value="full-rail">Full Rail</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>
      </div>

      {/* Aesthetic Preferences */}
      <div>
        <h3 className="text-base font-semibold text-heading mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">8</span>
          Aesthetic Preferences
        </h3>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="color_preference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-medium">
                    What color(s) do you want?{" "}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        placeholder='e.g. "Blue fade to white"'
                        className="h-12 rounded-xl border-border bg-secondary/50 text-heading flex-1"
                        {...field}
                      />
                    </FormControl>
                    <input
                      type="color"
                      className="h-12 w-12 rounded-xl border border-border cursor-pointer bg-secondary/50 p-1"
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="finish"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-medium">
                    Glossy or matte finish?
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: "gloss", label: "Gloss" },
                        { value: "matte", label: "Matte" },
                        { value: "satin", label: "Satin" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => field.onChange(opt.value)}
                          className={`py-3 rounded-xl text-sm font-medium transition-all ${
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

          <FormField
            control={form.control}
            name="custom_graphics"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-medium">
                  Any custom graphics or logos?{" "}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='e.g. "Tribal pattern on the deck" or "Company logo on the nose"'
                    className="rounded-xl border-border bg-secondary/50 text-heading min-h-[70px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Additional Notes */}
      <div>
        <h3 className="text-base font-semibold text-heading mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">9</span>
          Additional Notes
        </h3>
        <FormField
          control={form.control}
          name="additional_notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground font-medium">
                Anything else you'd like the shaper to know?{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={`e.g. "I want it to feel like my old 6'2" thruster but with more paddle power"`}
                  className="rounded-xl border-border bg-secondary/50 text-heading min-h-[90px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
