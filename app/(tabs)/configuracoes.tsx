import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { cliente } from '../../lib/api';
import { rotulosTema } from '../../lib/preferencias';
import { useLayoutTela } from '../../hooks/useLayoutTela';
import { usePreferenciasInterface } from '../../theme/PreferenciasProvider';
import { espaco } from '../../theme/design';
import ScreenContainer from '../../components/ScreenContainer';
import AppHeader from '../../components/AppHeader';
import { PreferenciasSheet } from '../../components/PreferenciasSheet';
import { AlertasEstoqueSheet } from '../../components/AlertasEstoqueSheet';
import { ContaSheet } from '../../components/perfil/ContaSheet';
import { AppText } from '../../components/ui/AppText';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { SettingsRow } from '../../components/ui/SettingsRow';

const indisponiveis = [
  { icon: 'briefcase', title: 'Gestão da loja', subtitle: 'Dados do negócio, pagamentos, taxas e entrega.' },
  { icon: 'bell', title: 'Notificações push', subtitle: 'Pedidos, estoque baixo, mensagens e resumo diário.' },
  { icon: 'shield', title: 'Segurança adicional', subtitle: 'Autenticação em dois fatores e dispositivos conectados.' },
  { icon: 'file-text', title: 'Atendimento e documentos', subtitle: 'WhatsApp, termos de uso e política de privacidade.' },
  { icon: 'user-x', title: 'Excluir conta', subtitle: 'Exclusão dos dados da conta.' },
] as const;

export default function ConfiguracoesScreen() {
  const layout = useLayoutTela();
  const { tema } = usePreferenciasInterface();
  const [aparenciaAberta, setAparenciaAberta] = useState(false);
  const [alertasAbertos, setAlertasAbertos] = useState(false);
  const [confirmarSaida, setConfirmarSaida] = useState(false);
  const [mostrarIndisponiveis, setMostrarIndisponiveis] = useState(false);
  const versao = Constants.expoConfig?.version;
  const verSemEstoque = () => {
    setAlertasAbertos(false);
    router.navigate({ pathname: '/vendas', params: { filtro: 'sem-estoque' } });
  };

  return <ScreenContainer testID="configuracoes-tela">
    <ScrollView testID="configuracoes-lista" style={{ flex: 1, minHeight: 0 }} contentContainerStyle={layout.conteudo} showsVerticalScrollIndicator={false}>
      <AppHeader showActions={false} />
      <AppText variant="titulo" accessibilityRole="header">Configurações</AppText>
      <AppText tone="secundario" style={{ marginTop: espaco.minimo, marginBottom: espaco.padrao }}>Exibição e preferências do aplicativo</AppText>
      <SectionHeader title="Exibição" label />
      <Card style={{ marginBottom: espaco.amplo }}>
        <SettingsRow icon="sun" title="Aparência" subtitle={'Tema: ' + rotulosTema[tema]} onPress={() => setAparenciaAberta(true)} />
        <SettingsRow icon="type" title="Tamanho do texto" subtitle="Acompanha a configuração do dispositivo" last />
      </Card>
      <SectionHeader title="Estoque" label />
      <Card style={{ marginBottom: espaco.amplo }}>
        <SettingsRow icon="bell" title="Alertas do estoque" subtitle="Consulte produtos sem unidades disponíveis" onPress={() => setAlertasAbertos(true)} last />
      </Card>
      <SectionHeader title="Conta" label />
      <Card style={{ marginBottom: espaco.padrao }}>
        <SettingsRow icon="user" title="Meu perfil" subtitle="Dados, privacidade e ajuda" onPress={() => router.navigate('/perfil')} />
        <SettingsRow icon="log-out" title="Sair da conta" onPress={() => setConfirmarSaida(true)} last />
      </Card>
      <Button variant="ghost" icon={mostrarIndisponiveis ? 'chevron-up' : 'chevron-down'} onPress={() => setMostrarIndisponiveis(mostrar => !mostrar)}
        accessibilityState={{ expanded: mostrarIndisponiveis }} style={{ justifyContent: 'flex-start', marginBottom: espaco.pequeno }}>Recursos indisponíveis</Button>
      {mostrarIndisponiveis && <Card style={{ marginBottom: espaco.padrao }}>
        {indisponiveis.map((recurso, indice) => <SettingsRow key={recurso.title} {...recurso} unavailable last={indice === indisponiveis.length - 1} />)}
      </Card>}
      <View style={{ marginTop: espaco.pequeno }}>
        <AppText variant="legenda" tone="secundario">Sail · {versao ? 'Versão ' + versao : 'Versão indisponível'}</AppText>
      </View>
    </ScrollView>
    <PreferenciasSheet visible={aparenciaAberta} onClose={() => setAparenciaAberta(false)} />
    <AlertasEstoqueSheet visible={alertasAbertos} onClose={() => setAlertasAbertos(false)} onView={verSemEstoque} />
    <ContaSheet acao={confirmarSaida ? 'sair' : null} usuario={cliente.obterSessao()} onClose={() => setConfirmarSaida(false)}
      onLogout={() => { setConfirmarSaida(false); cliente.encerrarSessao(); }} />
  </ScreenContainer>;
}
