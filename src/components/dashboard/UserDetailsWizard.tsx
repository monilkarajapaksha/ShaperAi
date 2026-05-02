import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import PersonalDetailsStep from "./wizard/PersonalDetailsStep";
import SurfingPreferencesStep from "./wizard/SurfingPreferencesStep";
import BoardSpecsStep from "./wizard/BoardSpecsStep";
import MaterialsAestheticsStep from "./wizard/MaterialsAestheticsStep";
import ReviewStep from "./wizard/ReviewStep";
import { UserDetails, SurfboardSuggestion } from "@/types/userDetails";
import { useBoardConfiguration } from "@/hooks/use-board-configuration";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

interface UserDetailsWizardProps {
  onComplete: (
    userDetails: UserDetails,
    suggestion: SurfboardSuggestion
  ) => void | Promise<void>;
}

const steps = [
  {
    id: "profile",
    title: "Surfer Profile",
    description: "Tell us about yourself",
  },
  {
    id: "style",
    title: "Style & Conditions",
    description: "Your surfing preferences and home break",
  },
  {
    id: "board-specs",
    title: "Board Specs",
    description: "Current board dimensions and shape features",
  },
  {
    id: "materials",
    title: "Materials & Look",
    description: "Fins, construction, and aesthetics",
  },
  {
    id: "review",
    title: "Review & Generate",
    description: "Confirm details and generate your board",
  },
];

export default function UserDetailsWizard({ onComplete }: UserDetailsWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const boardConfiguration = useBoardConfiguration();
  const form = useForm<UserDetails>({
    defaultValues: {
      fitness_level: "average",
      skill: "intermediate",
      surf_frequency: "weekly",
      stance: "regular",
    },
  });

  const nextStep = async () => {
    let fieldsToValidate: (keyof UserDetails)[] = [];

    if (currentStep === 0) {
      fieldsToValidate = ["height_cm", "weight_kg", "skill", "surf_frequency", "stance"];
    }

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
      return await boardConfiguration.mutateAsync(data);
    } catch (error) {
      console.error("Error fetching board configuration, using fallback:", error);

      // Fallback local calculation (ft and inches)
      const skillMultipliers: Record<string, number> = {
        beginner: 1.2,
        intermediate: 1.0,
        advanced: 0.95,
        pro: 0.9,
      };
      const mult = skillMultipliers[data.skill] ?? 1.0;
      const weightFactor = data.weight_kg / 75;

      const rawLength = (data.height_cm / 100) * 2 * mult * weightFactor; // rough ft
      const fallbackLength = Math.max(5.0, Math.min(10.0, Math.round(rawLength * 4) / 4));
      const fallbackWidth = Math.max(18, Math.min(24, Math.round(20.5 * weightFactor * 10) / 10));
      const fallbackThickness = Math.max(2.0, Math.min(3.5, Math.round(2.75 * mult * 10) / 10));

      return {
        length: fallbackLength,
        width: fallbackWidth,
        thickness: fallbackThickness,
        noseWidth: Math.round(fallbackWidth * 0.7 * 10) / 10,
        tailWidth: Math.round(fallbackWidth * 0.8 * 10) / 10,
        reasoning: `Based on your ${data.skill} skill level, ${data.height_cm}cm height, and ${data.weight_kg}kg weight, a ${fallbackLength}ft board is recommended.`,
        boardVolume: Math.round(fallbackLength * 12 * fallbackWidth * fallbackThickness * 0.016387 * 0.6 * 10) / 10,
      };
    }
  };

  const handleComplete = async (data: UserDetails) => {
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
                {currentStep === 0 && <PersonalDetailsStep form={form} />}
                {currentStep === 1 && <SurfingPreferencesStep form={form} />}
                {currentStep === 2 && <BoardSpecsStep form={form} />}
                {currentStep === 3 && <MaterialsAestheticsStep form={form} />}
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
