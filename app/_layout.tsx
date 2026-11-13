import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useSyncExternalStore } from 'react';
import { useTema } from '../hooks/useTema';
import { cliente } from '../lib/api';
import { PreferenciasProvider } from '../theme/PreferenciasProvider';
import { useMovimentoReduzido } from '../hooks/useMovimentoReduzido';

export default function RootLayout() {
  return <PreferenciasProvider><RootNavigator /></PreferenciasProvider>;
}

function RootNavigator() {
  const sessao = useSyncExternalStore(cliente.assinarSessao, cliente.obterSessao, () => null);
  const { isDark: escuro, cores } = useTema();
  const movimentoReduzido = useMovimentoReduzido();
  useEffect(() => {
    if (!sessao) return;
    const timer = setTimeout(() => cliente.encerrarSessao('Sua sessão expirou. Entre novamente.'), Math.max(0, Date.parse(sessao.expiraEm) - Date.now()));
    return () => clearTimeout(timer);
  }, [sessao]);
  return (
    <>
      <StatusBar style={escuro ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: cores.fundo },
          animation: movimentoReduzido ? 'none' : 'slide_from_right',
        }}
      >
        <Stack.Protected guard={!sessao} redirectTo="/(tabs)/vendas">
          <Stack.Screen name="index" />
          <Stack.Screen name="cadastro" />
        </Stack.Protected>

        <Stack.Protected guard={!!sessao} redirectTo="/">
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="historico" />
        <Stack.Screen
          name="produto/novo"
          options={{
            presentation: "modal",
            animation: movimentoReduzido ? 'none' : 'slide_from_bottom',
          }}
        />
        </Stack.Protected>
      </Stack>
    </>
  );
}
