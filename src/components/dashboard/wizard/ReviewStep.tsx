import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UserDetails } from "@/types/userDetails";
import { User, Activity, Waves, Settings, Loader2, Wrench, Palette } from "lucide-react";
import { toast } from "sonner";

interface ReviewStepProps {
  form: UseFormReturn<UserDetails>;
  onComplete: (data: UserDetails) => Promise<void>;
}

function Row({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === undefined || value === null || value === "" || value === false) return null;
  const display = typeof value === "boolean" ? "Yes" : String(value);
  return (
    <div className="flex justify-between border-b border-border/30 pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium text-heading capitalize text-right max-w-[60%]">{display}</span>
    </div>
  );
}

export default function ReviewStep({ form, onComplete }: ReviewStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const data = form.getValues();

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

  const waveTypes = data.wave_type_preference?.join(", ");

  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-2 gap-5">
        {/* Surfer Profile */}
        <Card className="p-5 bg-secondary/20 border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-primary">Surfer Profile</h3>
          </div>
          <div className="space-y-2 text-sm">
            <Row label="Height" value={data.height_cm ? `${data.height_cm} cm` : undefined} />
            <Row label="Weight" value={data.weight_kg ? `${data.weight_kg} kg` : undefined} />
            <Row label="Age" value={data.age ? `${data.age} yrs` : undefined} />
            <Row label="Fitness" value={data.fitness_level} />
            <Row label="Skill" value={data.skill} />
            <Row label="Frequency" value={data.surf_frequency} />
            <Row label="Stance" value={data.stance} />
            <Row label="Board Type" value={data.board_type_preference} />
          </div>
        </Card>

        {/* Style & Conditions */}
        <Card className="p-5 bg-secondary/20 border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Waves className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-blue-400">Style &amp; Conditions</h3>
          </div>
          <div className="space-y-2 text-sm">
            <Row label="Style" value={data.surfing_style?.replace("-", " ")} />
            <Row label="Wave Types" value={waveTypes} />
            <Row label="Board Feel" value={data.board_feel?.replace(/-/g, " ")} />
            <Row label="Wave Size" value={data.wave_size} />
            <Row label="Home Break" value={data.home_break} />
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Current Board Dims */}
        {(data.current_length_ft || data.current_width_in) && (
          <Card className="p-5 bg-secondary/20 border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-teal-400" />
              <h3 className="font-semibold text-teal-400">Current Board</h3>
            </div>
            <div className="space-y-2 text-sm">
              <Row label="Length" value={data.current_length_ft ? `${data.current_length_ft} ft` : undefined} />
              <Row label="Width" value={data.current_width_in ? `${data.current_width_in}"` : undefined} />
              <Row label="Thickness" value={data.current_thickness_in ? `${data.current_thickness_in}"` : undefined} />
              <Row label="Volume" value={data.current_volume_l ? `${data.current_volume_l} L` : undefined} />
              <Row label="Nose Width" value={data.current_nose_width_in ? `${data.current_nose_width_in}"` : undefined} />
              <Row label="Tail Width" value={data.current_tail_width_in ? `${data.current_tail_width_in}"` : undefined} />
            </div>
          </Card>
        )}

        {/* Shape Features */}
        {(data.nose_shape || data.tail_shape || data.nose_rocker) && (
          <Card className="p-5 bg-secondary/20 border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-4 h-4 text-orange-400" />
              <h3 className="font-semibold text-orange-400">Shape Features</h3>
            </div>
            <div className="space-y-2 text-sm">
              <Row label="Nose Shape" value={data.nose_shape} />
              <Row label="Tail Shape" value={data.tail_shape} />
              <Row label="Nose Rocker" value={data.nose_rocker} />
              <Row label="Tail Rocker" value={data.tail_rocker} />
              <Row label="Rail Profile" value={data.rail_profile?.replace(/-/g, " ")} />
              <Row label="Bottom" value={data.bottom_contour?.replace(/-/g, " ")} />
            </div>
          </Card>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Fins & Materials */}
        {(data.fin_configuration || data.core_material) && (
          <Card className="p-5 bg-secondary/20 border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="w-4 h-4 text-purple-400" />
              <h3 className="font-semibold text-purple-400">Fins &amp; Materials</h3>
            </div>
            <div className="space-y-2 text-sm">
              <Row label="Fins" value={data.fin_configuration} />
              <Row label="Fin Size" value={data.fin_size} />
              <Row label="Core" value={data.core_material} />
              <Row label="Lamination" value={data.lamination_strength?.replace(/-/g, " ")} />
              <Row label="Carbon" value={data.carbon_reinforcement} />
              <Row label="Carbon Placement" value={data.carbon_placement?.replace(/-/g, " ")} />
            </div>
          </Card>
        )}

        {/* Aesthetics */}
        {(data.color_preference || data.finish) && (
          <Card className="p-5 bg-secondary/20 border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-4 h-4 text-pink-400" />
              <h3 className="font-semibold text-pink-400">Aesthetics</h3>
            </div>
            <div className="space-y-2 text-sm">
              <Row label="Color" value={data.color_preference} />
              <Row label="Finish" value={data.finish} />
              <Row label="Graphics" value={data.custom_graphics} />
            </div>
          </Card>
        )}
      </div>

      {data.current_board_feedback && (
        <Card className="p-4 bg-secondary/20 border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Current Board Feedback</p>
          <p className="text-sm text-heading">{data.current_board_feedback}</p>
        </Card>
      )}

      {data.additional_notes && (
        <Card className="p-4 bg-secondary/20 border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Additional Notes</p>
          <p className="text-sm text-heading">{data.additional_notes}</p>
        </Card>
      )}

      <Separator className="bg-border/50" />

      {/* Action */}
      <div className="text-center pt-2">
        <div className="bg-primary/5 border border-primary/10 p-8 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <h3 className="text-xl font-bold text-heading mb-2 relative z-10">
            Ready to Generate Your Shape?
          </h3>
          <p className="text-body mb-6 max-w-lg mx-auto relative z-10">
            Our AI shaper will analyse your profile and preferences to create a custom board
            geometry. You can fine-tune the result in the next step.
          </p>
          <Button
            onClick={handleSubmit}
            size="lg"
            className="w-full md:w-auto min-w-[200px] h-12 shadow-[0_0_20px_rgba(var(--primary),0.3)] relative z-10"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Generate AI Shape"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
