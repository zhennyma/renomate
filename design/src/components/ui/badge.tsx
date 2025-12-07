import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Custom variants for Renomate
        success: "border-transparent bg-success/15 text-success",
        warning: "border-transparent bg-warning/15 text-warning-foreground",
        info: "border-transparent bg-info/15 text-info",
        muted: "border-transparent bg-muted text-muted-foreground",
        // Status badges
        new: "border-transparent bg-primary/15 text-primary font-medium",
        viewed: "border-transparent bg-info/15 text-info font-medium",
        responded: "border-transparent bg-success/15 text-success font-medium",
        // Fit score badges
        fitHigh: "border-transparent bg-success/15 text-success font-medium",
        fitMedium: "border-transparent bg-warning/15 text-warning-foreground font-medium",
        fitLow: "border-transparent bg-muted text-muted-foreground font-medium",
        // Budget bands
        economy: "border-transparent bg-muted text-muted-foreground",
        standard: "border-transparent bg-secondary text-secondary-foreground",
        premium: "border-transparent bg-primary/15 text-primary",
        luxury: "border-transparent bg-accent/15 text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
