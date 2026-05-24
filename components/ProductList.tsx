import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  messages: number;
  status: "active" | "out_of_stock";
}

function StarRating({ rating }: { rating: number }) {
  return (
    <View className="flex-row items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? "star" : star - 0.5 <= rating ? "star-half" : "star-outline"}
          size={14}
          color={star <= rating ? "#5BE096" : "#4b5563"}
        />
      ))}
    </View>
  );
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <View className="flex-row gap-3 bg-zinc-900 p-4 rounded-2xl border border-zinc-800 mb-3">
      <View className="w-20 h-20 rounded-xl bg-zinc-800 items-center justify-center">
        <Ionicons name="cube-outline" size={32} color="#6b7280" />
      </View>

      <View className="flex-1">
        <View className="flex-row items-start justify-between gap-2">
          <Text className="font-medium text-white flex-1" numberOfLines={1}>
            {product.title}
          </Text>
          <Badge variant={product.status === "active" ? "success" : "danger"}>
            {product.status === "active" ? "Ativo" : "Sem Estoque"}
          </Badge>
        </View>

        <Text className="text-xs text-gray-500 mt-1" numberOfLines={1}>
          {product.description}
        </Text>

        <Text className="text-sm font-bold text-primary mt-2">
          {formatCurrency(product.price)}
        </Text>

        <View className="flex-row items-center justify-between mt-2">
          <View className="flex-row items-center gap-2">
            <StarRating rating={product.rating} />
            <Text className="text-[10px] text-gray-500">({product.reviews})</Text>
          </View>

          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              className="relative p-2 rounded-full min-w-[36px] min-h-[36px] items-center justify-center"
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubble-outline" size={16} color="#5BE096" />
              {product.messages > 0 && (
                <View className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 items-center justify-center">
                  <Text className="text-[10px] text-white font-medium">{product.messages}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="p-2 rounded-full min-w-[36px] min-h-[36px] items-center justify-center"
              activeOpacity={0.7}
            >
              <Ionicons name="pencil" size={16} color="#5BE096" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

interface ProductListProps {
  products: Product[];
}

export function ProductList({ products }: ProductListProps) {
  return (
    <View>
      <Text className="text-sm font-medium text-gray-400 mb-3">
        Meus Produtos ({products.length})
      </Text>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </View>
  );
}

export type { Product };
