import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import SurferStep from "./wizard/SurferStep";
import WavesGoalStep from "./wizard/WavesGoalStep";
import CurrentBoardStep from "./wizard/CurrentBoardStep";
import ExtrasStep from "./wizard/ExtrasStep";
import ReviewStep from "./wizard/ReviewStep";
import { UserDetails, SurfboardSuggestion } from "@/types/userDetails";
import { useBoardConfiguration } from "@/hooks/use-board-configuration";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { pruneInvalidPicks } from "@/lib/boardRules";
import { applyExplicitChoices, fallbackSuggestion } from "@/lib/designFromPreferences";

interface UserDetailsWizardProps {
  onComplete: (
    userDetails: UserDetails,
    suggestion: SurfboardSuggestion
  ) => void | Promise<void>;
}

// The surfer only describes themselves, the waves and the goal. The AI decides the shape.
const steps = [
  { id: "surfer", title: "The Surfer", description: "Tell us about you" },
  { id: "waves", title: "Waves & Goal", description: "Where you surf and what you want most" },
  { id: "current", title: "Current Board", description: "Optional, but it tells the AI what to fix" },
  { id: "extras", title: "Extras", description: "Board type, fins, colours. All optional" },
  { id: "review", title: "Review & Generate", description: "Confirm and generate your board" },
];

const SHAPER_ONLY_KEYS: (keyof UserDetails)[] = [
  "age", "stance", "nose_shape", "tail_shape", "wide_point", "nose_rocker", "tail_rocker", "rail_profile",
  "rail_edge", "deck_dome", "bottom_contour", "fin_size", "fin_placement", "stringer", "leash_plug",
];

const REQUIRED_BY_STEP: Record<number, (keyof UserDetails)[]> = {
  0: ["height_cm", "weight_kg", "fitness_level", "skill", "surf_frequency"],
  1: ["wave_size", "wave_type", "goal"],
};

export default function UserDetailsWizard({ onComplete }: UserDetailsWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const boardConfiguration = useBoardConfiguration();
  const form = useForm<UserDetails>({
    // Nothing required is pre-selected, so people answer instead of skipping.
    defaultValues: { units: "imperial", shaper_mode: false },
  });

  const nextStep = async () => {
    const fieldsToValidate = REQUIRED_BY_STEP[currentStep] ?? [];

    const result =
      fieldsToValidate.length > 0
        ? await form.trigger(fieldsToValidate)
        : true;

    if (result && currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const generateSuggestion = async (data: UserDetails): Promise<SurfboardSuggestion> => {
    try {
      const suggestion = await boardConfiguration.mutateAsync(data);
      return { ...suggestion, design: applyExplicitChoices(suggestion.design, data) };
    } catch (error) {
      console.error("Error fetching board configuration, using fallback:", error);
      toast.warning("AI shaper unavailable", {
        description: "Using an offline estimate — you can refine it in the builder.",
      });
      return fallbackSuggestion(data);
    }
  };

  const handleComplete = async (raw: UserDetails) => {
    // Drop shaper-mode picks that don't fit the chosen board type, and everything when shaper mode is off.
    const data = { ...raw, ...pruneInvalidPicks(raw) };
    if (!data.shaper_mode) {
      for (const k of SHAPER_ONLY_KEYS) delete data[k];
    }
    const suggestion = await generateSuggestion(data);
    onComplete(data, suggestion);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Step Navigation */}
      <div className="mb-10 overflow-x-auto pb-2">
        <div className="flex items-center justify-center space-x-2 md:space-x-8 min-w-max mx-auto px-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              <div
                className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold transition-all duration-300 border-2 ${
                  index <= currentStep
                    ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(var(--primary),0.4)]"
                    : "bg-secondary text-muted-foreground border-border"
                }`}
              >
                {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              <div className="mt-2 text-center hidden md:block">
                <div
                  className={`text-xs font-medium transition-colors duration-300 whitespace-nowrap ${
                    index <= currentStep ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {step.title}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-4.5 left-1/2 w-[calc(100%+2rem)] h-0.5 -z-10 transition-colors duration-500 ${
                    index < currentStep ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content Card */}
      <div className="bg-card border border-border/50 rounded-2xl shadow-2xl p-6 md:p-10 relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="text-center mb-8 relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-heading mb-1">
            {steps[currentStep].title}
          </h1>
          <p className="text-body max-w-lg mx-auto text-sm">
            {steps[currentStep].description}
          </p>
        </div>

        <div className="relative z-10 min-h-[400px]">
          <Form {...form}>
            <AnimatePresence mode="wait" custom={currentStep}>
              <motion.div
                key={currentStep}
                custom={currentStep}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
              >
                {currentStep === 0 && <SurferStep form={form} />}
                {currentStep === 1 && <WavesGoalStep form={form} />}
                {currentStep === 2 && <CurrentBoardStep form={form} />}
                {currentStep === 3 && <ExtrasStep form={form} />}
                {currentStep === 4 && <ReviewStep form={form} onComplete={handleComplete} />}
              </motion.div>
            </AnimatePresence>
          </Form>
        </div>

        {/* Navigation */}
        {!isLastStep && (
          <div className="flex justify-between mt-10 pt-6 border-t border-border/50 relative z-10">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="text-muted-foreground hover:text-heading hover:bg-white/5"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button
              onClick={nextStep}
              className="px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.25)]"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
