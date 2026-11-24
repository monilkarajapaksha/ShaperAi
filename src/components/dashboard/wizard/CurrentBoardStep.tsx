import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem } from "@/components/ui/form";
import { UserDetails } from "@/types/userDetails";
import { COMPLAINTS } from "@/lib/boardRules";
import { ChoiceGroup, NumberField, Question } from "./controls";

/** Current length is typed as feet + inches but stored as total inches. */
function LengthField({ form }: { form: UseFormReturn<UserDetails> }) {
  return (
    <FormField
      control={form.control}
      name="current_length_in"
      render={({ field }) => {
        const total = field.value;
        const ft = total !== undefined ? Math.floor(total / 12) : "";
        const inch = total !== undefined ? total % 12 : "";
        const set = (f: string, i: string) => {
          if (f === "" && i === "") return field.onChange(undefined);
          field.onChange(Number(f || 0) * 12 + Number(i || 0));
        };
        const cls = "h-12 w-full rounded-xl border border-border bg-secondary/50 px-3 pr-9 text-heading outline-none focus:ring-1 focus:ring-primary";
        return (
          <FormItem>
            <Question optional>Length</Question>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <input type="number" min={0} max={12} placeholder="6" className={cls} value={ft}
                  onChange={(e) => set(e.target.value, String(inch))} aria-label="Feet" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">ft</span>
              </div>
              <div className="relative">
                <input type="number" min={0} max={11.99} step={0.25} placeholder="0" className={cls} value={inch}
                  onChange={(e) => set(String(ft), e.target.value)} aria-label="Inches" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">in</span>
              </div>
            </div>
          </FormItem>
        );
      }}
    />
  );
}

export default function CurrentBoardStep({ form }: { form: UseFormReturn<UserDetails> }) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <p className="text-sm text-muted-foreground text-center">
        Skip this if you're new or don't have a board. If you do, it's the most useful thing you can tell us: it shows the AI what to fix.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        <LengthField form={form} />
        <NumberField control={form.control} name="current_volume_l" label="Volume" unit="L" placeholder="30" optional min={10} max={120} step={0.1} />
      </div>
      <FormField
        control={form.control}
        name="current_board_complaint"
        render={({ field }) => (
          <FormItem>
            <Question optional>What's your biggest complaint about it?</Question>
            <ChoiceGroup
              value={field.value}
              onChange={field.onChange}
              options={COMPLAINTS}
              columns={3}
              allowClear
            />
          </FormItem>
        )}
      />
    </div>
  );
}
