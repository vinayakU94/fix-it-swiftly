import { useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { Plus, Package, LogOut } from "lucide-react";
import BookRepair from "@/pages/BookRepair";
import MyRepairs from "@/pages/MyRepairs";
import RepairDetails from "@/pages/RepairDetails";

function DashboardHome() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground">Manage your repair requests from here.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/dashboard/book">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Book New Repair</CardTitle>
                <CardDescription>Submit a new repair request</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link to="/dashboard/repairs">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Track Repairs</CardTitle>
                <CardDescription>View your repair requests</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, loading, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-primary">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo variant="default" size="md" />
          </Link>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Button variant="secondary" size="sm" asChild>
                <Link to="/admin">Admin Portal</Link>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => signOut()} className="text-primary-foreground">
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
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/dashboard">
                <Package className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/dashboard/book">
                <Plus className="w-4 h-4 mr-2" />
                Book Repair
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/dashboard/repairs">
                <Package className="w-4 h-4 mr-2" />
                My Repairs
              </Link>
            </Button>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<DashboardHome />} />
              <Route path="/book" element={<BookRepair />} />
              <Route path="/repairs" element={<MyRepairs />} />
              <Route path="/repairs/:id" element={<RepairDetails />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}
