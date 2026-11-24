import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { UserDetails } from "@/types/userDetails";
import { GOALS, WAVE_SIZES, WAVE_TYPES, getWarnings } from "@/lib/boardRules";
import { ChoiceGroup, Question, Warnings } from "./controls";

export default function WavesGoalStep({ form }: { form: UseFormReturn<UserDetails> }) {
  const warnings = getWarnings(form.watch());
  const choice = (name: "wave_size" | "wave_type" | "goal", q: string, options: any[], columns: number) => (
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
      {choice("wave_size", "What size are your usual waves?", WAVE_SIZES, 3)}
      {choice("wave_type", "What kind of waves are they?", WAVE_TYPES, 3)}
      {choice("goal", "What do you want most from this board? (pick one)", GOALS, 2)}
      <Warnings items={warnings} />
    </div>
  );
}
