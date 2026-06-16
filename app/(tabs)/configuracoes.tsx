import React, { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, Switch, Image } from "react-native";
import { router } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import BackgroundWrapper from "../../components/BackgroundWrapper";

export default function ConfiguracoesScreen() {
  const insets = useSafeAreaInsets();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [novosPedidos, setNovosPedidos] = useState(true);
  const [estoqueBaixo, setEstoqueBaixo] = useState(true);
  const [mensagensClientes, setMensagensClientes] = useState(false);
  const [resumoDiario, setResumoDiario] = useState(true);
  const [fontSize, setFontSize] = useState(1);

  const primaryColor = isDark ? "#5BE096" : "#2E8B57";
  const iconColor = isDark ? "#5BE096" : "#2E8B57";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const subtextColor = isDark ? "text-gray-400" : "text-gray-500";
  const cardBg = isDark ? "bg-zinc-900/90" : "bg-white/90";
  const divider = isDark ? "border-zinc-800" : "border-gray-100";
  const btnBg = isDark ? "bg-zinc-900" : "bg-gray-100";

  const renderItem = (icon: any, title: string, subtitle?: string, rightElement?: React.ReactNode, isDanger?: boolean, onPress?: () => void) => (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      className={`flex-row items-center justify-between p-4 border-b ${divider}`}
    >
      <View className="flex-row items-center gap-3 flex-1">
        <Ionicons name={icon} size={22} color={isDanger ? "#ef4444" : iconColor} />
        <View className="flex-1">
          <Text className={`${isDanger ? "text-red-500 font-medium" : textColor} text-base`}>{title}</Text>
          {subtitle && <Text className={`${subtextColor} text-xs mt-0.5`}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement ? rightElement : !isDanger && <Feather name="chevron-right" size={20} color={isDark ? "#52525b" : "#d1d5db"} />}
    </TouchableOpacity>
  );

  const renderToggle = (icon: any, title: string, subtitle: string, value: boolean, onValueChange: () => void) => (
    <View className={`flex-row items-center justify-between p-4 border-b ${divider}`}>
      <View className="flex-row items-center gap-3 flex-1">
        <Ionicons name={icon} size={22} color={iconColor} />
        <View className="flex-1 pr-4">
          <Text className={`${textColor} text-base`}>{title}</Text>
          <Text className={`${subtextColor} text-xs mt-0.5`}>{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: isDark ? "#3f3f46" : "#e5e7eb", true: primaryColor }}
        thumbColor="#ffffff"
      />
    </View>
  );

  return (
    <BackgroundWrapper>
      <View className="flex-1">
        <View style={{ paddingTop: insets.top }} className="px-4 pb-2 pt-4">
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800"
            >
              <Feather name="arrow-left" size={20} color="#fff" />
            </TouchableOpacity>

            <Image
              source={require('../../assets/images/logo.png')}
              style={{ width: 45, height: 45 }}
              resizeMode="contain"
            />

            <View className="flex-row gap-2">
              <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800">
                <Feather name="eye" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800">
                <Feather name="settings" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-xl relative bg-zinc-900 border border-zinc-800">
                <Feather name="bell" size={18} color="#fff" />
                <View className="absolute top-2 right-2 w-2 h-2 bg-[#5BE096] rounded-full" />
              </TouchableOpacity>
            </View>
          </View>

          {}
          <View className="items-center mb-2">
            <Text className={`text-3xl font-bold ${isDark ? "text-[#5BE096]" : "text-[#2E8B57]"}`}>Configurações</Text>
            <Text className={`${subtextColor} text-sm mt-1 text-center`}>Gerencie notificações, segurança e preferências do app</Text>
          </View>
        </View>

        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>

          <View className="mt-6 mb-6">
            <Text className={`text-xs font-bold uppercase tracking-wider mb-3 px-1 ${isDark ? "text-green-500" : "text-green-700"}`}>Aparência e Acessibilidade</Text>
            <View className={`${cardBg} rounded-2xl overflow-hidden border ${divider}`}>
              {renderToggle(
                isDark ? "moon" : "sunny",
                "Tema do Aplicativo",
                isDark ? "Você está no modo escuro" : "Você está no modo claro",
                isDark,
                toggleColorScheme
              )}

              <View className={`p-4 border-b ${divider}`}>
                <View className="flex-row items-center gap-3 mb-4">
                  <Ionicons name="text" size={22} color={iconColor} />
                  <View>
                    <Text className={`${textColor} text-base`}>Tamanho do Texto</Text>
                    <Text className={`${subtextColor} text-xs mt-0.5`}>Ajuste o tamanho do texto do aplicativo</Text>
                  </View>
                </View>
                <View className="flex-row items-center gap-2">
                  {[0, 1, 2].map((size) => (
                    <TouchableOpacity
                      key={size}
                      onPress={() => setFontSize(size)}
                      className={`flex-1 py-3 rounded-xl border ${fontSize === size ? `border-[${primaryColor}]` : divider} ${fontSize === size ? (isDark ? 'bg-zinc-800' : 'bg-green-50/50') : btnBg} items-center`}
                      activeOpacity={0.7}
                    >
                      <Text className={`font-bold ${fontSize === size ? (isDark ? "text-[#5BE096]" : "text-[#2E8B57]") : subtextColor} ${size === 0 ? "text-sm" : size === 2 ? "text-lg" : "text-base"}`}>
                        A{size === 0 ? "-" : size === 2 ? "+" : ""}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {renderItem("language", "Fonte do Sistema", "Define a fonte padrão do aplicativo",
                <View className={`px-3 py-1.5 rounded-lg flex-row items-center ${isDark ? "bg-zinc-800" : "bg-gray-100"}`}>
                  <Text className={`${subtextColor} text-sm mr-2`}>Padrão</Text>
                  <Feather name="chevron-right" size={14} color={isDark ? "#9ca3af" : "#6b7280"} />
                </View>
              )}
            </View>
          </View>

          <View className="mb-6">
            <Text className={`text-xs font-bold uppercase tracking-wider mb-3 px-1 ${isDark ? "text-green-500" : "text-green-700"}`}>Gerenciamento da Loja</Text>
            <View className={`${cardBg} rounded-2xl overflow-hidden border ${divider}`}>
              {renderItem("business", "Informações do Negócio", "CNPJ, Nome da Loja, Endereço")}
              {renderItem("card", "Métodos de Pagamento", "PIX, Cartão, Maquininha")}
              {renderItem("receipt", "Taxas e Impostos", "Configurar tributação")}
              {renderItem("car", "Opções de Frete/Entrega", "Taxas e integrações")}
            </View>
          </View>

          <View className="mb-6">
            <Text className={`text-xs font-bold uppercase tracking-wider mb-3 px-1 ${isDark ? "text-green-500" : "text-green-700"}`}>Notificações</Text>
            <View className={`${cardBg} rounded-2xl overflow-hidden border ${divider}`}>
              {renderToggle("notifications", "Novos Pedidos", "Receba notificações de novos pedidos", novosPedidos, () => setNovosPedidos(!novosPedidos))}
              {renderToggle("cube", "Estoque Baixo", "Seja avisado quando o estoque estiver baixo", estoqueBaixo, () => setEstoqueBaixo(!estoqueBaixo))}
              {renderToggle("chatbubble", "Mensagens de Clientes", "Receba mensagens e interações de clientes", mensagensClientes, () => setMensagensClientes(!mensagensClientes))}
              {renderToggle("bar-chart", "Resumo de Vendas Diário", "Receba o resumo diário de vendas", resumoDiario, () => setResumoDiario(!resumoDiario))}
            </View>
          </View>

          <View className="mb-6">
            <Text className={`text-xs font-bold uppercase tracking-wider mb-3 px-1 ${isDark ? "text-green-500" : "text-green-700"}`}>Conta e Segurança</Text>
            <View className={`${cardBg} rounded-2xl overflow-hidden border ${divider}`}>
              {renderItem("lock-closed", "Alterar Senha", "Mantenha sua conta segura")}
              {renderItem("shield-checkmark", "Autenticação em Dois Fatores (2FA)", "Mais segurança para sua conta")}
              {renderItem("phone-portrait", "Gerenciar Dispositivos Conectados", "Veja e gerencie dispositivos conectados")}
            </View>
          </View>

          <View className="mb-6">
            <Text className={`text-xs font-bold uppercase tracking-wider mb-3 px-1 ${isDark ? "text-green-500" : "text-green-700"}`}>Suporte e Sobre</Text>
            <View className={`${cardBg} rounded-2xl overflow-hidden border ${divider}`}>
              {renderItem("help-circle", "Central de Ajuda / FAQ", "Tire suas dúvidas")}
              {renderItem("logo-whatsapp", "Falar com o Suporte", "Converse com nossa equipe via WhatsApp")}
              {renderItem("document-text", "Termos de Uso e Privacidade", "Leia nossos termos e políticas")}
              <View className={`p-4 flex-row items-center justify-between border-b ${divider}`}>
                <Text className={`${subtextColor} text-sm`}>Versão do App</Text>
                <Text className={`${subtextColor} text-sm`}>v1.0.4</Text>
              </View>
            </View>
          </View>

          <View className="mb-8">
            <Text className="text-xs font-bold uppercase tracking-wider mb-3 px-1 text-red-500/80">Zona de Perigo</Text>
            <View className={`${cardBg} rounded-2xl overflow-hidden border ${divider}`}>
              {renderItem("log-out", "Sair da Conta", undefined, undefined, true)}
              {renderItem("trash", "Excluir Conta", undefined, undefined, true)}
            </View>
          </View>

          <View className="h-10" />
        </ScrollView>
      </View>
    </BackgroundWrapper>
  );
}