import { useCallback, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { cliente } from '../../lib/api';
import { produtosService } from '../../services';
import { useConsultaEmFoco } from '../../hooks/useConsultaEmFoco';
import { useVersaoEstoque } from '../../hooks/useVersaoEstoque';
import { useLayoutTela } from '../../hooks/useLayoutTela';
import { usePreferenciasInterface } from '../../theme/PreferenciasProvider';
import { rotulosTema } from '../../lib/preferencias';
import { espaco } from '../../theme/design';
import ScreenContainer from '../../components/ScreenContainer';
import AppHeader from '../../components/AppHeader';
import Feedback from '../../components/Feedback';
import { PreferenciasSheet } from '../../components/PreferenciasSheet';
import { AlertasEstoqueSheet } from '../../components/AlertasEstoqueSheet';
import { ProfileHeader, MetricasPerfil } from '../../components/perfil/ResumoPerfil';
import { ContaSheet, type AcaoConta } from '../../components/perfil/ContaSheet';
import { AppText } from '../../components/ui/AppText';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { SettingsRow } from '../../components/ui/SettingsRow';

export default function PerfilScreen() {
  const layout = useLayoutTela();
  const usuario = cliente.obterSessao();
  const { tema, valoresOcultos } = usePreferenciasInterface();
  const [acao, setAcao] = useState<AcaoConta | null>(null);
  const [aparenciaAberta, setAparenciaAberta] = useState(false);
  const [alertasAbertos, setAlertasAbertos] = useState(false);
  const versao = useVersaoEstoque();
  const carregar = useCallback((signal: AbortSignal) => produtosService.resumo(signal), [versao]);
  const consulta = useConsultaEmFoco(carregar, 'listagem');
  const verSemEstoque = () => { setAlertasAbertos(false); router.push({ pathname: '/vendas', params: { filtro: 'sem-estoque' } }); };

  return <ScreenContainer testID="perfil-tela">
    <ScrollView testID="perfil-lista" style={{ flex: 1, minHeight: 0 }} showsVerticalScrollIndicator={false} contentContainerStyle={layout.conteudo}>
      <AppHeader onNotifications={() => setAlertasAbertos(true)} />
      <AppText variant="titulo" accessibilityRole="header">Meu perfil</AppText>
      <AppText tone="secundario" style={{ marginTop: espaco.minimo, marginBottom: espaco.padrao }}>Conta, segurança e preferências</AppText>
      <ProfileHeader usuario={usuario} aoEditar={() => setAcao('dados')} />
      <Feedback mensagem={consulta.erro} aoTentarNovamente={consulta.atualizar} desabilitado={consulta.carregando} />
      <MetricasPerfil dados={consulta.erro ? null : consulta.dados} carregando={consulta.carregando} oculto={valoresOcultos} />
      <SectionHeader title="Minha conta" label />
      <Card style={{ marginBottom: espaco.amplo }}>
        <SettingsRow icon="lock" title="Edição de perfil e senha" unavailable last />
      </Card>
      <SectionHeader title="Preferências" label />
      <Card style={{ marginBottom: espaco.amplo }}>
        <SettingsRow icon="sun" title="Aparência" subtitle={'Tema: ' + rotulosTema[tema]} onPress={() => setAparenciaAberta(true)} />
        <SettingsRow icon="bell" title="Notificações" subtitle="Alertas e avisos do estoque" onPress={() => setAlertasAbertos(true)} last />
      </Card>
      <SectionHeader title="Privacidade e suporte" label />
      <Card style={{ marginBottom: espaco.amplo }}>
        <SettingsRow icon="shield" title="Privacidade" onPress={() => setAcao('privacidade')} />
        <SettingsRow icon="help-circle" title="Ajuda e suporte" onPress={() => setAcao('ajuda')} last />
      </Card>
      <Button variant="danger" icon="log-out" onPress={() => setAcao('sair')}>Sair da conta</Button>
      <View style={{ height: espaco.padrao }} />
    </ScrollView>
    <PreferenciasSheet visible={aparenciaAberta} onClose={() => setAparenciaAberta(false)} />
    <AlertasEstoqueSheet visible={alertasAbertos} onClose={() => setAlertasAbertos(false)} onView={verSemEstoque} />
    <ContaSheet acao={acao} usuario={usuario} onClose={() => setAcao(null)} onLogout={() => { setAcao(null); cliente.encerrarSessao(); }} />
  </ScreenContainer>;
}
