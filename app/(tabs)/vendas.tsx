import { ScrollView, View, Text } from "react-native";
import { Header } from "@/components/Header";
import { SummaryCards } from "@/components/SummaryCards";
import { ProductList, type Product } from "@/components/ProductList";
import { FloatingActionButton } from "@/components/FloatingActionButton";

const mockProducts: Product[] = [
  {
    id: 1,
    title: "Bolsa Couro Ecologico",
    description: "Bolsa transversal sustentavel, ideal para o dia a dia...",
    price: 189.9,
    rating: 4.5,
    reviews: 23,
    messages: 2,
    status: "active",
  },
  {
    id: 2,
    title: "Tenis Esportivo Premium",
    description: "Tenis com tecnologia de amortecimento para corridas...",
    price: 349.9,
    rating: 5,
    reviews: 47,
    messages: 5,
    status: "active",
  },
  {
    id: 3,
    title: "Camiseta Algodao Organico",
    description: "Camiseta 100% algodao organico, confortavel e duravel...",
    price: 79.9,
    rating: 4,
    reviews: 12,
    messages: 0,
    status: "out_of_stock",
  },
  {
    id: 4,
    title: "Relogio Smart Fitness",
    description: "Monitore seus treinos com precisao e estilo...",
    price: 459.9,
    rating: 4.8,
    reviews: 89,
    messages: 8,
    status: "active",
  },
];

export default function VendasScreen() {
  return (
    <View className="flex-1 bg-black">
      <Header />
      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold text-white mb-4">Minhas Vendas</Text>

        <SummaryCards
          cards={[
            { title: "Vendas Totais", value: " 1.250,00", prefix: "R$" },
            { title: "Pedidos Pendentes", value: 3 },
          ]}
        />

        <ProductList products={mockProducts} />
        
        <View className="h-24" />
      </ScrollView>
      <FloatingActionButton />
    </View>
  );
}
