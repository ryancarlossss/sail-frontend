import { TextInput, View, Text, type TextInputProps } from "react-native";
import { cn } from "@/lib/utils";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  leftElement,
  rightElement,
  containerClassName,
  className,
  ...props
}: InputProps) {
  return (
    <View className={cn("space-y-2", containerClassName)}>
      {label && (
        <Text className="text-sm text-gray-400">{label}</Text>
      )}
      <View className="relative">
        {leftElement && (
          <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            {leftElement}
          </View>
        )}
        <TextInput
          className={cn(
            "w-full bg-zinc-900 text-white rounded-xl px-4 py-4 text-sm",
            "placeholder:text-gray-600",
            leftElement && "pl-12",
            rightElement && "pr-12",
            error && "border border-red-500",
            className
          )}
          placeholderTextColor="#4b5563"
          {...props}
        />
        {rightElement && (
          <View className="absolute right-4 top-1/2 -translate-y-1/2">
            {rightElement}
          </View>
        )}
      </View>
      {error && (
        <Text className="text-sm text-red-400">{error}</Text>
      )}
    </View>
  );
}
