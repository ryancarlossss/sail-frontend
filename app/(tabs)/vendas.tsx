import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import axios from 'axios';
import BackgroundWrapper from '../../components/BackgroundWrapper';

interface Produto {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  imagem?: string;
}

export default function VendasScreen() {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [produtos, setProdutos] = useState<Produto[]>([]);

  const textColor = isDark ? "text-white" : "text-gray-900";
  const subtextColor = isDark ? "text-gray-400" : "text-gray-500";
  const cardBg = isDark ? "bg-zinc-900/90" : "bg-white/90";
  const borderColor = isDark ? "border-zinc-800" : "border-gray-200";

  const API_URL = 'http://10.178.215.156:8080/produtos';

  const buscarProdutos = async () => {
    try {
      const resposta = await axios.get(API_URL);
      setProdutos(resposta.data);
    } catch (error) {
      console.log("Erro ao buscar produtos:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      buscarProdutos();
    }, [])
  );

  const deletarProduto = (id: string) => {
    Alert.alert(
      "Excluir Produto",
      "Tem certeza que deseja excluir este produto do estoque?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/${id}`);
              buscarProdutos();
            } catch (error) {
              Alert.alert("Erro", "Não foi possível excluir o produto.");
            }
          }
        }
      ]
    );
  };

  return (
    <BackgroundWrapper>
      <View className="flex-1">

        <View style={{ paddingTop: insets.top }} className="px-6 pb-2 pt-4">
          <View className="flex-row items-center justify-between mb-6">

            {/* Logo adicionada aqui */}
            <Image
              source={require('../../assets/images/logo.png')}
              style={{ width: 45, height: 45 }}
              resizeMode="contain"
            />

            {/* Ícones do cabeçalho corrigidos para o fundo escuro */}
            <View className="flex-row gap-2">
              <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800">
                <Feather name="eye" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/configuracoes')} className="w-10 h-10 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800">
                <Feather name="settings" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-xl relative bg-zinc-900 border border-zinc-800">
                <Feather name="bell" size={18} color="#fff" />
                <View className="absolute top-2 right-2 w-2 h-2 bg-[#5BE096] rounded-full" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-6">
            <Text className={`text-2xl font-bold ${textColor} mb-1`}>Meu Estoque</Text>
            <Text className={`${subtextColor} text-sm`}>Acompanhe seus produtos e vendas</Text>
          </View>

          <View className="flex-row gap-4 mb-8">
            <View className={`flex-1 p-4 rounded-2xl ${cardBg} border ${borderColor}`}>
              <Text className={`${subtextColor} text-xs mb-2`}>Vendas Totais</Text>
              <View className={`w-8 h-8 rounded-lg items-center justify-center mb-3 ${isDark ? "bg-[#5BE096]/10" : "bg-[#2E8B57]/10"}`}>
                <Feather name="trending-up" size={16} color={isDark ? "#5BE096" : "#2E8B57"} />
              </View>
              <Text className={`text-[#5BE096] font-bold text-lg mb-1`}>R$ 1.250,00</Text>
              <View className="flex-row items-center">
                <Text className="text-[#5BE096] text-[10px] font-bold mr-1">+12,5% vs mês anterior</Text>
                <Feather name="arrow-up-right" size={10} color="#5BE096" />
              </View>
            </View>

            <View className={`flex-1 p-4 rounded-2xl ${cardBg} border ${borderColor}`}>
              <Text className={`${subtextColor} text-xs mb-2`}>Pedidos Pendentes</Text>
              <View className={`w-8 h-8 rounded-lg items-center justify-center mb-3 ${isDark ? "bg-[#5BE096]/10" : "bg-[#2E8B57]/10"}`}>
                <Feather name="file-text" size={16} color={isDark ? "#5BE096" : "#2E8B57"} />
              </View>
              <Text className={`font-bold text-lg ${textColor} mb-1`}>3</Text>
              <TouchableOpacity className="flex-row items-center mt-1">
                <Text className="text-[#5BE096] text-[10px] font-bold mr-1">Ver detalhes</Text>
                <Feather name="chevron-right" size={10} color="#5BE096" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row items-center justify-between mb-4">
            {/* TEXTO "MEUS PRODUTOS" CORRIGIDO E VISÍVEL */}
            <Text className={`text-xl font-bold ${isDark ? "text-[#5BE096]" : "text-[#2E8B57]"}`}>
              Meus Produtos ({produtos.length})
            </Text>

            {produtos.length > 0 && (
              <TouchableOpacity className="flex-row items-center">
                <Text className="text-[#5BE096] text-xs font-medium mr-1">Ver todos</Text>
                <Feather name="chevron-right" size={12} color="#5BE096" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {produtos.length === 0 ? (
            <View className="py-10 items-center justify-center opacity-50">
            </View>
          ) : (
            produtos.map((produto) => {
              const semEstoque = produto.quantidade <= 0;

              return (
                <View key={produto.id} className={`p-4 rounded-2xl ${cardBg} border ${borderColor} mb-4`}>
                  <View className="flex-row items-center">

                    <View className={`w-16 h-16 rounded-xl items-center justify-center mr-4 ${isDark ? "bg-zinc-800" : "bg-gray-100"}`}>
                      {produto.imagem ? (
                        <Image source={{ uri: produto.imagem }} className="w-full h-full rounded-xl" resizeMode="cover" />
                      ) : (
                        <Feather name="package" size={24} color={isDark ? "#5BE096" : "#2E8B57"} />
                      )}
                    </View>

                    <View className="flex-1">
                      <View className="flex-row justify-between items-start mb-1">
                        <Text className={`font-bold text-base ${textColor}`}>{produto.nome}</Text>
                        <View className={`px-2 py-0.5 rounded-md ${semEstoque ? 'bg-red-500/20' : 'bg-[#5BE096]/20'}`}>
                          <Text className={`text-[10px] font-bold ${semEstoque ? 'text-red-500' : 'text-[#5BE096]'}`}>
                            {semEstoque ? 'Sem Estoque' : 'Ativo'}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-[#5BE096] font-bold text-sm">
                          R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
                        </Text>
                        <Text className={`${subtextColor} text-[10px]`}>{produto.quantidade} unidades</Text>
                      </View>

                      <View className="flex-row justify-between items-center mt-2">
                        <TouchableOpacity className="border border-[#5BE096] px-3 py-1.5 rounded-lg flex-row items-center">
                          <Feather name="shopping-cart" size={12} color="#5BE096" className="mr-2" />
                          <Text className="text-[#5BE096] text-xs font-bold">Vender</Text>
                        </TouchableOpacity>

                        <View className="flex-row gap-2">
                          <TouchableOpacity
                            onPress={() => router.push(`/produto/novo?id=${produto.id}&nome=${produto.nome}&preco=${produto.preco}&quantidade=${produto.quantidade}`)}
                            className={`w-8 h-8 rounded-full items-center justify-center ${isDark ? "bg-zinc-800" : "bg-gray-100"}`}
                          >
                            <Feather name="edit-2" size={14} color="#5BE096" />
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => deletarProduto(produto.id)}
                            className={`w-8 h-8 rounded-full items-center justify-center ${isDark ? "bg-zinc-800" : "bg-gray-100"}`}
                          >
                            <Feather name="trash-2" size={14} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })
          )}
          <View className="h-24" />
        </ScrollView>

        <TouchableOpacity
          onPress={() => router.push('/produto/novo')}
          className="absolute bottom-6 right-6 w-14 h-14 bg-[#5BE096] rounded-full items-center justify-center shadow-lg"
          style={{ elevation: 5, shadowColor: '#5BE096', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}
        >
          <Feather name="plus" size={28} color="#000000" />
        </TouchableOpacity>
      </View>
    </BackgroundWrapper>
  );
}