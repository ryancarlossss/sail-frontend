import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import axios from 'axios';

export default function NovoProdutoScreen() {
  const insets = useSafeAreaInsets();

  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [categoria, setCategoria] = useState(''); // <-- Estado da categoria adicionado
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const salvarProdutoBackend = async () => {
    if (!nome || !preco || !quantidade || !categoria) {
      Alert.alert("Validação", "Preencha todos os campos, incluindo a categoria!");
      return;
    }

    setIsSubmitting(true);

    try {
      const produtoParaSalvar = {
        nome: nome,
        quantidade: parseInt(quantidade),
        preco: parseFloat(preco.replace(',', '.')),
        categoria: categoria // <-- Enviando a categoria para o Java
      };

      // URL atualizada com o IP real que apareceu no seu terminal
      const resposta = await axios.post('http://192.168.255.104:8080/produtos', produtoParaSalvar, {
          timeout: 5000 
      });

      if (resposta.status === 200 || resposta.status === 201) {
        Alert.alert("Sucesso", "Produto cadastrado com sucesso.");
        router.back();
      } else {
          Alert.alert("Aviso", `O servidor respondeu com status: ${resposta.status}`);
      }

    } catch (error) {
        let errorMessage = "Não foi possível conectar ao servidor.";
        if (axios.isAxiosError(error)) {
            errorMessage = error.message;
            if (error.response) {
                errorMessage = `Erro do servidor: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
            }
        }
      Alert.alert("Erro de Conexão", errorMessage);
      console.error("Erro Axios:", error);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      <View style={{ paddingTop: insets.top }} className="bg-black border-b border-surface-border">
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2 -ml-2 rounded-full min-w-[44px] min-h-[44px] items-center justify-center"
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-white">Novo Produto</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4">
          <Text className="text-sm text-gray-400 mb-2">Título do Produto</Text>
          <TextInput
            value={nome}
            onChangeText={setNome}
            placeholder="Ex: Bolsa Couro Ecológico"
            placeholderTextColor="#4b5563"
            className="w-full bg-zinc-900 text-white rounded-xl px-4 py-4 text-sm"
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm text-gray-400 mb-2">Valor</Text>
          <View className="relative">
            <Text className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-medium z-10">
              R$
            </Text>
            <TextInput
              value={preco}
              onChangeText={setPreco}
              placeholder="0,00"
              placeholderTextColor="#4b5563"
              keyboardType="decimal-pad"
              className="w-full bg-zinc-900 text-white rounded-xl pl-12 pr-4 py-4 text-sm"
            />
          </View>
        </View>

        {}
        <View className="mb-4">
          <Text className="text-sm text-gray-400 mb-2">Categoria</Text>
          <TextInput
            value={categoria}
            onChangeText={setCategoria}
            placeholder="Ex: Eletrônicos, Roupas..."
            placeholderTextColor="#4b5563"
            className="w-full bg-zinc-900 text-white rounded-xl px-4 py-4 text-sm"
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm text-gray-400 mb-2">Quantidade em Estoque</Text>
          <TextInput
            value={quantidade}
            onChangeText={setQuantidade}
            placeholder="0"
            placeholderTextColor="#4b5563"
            keyboardType="number-pad"
            className="w-full bg-zinc-900 text-white rounded-xl px-4 py-4 text-sm"
          />
        </View>

        <TouchableOpacity
          onPress={salvarProdutoBackend}
          disabled={isSubmitting}
          className={`w-full py-4 rounded-xl items-center mt-6 ${isSubmitting ? 'bg-gray-500' : 'bg-[#5BE096]'}`}
          activeOpacity={0.7}
        >
          {isSubmitting ? (
              <ActivityIndicator color="#000" />
          ) : (
              <Text className="text-black font-bold text-lg">Salvar Produto</Text>
          )}
        </TouchableOpacity>

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}