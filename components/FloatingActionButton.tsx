import { TouchableOpacity, View } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export function FloatingActionButton() {
  return (
    <View className="absolute bottom-4 right-4">
      <Link href="/produto/novo" asChild>
        <TouchableOpacity
          className="w-14 h-14 rounded-full bg-primary items-center justify-center shadow-lg"
          activeOpacity={0.8}
          style={{
            shadowColor: "#5BE096",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Ionicons name="add" size={28} color="#0B5D1E" />
        </TouchableOpacity>
      </Link>
    </View>
  );
}
