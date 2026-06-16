import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import BackgroundWrapper from '../../components/BackgroundWrapper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const cardBg = isDark ? "bg-[#121212]/90" : "bg-white/90";
  const borderColor = isDark ? "border-zinc-800" : "border-gray-200";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const subtextColor = isDark ? "text-gray-400" : "text-gray-500";

  const handleSair = async () => {
    await AsyncStorage.removeItem('usuarioId');
    router.replace('/');
  };

  const acoes = [
    { id: 1, icon: 'user', title: 'Editar Perfil', subtitle: 'Dados pessoais da conta' },
    { id: 2, icon: 'key', title: 'Alterar Senha', subtitle: 'Segurança de acesso' },
    { id: 3, icon: 'settings', title: 'Preferências', subtitle: 'Tema, idioma e exibição' },
  ];

  return (
    <BackgroundWrapper>
      <View className="flex-1">
        <ScrollView contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: 40 }} className="px-4" showsVerticalScrollIndicator={false}>
          
          <View className={`p-4 rounded-[28px] ${cardBg} border ${borderColor} mb-4 flex-row items-center mt-10`}>
            <View className="w-[72px] h-[72px] rounded-full border border-[#5BE096]/50 items-center justify-center bg-zinc-900 mr-4">
              <Feather name="user" size={32} color="#5BE096" />
            </View>
            <View className="flex-1 justify-center">
              <Text className={`text-2xl font-bold ${textColor} mb-0.5`}>Admin User</Text>
              <Text className={`${subtextColor} text-sm mb-2`}>admin@sail.com</Text>
              <View className="bg-[#5BE096]/10 px-2.5 py-1 rounded-md self-start">
                <Text className="text-[#5BE096] text-[10px] font-bold">Administrador</Text>
              </View>
            </View>
          </View>

          <View className={`py-5 px-2 rounded-[28px] ${cardBg} border ${borderColor} mb-8 flex-row justify-between`}>
            <View className={`items-center flex-1 border-r ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
              <Text className={`${textColor} text-xl font-bold mb-1`}>42</Text>
              <Text className={`${subtextColor} text-xs`}>Produtos</Text>
            </View>
            <View className={`items-center flex-1 border-r ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
              <Text className={`${textColor} text-xl font-bold mb-1`}>8</Text>
              <Text className={`${subtextColor} text-xs`}>Categorias</Text>
            </View>
            <View className="items-center flex-1">
              <Text className={`${textColor} text-sm font-bold mb-1 mt-1`}>R$ 15,2k</Text>
              <Text className={`${subtextColor} text-xs`}>Valor em Estoque</Text>
            </View>
          </View>

          <View className="mb-8 mt-4">
            <Text className="text-[#5BE096] text-xs font-bold uppercase tracking-wider mb-3 px-1">Ações da Conta</Text>
            <View className={`${cardBg} rounded-[28px] border ${borderColor} overflow-hidden`}>
              {acoes.map((item) => (
                <TouchableOpacity key={item.id} className="flex-row items-center justify-between p-4 border-b border-zinc-800" activeOpacity={0.7}>
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full items-center justify-center bg-[#5BE096]/10 mr-4">
                      <Feather name={item.icon as any} size={18} color="#5BE096" />
                    </View>
                    <View>
                      <Text className={`${textColor} text-sm font-medium`}>{item.title}</Text>
                      <Text className={`${subtextColor} text-xs`}>{item.subtitle}</Text>
                    </View>
                  </View>
                  <Feather name="chevron-right" size={18} color="#5BE096" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity onPress={handleSair} className={`w-full py-4 rounded-2xl flex-row justify-center items-center ${isDark ? 'bg-[#121212]/90' : 'bg-white/90'} border border-red-500/40`}>
            <Feather name="log-out" size={18} color="#EF4444" className="mr-2" />
            <Text className="text-red-500 font-medium text-base">Sair da Conta</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </BackgroundWrapper>
  );
}