import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha e-mail e senha.');
      return;
    }

    setIsLoading(true);

    try {
      
      const resposta = await axios.post('http://192.168.0.101:8080/usuarios/login', {
        email: email,
        senha: senha
      });

      if (resposta.status === 200 || resposta.status === 202) {
       
        router.replace('/vendas');
      }
    } catch (error) {
      Alert.alert('Acesso Negado', 'E-mail ou senha incorretos.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-black px-6 justify-center" style={{ paddingTop: insets.top }}>
      <View className="items-center mb-10">
        <Text className="text-5xl font-bold text-[#5BE096] mb-2">Sail.</Text>
        <Text className="text-gray-400 text-base">Gerencie seu estoque na palma da mão</Text>
      </View>

      <View className="mb-4">
        <Text className="text-sm text-gray-400 mb-2">E-mail</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="seu@email.com"
          placeholderTextColor="#4b5563"
          keyboardType="email-address"
          autoCapitalize="none"
          className="w-full bg-zinc-900 text-white rounded-xl px-4 py-4 text-sm"
        />
      </View>

      <View className="mb-6">
        <Text className="text-sm text-gray-400 mb-2">Senha</Text>
        <TextInput
          value={senha}
          onChangeText={setSenha}
          placeholder="********"
          placeholderTextColor="#4b5563"
          secureTextEntry
          className="w-full bg-zinc-900 text-white rounded-xl px-4 py-4 text-sm"
        />
      </View>

      <TouchableOpacity
        onPress={handleLogin}
        disabled={isLoading}
        className={`w-full py-4 rounded-xl items-center mb-4 ${isLoading ? 'bg-gray-500' : 'bg-[#5BE096]'}`}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text className="text-black font-bold text-lg">Entrar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/cadastro')} className="py-2 items-center">
        <Text className="text-gray-400">
          Não tem uma conta? <Text className="text-[#5BE096] font-bold">Cadastre-se</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}