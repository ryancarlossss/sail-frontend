import { useCallback, useRef, useState } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { historicoService } from '../services';
import { useTema } from '../hooks/useTema';
import { useLayoutTela } from '../hooks/useLayoutTela';
import { useListaPaginadaEmFoco } from '../hooks/useListaPaginadaEmFoco';
import { useVersaoEstoque } from '../hooks/useVersaoEstoque';
import { usePreferenciasInterface } from '../theme/PreferenciasProvider';
import { dimensao, espaco } from '../theme/design';
import { periodoVendas } from '../lib/estoque';
import { descreverMovimentacao, periodoHistoricoInicial } from '../lib/historico';
import { formatCurrency } from '../lib/utils';
import type { Registro } from '../lib/contratos';
import ScreenContainer from '../components/ScreenContainer';
import Feedback from '../components/Feedback';
import { AppText } from '../components/ui/AppText';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { IconButton } from '../components/ui/IconButton';
import { AppSheet } from '../components/ui/AppSheet';
import { SettingsRow } from '../components/ui/SettingsRow';
import { LoadingState, EmptyState } from '../components/ui/StatePanel';

const rotulosAcao: Record<string, string> = {
  VENDA: 'Venda', CADASTRO: 'Cadastro', AJUSTE: 'Ajuste de estoque', EDICAO: 'Edição', ARQUIVAMENTO: 'Arquivamento',
};

export default function HistoricoScreen() {
  const { cores } = useTema();
  const layout = useLayoutTela();
  const { valoresOcultos } = usePreferenciasInterface();
  const params = useLocalSearchParams<{ mes?: string; ano?: string }>();
  const [periodo, setPeriodo] = useState(() => periodoHistoricoInicial(params.mes, params.ano));
  const [periodoAberto, setPeriodoAberto] = useState(false);
  const [total, setTotal] = useState<number | null>(null);
  const versaoEstoque = useVersaoEstoque();
  const rodada = useRef(0);
  const carregar = useCallback(async (cursor: string | null, signal: AbortSignal) => {
    const atual = cursor === null ? ++rodada.current : rodada.current;
    if (cursor === null) setTotal(null);
    const pagina = await historicoService.listarPagina(periodo, cursor, signal);
    if (!signal.aborted && atual === rodada.current && cursor === null) setTotal(pagina.totalDoMes);
    return pagina;
  }, [periodo, versaoEstoque]);
  const consulta = useListaPaginadaEmFoco(carregar, 'historico');
  const todos = periodo.mes === 0;
  const rotuloPeriodo = todos ? 'Todo o histórico' : new Date(periodo.ano, periodo.mes - 1, 1)
    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const renderizarRegistro = useCallback(({ item }: { item: Registro }) => <Card style={{ padding: espaco.medio, marginBottom: espaco.medio }}>
    <AppText variant="rotulo" tone="destaque">{rotulosAcao[item.acao] ?? 'Movimentação'}</AppText>
    <AppText variant="destaque" style={{ marginTop: espaco.minimo }}>{item.produto.nome}</AppText>
    <AppText>{descreverMovimentacao(item)}</AppText>
    {item.acao === 'VENDA' && <AppText variant="botao" tone="destaque" style={{ marginTop: espaco.minimo }}>
      {item.valorTotal === undefined ? 'Valor registrado indisponível' : valoresOcultos ? '••••' : formatCurrency(item.valorTotal)}
    </AppText>}
    <AppText variant="legenda" tone="secundario" style={{ marginTop: espaco.pequeno }}>
      {new Date(item.dataHora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
      {' · ' + (item.usuario?.nome || 'Usuário não informado')}
    </AppText>
  </Card>, [valoresOcultos]);

  return <ScreenContainer testID="historico-tela" style={{ paddingBottom: layout.insets.bottom }}>
    <View style={{ width: '100%', maxWidth: dimensao.larguraMaxima, alignSelf: 'center', paddingHorizontal: layout.conteudo.paddingHorizontal,
      paddingTop: espaco.pequeno, paddingBottom: espaco.pequeno, flexDirection: 'row', alignItems: 'center', gap: espaco.medio }}>
      <IconButton icon="arrow-left" label="Voltar ao estoque" onPress={() => router.back()} />
      <AppText variant="titulo" accessibilityRole="header">Histórico</AppText>
    </View>
    <FlatList testID="historico-lista" style={{ flex: 1, minHeight: 0 }} contentContainerStyle={layout.conteudo}
      data={consulta.dados} renderItem={renderizarRegistro} keyExtractor={item => String(item.id)} initialNumToRender={10}
      showsVerticalScrollIndicator={false} onEndReached={consulta.carregarProxima}
      refreshControl={<RefreshControl refreshing={consulta.carregando && consulta.carregado} onRefresh={consulta.atualizar} tintColor={cores.destaque} />}
      ListHeaderComponent={<>
        <Button variant="outline" icon="calendar" onPress={() => setPeriodoAberto(true)}
          accessibilityLabel="Escolher período do histórico" style={{ alignSelf: 'flex-start', marginBottom: espaco.medio }}>{rotuloPeriodo}</Button>
        <Card style={{ padding: espaco.medio, marginBottom: espaco.padrao }}>
          <AppText variant="legenda" tone="secundario">Receita de vendas no período</AppText>
          <AppText variant="destaque">{consulta.erro || total === null ? '—' : valoresOcultos ? '••••' : formatCurrency(total)}</AppText>
          <AppText variant="legenda" tone="secundario">Somente vendas registradas. Ajustes de saldo não compõem a receita.</AppText>
        </Card>
        <Feedback mensagem={consulta.erro} aoTentarNovamente={consulta.atualizar} desabilitado={consulta.carregando} />
        {consulta.carregando && !consulta.carregado && <LoadingState label="Carregando movimentações…" />}
      </>}
      ListEmptyComponent={!consulta.carregando && !consulta.erro ? <EmptyState title="Nenhuma movimentação neste período"
        message="Escolha outro período para consultar os registros existentes." /> : undefined}
      ListFooterComponent={<>
        <Feedback mensagem={consulta.erroMais} aoTentarNovamente={consulta.tentarProxima} desabilitado={consulta.carregando || consulta.carregandoMais} />
        {consulta.carregandoMais && <LoadingState label="Carregando mais movimentações…" />}
      </>} />
    <AppSheet visible={periodoAberto} title="Período do histórico" onClose={() => setPeriodoAberto(false)}>
      <Card>{[
        { title: 'Este mês', periodo: periodoVendas(0) },
        { title: 'Mês anterior', periodo: periodoVendas(1) },
        { title: 'Todo o histórico', periodo: { mes: 0, ano: 0 } },
      ].map((opcao, indice) => <SettingsRow key={opcao.title} icon="calendar" title={opcao.title}
        selected={periodo.mes === opcao.periodo.mes && periodo.ano === opcao.periodo.ano} last={indice === 2}
        onPress={() => { setTotal(null); setPeriodo(opcao.periodo); setPeriodoAberto(false); }} />)}</Card>
    </AppSheet>
  </ScreenContainer>;
}
