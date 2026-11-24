import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { UserDetails } from "@/types/userDetails";
import { FITNESS, FREQUENCY, SKILLS } from "@/lib/boardRules";
import { ChoiceGroup, NumberField, Question } from "./controls";

export default function SurferStep({ form }: { form: UseFormReturn<UserDetails> }) {
  const choice = (name: "fitness_level" | "skill" | "surf_frequency", q: string, options: any[], columns?: number) => (
    <FormField
      control={form.control}
      name={name}
      rules={{ required: "Please pick one" }}
      render={({ field }) => (
        <FormItem>
          <Question>{q}</Question>
          <ChoiceGroup value={field.value} onChange={field.onChange} options={options} columns={columns} />
          <FormMessage />
        </FormItem>
      )}
    />
  );
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <NumberField control={form.control} name="height_cm" label="Height" unit="cm" placeholder="175" required min={100} max={220} />
        <NumberField control={form.control} name="weight_kg" label="Weight" unit="kg" placeholder="75" required min={30} max={200} />
      </div>
      {choice("fitness_level", "Fitness", FITNESS, 3)}
      {choice("skill", "Where are you at in your surfing?", SKILLS, 2)}
      {choice("surf_frequency", "How often do you surf?", FREQUENCY, 3)}
    </div>
  );
}
