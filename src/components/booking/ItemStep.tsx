import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ItemStepProps {
  categoryId: string;
  selectedItem: string | null;
  onSelect: (itemId: string) => void;
}

export function ItemStep({ categoryId, selectedItem, onSelect }: ItemStepProps) {
  const { data: items, isLoading } = useQuery({
    queryKey: ["repair-items", categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("repair_items")
        .select("*")
        .eq("category_id", categoryId)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!categoryId,
  });

  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Select Item</h2>
      <p className="text-muted-foreground mb-6">Choose the specific item you need repaired</p>
      {items && items.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card
              key={item.id}
              className={cn(
                "cursor-pointer transition-all hover:border-primary/50",
                selectedItem === item.id && "border-primary ring-2 ring-primary/20"
              )}
              onClick={() => onSelect(item.id)}
            >
              <CardHeader className="p-4">
                <CardTitle className="text-base">{item.name}</CardTitle>
                {item.description && (
                  <CardDescription className="text-sm">{item.description}</CardDescription>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No items available in this category.</p>
      )}
    </div>
  );
}
