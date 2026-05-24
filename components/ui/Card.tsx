import { View, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";

interface CardProps extends ViewProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <View
      className={cn(
        "bg-surface rounded-2xl border border-surface-border overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
}

export function CardHeader({ className, children, ...props }: CardProps) {
  return (
    <View
      className={cn("px-4 py-3 border-b border-zinc-800", className)}
      {...props}
    >
      {children}
    </View>
  );
}

export function CardContent({ className, children, ...props }: CardProps) {
  return (
    <View className={cn("p-4", className)} {...props}>
      {children}
    </View>
  );
}

export function CardFooter({ className, children, ...props }: CardProps) {
  return (
    <View
      className={cn("px-4 py-3 border-t border-zinc-800", className)}
      {...props}
    >
      {children}
    </View>
  );
}
