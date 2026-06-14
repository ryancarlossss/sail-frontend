import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import BackgroundWrapper from '../components/BackgroundWrapper'; // <-- Importamos o fundo aqui!

export default function CadastroScreen() {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCadastro = async () => {
    if (!nome || !email || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Sucesso', 'Conta criada com sucesso! Faça seu login.');
      router.back();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar a conta. Tente outro e-mail.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Colocamos o Wrapper por volta de tudo e tiramos a cor de fundo (bg-black) da View principal
    <BackgroundWrapper>
      <View className="flex-1 px-6" style={{ paddingTop: insets.top + 20 }}>

        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-12 h-12 items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-transparent"
          >
            <Feather name="arrow-left" size={24} color={isDark ? "#5BE096" : "#2E8B57"} />
          </TouchableOpacity>
          <Text className={`text-3xl font-bold italic absolute w-full text-center -z-10 ${isDark ? "text-[#5BE096]" : "text-[#2E8B57]"}`}>Sail.</Text>
          <View className="w-12" />
        </View>

        <View className="items-center mb-8">
          <Text className="text-3xl font-bold text-black dark:text-white mb-2">Criar Conta</Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm">Preencha seus dados para começar</Text>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-bold text-black dark:text-white mb-2">Nome Completo</Text>
          <View className="relative justify-center">
            <View className="absolute left-4 z-10">
              <Feather name="user" size={20} color={isDark ? "#5BE096" : "#2E8B57"} />
            </View>
            <TextInput
              value={nome}
              onChangeText={setNome}
              placeholder="Ex: João da Silva"
              placeholderTextColor={isDark ? "#4b5563" : "#9CA3AF"}
              className={`w-full bg-white dark:bg-zinc-900 text-black dark:text-white border ${isDark ? 'border-[#5BE096]' : 'border-[#2E8B57]'} rounded-2xl pl-12 pr-4 py-4 text-base`}
            />
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-bold text-black dark:text-white mb-2">E-mail</Text>
          <View className="relative justify-center">
            <View className="absolute left-4 z-10">
              <Feather name="mail" size={20} color={isDark ? "#5BE096" : "#2E8B57"} />
            </View>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="seu@email.com"
              placeholderTextColor={isDark ? "#4b5563" : "#9CA3AF"}
              keyboardType="email-address"
              autoCapitalize="none"
              className={`w-full bg-white dark:bg-zinc-900 text-black dark:text-white border ${isDark ? 'border-[#5BE096]' : 'border-[#2E8B57]'} rounded-2xl pl-12 pr-4 py-4 text-base`}
            />
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-sm font-bold text-black dark:text-white mb-2">Senha</Text>
          <View className="relative justify-center">
            <View className="absolute left-4 z-10">
              <Feather name="lock" size={20} color={isDark ? "#5BE096" : "#2E8B57"} />
            </View>
            <TextInput
              value={senha}
              onChangeText={setSenha}
              placeholder="Crie uma senha forte"
              placeholderTextColor={isDark ? "#4b5563" : "#9CA3AF"}
              secureTextEntry={!mostrarSenha}
              className={`w-full bg-white dark:bg-zinc-900 text-black dark:text-white border ${isDark ? 'border-[#5BE096]' : 'border-[#2E8B57]'} rounded-2xl pl-12 pr-12 py-4 text-base`}
            />
            <TouchableOpacity
              className="absolute right-4 z-10 p-2"
              onPress={() => setMostrarSenha(!mostrarSenha)}
            >
              <Feather name={mostrarSenha ? "eye-off" : "eye"} size={20} color={isDark ? "#5BE096" : "#2E8B57"} />
            </TouchableOpacity>
          </View>
        </View>

        <View className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 flex-row items-center mb-8">
          <View className={`${isDark ? 'bg-[#5BE096]/10' : 'bg-[#2E8B57]/10'} p-3 rounded-full mr-4`}>
            <Feather name="shield" size={24} color={isDark ? "#5BE096" : "#2E8B57"} />
          </View>
          <View className="flex-1">
            <Text className={`${isDark ? 'text-[#5BE096]' : 'text-[#2E8B57]'} font-bold text-sm mb-1`}>Dica de segurança</Text>
            <Text className="text-gray-500 dark:text-gray-400 text-xs leading-5">Use pelo menos 8 caracteres com letras, números e símbolos.</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleCadastro}
          disabled={isLoading}
          className={`w-full py-4 rounded-2xl items-center mb-6 ${isLoading ? 'bg-gray-300 dark:bg-zinc-700' : 'bg-[#5BE096]'}`}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text className="text-black font-bold text-lg">Cadastrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          className="py-2 items-center"
        >
          <Text className="text-gray-600 dark:text-gray-400">
            Já tem uma conta? <Text className="text-[#5BE096] font-bold">Entrar</Text>
          </Text>
        </TouchableOpacity>

      </View>
    </BackgroundWrapper>
  );
}