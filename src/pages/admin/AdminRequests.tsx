import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Database } from "@/integrations/supabase/types";

type RepairStatus = Database["public"]["Enums"]["repair_status"];

const STATUS_OPTIONS: { value: RepairStatus; label: string }[] = [
  { value: "submitted", label: "Submitted" },
  { value: "checking_with_partner", label: "Checking with Partner" },
  { value: "ready_for_pickup", label: "Ready for Pickup" },
  { value: "picked_up", label: "Picked Up" },
  { value: "reached_repair_partner", label: "Reached Repair Partner" },
  { value: "repair_in_progress", label: "Repair in Progress" },
  { value: "ready_for_delivery", label: "Ready for Delivery" },
  { value: "reached_delivery_partner", label: "Reached Delivery Partner" },
  { value: "confirmation_required", label: "Confirmation Required" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "payment_received", label: "Payment Received" },
  { value: "delivered", label: "Delivered" },
];

const getStatusColor = (status: RepairStatus) => {
  const colors: Record<RepairStatus, string> = {
    submitted: "bg-blue-100 text-blue-800",
    checking_with_partner: "bg-yellow-100 text-yellow-800",
    ready_for_pickup: "bg-orange-100 text-orange-800",
    picked_up: "bg-purple-100 text-purple-800",
    reached_repair_partner: "bg-indigo-100 text-indigo-800",
    repair_in_progress: "bg-amber-100 text-amber-800",
    ready_for_delivery: "bg-teal-100 text-teal-800",
    reached_delivery_partner: "bg-cyan-100 text-cyan-800",
    confirmation_required: "bg-pink-100 text-pink-800",
    out_for_delivery: "bg-lime-100 text-lime-800",
    payment_received: "bg-emerald-100 text-emerald-800",
    delivered: "bg-green-100 text-green-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

export default function AdminRequests() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: requests, isLoading } = useQuery({
    queryKey: ["admin-requests"],
    queryFn: async () => {
      const { data: requestsData, error } = await supabase
        .from("repair_requests")
        .select(`
          *,
          category:repair_categories(name),
          item:repair_items(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles separately using user_ids
      const userIds = [...new Set(requestsData.map((r) => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      return requestsData.map((r) => ({
        ...r,
        profile: profileMap.get(r.user_id) || null,
      }));
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: RepairStatus }) => {
      const { error } = await supabase
        .from("repair_requests")
        .update({ current_status: status })
        .eq("id", id);

      if (error) throw error;

      // Add to status history
      const { error: historyError } = await supabase
        .from("repair_status_history")
        .insert({
          repair_request_id: id,
          status,
          notes: `Status updated to ${status}`,
        });

      if (historyError) console.error("Failed to add history:", historyError);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({
        title: "Status updated",
        description: "The repair request status has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredRequests = requests?.filter((r) => 
    filterStatus === "all" || r.current_status === filterStatus
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">All Repair Requests</h1>
          <p className="text-muted-foreground">
            {filteredRequests?.length || 0} request(s) found
          </p>
        </div>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredRequests?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No requests found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests?.map((request) => (
            <Card key={request.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">
                      {request.item?.name || "Unknown Item"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {request.category?.name} • {format(new Date(request.created_at), "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                  <Badge className={getStatusColor(request.current_status)}>
                    {STATUS_OPTIONS.find((s) => s.value === request.current_status)?.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Customer</p>
                    <p className="text-muted-foreground">
                      {request.profile?.full_name || "N/A"}
                    </p>
                    <p className="text-muted-foreground">
                      {request.profile?.email}
                    </p>
                    <p className="text-muted-foreground">
                      {request.profile?.phone || "No phone"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Pickup Details</p>
                    <p className="text-muted-foreground">{request.pickup_address}</p>
                    <p className="text-muted-foreground">{request.pickup_time_slot}</p>
                  </div>
                </div>

                <div>
                  <p className="font-medium text-sm">Issue Description</p>
                  <p className="text-sm text-muted-foreground">{request.issue_description}</p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2 border-t">
                  <div className="flex-1">
                    <label className="text-sm font-medium">Update Status</label>
                    <Select
                      value={request.current_status}
                      onValueChange={(value) =>
                        updateStatusMutation.mutate({ id: request.id, status: value as RepairStatus })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
