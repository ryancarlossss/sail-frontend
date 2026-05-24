import { View, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Buscar produtos ou vendedores...",
}: SearchBarProps) {
  return (
    <View className="px-4 py-3">
      <View className="relative">
        <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
          <Ionicons name="search" size={20} color="#6b7280" />
        </View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#6b7280"
          className="w-full pl-12 pr-4 py-3.5 bg-surface border border-primary-dark rounded-xl text-sm text-white"
        />
      </View>
    </View>
  );
}
