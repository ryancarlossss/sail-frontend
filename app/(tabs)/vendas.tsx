import { useCallback, useEffect, useRef, useState } from 'react';
import { View, FlatList, RefreshControl, ActivityIndicator, Keyboard } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { produtosService, historicoService } from '../../services';
import { periodoVendas, rotulosFiltro, type FiltroEstoque } from '../../lib/estoque';
import type { Produto } from '../../lib/contratos';
import { useTema } from '../../hooks/useTema';
import { useLayoutTela } from '../../hooks/useLayoutTela';
import { useListaPaginadaEmFoco } from '../../hooks/useListaPaginadaEmFoco';
import { useConsultaEmFoco } from '../../hooks/useConsultaEmFoco';
import { useMovimentacoesEstoque } from '../../hooks/useMovimentacoesEstoque';
import { useBuscaProdutos } from '../../hooks/useBuscaProdutos';
import { useVersaoEstoque } from '../../hooks/useVersaoEstoque';
import { useMovimentoReduzido } from '../../hooks/useMovimentoReduzido';
import { usePreferenciasInterface } from '../../theme/PreferenciasProvider';
import { dimensao, espaco, interacao } from '../../theme/design';
import ScreenContainer from '../../components/ScreenContainer';
import AppHeader from '../../components/AppHeader';
import Feedback from '../../components/Feedback';
import ProdutoEstoque from '../../components/estoque/ProdutoEstoque';
import ModalVenda from '../../components/estoque/ModalVenda';
import { ResumoVendas } from '../../components/estoque/ResumoVendas';
import { IndicadoresEstoque } from '../../components/estoque/IndicadoresEstoque';
import { FiltrosEstoqueSheet } from '../../components/estoque/FiltrosEstoqueSheet';
import { AlertasEstoqueSheet } from '../../components/AlertasEstoqueSheet';
import { AppText } from '../../components/ui/AppText';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { AppSheet } from '../../components/ui/AppSheet';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { SettingsRow } from '../../components/ui/SettingsRow';
import { LoadingState, EmptyState } from '../../components/ui/StatePanel';

