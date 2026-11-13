import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import BackgroundWrapper from '../components/BackgroundWrapper';
import { cliente } from '../lib/api';
import { usuariosService } from '../services';
import { useEnvio } from '../hooks/useEnvio';
import { validarEmail } from '../lib/validacao';
import { foiCancelado, mensagemErro } from '../lib/erros';
import Feedback from '../components/Feedback';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const { enviando: isLoading, executar, estaAtivo } = useEnvio();
  const [erro, setErro] = useState<string | null>(cliente.obterAvisoSessao());

  const handleLogin = async () => {
    setErro(null);
    if (!validarEmail(email) || !senha.trim() || senha.length > 255) {
      setErro('Informe um e-mail válido e sua senha.');
      return;
    }
    try {
      const resposta = await executar(signal => usuariosService.entrar({ email: email.trim(), senha }, signal));
      if (resposta && estaAtivo()) cliente.definirSessao(resposta);
    } catch (falha) {
      if (estaAtivo() && !foiCancelado(falha)) setErro(mensagemErro(falha, 'login'));
    }
  };

  return (
    <BackgroundWrapper>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingTop: insets.top, paddingBottom: insets.bottom + 24 }}>
        <View className="items-center mb-10 mt-4">
          <Image source={require('../assets/images/logo-completa.png')} style={{ width: 220, height: 100 }} resizeMode="contain" className="mb-2" />
          <Text className="text-2xl font-bold text-black dark:text-white mb-1">Bem-vindo ao Sail</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">Seu auxiliar inteligente de vendas</Text>
        </View>

        <Feedback mensagem={erro} />
        <View className="mb-4 relative justify-center">
          <View className="absolute left-4 z-10">
            <Feather name="mail" size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
          </View>
          <TextInput editable={!isLoading} value={email} onChangeText={setEmail} placeholder="E-mail" placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"} keyboardType="email-address" autoCapitalize="none" className="w-full bg-white/90 dark:bg-zinc-900/90 text-black dark:text-white border border-gray-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-base" />
        </View>

        <View className="mb-8 relative justify-center">
          <View className="absolute left-4 z-10">
            <Feather name="lock" size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
          </View>
          <TextInput editable={!isLoading} value={senha} onChangeText={setSenha} placeholder="Senha" placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"} secureTextEntry={!mostrarSenha} className="w-full bg-white/90 dark:bg-zinc-900/90 text-black dark:text-white border border-gray-200 dark:border-zinc-800 rounded-2xl pl-12 pr-12 py-4 text-base" />
          <TouchableOpacity className="absolute right-4 z-10 p-2" onPress={() => setMostrarSenha(!mostrarSenha)}>
            <Feather name={mostrarSenha ? "eye-off" : "eye"} size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleLogin} disabled={isLoading} className={`w-full py-4 rounded-2xl items-center mb-8 ${isLoading ? 'bg-gray-300 dark:bg-zinc-700' : 'bg-[#5BE096]'}`} activeOpacity={0.8}>
          {isLoading ? <ActivityIndicator color="#000000" /> : <Text className="text-black font-bold text-lg">Entrar</Text>}
        </TouchableOpacity>

        <View className="flex-row items-center mb-8">
          <View className="flex-1 h-[1px] bg-gray-300 dark:bg-zinc-800" />
          <Text className="text-gray-500 dark:text-gray-400 text-xs px-4">ou continue com</Text>
          <View className="flex-1 h-[1px] bg-gray-300 dark:bg-zinc-800" />
        </View>

        <TouchableOpacity className="w-full py-4 mb-4 bg-transparent border border-[#5BE096] rounded-2xl flex-row justify-center items-center bg-white/50 dark:bg-black/50" activeOpacity={0.7}>
          <FontAwesome name="google" size={18} color="#5BE096" className="mr-3" />
          <Text className="text-[#5BE096] font-semibold ml-2">Continuar com Google</Text>
        </TouchableOpacity>

        <TouchableOpacity className="w-full py-4 mb-8 bg-transparent border border-[#5BE096] rounded-2xl flex-row justify-center items-center bg-white/50 dark:bg-black/50" activeOpacity={0.7}>
          <FontAwesome name="facebook" size={18} color="#5BE096" className="mr-3" />
          <Text className="text-[#5BE096] font-semibold ml-2">Continuar com Facebook</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/cadastro')} className="py-2 items-center">
          <Text className="text-gray-600 dark:text-gray-400">Não tem conta? <Text className="text-[#5BE096] font-bold">Criar conta</Text></Text>
        </TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>
    </BackgroundWrapper>
  );
}
