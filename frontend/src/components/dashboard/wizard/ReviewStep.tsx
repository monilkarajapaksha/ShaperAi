import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserDetails } from "@/types/userDetails";
import { BOARD_COLORS, FIN_COLORS, FIN_SETUPS, FINISHES, boardTypeName, formatFeetInches } from "@/types/boardDesign";
import {
  complaintLabel, fitnessLabel, frequencyLabel, getWarnings, goalLabel, skillLabel, waveSizeLabel, waveTypeLabel,
} from "@/lib/boardRules";
import { Warnings } from "./controls";

const nameOf = (list: readonly { id: string; name: string }[], id?: string) => list.find((x) => x.id === id)?.name;
const colorName = (hex?: string) => [...BOARD_COLORS, ...FIN_COLORS].find((c) => c.hex === hex)?.name;

function Row({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === undefined || value === null || value === "" || value === 0) return null;
  const display = typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);
  return (
    <div className="flex justify-between border-b border-border/30 pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-heading text-right max-w-[60%]">{display}</span>
    </div>
  );
}

const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card className="p-5 bg-secondary/20 border-border/50">
    <h3 className="font-semibold text-primary mb-3">{title}</h3>
    <div className="space-y-2 text-sm">{children}</div>
  </Card>
);

export default function ReviewStep({ form, onComplete }: { form: UseFormReturn<UserDetails>; onComplete: (data: UserDetails) => Promise<void> }) {
  const [isLoading, setIsLoading] = useState(false);
  const d = form.getValues();

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await form.handleSubmit(onComplete)();
    } catch (error) {
      console.error("Error generating surfboard:", error);
      toast.error("Failed to generate surfboard configuration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const picked = [d.tail_shape, d.bottom_contour, d.nose_shape, d.wide_point, d.nose_rocker, d.tail_rocker, d.rail_profile, d.rail_edge, d.deck_dome, d.fin_size, d.stance, d.age].filter((v) => v !== undefined).length;
  const colors = [d.deck_color, d.bottom_color, d.fin_color].some(Boolean)
    ? [colorName(d.deck_color), colorName(d.bottom_color), colorName(d.fin_color)].map((c) => c ?? "AI").join(" / ")
    : undefined;

  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-2 gap-5">
        <Block title="The surfer">
          <Row label="Height" value={d.height_cm && `${d.height_cm} cm`} />
          <Row label="Weight" value={d.weight_kg && `${d.weight_kg} kg`} />
          <Row label="Fitness" value={fitnessLabel(d.fitness_level)} />
          <Row label="Skill" value={skillLabel(d.skill)} />
          <Row label="Surfs" value={frequencyLabel(d.surf_frequency)} />
        </Block>
        <Block title="Waves and goal">
          <Row label="Wave size" value={waveSizeLabel(d.wave_size)} />
          <Row label="Wave type" value={waveTypeLabel(d.wave_type)} />
          <Row label="Wants most" value={goalLabel(d.goal)} />
        </Block>
        {(d.current_length_in || d.current_volume_l || d.current_board_complaint) && (
          <Block title="Current board">
            <Row label="Length" value={d.current_length_in && formatFeetInches(d.current_length_in)} />
            <Row label="Volume" value={d.current_volume_l && `${d.current_volume_l} L`} />
            <Row label="Complaint" value={complaintLabel(d.current_board_complaint)} />
          </Block>
        )}
        <Block title="Extras">
          <Row label="Board type" value={d.board_type_preference ? boardTypeName(d.board_type_preference) : "Let AI choose"} />
          <Row label="Fins" value={nameOf(FIN_SETUPS, d.fin_configuration) ?? "Let AI choose"} />
          <Row label="Finish" value={nameOf(FINISHES, d.finish)} />
          <Row label="Deck / bottom / fins" value={colors} />
          {d.shaper_mode && <Row label="Shaper-mode picks" value={`${picked} set`} />}
        </Block>
      </div>

      {d.additional_notes && (
        <Card className="p-4 bg-secondary/20 border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Notes</p>
          <p className="text-sm text-heading">{d.additional_notes}</p>
        </Card>
      )}

      <Warnings items={getWarnings(d)} />

      <div className="text-center pt-2">
        <div className="bg-primary/5 border border-primary/10 p-8 rounded-2xl">
          <h3 className="text-xl font-bold text-heading mb-2">Ready to generate your shape?</h3>
          <p className="text-body mb-6 max-w-lg mx-auto">
            The AI shaper decides rocker, rails, tail, bottom and fins from your answers. You can fine-tune the result next.
          </p>
          <Button onClick={handleSubmit} size="lg" className="w-full md:w-auto min-w-[200px] h-12" disabled={isLoading}>
            {isLoading ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />Processing...</>) : "Generate AI Shape"}
          </Button>
        </div>
      </div>
    </div>
  );
}
