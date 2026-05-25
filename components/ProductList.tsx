import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

export interface Product {
  id: number;
  nome: string; 
  preco: number;
  quantidade: number;
}

interface ProductCardProps {
  product: Product;
  onExcluir: (id: number) => void;
  onVender: (produto: Product) => void;
  onEditar: (produto: Product) => void;
}

export function ProductCard({ product, onExcluir, onVender, onEditar }: ProductCardProps) {
  const qty = product.quantidade !== undefined ? product.quantidade : 0;
  const isEstoqueBaixo = qty < 5;

  return (
    <View className="flex-row gap-3 bg-zinc-900 p-4 rounded-2xl border border-zinc-800 mb-3">
      <View className="w-20 h-20 rounded-xl bg-zinc-800 items-center justify-center">
        <Ionicons name="cube-outline" size={32} color="#6b7280" />
      </View>

      <View className="flex-1">
        <View className="flex-row items-start justify-between gap-2">
          <Text className="font-medium text-white flex-1" numberOfLines={1}>
            {product.nome}
          </Text>
          <Badge variant={isEstoqueBaixo ? "danger" : "success"}>
            {isEstoqueBaixo ? "Sem Estoque" : "Ativo"}
          </Badge>
        </View>

        <View className="flex-row items-center justify-between mt-2">
          <Text className="text-sm font-bold text-primary">
            {formatCurrency(product.preco)}
          </Text>
          <Text className="text-xs font-medium text-gray-400">
            {qty} unidades
          </Text>
        </View>

        <View className="flex-row items-center justify-between mt-3">
          <TouchableOpacity
            className="bg-primary/20 border border-primary/50 px-3 py-1.5 rounded-lg flex-row items-center gap-1"
            activeOpacity={0.7}
            onPress={() => onVender(product)}
          >
            <Ionicons name="cart-outline" size={14} color="#5BE096" />
            <Text className="text-primary text-xs font-bold">Vender</Text>
          </TouchableOpacity>

          <View className="flex-row items-center gap-1">
            <TouchableOpacity
              className="p-2 rounded-full min-w-[36px] min-h-[36px] items-center justify-center"
              activeOpacity={0.7}
              onPress={() => onEditar(product)}
            >
              <Ionicons name="pencil" size={16} color="#5BE096" />
            </TouchableOpacity>

            <TouchableOpacity
              className="p-2 rounded-full min-w-[36px] min-h-[36px] items-center justify-center bg-red-500/10"
              activeOpacity={0.7}
              onPress={() => onExcluir(product.id)}
            >
              <Ionicons name="trash-outline" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

interface ProductListProps {
  products: Product[];
  onExcluir: (id: number) => void;
  onVender: (produto: Product) => void;
  onEditar: (produto: Product) => void;
}

export function ProductList({ products, onExcluir, onVender, onEditar }: ProductListProps) {
  return (
    <View>
      <Text className="text-sm font-medium text-gray-400 mb-3">
        Meus Produtos ({products.length})
      </Text>
      {products.map((product) => (
        <ProductCard 
            key={product.id} 
            product={product} 
            onExcluir={onExcluir}
            onVender={onVender}
            onEditar={onEditar}
        />
      ))}
    </View>
  );
}