export default function VendasScreen() {
  const { cores } = useTema();
  const layout = useLayoutTela();
  const movimentoReduzido = useMovimentoReduzido();
  const { valoresOcultos } = usePreferenciasInterface();
  const params = useLocalSearchParams<{ filtro?: string }>();
  const lista = useRef<FlatList<Produto>>(null);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [alertasAbertos, setAlertasAbertos] = useState(false);
  const [periodoAberto, setPeriodoAberto] = useState(false);
  const [deslocamento, setDeslocamento] = useState(0);
  const [produtoExcluir, setProdutoExcluir] = useState<Produto | null>(null);
  const carregar = useCallback((cursor: string | null, signal: AbortSignal) => produtosService.listarPagina(cursor, signal), []);
  const consulta = useListaPaginadaEmFoco(carregar, 'listagem');
  const busca = useBuscaProdutos(consulta);
  const setFiltro = busca.setFiltro;

  useEffect(() => {
    if (params.filtro === 'sem-estoque' || params.filtro === 'com-estoque' || params.filtro === 'todos') {
      setFiltro(params.filtro);
      router.setParams({ filtro: undefined });
    }
  }, [params.filtro, setFiltro]);

  const confirmarItem = consulta.confirmarItem;
  const aoVender = useCallback(async (produto: Produto) => { confirmarItem(produto.id, produto); }, [confirmarItem]);
  const aoExcluir = useCallback(async (id: number) => { confirmarItem(id, null); setProdutoExcluir(null); }, [confirmarItem]);
  const movimentos = useMovimentacoesEstoque(produtosService, { aoVender, aoExcluir });
  const { excluir, limparFeedback, abrirModalVenda, enviando } = movimentos;
  useFocusEffect(useCallback(() => { limparFeedback(); }, [limparFeedback]));
  const abrirExclusao = useCallback((id: number) => {
    const produto = consulta.dados.find(atual => atual.id === id);
    if (produto) { limparFeedback(); setProdutoExcluir(produto); }
  }, [consulta.dados, limparFeedback]);
  const editarProduto = useCallback((produto: Produto) => router.push({ pathname: '/produto/novo', params: { id: String(produto.id) } }), []);
  const cadastrar = useCallback(() => router.push('/produto/novo'), []);
  const renderizarProduto = useCallback(({ item }: { item: Produto }) => <ProdutoEstoque produto={item}
    enviando={enviando} valoresOcultos={valoresOcultos} aoVender={abrirModalVenda} aoExcluir={abrirExclusao} aoEditar={editarProduto} />,
  [enviando, valoresOcultos, abrirModalVenda, abrirExclusao, editarProduto]);

  const versao = useVersaoEstoque();
  const periodo = periodoVendas(deslocamento);
  const anterior = periodoVendas(deslocamento + 1);
  const carregarTotal = useCallback((signal: AbortSignal) => historicoService.totalPeriodo({ mes: periodo.mes, ano: periodo.ano }, signal), [periodo.mes, periodo.ano, versao]);
  const carregarAnterior = useCallback((signal: AbortSignal) => historicoService.totalPeriodo({ mes: anterior.mes, ano: anterior.ano }, signal), [anterior.mes, anterior.ano, versao]);
  const vendas = useConsultaEmFoco(carregarTotal, 'historico');
  const comparacao = useConsultaEmFoco(carregarAnterior, 'historico');
  const carregarResumo = useCallback((signal: AbortSignal) => produtosService.resumo(signal), [versao]);
  const resumo = useConsultaEmFoco(carregarResumo, 'listagem');
  const atualizarVendas = () => { void vendas.atualizar(); void comparacao.atualizar(); };
  const atualizarTudo = () => { void consulta.atualizar(); void resumo.atualizar(); atualizarVendas(); };
  const mesAno = new Date(periodo.ano, periodo.mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const semEstoque = resumo.erro || resumo.carregando ? undefined : resumo.dados?.quantidadeSemEstoque;
  const tituloAlerta = semEstoque === undefined ? 'Consulte os alertas do estoque' : semEstoque === 0 ? 'Estoque em dia' : semEstoque + (semEstoque === 1 ? ' produto sem estoque' : ' produtos sem estoque');
  const selecionarFiltro = (filtro: FiltroEstoque) => { busca.setFiltro(filtro); setFiltrosAbertos(false); };
  const verSemEstoque = () => { setAlertasAbertos(false); busca.setBusca(''); busca.setFiltro('sem-estoque'); lista.current?.scrollToOffset({ offset: 0, animated: !movimentoReduzido }); };
  const verTodos = () => { Keyboard.dismiss(); busca.setBusca(''); busca.setFiltro('todos'); lista.current?.scrollToOffset({ offset: 0, animated: !movimentoReduzido }); };

  return <ScreenContainer testID="estoque-tela">
    <FlatList ref={lista} testID="estoque-lista" style={{ flex: 1, minHeight: 0 }} data={busca.produtos} renderItem={renderizarProduto} keyExtractor={produto => String(produto.id)}
      initialNumToRender={10} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"
      contentContainerStyle={layout.conteudo} onEndReached={busca.ativa ? undefined : consulta.carregarProxima}
      refreshControl={<RefreshControl refreshing={consulta.carregando && consulta.carregado} onRefresh={atualizarTudo} enabled={!enviando} tintColor={cores.destaque} />}
      ListHeaderComponent={<>
        <AppHeader onNotifications={() => setAlertasAbertos(true)} alert={semEstoque !== undefined && semEstoque > 0} />
        <AppText variant="titulo" accessibilityRole="header">Meu Estoque</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: espaco.pequeno, marginTop: espaco.minimo, marginBottom: espaco.padrao }}>
          <AppText tone="secundario">Seu negócio em um só lugar</AppText>
          <Button variant="outline" size="sm" onPress={() => setPeriodoAberto(true)} accessibilityLabel="Escolher período das vendas">{deslocamento === 0 ? 'Este mês' : 'Mês anterior'}</Button>
        </View>
        <ResumoVendas total={vendas.dados} anterior={comparacao.dados} carregando={vendas.carregando} comparando={comparacao.carregando}
          erro={vendas.erro} erroComparacao={comparacao.erro} oculto={valoresOcultos} periodo={mesAno} aoAtualizar={atualizarVendas}
          aoHistorico={() => router.push({ pathname: '/historico', params: { mes: String(periodo.mes), ano: String(periodo.ano) } })} />
        <IndicadoresEstoque dados={resumo.erro ? null : resumo.dados} carregando={resumo.carregando} oculto={valoresOcultos} />
        <Feedback mensagem={resumo.erro} aoTentarNovamente={resumo.atualizar} desabilitado={resumo.carregando} />
        <Card elevated style={{ marginBottom: espaco.padrao }}>
          <SettingsRow icon="file-text" title={resumo.erro ? 'Indicadores indisponíveis' : tituloAlerta} subtitle={semEstoque === 0 ? 'Consulte os saldos dos seus produtos' : 'Consulte produtos que precisam de atenção'} onPress={verSemEstoque} last />
        </Card>
        <SectionHeader title="Meus produtos" action="Ver todos ›" onPress={verTodos} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: espaco.pequeno, marginBottom: espaco.padrao }}>
          <View style={{ flex: 1, minWidth: 0 }}><Input value={busca.busca} onChangeText={busca.setBusca} placeholder="Buscar produto..."
            accessibilityLabel="Buscar produto" autoCapitalize="none" autoCorrect={false} returnKeyType="search" onSubmitEditing={Keyboard.dismiss}
            leftElement={<Feather name="search" color={cores.textoSecundario} size={dimensao.icone} />}
            rightElement={busca.busca ? <IconButton icon="x" label="Limpar busca" onPress={() => busca.setBusca('')} /> : undefined} /></View>
          <IconButton icon="filter" label="Filtrar produtos" selected={busca.filtro !== 'todos'} onPress={() => setFiltrosAbertos(true)} outlined />
        </View>
        {busca.filtro !== 'todos' && <Button variant="secondary" size="sm" onPress={() => busca.setFiltro('todos')} style={{ alignSelf: 'flex-start', marginBottom: espaco.padrao }}>{rotulosFiltro[busca.filtro] + ' · Limpar filtro'}</Button>}
        <Feedback mensagem={consulta.erro} aoTentarNovamente={consulta.atualizar} desabilitado={consulta.carregando} />
        <Feedback mensagem={!movimentos.modalVisible && !produtoExcluir ? movimentos.erroOperacao : null} />
        <Feedback sucesso mensagem={movimentos.sucesso} />
        {busca.buscando && <LoadingState label="Buscando no estoque…" />}
        {busca.ativa && consulta.erroMais && <AppText tone="perigo" style={{ marginBottom: espaco.padrao }}>Não foi possível concluir a busca. Tente novamente.</AppText>}
      </>}
      ListEmptyComponent={consulta.carregando && !consulta.carregado ? <LoadingState /> : !consulta.erro && !consulta.erroMais && !busca.buscando ?
        <EmptyState title={busca.ativa ? 'Nenhum resultado' : 'Seu estoque começa aqui'} message={busca.ativa ? 'Tente outro nome ou filtro.' : 'Cadastre seu primeiro produto para acompanhar saldos e vendas.'}
          action={busca.ativa ? 'Limpar busca e filtros' : undefined} onPress={busca.ativa ? verTodos : undefined} /> : undefined}
      ListFooterComponent={<View>
        <Feedback mensagem={consulta.erroMais} aoTentarNovamente={consulta.tentarProxima} desabilitado={consulta.carregando || consulta.carregandoMais} />
        {consulta.carregandoMais && !busca.buscando && <ActivityIndicator color={cores.destaque} accessibilityLabel="Carregando mais produtos" style={{ padding: espaco.padrao }} />}
      </View>} />
    <View testID="cadastro-estoque" style={{ paddingVertical: espaco.pequeno, backgroundColor: cores.fundo, borderTopWidth: interacao.borda, borderTopColor: cores.borda }}>
      <View style={{ width: '100%', maxWidth: dimensao.larguraMaxima, alignSelf: 'center', paddingHorizontal: layout.conteudo.paddingHorizontal }}>
        <Button icon="plus" onPress={cadastrar} disabled={enviando} accessibilityLabel="Cadastrar produto">Cadastrar produto</Button>
      </View>
    </View>
    <ModalVenda visivel={movimentos.modalVisible} nomeProduto={movimentos.produtoSelecionado?.nome} quantidade={movimentos.qtdVenda}
      preco={movimentos.produtoSelecionado?.preco} saldo={movimentos.produtoSelecionado?.quantidade} valoresOcultos={valoresOcultos}
      carregando={movimentos.carregandoVenda} pronta={movimentos.vendaPronta} aoRecarregar={movimentos.recarregarVenda}
      enviando={enviando} erro={movimentos.erroOperacao} aoAlterarQuantidade={movimentos.setQtdVenda} aoFechar={movimentos.fecharModalVenda} aoConfirmar={movimentos.confirmarVenda} />
    <AppSheet visible={produtoExcluir !== null} title="Remover produto?" onClose={() => setProdutoExcluir(null)} busy={enviando}>
      <AppText>Deseja remover {produtoExcluir?.nome} do estoque? Seu histórico será preservado.</AppText>
      <Feedback mensagem={movimentos.erroOperacao} />
      <Button variant="danger" icon="trash-2" loading={enviando} onPress={() => { if (produtoExcluir) void excluir(produtoExcluir.id); }}>Confirmar exclusão</Button>
      <Button variant="secondary" disabled={enviando} onPress={() => setProdutoExcluir(null)}>Cancelar</Button>
    </AppSheet>
    <FiltrosEstoqueSheet visible={filtrosAbertos} filtro={busca.filtro} onClose={() => setFiltrosAbertos(false)} onSelect={selecionarFiltro} />
    <AlertasEstoqueSheet visible={alertasAbertos} onClose={() => setAlertasAbertos(false)} onView={verSemEstoque} />
    <AppSheet visible={periodoAberto} title="Período das vendas" onClose={() => setPeriodoAberto(false)}>
      <Card>{[0, 1].map(opcao => <SettingsRow key={opcao} icon="calendar" title={opcao === 0 ? 'Este mês' : 'Mês anterior'} selected={deslocamento === opcao} last={opcao === 1}
        onPress={() => { setDeslocamento(opcao); setPeriodoAberto(false); }} />)}</Card>
    </AppSheet>
  </ScreenContainer>;
}
