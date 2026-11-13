import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatCurrency } from "@/lib/utils";

interface MarketplaceProduct {
  id: string;
  productName: string;
  sellerName: string;
  price: number;
  rating: number;
  reviewCount: number;
}

const mockProducts: MarketplaceProduct[] = [
  {
    id: "1",
    productName: "Camiseta Premium Oversized",
    sellerName: "Marina Store",
    price: 89.9,
    rating: 4.8,
    reviewCount: 120,
  },
  {
    id: "2",
    productName: "Fone Bluetooth Pro Max",
    sellerName: "TechShop BR",
    price: 299.9,
    rating: 4.9,
    reviewCount: 256,
  },
  {
    id: "3",
    productName: "Colar Dourado Minimalista",
    sellerName: "Joias da Lu",
    price: 159.9,
    rating: 4.7,
    reviewCount: 89,
  },
  {
    id: "4",
    productName: "Tenis Running Ultra",
    sellerName: "SportMax",
    price: 449.9,
    rating: 4.6,
    reviewCount: 312,
  },
  {
    id: "5",
    productName: "Bolsa Couro Ecologico",
    sellerName: "Moda Sustentavel",
    price: 189.9,
    rating: 4.5,
    reviewCount: 78,
  },
];

function StarRating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  return (
    <View className="flex-row items-center gap-2">
      <View className="flex-row items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= Math.floor(rating) ? "star" : star <= rating ? "star-half" : "star-outline"}
            size={16}
            color={star <= rating ? "#5BE096" : "#4b5563"}
          />
        ))}
      </View>
      <Text className="text-sm text-gray-400">
        {rating.toFixed(1)} - {reviewCount} avaliacoes
      </Text>
    </View>
  );
}

function MarketplaceCard({ product }: { product: MarketplaceProduct }) {
  return (
    <View className="bg-surface rounded-2xl overflow-hidden border border-zinc-800 mb-4">
      {/* Product Image Placeholder */}
      <View className="aspect-[4/3] w-full bg-surface-light items-center justify-center">
        <Ionicons name="cube-outline" size={64} color="#4b5563" />
        <Text className="text-xs text-gray-600 mt-2">Imagem do Produto</Text>
      </View>

      {/* Product Info */}
      <View className="p-4">
        <Text className="font-bold text-white text-lg mb-1">{product.productName}</Text>
        <Text className="text-sm text-gray-500 mb-3">Vendido por: {product.sellerName}</Text>

        <StarRating rating={product.rating} reviewCount={product.reviewCount} />

        <Text className="text-2xl font-bold text-primary mt-4 mb-4">
          {formatCurrency(product.price)}
        </Text>

        <TouchableOpacity
          className="w-full py-3.5 bg-primary-dark rounded-xl border border-primary/30 items-center"
          activeOpacity={0.7}
        >
          <Text className="text-primary font-semibold">Ver Detalhes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function MarketplaceCards() {
  return (
    <View className="px-4 pb-4">
      <View className="flex-row items-center gap-2 mb-4">
        <View className="w-1 h-5 bg-primary rounded-full" />
        <Text className="text-lg font-bold text-white">Produtos em Destaque</Text>
      </View>

      {mockProducts.map((product) => (
        <MarketplaceCard key={product.id} product={product} />
      ))}
    </View>
  );
}
