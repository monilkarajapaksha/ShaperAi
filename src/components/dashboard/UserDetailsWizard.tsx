import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import PersonalDetailsStep from "./wizard/PersonalDetailsStep";
import SurfingPreferencesStep from "./wizard/SurfingPreferencesStep";
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
    id: "personal",
    title: "User Details",
    description: "Tell us about yourself",
  },
  {
    id: "preferences",
    title: "Surf Preference",
    description: "Your surfing style and conditions",
  },
  {
    id: "review",
    title: "Review Suggestions",
    description: "Confirm details and see recommendations",
  },
];

export default function UserDetailsWizard({
  onComplete,
}: UserDetailsWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const boardConfiguration = useBoardConfiguration();
  const form = useForm<UserDetails>({
    defaultValues: {
      fitness_level: "avg",
      goal_style: "all-rounder",
      stance_bias: "neutral",
      wetsuit: false,
      wind_regime: "variable",
      construction_preference: "PU",
      rocker_profile_type: "continuous",
    },
  });

  const nextStep = async () => {
    // Validate before moving to next step
    const fieldsToValidate = currentStep === 0 
      ? ['weight_kg', 'height_mm', 'skill', 'location']
      : currentStep === 1 
        ? ['fitness_level', 'goal_style', 'stance_bias']
        : [];
    
    // @ts-ignore - dynamic key access
    const result = await form.trigger(fieldsToValidate);
    
    if (result && currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const generateSuggestion = async (
    data: UserDetails
  ): Promise<SurfboardSuggestion> => {
    try {
      // For demo/development without backend, we'll use local calculation if API fails
      // In production, this would wait for the API
      try {
         return await boardConfiguration.mutateAsync(data);
      } catch (e) {
         console.warn("API unavailable, falling back to local calculation");
         throw e;
      }
    } catch (error) {
      console.error("Error fetching board configuration:", error);

      // Fallback to local calculation if API fails
      const baseLength = data.height_mm / 10;
      const weightFactor = data.weight_kg / 70;

      const skillMultipliers = {
        beginner: { length: 1.2, width: 1.15, thickness: 1.1 },
        novice: { length: 1.1, width: 1.1, thickness: 1.05 },
        intermediate: { length: 1.0, width: 1.0, thickness: 1.0 },
        advanced: { length: 0.95, width: 0.95, thickness: 0.95 },
        expert: { length: 0.9, width: 0.9, thickness: 0.9 },
      };

      // @ts-ignore
      const multiplier = skillMultipliers[data.skill] || skillMultipliers.intermediate;

      const rawLength = Math.round(
        baseLength * multiplier.length * weightFactor
      );
      const rawWidth = Math.round(50 * multiplier.width * weightFactor);
      const rawThickness = Math.round(6 * multiplier.thickness);

      const fallbackLength = Math.max(150, Math.min(220, rawLength));
      const fallbackWidth = Math.max(40, Math.min(65, rawWidth));
      const fallbackThickness = Math.max(4, Math.min(10, rawThickness));

      return {
        length: fallbackLength,
        width: fallbackWidth,
        thickness: fallbackThickness,
        noseWidth: Math.round(fallbackWidth * 0.6),
        tailWidth: Math.round(fallbackWidth * 0.7),
        reasoning: `Based on your ${data.skill} skill level, ${data.height_mm}mm height, and ${data.weight_kg}kg weight, we recommend a ${fallbackLength}cm board for optimal performance and stability.`,
        boardVolume: Math.round(
          (fallbackLength * fallbackWidth * fallbackThickness) / 1000 * 0.55 // crude approximation
        ),
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

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Step Navigation */}
      <div className="mb-12">
        <div className="flex items-center justify-center space-x-4 md:space-x-12">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold transition-all duration-300 border-2 ${
                  index <= currentStep
                    ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(var(--primary),0.4)]"
                    : "bg-secondary text-muted-foreground border-border"
                }`}
              >
                {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
              </div>
              <div className="mt-3 text-center hidden md:block">
                <div
                  className={`text-sm font-medium transition-colors duration-300 ${
                    index <= currentStep ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {step.title}
                </div>
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div 
                   className={`absolute top-5 left-1/2 w-[calc(100%+3rem)] h-0.5 -z-10 transition-colors duration-500 ${
                     index < currentStep ? "bg-primary" : "bg-border"
                   }`} 
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-card border border-border/50 rounded-2xl shadow-2xl p-6 md:p-10 relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="text-center mb-8 relative z-10">
          <h1 className="text-3xl font-bold tracking-tight text-heading mb-2">
            {steps[currentStep].title}
          </h1>
          <p className="text-body max-w-lg mx-auto">
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
                {currentStep === 1 && (
                  <SurfingPreferencesStep form={form} />
                )}
                {currentStep === 2 && (
                  <ReviewStep form={form} onComplete={handleComplete} />
                )}
              </motion.div>
            </AnimatePresence>
          </Form>
        </div>

        {/* Navigation */}
        {currentStep < 2 && (
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
