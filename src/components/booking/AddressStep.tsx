import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface AddressStepProps {
  address: string;
  phone: string;
  onChange: (address: string) => void;
  onPhoneChange: (phone: string) => void;
}

export function AddressStep({ address, phone, onChange, onPhoneChange }: AddressStepProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Pickup Address & Contact</h2>
      <p className="text-muted-foreground mb-6">
        Where should we pick up your item for repair?
      </p>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Contact Number *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Enter your 10-digit phone number"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
          />
          <p className="text-xs text-muted-foreground">
            We'll contact you on this number for pickup coordination.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Full Address *</Label>
          <Textarea
            id="address"
            placeholder="Enter your complete address including building name, street, landmark, city, and pincode"
            value={address}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[120px]"
          />
          <p className="text-xs text-muted-foreground">
            Please provide a detailed address to ensure smooth pickup.
          </p>
        </div>
      </div>
    </div>
  );
}
