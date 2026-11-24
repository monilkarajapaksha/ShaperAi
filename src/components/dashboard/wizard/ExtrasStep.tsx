import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { NumberField, ChoiceGroup, Question, Warnings } from "./controls";
import { UserDetails } from "@/types/userDetails";
import {
  BOARD_COLORS, BOARD_TYPES, FIN_COLORS, FIN_SETUPS, FINISHES, RAIL_PROFILES, TAIL_SHAPES, boardTypeName,
} from "@/types/boardDesign";
import { bottomsFor, boardTypesFor, finsFor, getWarnings, pruneInvalidPicks, tailsFor } from "@/lib/boardRules";

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
      <span className="text-xs text-muted-foreground ml-1">{colors.find((c) => c.hex === value)?.name ?? "Let AI choose"}</span>
    </div>
  );
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-4">
    <h3 className="text-base font-semibold text-heading">{title}</h3>
    {children}
  </div>
);

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");
const opts = (vals: string[]) => vals.map((v) => ({ value: v, label: cap(v) }));

export default function ExtrasStep({ form }: { form: UseFormReturn<UserDetails> }) {
  const d = form.watch();
  const type = d.board_type_preference;
  const shaper = !!d.shaper_mode;
  const skillTypes = boardTypesFor(d.skill, shaper);
  const fins = d.fin_configuration;

  // Keep dependent picks valid whenever skill, board type or mode change.
  useEffect(() => {
    const dropped = pruneInvalidPicks(form.getValues());
    (Object.keys(dropped) as (keyof UserDetails)[]).forEach((k) => form.setValue(k, undefined as never));
  }, [type, d.skill, shaper, form]);

  const field = <K extends keyof UserDetails>(name: K, render: (v: UserDetails[K], set: (v: UserDetails[K] | undefined) => void) => React.ReactNode, label: string, optional = true) => (
    <FormField
      control={form.control}
      name={name as never}
      render={({ field: f }) => (
        <FormItem>
          <Question optional={optional}>{label}</Question>
          {render(f.value as UserDetails[K], f.onChange as never)}
        </FormItem>
      )}
    />
  );

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <p className="text-sm text-muted-foreground text-center">
        Everything here is optional. Leave it and the AI chooses for you.
      </p>

      <Section title="Board type">
        {field(
          "board_type_preference",
          (v, set) => (
            <ChoiceGroup
              value={v}
              onChange={set}
              allowClear
              columns={4}
              options={BOARD_TYPES.filter((t) => skillTypes.includes(t.id)).map((t) => ({ value: t.id, label: t.name }))}
            />
          ),
          "Pick a type, or tap it again to let the AI choose",
        )}
        <p className="text-xs text-muted-foreground">
          {type ? `Showing options that suit the ${boardTypeName(type).toLowerCase()}.` : "Let AI choose is on."}
        </p>
      </Section>

      <Section title="Fins">
        {type ? (
          field(
            "fin_configuration",
            (v, set) => (
              <ChoiceGroup
                value={v}
                onChange={set}
                allowClear
                columns={4}
                options={FIN_SETUPS.filter((f) => finsFor(type).includes(f.id)).map((f) => ({ value: f.id, label: f.name }))}
              />
            ),
            "Fin setup",
          )
        ) : (
          <p className="text-sm text-muted-foreground">Fins: Let AI choose. Pick a board type above to see fin setups that work with it.</p>
        )}
      </Section>

      <Section title="Colours and finish">
        {field("finish", (v, set) => <ChoiceGroup value={v} onChange={set} allowClear columns={3} options={FINISHES.map((f) => ({ value: f.id, label: f.name }))} />, "Finish")}
        {field("deck_color", (v, set) => <Swatches value={v} onChange={set} colors={BOARD_COLORS} />, "Deck")}
        {field("bottom_color", (v, set) => <Swatches value={v} onChange={set} colors={BOARD_COLORS} />, "Bottom")}
        {fins !== "none" && field("fin_color", (v, set) => <Swatches value={v} onChange={set} colors={FIN_COLORS} />, "Fins")}
        {field(
          "units",
          (v, set) => (
            <ChoiceGroup value={v ?? "imperial"} onChange={(x) => set(x ?? "imperial")} columns={2} options={[{ value: "imperial", label: "Ft / in" }, { value: "metric", label: "Metric" }]} />
          ),
          "Builder units",
          false,
        )}
        <FormField
          control={form.control}
          name="additional_notes"
          render={({ field: f }) => (
            <FormItem>
              <Question optional>Anything else the shaper should know?</Question>
              <Textarea {...f} value={f.value ?? ""} placeholder="e.g. I want something like my old 6'2 thruster but easier to paddle" className="rounded-xl border-border bg-secondary/50 text-heading min-h-[80px] resize-none" />
            </FormItem>
          )}
        />
      </Section>

      <Warnings items={getWarnings(d)} />

      {/* Shaper mode */}
      <div className="rounded-2xl border border-border/60 p-4 space-y-5">
        <FormField
          control={form.control}
          name="shaper_mode"
          render={({ field: f }) => (
            <FormItem className="flex items-center justify-between gap-4 space-y-0">
              <div>
                <FormLabel className="text-foreground font-semibold">Advanced / Shaper mode</FormLabel>
                <p className="text-xs text-muted-foreground mt-0.5">Set shape details yourself. Your picks override the AI.</p>
              </div>
              <Switch checked={!!f.value} onCheckedChange={f.onChange} />
            </FormItem>
          )}
        />

        {shaper && (
          <div className="space-y-5 pt-2">
            {!type && (
              <p className="text-sm text-amber-300">Choose a board type above to unlock tail and bottom options that fit it.</p>
            )}
            {type && field("tail_shape", (v, set) => <ChoiceGroup value={v} onChange={set} allowClear columns={4} options={TAIL_SHAPES.filter((t) => tailsFor(type).includes(t.id)).map((t) => ({ value: t.id, label: t.name }))} />, "Tail shape")}
            {type && field("bottom_contour", (v, set) => <ChoiceGroup value={v} onChange={set} allowClear columns={3} options={opts(bottomsFor(type))} />, "Bottom")}
            {field("nose_shape", (v, set) => <ChoiceGroup value={v} onChange={set} allowClear columns={3} options={opts(["pointed", "medium", "round"])} />, "Nose tip")}
            {field("wide_point", (v, set) => <ChoiceGroup value={v} onChange={set} allowClear columns={3} options={opts(["back", "centered", "forward"])} />, "Wide point")}
            {field("nose_rocker", (v, set) => <ChoiceGroup value={v} onChange={set} allowClear columns={3} options={opts(["low", "medium", "high"])} />, "Nose rocker")}
            {field("tail_rocker", (v, set) => <ChoiceGroup value={v} onChange={set} allowClear columns={3} options={opts(["low", "medium", "high"])} />, "Tail rocker")}
            {field("rail_profile", (v, set) => <ChoiceGroup value={v} onChange={set} allowClear columns={4} options={RAIL_PROFILES.map((r) => ({ value: r, label: r }))} />, "Rail profile")}
            {field("rail_edge", (v, set) => <ChoiceGroup value={v} onChange={set} allowClear columns={3} options={opts(["soft", "medium", "hard"])} />, "Rail edge")}
            {field("deck_dome", (v, set) => <ChoiceGroup value={v} onChange={set} allowClear columns={3} options={opts(["flat", "moderate", "domed"])} />, "Deck dome")}
            {fins !== "none" && field("fin_size", (v, set) => <ChoiceGroup value={v} onChange={set} allowClear columns={3} options={opts(["small", "medium", "large"])} />, "Fin size")}
            {field("stance", (v, set) => <ChoiceGroup value={v} onChange={set} allowClear columns={2} options={opts(["regular", "goofy"])} />, "Stance")}
            {field("stringer", (v, set) => <ChoiceGroup value={v} onChange={set} allowClear columns={2} options={[{ value: true, label: "Stringer" }, { value: false, label: "No stringer" }]} />, "Stringer")}
            {field("leash_plug", (v, set) => <ChoiceGroup value={v} onChange={set} allowClear columns={2} options={[{ value: true, label: "Leash plug" }, { value: false, label: "No leash plug" }]} />, "Leash plug")}
            <div className="max-w-[10rem]">
              <NumberField control={form.control} name="age" label="Age" unit="yrs" optional min={5} max={100} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
