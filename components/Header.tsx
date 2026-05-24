import { View, TouchableOpacity, Image } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function Header() {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: insets.top }}
      className="bg-black border-b border-surface-border"
    >
      <View className="flex-row items-center justify-between px-4 py-3">
        <Image
          source={require("@/assets/images/logo-site.png")}
          className="w-[100px] h-[40px]"
          resizeMode="contain"
        />

        <View className="flex-row items-center gap-1">
          <TouchableOpacity
            className="p-3 rounded-full min-w-[44px] min-h-[44px] items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="eye-outline" size={20} color="#5BE096" />
          </TouchableOpacity>

          <Link href="/configuracoes" asChild>
            <TouchableOpacity
              className="p-3 rounded-full min-w-[44px] min-h-[44px] items-center justify-center"
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={20} color="#5BE096" />
            </TouchableOpacity>
          </Link>

          <TouchableOpacity
            className="relative p-3 rounded-full min-w-[44px] min-h-[44px] items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={20} color="#5BE096" />
            <View className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
