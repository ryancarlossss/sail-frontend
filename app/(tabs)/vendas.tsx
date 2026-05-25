import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, Alert, Modal, TextInput, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Header } from "@/components/Header";
import { SummaryCards } from "@/components/SummaryCards";
import { ProductList, type Product } from "@/components/ProductList";
import { FloatingActionButton } from "@/components/FloatingActionButton";

const API_URL = "http://192.168.0.101:8080/produtos";

export default function VendasScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  
  
  const [modalVisible, setModalVisible] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Product | null>(null);
  const [qtdVenda, setQtdVenda] = useState("1");

  const fetchProdutos = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Erro");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  const handleExcluir = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (response.ok) fetchProdutos(); 
    } catch (error) {
      console.error(error);
    }
  };

  
  const handleEditar = (produto: Product) => {
    router.push({
      pathname: "/produto/novo",
      params: { 
        id: produto.id, 
        nome: produto.nome, 
        preco: produto.preco, 
        quantidade: produto.quantidade 
      }
    });
  };

  
  const abrirModalVenda = (produto: Product) => {
    setProdutoSelecionado(produto);
    setQtdVenda("1");
    setModalVisible(true);
  };

  
  const confirmarVenda = async () => {
    if (!produtoSelecionado || !qtdVenda) return;
    try {
      const response = await fetch(`${API_URL}/${produtoSelecionado.id}/vender/${qtdVenda}`, {
        method: 'PUT',
      });
      if (response.ok) {
        setModalVisible(false);
        fetchProdutos();
        Alert.alert("Sucesso", "Venda registrada com sucesso!");
      } else {
        Alert.alert("Aviso", "Estoque insuficiente para essa venda.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <Header />
      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold text-white mb-4">Meu Estoque</Text>

        <SummaryCards
          cards={[
            { title: "Vendas Totais", value: " 1.250,00", prefix: "R$" },
            { title: "Pedidos Pendentes", value: 3 },
          ]}
        />

        <ProductList 
            products={products} 
            onExcluir={handleExcluir} 
            onVender={abrirModalVenda} 
            onEditar={handleEditar}
        />
        
        <View className="h-24" />
      </ScrollView>
      <FloatingActionButton />

      {}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/80 px-4">
          <View className="bg-zinc-900 p-6 rounded-2xl w-full border border-zinc-800">
            <Text className="text-xl font-bold text-white mb-2">Registrar Venda</Text>
            <Text className="text-gray-400 mb-4">
              Quantas unidades de "{produtoSelecionado?.nome}" você quer vender?
            </Text>
            
            <TextInput
              value={qtdVenda}
              onChangeText={setQtdVenda}
              keyboardType="number-pad"
              className="bg-black text-white px-4 py-3 rounded-xl border border-zinc-700 mb-6 text-center text-lg font-bold"
            />

            <View className="flex-row justify-end gap-3">
              <TouchableOpacity onPress={() => setModalVisible(false)} className="px-4 py-2">
                <Text className="text-gray-400 font-bold">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmarVenda} className="bg-primary px-6 py-2 rounded-lg">
                <Text className="text-black font-bold">Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}