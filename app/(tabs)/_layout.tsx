import { Tabs } from 'expo-router';
import { useCallback, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTema } from '../../hooks/useTema';
import { AppText } from '../../components/ui/AppText';
import { dimensao, espaco, interacao, raio, tipografia } from '../../theme/design';

function TabIcon({ name, focused }: { name: keyof typeof Feather.glyphMap; focused: boolean }) {
  const { cores } = useTema();
  return <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ alignItems: 'center', justifyContent: 'center', gap: espaco.minimo, height: dimensao.icone + espaco.pequeno }}>
    <View style={{ height: espaco.minimo, width: espaco.amplo, borderRadius: raio.circular, backgroundColor: focused ? cores.destaque : cores.transparente }} />
    <Feather name={name} size={dimensao.icone} color={focused ? cores.destaque : cores.navegacaoInativa} />
  </View>;
}

export default function TabLayout() {
  const { cores } = useTema();
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  const [medidas, setMedidas] = useState<Record<string, number>>({});
  const medirRotulo = useCallback((nome: string, altura: number) => {
    const arredondada = Math.ceil(altura);
    setMedidas(atuais => {
      if (atuais[nome] === arredondada) return atuais;
      return { ...atuais, [nome]: arredondada };
    });
  }, []);
  const alturaRotulo = Math.max(tipografia.legenda.lineHeight * fontScale, ...Object.values(medidas));
  const altura = Math.max(dimensao.aba, dimensao.icone + espaco.pequeno + alturaRotulo + espaco.medio);
  return <Tabs screenOptions={{
    headerShown: false, tabBarActiveTintColor: cores.destaque, tabBarInactiveTintColor: cores.navegacaoInativa,
    tabBarHideOnKeyboard: true, tabBarLabelPosition: 'below-icon',
    tabBarIconStyle: { height: dimensao.icone + espaco.pequeno, width: dimensao.toque },
    tabBarStyle: { backgroundColor: cores.superficie, borderTopColor: cores.bordaNavegacao, borderTopWidth: interacao.borda,
      height: Math.ceil(altura) + insets.bottom,
      paddingBottom: insets.bottom, paddingTop: 0 },
    tabBarLabel: ({ children, color }) => <AppText variant="legenda" onLayout={evento => medirRotulo(children, evento.nativeEvent.layout.height)}
      style={{ color, fontWeight: '600', textAlign: 'center', flexShrink: 0, maxWidth: '100%' }}>{children}</AppText>,
  }}>
    <Tabs.Screen name="vendas" options={{ title: 'Estoque', tabBarAccessibilityLabel: 'Estoque', tabBarIcon: ({ focused }) => <TabIcon name="bar-chart-2" focused={focused} /> }} />
    <Tabs.Screen name="configuracoes" options={{ title: 'Configurações', tabBarAccessibilityLabel: 'Configurações', tabBarIcon: ({ focused }) => <TabIcon name="settings" focused={focused} /> }} />
    <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarAccessibilityLabel: 'Perfil', tabBarIcon: ({ focused }) => <TabIcon name="user" focused={focused} /> }} />
    <Tabs.Screen name="pedidos" options={{ href: null, title: 'Meus Pedidos', tabBarIcon: ({ focused }) => <TabIcon name="shopping-bag" focused={focused} /> }} />
  </Tabs>;
}
