import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary",
        secondary: "bg-secondary/10 text-secondary",
        outline: "border border-border bg-background text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Badge = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>>(
  ({ className, variant, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant, className }))} {...props} />
  ),
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
