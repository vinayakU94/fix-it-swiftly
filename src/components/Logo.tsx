import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "default" | "light" | "dark";
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, variant = "default", size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  };

  const getColors = () => {
    switch (variant) {
      case "light":
        return { fix: "text-primary-foreground", this: "text-primary-foreground" };
      case "dark":
        return { fix: "text-foreground", this: "text-foreground" };
      default:
        return { fix: "text-primary-foreground", this: "text-foreground" };
    }
  };

  const colors = getColors();

  return (
    <span className={cn("font-bold tracking-tight", sizeClasses[size], className)}>
      <span className={colors.fix}>fix</span>
      <span className={colors.this}>this</span>
    </span>
  );
}
