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
        
        // Status variants for Renomate
        success: "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        warning: "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        info: "border-transparent bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        muted: "border-transparent bg-muted text-muted-foreground",
        
        // Lead/Invite status badges (legacy compatibility)
        new: "border-transparent bg-primary/15 text-primary font-medium",
        viewed: "border-transparent bg-info/15 text-blue-600 font-medium",
        responded: "border-transparent bg-success/15 text-emerald-600 font-medium",
        
        // Fit score badges (legacy compatibility)
        fitHigh: "border-transparent bg-emerald-100 text-emerald-700 font-medium",
        fitMedium: "border-transparent bg-amber-100 text-amber-700 font-medium",
        fitLow: "border-transparent bg-gray-100 text-gray-600 font-medium",
        
        // Budget bands (legacy compatibility)
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
