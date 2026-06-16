import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, Modal, TextInput } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import axios from 'axios';
import BackgroundWrapper from '../../components/BackgroundWrapper';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [modalVisible, setModalVisible] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [qtdVenda, setQtdVenda] = useState("1");

  const API_URL = 'http://192.168.0.104:8080/produtos';

  const buscarProdutos = async () => {
    try {
      const resposta = await axios.get(API_URL);
      setProdutos(resposta.data);
    } catch (error) {}
  };

  useFocusEffect(
    useCallback(() => {
      buscarProdutos();
    }, [])
  );

  const deletarProduto = (id: string) => {
    Alert.alert(
      "Excluir",
      "Deseja excluir este produto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const resposta = await axios.delete(`${API_URL}/${id}`);
              if (resposta.status === 200 || resposta.status === 204) {
                await buscarProdutos();
              }
            } catch (error) {
              Alert.alert(
                "Ação Bloqueada pelo Banco",
                "O MySQL impediu a exclusão porque este produto já possui vendas no histórico. Excluir corromperia os registros passados."
              );
            }
          }
        }
      ]
    );
  };

  const abrirModalVenda = (produto: Produto) => {
    setProdutoSelecionado(produto);
    setQtdVenda("1");
    setModalVisible(true);
  };

  const confirmarVenda = async () => {
    if (!produtoSelecionado || !qtdVenda) return;
    try {
      const usuarioId = await AsyncStorage.getItem('usuarioId');
      if (!usuarioId) {
        router.replace('/'); 
        return;
      }
      const resposta = await axios.post(
        `${API_URL}/${produtoSelecionado.id}/vender?quantidade=${qtdVenda}`, 
        {},
        { headers: { 'usuarioId': usuarioId } }
      );
      if (resposta.status === 200) {
        setModalVisible(false);
        await buscarProdutos();
      }
    } catch (error) {}
  };

  return (
    <BackgroundWrapper>
      <View className="flex-1">
        <View style={{ paddingTop: insets.top }} className="px-6 pb-2 pt-4">
          
          <View className="flex-row items-center justify-between mb-6">
            <Image source={require('../../assets/images/logo.png')} style={{ width: 45, height: 45 }} resizeMode="contain" />
            <View className="flex-row gap-2">
              <TouchableOpacity style={{ backgroundColor: isDark ? '#18181b' : '#f3f4f6', borderColor: isDark ? '#27272a' : '#e5e7eb', borderWidth: 1 }} className="w-10 h-10 items-center justify-center rounded-xl">
                <Feather name="eye" size={18} color={isDark ? "#ffffff" : "#000000"} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/configuracoes')} style={{ backgroundColor: isDark ? '#18181b' : '#f3f4f6', borderColor: isDark ? '#27272a' : '#e5e7eb', borderWidth: 1 }} className="w-10 h-10 items-center justify-center rounded-xl">
                <Feather name="settings" size={18} color={isDark ? "#ffffff" : "#000000"} />
              </TouchableOpacity>
              <TouchableOpacity style={{ backgroundColor: isDark ? '#18181b' : '#f3f4f6', borderColor: isDark ? '#27272a' : '#e5e7eb', borderWidth: 1 }} className="w-10 h-10 items-center justify-center rounded-xl relative">
                <Feather name="bell" size={18} color={isDark ? "#ffffff" : "#000000"} />
                <View style={{ backgroundColor: isDark ? '#5BE096' : '#2E8B57' }} className="absolute top-2 right-2 w-2 h-2 rounded-full" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-6">
            <Text style={{ color: isDark ? '#ffffff' : '#000000' }} className="text-2xl font-bold mb-1">Meu Estoque</Text>
            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280' }} className="text-sm">Seus produtos e vendas</Text>
          </View>

          <View className="flex-row gap-4 mb-8">
            <TouchableOpacity onPress={() => router.push('/historico')} style={{ backgroundColor: isDark ? '#18181b' : '#ffffff', borderColor: isDark ? '#27272a' : '#e5e7eb', borderWidth: 1 }} className="flex-1 p-4 rounded-2xl" activeOpacity={0.7}>
              <Text style={{ color: isDark ? '#9ca3af' : '#6b7280' }} className="text-xs mb-2">Vendas Totais</Text>
              <View style={{ backgroundColor: isDark ? 'rgba(91, 224, 150, 0.1)' : 'rgba(46, 139, 87, 0.1)' }} className="w-8 h-8 rounded-lg items-center justify-center mb-3">
                <Feather name="trending-up" size={16} color={isDark ? "#5BE096" : "#2E8B57"} />
              </View>
              <Text style={{ color: isDark ? '#5BE096' : '#2E8B57' }} className="font-bold text-lg mb-1">Histórico</Text>
              <View className="flex-row items-center">
                <Text style={{ color: isDark ? '#5BE096' : '#2E8B57' }} className="text-[10px] font-bold mr-1">Ver alterações</Text>
                <Feather name="arrow-up-right" size={10} color={isDark ? "#5BE096" : "#2E8B57"} />
              </View>
            </TouchableOpacity>

            <View style={{ backgroundColor: isDark ? '#18181b' : '#ffffff', borderColor: isDark ? '#27272a' : '#e5e7eb', borderWidth: 1 }} className="flex-1 p-4 rounded-2xl">
              <Text style={{ color: isDark ? '#9ca3af' : '#6b7280' }} className="text-xs mb-2">Pendentes</Text>
              <View style={{ backgroundColor: isDark ? 'rgba(91, 224, 150, 0.1)' : 'rgba(46, 139, 87, 0.1)' }} className="w-8 h-8 rounded-lg items-center justify-center mb-3">
                <Feather name="file-text" size={16} color={isDark ? "#5BE096" : "#2E8B57"} />
              </View>
              <Text style={{ color: isDark ? '#ffffff' : '#000000' }} className="font-bold text-lg mb-1">3</Text>
              <View className="flex-row items-center mt-1">
                <Text style={{ color: isDark ? '#5BE096' : '#2E8B57' }} className="text-[10px] font-bold mr-1">Detalhes</Text>
                <Feather name="chevron-right" size={10} color={isDark ? "#5BE096" : "#2E8B57"} />
              </View>
            </View>
          </View>

          <View className="flex-row items-center justify-between mb-4">
            <Text style={{ color: isDark ? '#5BE096' : '#2E8B57' }} className="text-xl font-bold">Meus Produtos</Text>
            {produtos.length > 0 && (
              <TouchableOpacity className="flex-row items-center">
                <Text style={{ color: isDark ? '#5BE096' : '#2E8B57' }} className="text-xs font-medium mr-1">Ver todos</Text>
                <Feather name="chevron-right" size={12} color={isDark ? "#5BE096" : "#2E8B57"} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {produtos.length === 0 ? (
            <View className="py-10 items-center justify-center opacity-50"></View>
          ) : (
            produtos.map((produto) => {
              const semEstoque = produto.quantidade <= 0;
              return (
                <View key={produto.id} style={{ backgroundColor: isDark ? '#18181b' : '#ffffff', borderColor: isDark ? '#27272a' : '#e5e7eb', borderWidth: 1 }} className="p-4 rounded-2xl mb-4">
                  <View className="flex-row items-center">
                    <View style={{ backgroundColor: isDark ? '#27272a' : '#f3f4f6' }} className="w-16 h-16 rounded-xl items-center justify-center mr-4">
                      {produto.imagem ? (
                        <Image source={{ uri: produto.imagem }} className="w-full h-full rounded-xl" resizeMode="cover" />
                      ) : (
                        <Feather name="package" size={24} color={isDark ? "#5BE096" : "#2E8B57"} />
                      )}
                    </View>

                    <View className="flex-1">
                      <View className="flex-row justify-between items-start mb-1">
                        <Text style={{ color: isDark ? '#ffffff' : '#000000' }} className="font-bold text-base">{produto.nome}</Text>
                        <View style={{ backgroundColor: semEstoque ? 'rgba(239, 68, 68, 0.2)' : (isDark ? 'rgba(91, 224, 150, 0.2)' : 'rgba(46, 139, 87, 0.2)') }} className="px-2 py-0.5 rounded-md">
                          <Text style={{ color: semEstoque ? '#ef4444' : (isDark ? '#5BE096' : '#2E8B57') }} className="text-[10px] font-bold">
                            {semEstoque ? 'Sem Estoque' : 'Ativo'}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row justify-between items-center mb-2">
                        <Text style={{ color: isDark ? '#5BE096' : '#2E8B57' }} className="font-bold text-sm">
                          R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
                        </Text>
                        <Text style={{ color: isDark ? '#9ca3af' : '#6b7280' }} className="text-[10px]">{produto.quantidade} un</Text>
                      </View>

                      <View className="flex-row justify-between items-center mt-2">
                        <TouchableOpacity onPress={() => abrirModalVenda(produto)} style={{ borderColor: isDark ? '#5BE096' : '#2E8B57', borderWidth: 1 }} className="px-3 py-1.5 rounded-lg flex-row items-center">
                          <Feather name="shopping-cart" size={12} color={isDark ? "#5BE096" : "#2E8B57"} className="mr-2" />
                          <Text style={{ color: isDark ? '#5BE096' : '#2E8B57' }} className="text-xs font-bold">Vender</Text>
                        </TouchableOpacity>

                        <View className="flex-row gap-2">
                          <TouchableOpacity onPress={() => router.push(`/produto/novo?id=${produto.id}&nome=${produto.nome}&preco=${produto.preco}&quantidade=${produto.quantidade}`)} style={{ backgroundColor: isDark ? '#27272a' : '#f3f4f6' }} className="w-8 h-8 rounded-full items-center justify-center">
                            <Feather name="edit-2" size={14} color={isDark ? "#5BE096" : "#2E8B57"} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => deletarProduto(produto.id)} style={{ backgroundColor: isDark ? '#27272a' : '#f3f4f6' }} className="w-8 h-8 rounded-full items-center justify-center">
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

        <TouchableOpacity onPress={() => router.push('/produto/novo')} style={{ backgroundColor: isDark ? '#5BE096' : '#2E8B57', elevation: 5, shadowColor: isDark ? '#5BE096' : '#2E8B57', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }} className="absolute bottom-6 right-6 w-14 h-14 rounded-full items-center justify-center shadow-lg">
          <Feather name="plus" size={28} color={isDark ? "#000000" : "#ffffff"} />
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/80 px-4">
          <View style={{ backgroundColor: isDark ? '#18181b' : '#ffffff', borderColor: isDark ? '#27272a' : '#e5e7eb', borderWidth: 1 }} className="p-6 rounded-3xl w-full">
            <Text style={{ color: isDark ? '#ffffff' : '#000000' }} className="text-xl font-bold mb-2">Venda</Text>
            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280' }} className="mb-6">Quantidade de "{produtoSelecionado?.nome}"?</Text>
            
            <TextInput value={qtdVenda} onChangeText={setQtdVenda} keyboardType="number-pad" style={{ backgroundColor: isDark ? '#27272a' : '#f3f4f6', color: isDark ? '#ffffff' : '#000000', borderColor: isDark ? '#3f3f46' : '#d1d5db', borderWidth: 1 }} className="w-full rounded-2xl px-4 py-4 text-center text-xl font-bold mb-8" />

            <View className="flex-row justify-end gap-4">
              <TouchableOpacity onPress={() => setModalVisible(false)} className="px-4 py-3">
                <Text style={{ color: isDark ? '#9ca3af' : '#6b7280' }} className="font-bold text-base">Sair</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmarVenda} style={{ backgroundColor: isDark ? '#5BE096' : '#2E8B57' }} className="px-8 py-3 rounded-2xl">
                <Text style={{ color: isDark ? '#000000' : '#ffffff' }} className="font-bold text-base">Vender</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </BackgroundWrapper>
  );
}