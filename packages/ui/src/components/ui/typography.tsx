import { cn } from "../../lib/utils";
import { type VariantProps, cva } from "class-variance-authority";
import type { PropsWithChildren } from "react";

type TypographyTags = "h1" | "h2" | "h3" | "h4" | "p" | "span";

const TypographyVariants = cva("", {
  variants: {
    size: {
      heading: "text-xl font-bold",
      title: "text-2xl font-semibold",
      subtitle: "text-xl font-semibold",
      body: "text-sm font-medium",
      small: "text-xs font-medium",
      default: "text-base",
    },
    theme: {
      default: "text-foreground",
      error: "text-red-400",
      success: "text-green-500",
      warning: "text-yellow-500",
    },
  },
  defaultVariants: {
    size: "default",
    theme: "default",
  },
});

type DynamicElementProps = PropsWithChildren &
  VariantProps<typeof TypographyVariants> & {
    as?: TypographyTags;
    className?: string;
  };

export const Typography: React.FC<DynamicElementProps> = ({
  as: Component = "p",
  size,
  className,
  theme,
  ...props
}: DynamicElementProps) => {
  return <Component className={cn(TypographyVariants({ size, theme, className }))} {...props} />;
};
