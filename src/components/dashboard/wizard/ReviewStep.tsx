import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UserDetails } from "@/types/userDetails";
import { User, Activity, Waves, Settings, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ReviewStepProps {
  form: UseFormReturn<UserDetails>;
  onComplete: (data: UserDetails) => Promise<void>;
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
      toast.error(
        "Failed to generate surfboard configuration. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <Card className="p-5 bg-secondary/20 border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-primary">Personal Details</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-border/30 pb-2">
              <span className="text-muted-foreground">Weight:</span>
              <span className="font-medium text-heading">{data.weight_kg} kg</span>
            </div>
            <div className="flex justify-between border-b border-border/30 pb-2">
              <span className="text-muted-foreground">Height:</span>
              <span className="font-medium text-heading">{data.height_mm} mm</span>
            </div>
            <div className="flex justify-between border-b border-border/30 pb-2">
              <span className="text-muted-foreground">Skill Level:</span>
              <span className="font-medium text-heading capitalize">{data.skill}</span>
            </div>
            {data.location && (
              <div className="flex justify-between pt-1">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium text-heading">{data.location}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Surfing Preferences */}
        <Card className="p-5 bg-secondary/20 border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-blue-400">Preferences</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-border/30 pb-2">
              <span className="text-muted-foreground">Fitness:</span>
              <span className="font-medium text-heading capitalize">
                {data.fitness_level}
              </span>
            </div>
            <div className="flex justify-between border-b border-border/30 pb-2">
              <span className="text-muted-foreground">Goal:</span>
              <span className="font-medium text-heading">
                {data.goal_style?.replace("-", " ")}
              </span>
            </div>
            <div className="flex justify-between border-b border-border/30 pb-2">
              <span className="text-muted-foreground">Stance:</span>
              <span className="font-medium text-heading">
                {data.stance_bias?.replace("-", " ")}
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-muted-foreground">Wetsuit:</span>
              <span className="font-medium text-heading">{data.wetsuit ? "Yes" : "No"}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Wave Conditions */}
      <Card className="p-5 bg-secondary/20 border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <Waves className="w-4 h-4 text-teal-400" />
          <h3 className="font-semibold text-teal-400">Wave Conditions</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-6 text-sm">
          {data.wave_power && (
            <div className="flex justify-between md:block">
              <span className="text-muted-foreground block mb-1">Wave Power:</span>
              <span className="font-medium text-heading">{data.wave_power}/10</span>
            </div>
          )}
          <div className="flex justify-between md:block">
            <span className="text-muted-foreground block mb-1">Wind:</span>
            <span className="font-medium text-heading capitalize">{data.wind_regime}</span>
          </div>
          {data.swell_period_s && (
            <div className="flex justify-between md:block">
              <span className="text-muted-foreground block mb-1">Swell Period:</span>
              <span className="font-medium text-heading">{data.swell_period_s}s</span>
            </div>
          )}
        </div>
      </Card>

      <Separator className="bg-border/50" />

      {/* Action */}
      <div className="text-center pt-4">
        <div className="bg-primary/5 border border-primary/10 p-8 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <h3 className="text-xl font-bold text-heading mb-2 relative z-10">
            Ready to Generate Your Shape?
          </h3>
          <p className="text-body mb-6 max-w-lg mx-auto relative z-10">
            Our neural engine will analyze your biometrics and preferences to create a
            signature board geometry. You can fine-tune the result in the next step.
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
