import { View, Text, Image, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";

interface AvatarProps extends ViewProps {
  size?: "sm" | "md" | "lg";
  source?: { uri: string } | number;
  fallback?: string;
  className?: string;
}

export function Avatar({ size = "md", source, fallback, className, ...props }: AvatarProps) {
  const sizeStyles = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  const textSizeStyles = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-lg",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View
      className={cn(
        "rounded-full bg-zinc-800 items-center justify-center overflow-hidden",
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {source ? (
        <Image
          source={source}
          className="w-full h-full"
          resizeMode="cover"
        />
      ) : fallback ? (
        <Text className={cn("text-primary font-semibold", textSizeStyles[size])}>
          {getInitials(fallback)}
        </Text>
      ) : (
        <View className="w-full h-full bg-zinc-700" />
      )}
    </View>
  );
}
