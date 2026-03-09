import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface DescriptionStepProps {
  description: string;
  onChange: (description: string) => void;
}

export function DescriptionStep({ description, onChange }: DescriptionStepProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Describe the Issue</h2>
      <p className="text-muted-foreground mb-6">
        Please provide details about the problem you're experiencing
      </p>
      <div className="space-y-2">
        <Label htmlFor="description">Issue Description *</Label>
        <Textarea
          id="description"
          placeholder="E.g., My mixer stopped working suddenly. It makes a humming sound but the blades don't rotate..."
          value={description}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[150px]"
        />
        <p className="text-xs text-muted-foreground">
          Include when the issue started, any error messages, and what you've tried so far.
        </p>
      </div>
    </div>
  );
}
