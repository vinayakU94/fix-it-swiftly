import { useEffect } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { LayoutDashboard, Package, Users, LogOut, ArrowLeft } from "lucide-react";
import AdminRequests from "./AdminRequests";
import AdminUsers from "./AdminUsers";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

function AdminHome() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [requestsRes, usersRes] = await Promise.all([
        supabase.from("repair_requests").select("id, current_status", { count: "exact" }),
        supabase.from("user_roles").select("id", { count: "exact" }).eq("role", "admin"),
      ]);

      const activeRequests = requestsRes.data?.filter(
        (r) => r.current_status !== "delivered"
      ).length || 0;

      return {
        totalRequests: requestsRes.count || 0,
        activeRequests,
        adminCount: usersRes.count || 0,
      };
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage repair requests and users.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardDescription>Total Requests</CardDescription>
            <CardTitle className="text-3xl">{stats?.totalRequests || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Active Requests</CardDescription>
            <CardTitle className="text-3xl">{stats?.activeRequests || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Admin Users</CardDescription>
            <CardTitle className="text-3xl">{stats?.adminCount || 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/admin/requests">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Manage Requests</CardTitle>
                <CardDescription>View and update all repair requests</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/admin/users">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Manage Admins</CardTitle>
                <CardDescription>Add or remove admin users</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, loading, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (!loading && user && !isAdmin) {
      navigate("/dashboard");
    }
  }, [user, loading, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-destructive">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2">
            <Logo variant="default" size="md" />
            <span className="text-destructive-foreground font-semibold">Admin</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="secondary" size="sm" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                User Dashboard
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => signOut()} className="text-destructive-foreground">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Sidebar + Content */}
      <div className="container py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 space-y-2">
            <Button 
              variant={isActive("/admin") ? "secondary" : "ghost"} 
              className="w-full justify-start" 
              asChild
            >
              <Link to="/admin">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button 
              variant={location.pathname.includes("/admin/requests") ? "secondary" : "ghost"} 
              className="w-full justify-start" 
              asChild
            >
              <Link to="/admin/requests">
                <Package className="w-4 h-4 mr-2" />
                All Requests
              </Link>
            </Button>
            <Button 
              variant={location.pathname.includes("/admin/users") ? "secondary" : "ghost"} 
              className="w-full justify-start" 
              asChild
            >
              <Link to="/admin/users">
                <Users className="w-4 h-4 mr-2" />
                Manage Admins
              </Link>
            </Button>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<AdminHome />} />
              <Route path="/requests" element={<AdminRequests />} />
              <Route path="/users" element={<AdminUsers />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}
