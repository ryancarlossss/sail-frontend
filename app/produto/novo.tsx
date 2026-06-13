import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useColorScheme } from 'nativewind';

export default function NovoProdutoScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const isEditing = !!params.id;

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const primaryColor = isDark ? "#5BE096" : "#2E8B57";

  const [titulo, setTitulo] = useState(params.nome ? String(params.nome) : '');
  const [valor, setValor] = useState(params.preco ? String(params.preco) : '');
  const [quantidade, setQuantidade] = useState(params.quantidade ? String(params.quantidade) : '');
  const [imagem, setImagem] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImagem(result.assets[0].uri);
    }
  };

  const handleSalvar = async () => {
    if (!titulo || !valor || !quantidade) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    setIsLoading(true);

    try {
      const produtoParaSalvar = {
        nome: titulo,
        quantidade: parseInt(quantidade),
        preco: parseFloat(valor.replace(',', '.')),
        imagem: imagem
      };

      const API_URL = 'http://10.178.215.156:8080/produtos';
      let resposta;

      if (isEditing) {
        resposta = await axios.put(`${API_URL}/${params.id}`, produtoParaSalvar);
      } else {
        resposta = await axios.post(API_URL, produtoParaSalvar);
      }

      if (resposta.status === 200 || resposta.status === 201 || resposta.status === 204) {
        Alert.alert('Sucesso', isEditing ? 'Produto atualizado!' : 'Produto salvo com sucesso!');
        router.back();
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o produto.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F5FBF7] dark:bg-black" style={{ paddingTop: insets.top + 20 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 24 }}>

        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-12 h-12 items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-transparent"
          >
            <Feather name="arrow-left" size={24} color={primaryColor} />
          </TouchableOpacity>
          <Text className={`text-3xl font-bold italic absolute w-full text-center -z-10 ${isDark ? "text-[#5BE096]" : "text-[#2E8B57]"}`}>Sail.</Text>
          <View className="w-12" />
        </View>

        {/* Títulos */}
        <View className="items-center mb-8">
          <Text className="text-3xl font-bold text-black dark:text-white mb-2">
            {isEditing ? "Editar Produto" : "Novo Produto"}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm">Preencha as informações do produto</Text>
        </View>

        {/* Foto do Produto */}
        <View className="mb-6">
          <Text className="text-sm font-bold text-black dark:text-white mb-2">Foto do Produto</Text>
          <TouchableOpacity
            onPress={pickImage}
            className={`w-full h-48 border-2 border-dashed rounded-2xl items-center justify-center bg-white dark:bg-zinc-900 overflow-hidden ${isDark ? 'border-[#5BE096]' : 'border-[#2E8B57]'}`}
          >
            {imagem ? (
              <Image source={{ uri: imagem }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <View className="items-center">
                <Feather name="camera" size={32} color={primaryColor} className="mb-2" />
                <Text className={`font-bold ${isDark ? "text-[#5BE096]" : "text-[#2E8B57]"}`}>Adicionar foto</Text>
                <Text className="text-gray-400 dark:text-gray-500 text-xs mt-1">PNG, JPG ou WEBP • Máx. 5MB</Text>
              </View>
            )}
          </TouchableOpacity>

          <View className={`rounded-xl p-4 flex-row items-center mt-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-transparent`}>
            <Feather name="leaf" size={18} color={primaryColor} className="mr-3" />
            <Text className={`text-xs font-medium ${isDark ? "text-[#5BE096]" : "text-[#2E8B57]"}`}>Uma boa foto ajuda a vender mais!</Text>
          </View>
        </View>

        {/* Título do Produto */}
        <View className="mb-4">
          <Text className="text-sm font-bold text-black dark:text-white mb-2">Título do Produto</Text>
          <View className="relative justify-center">
            <View className="absolute left-4 z-10">
              <Feather name="tag" size={20} color={primaryColor} />
            </View>
            <TextInput
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Ex: Bolsa Couro Ecológico"
              placeholderTextColor={isDark ? "#4b5563" : "#9CA3AF"}
              className={`w-full bg-white dark:bg-zinc-900 text-black dark:text-white border rounded-2xl pl-12 pr-4 py-4 text-base ${isDark ? 'border-[#5BE096]' : 'border-[#2E8B57]'}`}
            />
          </View>
        </View>

        {/* Valor */}
        <View className="mb-4">
          <Text className="text-sm font-bold text-black dark:text-white mb-2">Valor</Text>
          <View className="relative justify-center">
            <View className="absolute left-4 z-10">
              <Text className={`font-bold text-base ${isDark ? "text-[#5BE096]" : "text-[#2E8B57]"}`}>R$</Text>
            </View>
            <TextInput
              value={valor}
              onChangeText={setValor}
              placeholder="0,00"
              placeholderTextColor={isDark ? "#4b5563" : "#9CA3AF"}
              keyboardType="numeric"
              className={`w-full bg-white dark:bg-zinc-900 text-black dark:text-white border rounded-2xl pl-12 pr-4 py-4 text-base ${isDark ? 'border-[#5BE096]' : 'border-[#2E8B57]'}`}
            />
          </View>
        </View>

        {/* Quantidade */}
        <View className="mb-8">
          <Text className="text-sm font-bold text-black dark:text-white mb-2">Quantidade em Estoque</Text>
          <View className="relative justify-center">
            <View className="absolute left-4 z-10">
              <Feather name="package" size={20} color={primaryColor} />
            </View>
            <TextInput
              value={quantidade}
              onChangeText={setQuantidade}
              placeholder="0"
              placeholderTextColor={isDark ? "#4b5563" : "#9CA3AF"}
              keyboardType="numeric"
              className={`w-full bg-white dark:bg-zinc-900 text-black dark:text-white border rounded-2xl pl-12 pr-4 py-4 text-base ${isDark ? 'border-[#5BE096]' : 'border-[#2E8B57]'}`}
            />
          </View>
        </View>

        {/* Botão Salvar */}
        <TouchableOpacity
          onPress={handleSalvar}
          disabled={isLoading}
          className={`w-full py-4 rounded-2xl flex-row justify-center items-center mb-6 ${isLoading ? 'bg-gray-300 dark:bg-zinc-700' : 'bg-[#5BE096]'}`}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <>
              <Feather name="save" size={20} color="#000000" className="mr-2" />
              <Text className="text-black font-bold text-lg">
                {isEditing ? "Salvar Alterações" : "Salvar Produto"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}