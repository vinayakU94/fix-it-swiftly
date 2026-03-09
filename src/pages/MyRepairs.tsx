import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Package, Eye } from "lucide-react";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-800",
  checking_with_partner: "bg-yellow-100 text-yellow-800",
  ready_for_pickup: "bg-orange-100 text-orange-800",
  picked_up: "bg-purple-100 text-purple-800",
  reached_repair_partner: "bg-indigo-100 text-indigo-800",
  repair_in_progress: "bg-cyan-100 text-cyan-800",
  ready_for_delivery: "bg-teal-100 text-teal-800",
  reached_delivery_partner: "bg-emerald-100 text-emerald-800",
  confirmation_required: "bg-amber-100 text-amber-800",
  out_for_delivery: "bg-lime-100 text-lime-800",
  payment_received: "bg-green-100 text-green-800",
  delivered: "bg-green-200 text-green-900",
};

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

export default function MyRepairs() {
  const { user } = useAuth();

  const { data: repairs, isLoading } = useQuery({
    queryKey: ["my-repairs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("repair_requests")
        .select(`
          *,
          repair_categories(name),
          repair_items(name)
        `)
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">My Repairs</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Repairs</h1>
        <Button asChild>
          <Link to="/dashboard/book">
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Link>
        </Button>
      </div>

      {repairs && repairs.length > 0 ? (
        <div className="space-y-4">
          {repairs.map((repair) => (
            <Card key={repair.id} className="hover:border-primary/30 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {repair.repair_items?.name || "Unknown Item"}
                    </CardTitle>
                    <CardDescription>
                      {repair.repair_categories?.name} • {format(new Date(repair.created_at), "MMM d, yyyy")}
                    </CardDescription>
                  </div>
                  <Badge className={statusColors[repair.current_status] || "bg-muted"}>
                    {statusLabels[repair.current_status] || repair.current_status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {repair.issue_description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-mono">
                    ID: {repair.id.slice(0, 8).toUpperCase()}
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/dashboard/repairs/${repair.id}`}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No repair requests yet</h3>
            <p className="text-muted-foreground mb-4">
              Book your first repair request to get started.
            </p>
            <Button asChild>
              <Link to="/dashboard/book">
                <Plus className="w-4 h-4 mr-2" />
                Book a Repair
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
