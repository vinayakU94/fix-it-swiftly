import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MapPin, Clock, CheckCircle, Circle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const allStatuses = [
  "submitted",
  "checking_with_partner",
  "ready_for_pickup",
  "picked_up",
  "reached_repair_partner",
  "repair_in_progress",
  "ready_for_delivery",
  "reached_delivery_partner",
  "confirmation_required",
  "out_for_delivery",
  "payment_received",
  "delivered",
];

const statusLabels: Record<string, string> = {
  submitted: "Submitted",
  checking_with_partner: "Checking with Partner",
  ready_for_pickup: "Ready for Pickup",
  picked_up: "Picked Up",
  reached_repair_partner: "At Repair Partner",
  repair_in_progress: "Repair in Progress",
  ready_for_delivery: "Ready for Delivery",
  reached_delivery_partner: "At Delivery Partner",
  confirmation_required: "Confirmation Required",
  out_for_delivery: "Out for Delivery",
  payment_received: "Payment Received",
  delivered: "Delivered",
};

export default function RepairDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { data: repair, isLoading } = useQuery({
    queryKey: ["repair-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("repair_requests")
        .select(`
          *,
          repair_categories(name),
          repair_items(name)
        `)
        .eq("id", id!)
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });

  const { data: statusHistory } = useQuery({
    queryKey: ["repair-history", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("repair_status_history")
        .select("*")
        .eq("repair_request_id", id!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!repair) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Repair not found</h2>
        <p className="text-muted-foreground mb-4">This repair request doesn't exist or you don't have access.</p>
        <Button asChild>
          <Link to="/dashboard/repairs">Back to My Repairs</Link>
        </Button>
      </div>
    );
  }

  const currentStatusIndex = allStatuses.indexOf(repair.current_status as string);
  const completedStatuses = statusHistory?.map((h) => h.status as string) || [];

  return (
    <div>
      <Button variant="ghost" asChild className="mb-4">
        <Link to="/dashboard/repairs">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Repairs
        </Link>
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{repair.repair_items?.name}</CardTitle>
                  <CardDescription>
                    {repair.repair_categories?.name} • ID: {repair.id.slice(0, 8).toUpperCase()}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-primary border-primary">
                  {statusLabels[repair.current_status]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">Issue Description</h4>
                <p className="text-muted-foreground">{repair.issue_description}</p>
              </div>

              {repair.images && repair.images.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Images</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {repair.images.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Repair image ${index + 1}`}
                        className="rounded-lg aspect-square object-cover border"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Pickup Address</h4>
                    <p className="text-sm text-muted-foreground">{repair.pickup_address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Pickup Time</h4>
                    <p className="text-sm text-muted-foreground">{repair.pickup_time_slot}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allStatuses.map((status, index) => {
                  const historyEntry = statusHistory?.find((h) => h.status === status);
                  const isCompleted = completedStatuses.includes(status);
                  const isCurrent = status === repair.current_status;

                  return (
                    <div key={status} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            isCompleted || isCurrent
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </div>
                        {index < allStatuses.length - 1 && (
                          <div
                            className={cn(
                              "w-0.5 h-8 mt-1",
                              index < currentStatusIndex ? "bg-primary" : "bg-muted"
                            )}
                          />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p
                          className={cn(
                            "font-medium",
                            isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"
                          )}
                        >
                          {statusLabels[status]}
                        </p>
                        {historyEntry && (
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(historyEntry.created_at), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span>{format(new Date(repair.created_at), "MMM d, yyyy")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Updated</span>
                <span>{format(new Date(repair.updated_at), "MMM d, yyyy")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Category</span>
                <span>{repair.repair_categories?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Item</span>
                <span>{repair.repair_items?.name}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                Need help with your repair request?
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/contact">Contact Support</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
