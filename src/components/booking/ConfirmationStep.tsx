import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ConfirmationStepProps {
  requestId: string;
}

export function ConfirmationStep({ requestId }: ConfirmationStepProps) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Request Submitted!</h2>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Your repair request has been submitted successfully. We'll contact you shortly to confirm the pickup.
      </p>
      
      <div className="bg-muted/50 rounded-lg p-4 mb-6 max-w-sm mx-auto">
        <p className="text-sm text-muted-foreground">Request ID</p>
        <p className="font-mono font-medium">{requestId.slice(0, 8).toUpperCase()}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild>
          <Link to="/dashboard/repairs">Track Your Repair</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
