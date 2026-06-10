import { Link as RouterLink, type LinkProps as RouterLinkProps } from "@tanstack/react-router";
import { type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { buttonVariants } from "./button";

export interface LinkProps extends RouterLinkProps, VariantProps<typeof buttonVariants> {
  className?: string;
}

export function Link({ className, variant, size, ...props }: LinkProps) {
  return (
    <RouterLink
      className={cn(buttonVariants({ variant, size }), "no-underline", className)}
      {...props}
    />
  );
}
