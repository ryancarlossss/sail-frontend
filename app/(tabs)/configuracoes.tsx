import { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Switch, ListItem, ToggleItem } from "@/components/ui/ListItem";

export default function ConfiguracoesScreen() {
  const insets = useSafeAreaInsets();
  const [darkMode, setDarkMode] = useState(true);
  const [novosPedidos, setNovosPedidos] = useState(true);
  const [estoqueBaixo, setEstoqueBaixo] = useState(true);
  const [mensagensClientes, setMensagensClientes] = useState(false);
  const [resumoDiario, setResumoDiario] = useState(true);
  const [fontSize, setFontSize] = useState(1);

  return (
    <View className="flex-1 bg-[#09090b]">
      {/* Header */}
      <View style={{ paddingTop: insets.top }} className="bg-[#09090b] border-b border-zinc-800">
        <View className="flex-row items-center px-4 py-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 -ml-2 rounded-full"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-lg font-semibold text-white pr-8">
            Configuracoes
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {/* Aparencia e Acessibilidade */}
        <Section title="Aparencia e Acessibilidade">
          <View className="bg-surface-light rounded-xl overflow-hidden divide-y divide-zinc-800">
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-3">
                <Ionicons name={darkMode ? "moon" : "sunny"} size={20} color="#5BE096" />
                <Text className="text-white">Tema do Aplicativo</Text>
              </View>
              <Switch enabled={darkMode} onToggle={() => setDarkMode(!darkMode)} />
            </View>

            <View className="p-4">
              <View className="flex-row items-center gap-3 mb-3">
                <Ionicons name="text" size={20} color="#5BE096" />
                <Text className="text-white">Tamanho do Texto</Text>
              </View>
              <View className="flex-row items-center justify-center gap-2">
                {[0, 1, 2].map((size) => (
                  <TouchableOpacity
                    key={size}
                    onPress={() => setFontSize(size)}
                    className={`px-4 py-2 rounded-lg ${
                      fontSize === size ? "bg-primary" : "bg-zinc-800"
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`font-medium ${
                        fontSize === size ? "text-primary-dark" : "text-gray-400"
                      } ${size === 0 ? "text-sm" : size === 2 ? "text-lg" : "text-base"}`}
                    >
                      A{size === 0 ? "-" : size === 2 ? "+" : ""}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <ListItem
              icon="language"
              label="Fonte do Sistema"
              rightElement={
                <View className="bg-zinc-800 px-3 py-2 rounded-lg">
                  <Text className="text-white text-sm">Padrao</Text>
                </View>
              }
              showChevron={false}
            />
          </View>
        </Section>

        {/* Gerenciamento da Loja */}
        <Section title="Gerenciamento da Loja">
          <View className="bg-surface-light rounded-xl overflow-hidden divide-y divide-zinc-800">
            <ListItem icon="business" label="Informacoes do Negocio" subtitle="CNPJ, Nome da Loja, Endereco" />
            <ListItem icon="card" label="Metodos de Pagamento" subtitle="PIX, Cartao, Maquininha" />
            <ListItem icon="receipt" label="Taxas e Impostos" subtitle="Configurar tributacao" />
            <ListItem icon="car" label="Opcoes de Frete/Entrega" subtitle="Taxas e integracoes" />
          </View>
        </Section>

        {/* Notificacoes */}
        <Section title="Notificacoes">
          <View className="bg-surface-light rounded-xl overflow-hidden divide-y divide-zinc-800">
            <ToggleItem
              icon="notifications"
              label="Novos Pedidos"
              enabled={novosPedidos}
              onToggle={() => setNovosPedidos(!novosPedidos)}
            />
            <ToggleItem
              icon="cube"
              label="Estoque Baixo"
              enabled={estoqueBaixo}
              onToggle={() => setEstoqueBaixo(!estoqueBaixo)}
            />
            <ToggleItem
              icon="chatbubble"
              label="Mensagens de Clientes"
              enabled={mensagensClientes}
              onToggle={() => setMensagensClientes(!mensagensClientes)}
            />
            <ToggleItem
              icon="bar-chart"
              label="Resumo de Vendas Diario"
              enabled={resumoDiario}
              onToggle={() => setResumoDiario(!resumoDiario)}
            />
          </View>
        </Section>

        {/* Conta e Seguranca */}
        <Section title="Conta e Seguranca">
          <View className="bg-surface-light rounded-xl overflow-hidden divide-y divide-zinc-800">
            <ListItem icon="lock-closed" label="Alterar Senha" />
            <ListItem icon="shield-checkmark" label="Autenticacao em Dois Fatores (2FA)" />
            <ListItem icon="phone-portrait" label="Gerenciar Dispositivos Conectados" />
          </View>
        </Section>

        {/* Suporte e Sobre */}
        <Section title="Suporte e Sobre">
          <View className="bg-surface-light rounded-xl overflow-hidden divide-y divide-zinc-800">
            <ListItem icon="help-circle" label="Central de Ajuda / FAQ" />
            <ListItem icon="chatbubbles" label="Falar com o Suporte" subtitle="WhatsApp" />
            <ListItem icon="document-text" label="Termos de Uso e Privacidade" />
            <View className="p-4 flex-row items-center justify-between">
              <Text className="text-gray-500 text-sm">Versao do App</Text>
              <Text className="text-gray-600 text-sm">v1.0.4</Text>
            </View>
          </View>
        </Section>

        {}
        <Section title="Zona de Perigo" titleColor="text-red-500/70">
          <View className="bg-surface-light rounded-xl overflow-hidden divide-y divide-zinc-800">
            <TouchableOpacity className="flex-row items-center gap-3 p-4" activeOpacity={0.7}>
              <Ionicons name="log-out" size={20} color="#ef4444" />
              <Text className="text-red-500 font-medium">Sair da Conta</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center gap-3 p-4" activeOpacity={0.7}>
              <Ionicons name="trash" size={20} color="#f87171" />
              <Text className="text-red-400/70 text-sm">Excluir Conta</Text>
            </TouchableOpacity>
          </View>
        </Section>

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}

function Section({
  title,
  titleColor = "text-gray-500",
  children,
}: {
  title: string;
  titleColor?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-6">
      <Text className={`text-xs font-medium uppercase tracking-wider mb-3 px-1 ${titleColor}`}>
        {title}
      </Text>
      {children}
    </View>
  );
}
