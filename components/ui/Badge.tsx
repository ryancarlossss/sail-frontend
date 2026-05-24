import { View, Text, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";

interface BadgeProps extends ViewProps {
  variant?: "default" | "success" | "warning" | "danger" | "info";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className, ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-zinc-800",
    success: "bg-primary/20",
    warning: "bg-amber-500/20",
    danger: "bg-red-500/20",
    info: "bg-blue-500/20",
  };

  const textVariantStyles = {
    default: "text-gray-300",
    success: "text-primary",
    warning: "text-amber-400",
    danger: "text-red-400",
    info: "text-blue-400",
  };

  return (
    <View
      className={cn(
        "px-2 py-0.5 rounded-full self-start",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {typeof children === "string" ? (
        <Text className={cn("text-[10px] font-medium", textVariantStyles[variant])}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}
