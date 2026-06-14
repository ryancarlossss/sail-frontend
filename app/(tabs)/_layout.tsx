import { Tabs } from "expo-router";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind"; // <-- Importamos para a barra mudar de cor

type TabIconProps = {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
};

function TabIcon({ name, color, focused }: TabIconProps) {
  // Ajustei o tracinho verde em cima do ícone para respeitar a cor do tema
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="items-center justify-center">
      {focused && (
        <View className={`absolute -top-2 w-8 h-1 rounded-full ${isDark ? 'bg-[#5BE096]' : 'bg-[#2E8B57]'}`} />
      )}
      <Ionicons name={name} size={24} color={color} />
    </View>
  );
}

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? "#5BE096" : "#2E8B57", // Cor dinâmica
        tabBarInactiveTintColor: isDark ? "#6b7280" : "#9CA3AF",
        tabBarStyle: {
          backgroundColor: isDark ? "#000000" : "#ffffff", // Fundo da barra dinâmico
          borderTopColor: isDark ? "#1a1a1a" : "#e5e7eb", // Linha de cima dinâmica
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "500",
        },
      }}
    >
      
      <Tabs.Screen
        name="pedidos"
        options={{
          href: null,
          title: "Meus Pedidos",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="bag-handle" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="vendas"
        options={{
          title: "Meu Estoque",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="bar-chart" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="configuracoes"
        options={{
          title: "Configurações",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="settings" color={color} focused={focused} />
          ),
        }}
      />

      {/* NOVA TELA DE PERFIL ADICIONADA AQUI */}
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}