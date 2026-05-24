import { ScrollView, View } from "react-native";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { MarketplaceCards } from "@/components/MarketplaceCards";
import { FloatingActionButton } from "@/components/FloatingActionButton";

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-black">
      <Header />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <SearchBar />
        <MarketplaceCards />
      </ScrollView>
      <FloatingActionButton />
    </View>
  );
}
