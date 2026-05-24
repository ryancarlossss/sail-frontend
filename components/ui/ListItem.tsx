import { TouchableOpacity, View, Text, type TouchableOpacityProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "@/lib/utils";

interface SwitchProps {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function Switch({ enabled, onToggle, disabled }: SwitchProps) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      disabled={disabled}
      activeOpacity={0.8}
      className={cn(
        "w-11 h-6 rounded-full justify-center",
        enabled ? "bg-primary" : "bg-zinc-600",
        disabled && "opacity-50"
      )}
    >
      <View
        className={cn(
          "w-5 h-5 bg-white rounded-full shadow-sm",
          enabled ? "ml-5" : "ml-0.5"
        )}
      />
    </TouchableOpacity>
  );
}

interface ListItemProps extends TouchableOpacityProps {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
  iconColor?: string;
}

export function ListItem({
  icon,
  label,
  subtitle,
  rightElement,
  showChevron = true,
  iconColor = "#5BE096",
  className,
  ...props
}: ListItemProps) {
  return (
    <TouchableOpacity
      className={cn("flex-row items-center justify-between p-4", className)}
      activeOpacity={0.7}
      {...props}
    >
      <View className="flex-row items-center gap-3 flex-1">
        {icon && <Ionicons name={icon} size={20} color={iconColor} />}
        <View className="flex-1">
          <Text className="text-white">{label}</Text>
          {subtitle && <Text className="text-gray-500 text-sm mt-0.5">{subtitle}</Text>}
        </View>
      </View>
      {rightElement || (showChevron && (
        <Ionicons name="chevron-forward" size={20} color="#4b5563" />
      ))}
    </TouchableOpacity>
  );
}

interface ToggleItemProps {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  enabled: boolean;
  onToggle: () => void;
}

export function ToggleItem({ icon, label, enabled, onToggle }: ToggleItemProps) {
  return (
    <View className="flex-row items-center justify-between p-4">
      <View className="flex-row items-center gap-3">
        {icon && <Ionicons name={icon} size={20} color="#5BE096" />}
        <Text className="text-white">{label}</Text>
      </View>
      <Switch enabled={enabled} onToggle={onToggle} />
    </View>
  );
}
