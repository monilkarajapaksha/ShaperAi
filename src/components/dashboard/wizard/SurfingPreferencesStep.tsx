import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { UserDetails } from '@/types/userDetails';

interface SurfingPreferencesStepProps {
  form: UseFormReturn<UserDetails>;
}

export default function SurfingPreferencesStep({ form }: SurfingPreferencesStepProps) {
  return (
    <div className="space-y-6">
      {/* Primary Preferences */}
      <div className="grid md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="fitness_level"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-heading">Fitness Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-border text-heading">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-card border-border text-heading">
                  <SelectItem value="low">Low - Casual surfer</SelectItem>
                  <SelectItem value="avg">Average - Regular exercise</SelectItem>
                  <SelectItem value="high">High - Very active</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="goal_style"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-heading">Surfing Goal</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-border text-heading">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-card border-border text-heading">
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="trim">Trim (Flow)</SelectItem>
                  <SelectItem value="noseride">Noseride</SelectItem>
                  <SelectItem value="all-rounder">All-rounder</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="stance_bias"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-heading">Stance Preference</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-border text-heading">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-card border-border text-heading">
                  <SelectItem value="front-foot">Front-foot heavy</SelectItem>
                  <SelectItem value="back-foot">Back-foot heavy</SelectItem>
                  <SelectItem value="neutral">Neutral/balanced</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="wind_regime"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-heading">Typical Wind</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-border text-heading">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-card border-border text-heading">
                  <SelectItem value="onshore">Onshore</SelectItem>
                  <SelectItem value="offshore">Offshore</SelectItem>
                  <SelectItem value="variable">Variable</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Advanced Options */}
      <div className="space-y-4 pt-4 border-t border-border/50">
        <h3 className="text-lg font-medium text-heading">Advanced Specifications</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="construction_preference"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-heading">Board Construction</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-border text-heading">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-card border-border text-heading">
                    <SelectItem value="PU">PU (Polyurethane)</SelectItem>
                    <SelectItem value="EPS">EPS (Epoxy)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rocker_profile_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-heading">Rocker Profile</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-border text-heading">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-card border-border text-heading">
                    <SelectItem value="continuous">Continuous</SelectItem>
                    <SelectItem value="staged">Staged</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="swell_period_s"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-heading">Swell Period (s)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="12"
                    className="bg-secondary/50 border-border text-heading"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
              control={form.control}
              name="water_temp_C"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-heading">Water Temp (°C)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="20"
                      className="bg-secondary/50 border-border text-heading"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="wetsuit"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-center items-start pt-6">
                  <div className="flex items-center gap-3">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-heading m-0 pb-0 cursor-pointer">Use Wetsuit</FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
      </div>
    </div>
  );
}
