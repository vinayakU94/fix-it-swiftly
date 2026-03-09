import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookingSteps } from "@/components/booking/BookingSteps";
import { CategoryStep } from "@/components/booking/CategoryStep";
import { ItemStep } from "@/components/booking/ItemStep";
import { DescriptionStep } from "@/components/booking/DescriptionStep";
import { ImageUploadStep } from "@/components/booking/ImageUploadStep";
import { AddressStep } from "@/components/booking/AddressStep";
import { TimeSlotStep } from "@/components/booking/TimeSlotStep";
import { ConfirmationStep } from "@/components/booking/ConfirmationStep";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

const steps = ["Category", "Item", "Issue", "Photos", "Address", "Time", "Done"];

interface BookingData {
  categoryId: string | null;
  itemId: string | null;
  description: string;
  images: string[];
  address: string;
  phone: string;
  timeSlot: string;
}

export default function BookRepair() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  
  const [bookingData, setBookingData] = useState<BookingData>({
    categoryId: null,
    itemId: null,
    description: "",
    images: [],
    address: "",
    phone: "",
    timeSlot: "",
  });

  const canProceed = () => {
    switch (currentStep) {
      case 0: return !!bookingData.categoryId;
      case 1: return !!bookingData.itemId;
      case 2: return bookingData.description.trim().length >= 10;
      case 3: return true; // Images are optional
      case 4: return bookingData.address.trim().length >= 10 && bookingData.phone.length === 10;
      case 5: return !!bookingData.timeSlot;
      default: return false;
    }
  };

  const handleNext = async () => {
    if (currentStep === 5) {
      // Submit the form
      await handleSubmit();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      // Reset item when going back to category
      setBookingData((prev) => ({ ...prev, itemId: null }));
    }
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!user || !bookingData.categoryId || !bookingData.itemId) return;

    setSubmitting(true);
    try {
      const timeSlotLabels: Record<string, string> = {
        morning: "Morning (9:00 AM - 12:00 PM)",
        afternoon: "Afternoon (12:00 PM - 3:00 PM)",
        evening: "Evening (3:00 PM - 6:00 PM)",
      };

      const { data, error } = await supabase
        .from("repair_requests")
        .insert({
          user_id: user.id,
          category_id: bookingData.categoryId,
          item_id: bookingData.itemId,
          issue_description: bookingData.description,
          images: bookingData.images.length > 0 ? bookingData.images : null,
          pickup_address: bookingData.address,
          pickup_time_slot: timeSlotLabels[bookingData.timeSlot] || bookingData.timeSlot,
        })
        .select()
        .single();

      if (error) throw error;

      // Initial status history is created automatically by database trigger

      // Trigger Make.com webhook for new order notification
      try {
        await fetch("https://hook.eu2.make.com/52r15nlr9lq6dip9orr961mkls9f8poi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            request_id: data.id,
            user_id: data.user_id,
            category_id: data.category_id,
            item_id: data.item_id,
            issue_description: data.issue_description,
            pickup_address: data.pickup_address,
            pickup_time_slot: data.pickup_time_slot,
            phone: bookingData.phone,
            created_at: data.created_at,
          }),
        });
      } catch (webhookError) {
        console.error("Webhook notification failed:", webhookError);
      }

      setRequestId(data.id);
      setCurrentStep(6);
      toast.success("Repair request submitted successfully!");
    } catch (error) {
      console.error("Error submitting repair request:", error);
      toast.error("Failed to submit repair request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <CategoryStep
            selectedCategory={bookingData.categoryId}
            onSelect={(id) => setBookingData((prev) => ({ ...prev, categoryId: id, itemId: null }))}
          />
        );
      case 1:
        return (
          <ItemStep
            categoryId={bookingData.categoryId!}
            selectedItem={bookingData.itemId}
            onSelect={(id) => setBookingData((prev) => ({ ...prev, itemId: id }))}
          />
        );
      case 2:
        return (
          <DescriptionStep
            description={bookingData.description}
            onChange={(desc) => setBookingData((prev) => ({ ...prev, description: desc }))}
          />
        );
      case 3:
        return (
          <ImageUploadStep
            images={bookingData.images}
            onChange={(imgs) => setBookingData((prev) => ({ ...prev, images: imgs }))}
          />
        );
      case 4:
        return (
          <AddressStep
            address={bookingData.address}
            phone={bookingData.phone}
            onChange={(addr) => setBookingData((prev) => ({ ...prev, address: addr }))}
            onPhoneChange={(ph) => setBookingData((prev) => ({ ...prev, phone: ph }))}
          />
        );
      case 5:
        return (
          <TimeSlotStep
            selectedSlot={bookingData.timeSlot}
            onChange={(slot) => setBookingData((prev) => ({ ...prev, timeSlot: slot }))}
          />
        );
      case 6:
        return <ConfirmationStep requestId={requestId!} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Book a Repair</h1>
      
      <Card>
        <CardContent className="pt-6">
          {currentStep < 6 && <BookingSteps currentStep={currentStep} steps={steps} />}
          
          {renderStep()}

          {currentStep < 6 && (
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!canProceed() || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : currentStep === 5 ? (
                  "Submit Request"
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
