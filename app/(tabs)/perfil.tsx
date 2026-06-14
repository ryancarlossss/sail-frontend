import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import BackgroundWrapper from '../../components/BackgroundWrapper';

export default function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const primaryColor = isDark ? "#5BE096" : "#2E8B57";
  const cardBg = isDark ? "bg-[#121212]/90" : "bg-white/90";
  const borderColor = isDark ? "border-zinc-800" : "border-gray-200";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const subtextColor = isDark ? "text-gray-400" : "text-gray-500";

  const atividades = [
    { id: 1, icon: 'package', title: 'Produto "Copo Ecológico" cadastrado', time: 'há 15 minutos' },
    { id: 2, icon: 'box', title: 'Estoque atualizado', time: 'há 1 hora' },
    { id: 3, icon: 'folder-plus', title: 'Categoria "Materiais Recicláveis" criada', time: 'há 3 horas' },
    { id: 4, icon: 'edit-2', title: 'Produto "Sacola Sustentável" editado', time: 'ontem' },
  ];

  const acoes = [
    { id: 1, icon: 'user', title: 'Editar Perfil', subtitle: 'Dados pessoais da conta' },
    { id: 2, icon: 'key', title: 'Alterar Senha', subtitle: 'Segurança de acesso' },
    { id: 3, icon: 'settings', title: 'Preferências', subtitle: 'Tema, idioma e exibição' },
    { id: 4, icon: 'bell', title: 'Notificações', subtitle: 'Alertas do sistema' },
    { id: 5, icon: 'shield', title: 'Privacidade', subtitle: 'Controle de dados' },
    { id: 6, icon: 'help-circle', title: 'Ajuda e Suporte', subtitle: 'Central de atendimento' },
  ];

  const handleSair = () => {
    router.replace('/');
  };

  return (
    <BackgroundWrapper>
      <View className="flex-1">
        <ScrollView
          contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: 40 }}
          className="px-4"
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER PADRONIZADO */}
          <View className="flex-row items-center justify-between mb-8 mt-2">
            <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800">
              <Feather name="arrow-left" size={20} color="#fff" />
            </TouchableOpacity>

            <Image
              source={require('../../assets/images/logo.png')}
              style={{ width: 45, height: 45 }}
              resizeMode="contain"
            />

            <View className="flex-row gap-2">
              <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800">
                <Feather name="settings" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-xl relative bg-zinc-900 border border-zinc-800">
                <Feather name="bell" size={18} color="#fff" />
                <View className="absolute top-2 right-2 w-2 h-2 bg-[#5BE096] rounded-full" />
              </TouchableOpacity>
            </View>
          </View>

          {/* CARD DO USUÁRIO */}
          <View className={`p-4 rounded-[28px] ${cardBg} border ${borderColor} mb-4 flex-row items-center`}>
            <View className="w-[72px] h-[72px] rounded-full border border-[#5BE096]/50 items-center justify-center bg-zinc-900 mr-4">
              <Feather name="user" size={32} color="#5BE096" />
            </View>
            <View className="flex-1 justify-center">
              <Text className={`text-2xl font-bold ${textColor} mb-0.5`}>Usuário</Text>
              <Text className={`${subtextColor} text-sm mb-2`}>usuario@sail.com</Text>
              <View className="flex-row gap-2">
                <View className="bg-[#5BE096]/10 px-2.5 py-1 rounded-md">
                  <Text className="text-[#5BE096] text-[10px] font-bold">Administrador</Text>
                </View>
                <View className={`${isDark ? 'bg-zinc-800' : 'bg-gray-100'} px-2.5 py-1 rounded-md`}>
                  <Text className={`${subtextColor} text-[10px] font-bold`}>Eco Solutions LTDA</Text>
                </View>
              </View>
            </View>
          </View>

          {/* ESTATÍSTICAS */}
          <View className={`py-5 px-2 rounded-[28px] ${cardBg} border ${borderColor} mb-8 flex-row justify-between`}>
            <View className={`items-center flex-1 border-r ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
              <Text className={`${textColor} text-xl font-bold mb-1`}>128</Text>
              <Text className={`${subtextColor} text-xs`}>Produtos</Text>
            </View>
            <View className={`items-center flex-1 border-r ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
              <Text className={`${textColor} text-xl font-bold mb-1`}>14</Text>
              <Text className={`${subtextColor} text-xs`}>Categorias</Text>
            </View>
            <View className="items-center flex-1">
              <Text className={`${textColor} text-xl font-bold mb-1`}>R$ 25,9k</Text>
              <Text className={`${subtextColor} text-xs`}>Valor Total</Text>
            </View>
          </View>

          {/* ATIVIDADE RECENTE */}
          <View className="mb-8">
            <Text className="text-[#5BE096] text-xs font-bold uppercase tracking-wider mb-3 px-1">Atividade Recente</Text>
            <View className={`${cardBg} rounded-[28px] border ${borderColor} p-5`}>
              {atividades.map((item, index) => (
                <View key={item.id} className={`flex-row items-start ${index !== atividades.length - 1 ? 'mb-5' : ''}`}>
                  <View className="w-8 h-8 rounded-full border border-[#5BE096]/30 items-center justify-center bg-[#5BE096]/10 mr-4">
                    <Feather name={item.icon as any} size={14} color="#5BE096" />
                  </View>
                  <View className="flex-1">
                    <Text className={`${textColor} text-sm font-medium mb-1`}>{item.title}</Text>
                    <View className="flex-row items-center">
                      <Feather name="clock" size={10} color={isDark ? "#9CA3AF" : "#6B7280"} />
                      <Text className={`${subtextColor} text-xs ml-1.5`}>{item.time}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* AÇÕES DA CONTA */}
          <View className="mb-8">
            <Text className="text-[#5BE096] text-xs font-bold uppercase tracking-wider mb-3 px-1">Ações da Conta</Text>
            <View className={`${cardBg} rounded-[28px] border ${borderColor} overflow-hidden`}>
              {acoes.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  className={`flex-row items-center justify-between p-4 ${index !== acoes.length - 1 ? `border-b ${borderColor}` : ''}`}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full items-center justify-center bg-[#5BE096]/10 mr-4">
                      <Feather name={item.icon as any} size={18} color="#5BE096" />
                    </View>
                    <View>
                      <Text className={`${textColor} text-sm font-medium mb-0.5`}>{item.title}</Text>
                      <Text className={`${subtextColor} text-xs`}>{item.subtitle}</Text>
                    </View>
                  </View>
                  <Feather name="chevron-right" size={18} color="#5BE096" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* BOTÃO DE SAIR */}
          <TouchableOpacity
            onPress={handleSair}
            activeOpacity={0.7}
            className={`w-full py-4 rounded-2xl flex-row justify-center items-center ${isDark ? 'bg-[#121212]/90' : 'bg-white/90'} border border-red-500/40 mb-2`}
          >
            <Feather name="log-out" size={18} color="#EF4444" className="mr-2" />
            <Text className="text-red-500 font-medium text-base">Sair da Conta</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
    </BackgroundWrapper>
  );
}