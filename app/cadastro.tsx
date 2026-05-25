import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

export default function CadastroScreen() {
  const insets = useSafeAreaInsets();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCadastro = async () => {
    if (!nome || !email || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    setIsLoading(true);

    try {
      
      const resposta = await axios.post('http://192.168.0.101:8080/usuarios/cadastrar', {
        nome: nome,
        email: email,
        senha: senha
      });

      if (resposta.status === 200 || resposta.status === 201) {
        Alert.alert('Sucesso', 'Conta criada com sucesso! Faça seu login.');
        // Volta pra tela de Login
        router.back();
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar a conta. Tente outro e-mail.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-black px-6" style={{ paddingTop: insets.top + 20 }}>
      <TouchableOpacity
        onPress={() => router.back()}
        className="p-2 -ml-2 mb-6 rounded-full w-12 h-12 items-center justify-center bg-zinc-900"
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <Text className="text-3xl font-bold text-white mb-2">Criar Conta</Text>
      <Text className="text-gray-400 text-base mb-8">Preencha seus dados para começar</Text>

      <View className="mb-4">
        <Text className="text-sm text-gray-400 mb-2">Nome Completo</Text>
        <TextInput
          value={nome}
          onChangeText={setNome}
          placeholder="Ex: João da Silva"
          placeholderTextColor="#4b5563"
          className="w-full bg-zinc-900 text-white rounded-xl px-4 py-4 text-sm"
        />
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

      <View className="mb-8">
        <Text className="text-sm text-gray-400 mb-2">Senha</Text>
        <TextInput
          value={senha}
          onChangeText={setSenha}
          placeholder="Crie uma senha forte"
          placeholderTextColor="#4b5563"
          secureTextEntry
          className="w-full bg-zinc-900 text-white rounded-xl px-4 py-4 text-sm"
        />
      </View>

      <TouchableOpacity
        onPress={handleCadastro}
        disabled={isLoading}
        className={`w-full py-4 rounded-xl items-center ${isLoading ? 'bg-gray-500' : 'bg-[#5BE096]'}`}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text className="text-black font-bold text-lg">Cadastrar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}