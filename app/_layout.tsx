import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#000000" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#000000" },
          animation: "slide_from_right",
        }}
      >
        {}
        <Stack.Screen name="index" />
        <Stack.Screen name="cadastro" />

        {}
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="produto/novo"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}