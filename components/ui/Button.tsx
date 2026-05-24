import { TouchableOpacity, Text, ActivityIndicator, type TouchableOpacityProps } from "react-native";
import { cn } from "@/lib/utils";

interface ButtonProps extends TouchableOpacityProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
  textClassName?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  loading = false,
  disabled,
  className,
  textClassName,
  ...props
}: ButtonProps) {
  const baseStyles = "flex-row items-center justify-center rounded-xl";
  
  const variantStyles = {
    primary: "bg-primary-dark border border-primary/30",
    secondary: "bg-zinc-900 border border-zinc-800",
    outline: "bg-transparent border border-zinc-600",
    ghost: "bg-transparent",
    danger: "bg-red-500/20 border border-red-500/30",
  };
  
  const textVariantStyles = {
    primary: "text-primary font-semibold",
    secondary: "text-white",
    outline: "text-white",
    ghost: "text-primary",
    danger: "text-red-400 font-semibold",
  };
  
  const sizeStyles = {
    sm: "px-3 py-2 min-h-[36px]",
    md: "px-4 py-3 min-h-[44px]",
    lg: "px-6 py-4 min-h-[52px]",
  };
  
  const textSizeStyles = {
    sm: "text-sm",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <TouchableOpacity
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        disabled && "opacity-50",
        className
      )}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#5BE096" : "#ffffff"} size="small" />
      ) : typeof children === "string" ? (
        <Text className={cn(textVariantStyles[variant], textSizeStyles[size], textClassName)}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}
