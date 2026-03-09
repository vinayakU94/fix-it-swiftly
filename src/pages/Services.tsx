import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Lamp, Headphones, UtensilsCrossed, Home, Wrench, MoreHorizontal } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  clock: Clock,
  lamp: Lamp,
  headphones: Headphones,
  utensils: UtensilsCrossed,
  home: Home,
  wrench: Wrench,
  "more-horizontal": MoreHorizontal,
};

export default function Services() {
  const { user } = useAuth();

  const { data: categories, isLoading } = useQuery({
    queryKey: ["repair-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("repair_categories")
        .select(`
          *,
          repair_items (*)
        `)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="bg-primary py-16">
        <div className="container">
          <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
            Our Repair Services
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl">
            Browse our comprehensive list of repair services. We handle everything from small electronics to large household appliances.
          </p>
        </div>
      </section>

      {/* Services List */}
      <section className="py-16">
        <div className="container">
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {categories?.map((category) => {
                const IconComponent = iconMap[category.icon || "wrench"] || Wrench;
                return (
                  <Card key={category.id} className="hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle>{category.name}</CardTitle>
                          <CardDescription>{category.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Items we repair:</p>
                        <div className="flex flex-wrap gap-2">
                          {category.repair_items?.map((item: { id: string; name: string }) => (
                            <span
                              key={item.id}
                              className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-sm"
                            >
                              {item.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Don't See Your Item Listed?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            We repair many more items than listed here. Contact us or book a repair under "Others" category.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button asChild>
                <Link to="/dashboard/book">Book a Repair</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link to="/auth?mode=signup">Sign Up to Book</Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
