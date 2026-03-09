import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Calendar, Clock } from "lucide-react";

const timeSlots = [
  { id: "morning", label: "Morning", time: "9:00 AM - 12:00 PM" },
  { id: "afternoon", label: "Afternoon", time: "12:00 PM - 3:00 PM" },
  { id: "evening", label: "Evening", time: "3:00 PM - 6:00 PM" },
];

interface TimeSlotStepProps {
  selectedSlot: string;
  onChange: (slot: string) => void;
}

export function TimeSlotStep({ selectedSlot, onChange }: TimeSlotStepProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Preferred Pickup Time</h2>
      <p className="text-muted-foreground mb-6">
        Select your preferred time slot for pickup
      </p>
      
      <div className="grid sm:grid-cols-3 gap-4">
        {timeSlots.map((slot) => (
          <Card
            key={slot.id}
            className={cn(
              "cursor-pointer transition-all hover:border-primary/50",
              selectedSlot === slot.id && "border-primary ring-2 ring-primary/20"
            )}
            onClick={() => onChange(slot.id)}
          >
            <CardHeader className="text-center p-4">
              <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-base">{slot.label}</CardTitle>
              <p className="text-sm text-muted-foreground">{slot.time}</p>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg flex items-start gap-3">
        <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
        <div>
          <p className="text-sm font-medium">Pickup within 24-48 hours</p>
          <p className="text-xs text-muted-foreground">
            Our team will confirm the exact pickup date and time via email.
          </p>
        </div>
      </div>
    </div>
  );
}
