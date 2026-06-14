import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import BackgroundWrapper from '../components/BackgroundWrapper';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.replace('/vendas');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BackgroundWrapper>
      <View
        className="flex-1 px-6 justify-center"
        style={{ paddingTop: insets.top }}
      >
        <View className="items-center mb-10 mt-4">

          {/* NOVA LOGO COM NOME ADICIONADA AQUI! Ajustei o tamanho para ela ficar proporcional */}
          <Image
            source={require('../assets/images/logo-completa.png')}
            style={{ width: 220, height: 100 }}
            resizeMode="contain"
            className="mb-2"
          />

          <Text className="text-2xl font-bold text-black dark:text-white mb-1">Bem-vindo ao Sail</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">Seu auxiliar inteligente de vendas</Text>
        </View>

        <View className="mb-4 relative justify-center">
          <View className="absolute left-4 z-10">
            <Feather name="mail" size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
          </View>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="E-mail"
            placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
            keyboardType="email-address"
            autoCapitalize="none"
            className="w-full bg-white/90 dark:bg-zinc-900/90 text-black dark:text-white border border-gray-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-base"
          />
        </View>

        <View className="mb-8 relative justify-center">
          <View className="absolute left-4 z-10">
            <Feather name="lock" size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
          </View>
          <TextInput
            value={senha}
            onChangeText={setSenha}
            placeholder="Senha"
            placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
            secureTextEntry={!mostrarSenha}
            className="w-full bg-white/90 dark:bg-zinc-900/90 text-black dark:text-white border border-gray-200 dark:border-zinc-800 rounded-2xl pl-12 pr-12 py-4 text-base"
          />
          <TouchableOpacity
            className="absolute right-4 z-10 p-2"
            onPress={() => setMostrarSenha(!mostrarSenha)}
          >
            <Feather name={mostrarSenha ? "eye-off" : "eye"} size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={isLoading}
          className={`w-full py-4 rounded-2xl items-center mb-8 ${isLoading ? 'bg-gray-300 dark:bg-zinc-700' : 'bg-[#5BE096]'}`}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text className="text-black font-bold text-lg">Entrar</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row items-center mb-8">
          <View className="flex-1 h-[1px] bg-gray-300 dark:bg-zinc-800" />
          <Text className="text-gray-500 dark:text-gray-400 text-xs px-4">ou continue com</Text>
          <View className="flex-1 h-[1px] bg-gray-300 dark:bg-zinc-800" />
        </View>

        <TouchableOpacity
          className="w-full py-4 mb-4 bg-transparent border border-[#5BE096] rounded-2xl flex-row justify-center items-center bg-white/50 dark:bg-black/50"
          activeOpacity={0.7}
        >
          <FontAwesome name="google" size={18} color="#5BE096" className="mr-3" />
          <Text className="text-[#5BE096] font-semibold ml-2">Continuar com Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full py-4 mb-8 bg-transparent border border-[#5BE096] rounded-2xl flex-row justify-center items-center bg-white/50 dark:bg-black/50"
          activeOpacity={0.7}
        >
          <FontAwesome name="facebook" size={18} color="#5BE096" className="mr-3" />
          <Text className="text-[#5BE096] font-semibold ml-2">Continuar com Facebook</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/cadastro')}
          className="py-2 items-center"
        >
          <Text className="text-gray-600 dark:text-gray-400">
            Não tem conta? <Text className="text-[#5BE096] font-bold">Criar conta</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </BackgroundWrapper>
  );
}