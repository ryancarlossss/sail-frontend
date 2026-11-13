import { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";

type OrderStatus = "pendente" | "processando" | "enviado" | "entregue" | "cancelado";

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  totalValue: number;
  status: OrderStatus;
  product: {
    name: string;
    seller: string;
    price: number;
  };
}

const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "123-4567890-1234567",
    date: "28 de abril de 2026",
    totalValue: 189.9,
    status: "entregue",
    product: {
      name: "Fone de Ouvido Bluetooth Premium",
      seller: "TechStore Oficial",
      price: 189.9,
    },
  },
  {
    id: "2",
    orderNumber: "123-4567890-7654321",
    date: "2 de maio de 2026",
    totalValue: 459.0,
    status: "enviado",
    product: {
      name: "Smartwatch Fitness Pro",
      seller: "Eletronicos BR",
      price: 459.0,
    },
  },
  {
    id: "3",
    orderNumber: "123-4567890-9876543",
    date: "3 de maio de 2026",
    totalValue: 79.9,
    status: "pendente",
    product: {
      name: "Carregador Turbo USB-C",
      seller: "Acessorios Mobile",
      price: 79.9,
    },
  },
  {
    id: "4",
    orderNumber: "123-4567890-1122334",
    date: "1 de maio de 2026",
    totalValue: 299.0,
    status: "processando",
    product: {
      name: "Caixa de Som Portatil",
      seller: "Som & Musica",
      price: 299.0,
    },
  },
  {
    id: "5",
    orderNumber: "123-4567890-5566778",
    date: "20 de abril de 2026",
    totalValue: 149.9,
    status: "cancelado",
    product: {
      name: "Cabo HDMI 4K 2 metros",
      seller: "Cabos Express",
      price: 149.9,
    },
  },
];

const filters = [
  { id: "todos", label: "Todos" },
  { id: "aberto", label: "Em aberto" },
  { id: "enviados", label: "Enviados" },
  { id: "cancelados", label: "Cancelados" },
];

function getStatusConfig(status: OrderStatus) {
  switch (status) {
    case "entregue":
      return { label: "Entregue", variant: "success" as const };
    case "enviado":
      return { label: "Enviado", variant: "info" as const };
    case "pendente":
      return { label: "Pagamento pendente", variant: "warning" as const };
    case "processando":
      return { label: "Em processamento", variant: "warning" as const };
    case "cancelado":
      return { label: "Cancelado", variant: "danger" as const };
    default:
      return { label: status, variant: "default" as const };
  }
}

function OrderCard({ order }: { order: Order }) {
  const statusConfig = getStatusConfig(order.status);

  return (
    <View className="bg-surface-light rounded-xl overflow-hidden mb-4">
      {/* Header */}
      <View className="px-4 py-3 border-b border-zinc-800 flex-row items-center justify-between">
        <View>
          <Text className="text-xs text-gray-400">{order.date}</Text>
          <Text className="text-xs text-gray-500 mt-0.5">Pedido #{order.orderNumber}</Text>
        </View>
        <Text className="text-sm font-semibold text-white">{formatCurrency(order.totalValue)}</Text>
      </View>

      {/* Status */}
      <View className="px-4 py-2 border-b border-zinc-800">
        <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
      </View>

      {/* Product Info */}
      <View className="px-4 py-3 flex-row gap-3">
        <View className="w-16 h-16 rounded-lg bg-zinc-800 items-center justify-center">
          <Ionicons name="cube-outline" size={32} color="#4b5563" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-medium text-white" numberOfLines={1}>
            {order.product.name}
          </Text>
          <Text className="text-xs text-gray-500 mt-0.5">Vendedor: {order.product.seller}</Text>
          <Text className="text-sm font-semibold text-primary mt-1">
            {formatCurrency(order.product.price)}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View className="px-4 py-3 border-t border-zinc-800 gap-2">
        {order.status === "pendente" && (
          <Button variant="primary" className="w-full">
            <View className="flex-row items-center gap-2">
              <Ionicons name="card-outline" size={16} color="#5BE096" />
              <Text className="text-primary font-medium text-sm">Atualizar pagamento</Text>
            </View>
          </Button>
        )}

        {order.status === "enviado" && (
          <Button variant="outline" className="w-full">
            <View className="flex-row items-center gap-2">
              <Ionicons name="locate-outline" size={16} color="#fff" />
              <Text className="text-white text-sm">Rastrear pacote</Text>
            </View>
          </Button>
        )}

        {order.status === "entregue" && (
          <View className="flex-row gap-2">
            <Button variant="primary" className="flex-1">
              <View className="flex-row items-center gap-2">
                <Ionicons name="refresh-outline" size={16} color="#5BE096" />
                <Text className="text-primary font-medium text-sm">Comprar novamente</Text>
              </View>
            </Button>
            <Button variant="outline">
              <Ionicons name="star-outline" size={16} color="#fff" />
            </Button>
          </View>
        )}

        {order.status === "processando" && (
          <Button variant="outline" className="w-full">
            <View className="flex-row items-center gap-2">
              <Ionicons name="cube-outline" size={16} color="#fff" />
              <Text className="text-white text-sm">Acompanhar pedido</Text>
            </View>
          </Button>
        )}

        {/* Links */}
        <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-zinc-800">
          <TouchableOpacity className="flex-row items-center gap-1">
            <Ionicons name="chevron-forward" size={12} color="#6b7280" />
            <Text className="text-xs text-gray-400">Exibir detalhes do pedido</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center gap-1">
            <Ionicons name="document-text-outline" size={12} color="#6b7280" />
            <Text className="text-xs text-gray-400">Baixar fatura</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function PedidosScreen() {
  const [activeFilter, setActiveFilter] = useState("todos");

  const filteredOrders = mockOrders.filter((order) => {
    if (activeFilter === "todos") return true;
    if (activeFilter === "aberto") return order.status === "pendente" || order.status === "processando";
    if (activeFilter === "enviados") return order.status === "enviado";
    if (activeFilter === "cancelados") return order.status === "cancelado";
    return true;
  });

  return (
    <View className="flex-1 bg-black">
      <Header />

      {/* Title */}
      <View className="px-4 pt-4 pb-2">
        <Text className="text-xl font-bold text-white">Meus Pedidos</Text>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 py-2"
        contentContainerStyle={{ gap: 8 }}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            onPress={() => setActiveFilter(filter.id)}
            className={`px-4 py-2 rounded-full ${
              activeFilter === filter.id ? "bg-primary" : "bg-zinc-900"
            }`}
            activeOpacity={0.7}
          >
            <Text
              className={`text-sm font-medium ${
                activeFilter === filter.id ? "text-black" : "text-gray-400"
              }`}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders List */}
      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => <OrderCard key={order.id} order={order} />)
        ) : (
          <View className="items-center justify-center py-12">
            <Ionicons name="cube-outline" size={64} color="#4b5563" />
            <Text className="text-gray-400 mt-4">Nenhum pedido encontrado</Text>
            <Text className="text-gray-600 text-sm mt-1">Tente alterar o filtro selecionado</Text>
          </View>
        )}
        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
