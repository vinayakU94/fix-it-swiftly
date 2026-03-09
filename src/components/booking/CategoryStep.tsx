import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Lightbulb, Headphones, UtensilsCrossed, Home, Wrench, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  clock: Clock,
  lightbulb: Lightbulb,
  headphones: Headphones,
  utensils: UtensilsCrossed,
  home: Home,
  wrench: Wrench,
};

interface CategoryStepProps {
  selectedCategory: string | null;
  onSelect: (categoryId: string) => void;
}

export function CategoryStep({ selectedCategory, onSelect }: CategoryStepProps) {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["repair-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("repair_categories")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Select Repair Category</h2>
      <p className="text-muted-foreground mb-6">Choose the category that best describes your item</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories?.map((category) => {
          const IconComponent = iconMap[category.icon || ""] || HelpCircle;
          return (
            <Card
              key={category.id}
              className={cn(
                "cursor-pointer transition-all hover:border-primary/50",
                selectedCategory === category.id && "border-primary ring-2 ring-primary/20"
              )}
              onClick={() => onSelect(category.id)}
            >
              <CardHeader className="flex flex-row items-center gap-4 p-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <IconComponent className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{category.name}</CardTitle>
                  {category.description && (
                    <CardDescription className="text-sm">{category.description}</CardDescription>
                  )}
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
