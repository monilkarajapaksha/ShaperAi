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
import { UserDetails } from "@/types/userDetails";
import { BOARD_COLORS, FIN_COLORS, FIN_SETUPS, FINISHES } from "@/types/boardDesign";

interface MaterialsAestheticsStepProps {
  form: UseFormReturn<UserDetails>;
}

type Option = { value: string | boolean; label: string };

const ON_OFF: Option[] = [
  { value: true, label: "On" },
  { value: false, label: "Off" },
];

function Segmented({ value, onChange, options }: { value: unknown; onChange: (v: unknown) => void; options: Option[] }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          type="button"
          // Clicking the active option clears it, leaving the choice to the AI.
          onClick={() => onChange(value === opt.value ? undefined : opt.value)}
          className={`py-3 rounded-xl text-sm font-medium transition-all ${
            value === opt.value
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function Swatches({ value, onChange, colors }: { value?: string; onChange: (v?: string) => void; colors: readonly { hex: string; name: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {colors.map((c) => (
        <button
          key={c.hex}
          type="button"
          title={c.name}
          aria-label={c.name}
          aria-pressed={value === c.hex}
          onClick={() => onChange(value === c.hex ? undefined : c.hex)}
          className={`w-9 h-9 rounded-lg border border-white/20 transition-transform ${
            value === c.hex ? "ring-2 ring-primary ring-offset-2 ring-offset-card scale-105" : "hover:scale-105"
          }`}
          style={{ backgroundColor: c.hex }}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">
        {colors.find((c) => c.hex === value)?.name ?? "No preference"}
      </span>
    </div>
  );
}

const SectionTitle = ({ n, children }: { n: number; children: React.ReactNode }) => (
  <h3 className="text-base font-semibold text-heading mb-4 flex items-center gap-2">
    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">{n}</span>
    {children}
  </h3>
);

export default function MaterialsAestheticsStep({ form }: MaterialsAestheticsStepProps) {
  const fins = form.watch("fin_configuration");

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Fin Setup */}
      <div>
        <SectionTitle n={6}>Fin Setup</SectionTitle>
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
                        <SelectValue placeholder="Let the AI choose" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border text-heading">
                      {FIN_SETUPS.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {fins !== "none" && (
              <FormField
                control={form.control}
                name="fin_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">
                      What size fins do you prefer?
                    </FormLabel>
                    <FormControl>
                      <Segmented
                        value={field.value}
                        onChange={field.onChange}
                        options={[
                          { value: "small", label: "Small" },
                          { value: "medium", label: "Medium" },
                          { value: "large", label: "Large" },
                        ]}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {fins !== "none" && (
            <FormField
              control={form.control}
              name="fin_placement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-medium">
                    Any fin cant / toe or placement preference?{" "}
                    <span className="text-muted-foreground font-normal">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='e.g. "More cant for a looser feel" or "Less toe for more drive"'
                      className="h-12 rounded-xl border-border bg-secondary/50 text-heading"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </div>

      {/* Construction */}
      <div>
        <SectionTitle n={7}>Construction</SectionTitle>
        <div className="grid md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="stringer"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-medium">Stringer</FormLabel>
                <FormControl>
                  <Segmented value={field.value} onChange={field.onChange} options={ON_OFF} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="leash_plug"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-medium">Leash plug</FormLabel>
                <FormControl>
                  <Segmented value={field.value} onChange={field.onChange} options={ON_OFF} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="finish"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground font-medium">Finish</FormLabel>
                <FormControl>
                  <Segmented
                    value={field.value}
                    onChange={field.onChange}
                    options={FINISHES.map((f) => ({ value: f.id, label: f.id === "foam" ? "Foam" : f.name }))}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Colors & Units */}
      <div>
        <SectionTitle n={8}>Colors &amp; Units</SectionTitle>
        <div className="space-y-4">
          {(
            [
              ["deck_color", "Deck", BOARD_COLORS],
              ["bottom_color", "Bottom", BOARD_COLORS],
              ["fin_color", "Fins", FIN_COLORS],
            ] as const
          ).map(([name, label, colors]) =>
            name === "fin_color" && fins === "none" ? null : (
              <FormField
                key={name}
                control={form.control}
                name={name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">{label}</FormLabel>
                    <FormControl>
                      <Swatches value={field.value} onChange={field.onChange} colors={colors} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )
          )}

          <FormField
            control={form.control}
            name="units"
            render={({ field }) => (
              <FormItem className="max-w-xs">
                <FormLabel className="text-foreground font-medium">Builder units</FormLabel>
                <FormControl>
                  <Segmented
                    value={field.value ?? "imperial"}
                    onChange={(v) => field.onChange(v ?? "imperial")}
                    options={[
                      { value: "imperial", label: "Ft / in" },
                      { value: "metric", label: "Metric" },
                    ]}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Additional Notes */}
      <div>
        <SectionTitle n={9}>Additional Notes</SectionTitle>
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
