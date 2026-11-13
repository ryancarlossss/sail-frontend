import { useCallback, useState } from 'react';
import { useEnvio } from './useEnvio.ts';
import { codigoErro, foiCancelado, mensagemErro } from '../lib/erros.ts';
import { obterMensagemErroEstoque, validarQuantidadeVenda } from '../lib/venda.ts';
import type { Produto } from '../lib/contratos.ts';
import type { ServicoProdutos } from '../services/produtos.ts';

interface ConfirmacoesEstoque {
  aoVender: (produto: Produto) => Promise<void>;
  aoExcluir: (id: number) => Promise<void>;
}

export function useMovimentacoesEstoque(servico: ServicoProdutos, confirmacoes: ConfirmacoesEstoque) {
  const { enviando, executar, estaAtivo, estaEnviando } = useEnvio();
  const [modalVisible, setModalVisible] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [versaoVenda, setVersaoVenda] = useState<string | null>(null);
  const [carregandoVenda, setCarregandoVenda] = useState(false);
  const [qtdVenda, setQtdVenda] = useState('1');
  const [erroOperacao, setErroOperacao] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const limparFeedback = useCallback(() => { setErroOperacao(null); setSucesso(null); }, []);

  const { aoVender, aoExcluir } = confirmacoes;
  const excluir = useCallback(async (id: number) => {
    setErroOperacao(null);
    setSucesso(null);
    try {
      const confirmada = await executar(async signal => { await servico.excluir(id, signal); return true; });
      if (!confirmada || !estaAtivo()) return;
      setSucesso('Produto removido do estoque. O histórico foi preservado.');
      await aoExcluir(id);
    } catch (falha) {
      if (estaAtivo() && !foiCancelado(falha)) setErroOperacao(obterMensagemErroEstoque(falha, 'exclusao'));
    }
  }, [executar, estaAtivo, servico, aoExcluir]);

  const carregarDadosVenda = useCallback(async (produto: Produto) => {
    if (estaEnviando()) return;
    setVersaoVenda(null);
    setCarregandoVenda(true);
    setErroOperacao(null);
    try {
      const atual = await executar(signal => servico.obter(produto.id, signal));
      if (atual && estaAtivo()) {
        setProdutoSelecionado(atual.produto);
        setVersaoVenda(atual.versao);
      }
    } catch (falha) {
      if (estaAtivo() && !foiCancelado(falha)) setErroOperacao(mensagemErro(falha, 'listagem'));
    } finally {
      if (estaAtivo()) setCarregandoVenda(false);
    }
  }, [estaEnviando, executar, servico, estaAtivo]);

  const abrirModalVenda = useCallback((produto: Produto) => {
    if (estaEnviando()) return;
    setProdutoSelecionado(produto);
    setQtdVenda('1');
    setSucesso(null);
    setModalVisible(true);
    void carregarDadosVenda(produto);
  }, [estaEnviando, carregarDadosVenda]);

  const recarregarVenda = useCallback(() => {
    if (produtoSelecionado) void carregarDadosVenda(produtoSelecionado);
  }, [produtoSelecionado, carregarDadosVenda]);

  const fecharModalVenda = useCallback(() => { if (!estaEnviando()) setModalVisible(false); }, [estaEnviando]);

  const confirmarVenda = useCallback(async () => {
    if (!produtoSelecionado || !versaoVenda || estaEnviando()) return;
    const validacao = validarQuantidadeVenda(qtdVenda, produtoSelecionado.quantidade);
    if (validacao.erro !== undefined) {
      setErroOperacao(validacao.erro);
      return;
    }
    setErroOperacao(null);
    try {
      const produto = await executar(signal => servico.vender(produtoSelecionado.id, validacao.quantidade, signal, versaoVenda));
      if (!produto || !estaAtivo()) return;
      setModalVisible(false);
      setSucesso(validacao.quantidade + ' unidade(s) vendida(s) com sucesso.');
      await aoVender(produto);
    } catch (falha) {
      if (estaAtivo() && !foiCancelado(falha)) {
        if (codigoErro(falha) === 'PRODUTO_ALTERADO') setVersaoVenda(null);
        setErroOperacao(obterMensagemErroEstoque(falha, 'venda'));
      }
    }
  }, [produtoSelecionado, versaoVenda, qtdVenda, estaEnviando, executar, servico, estaAtivo, aoVender]);

  return {
    enviando, modalVisible, produtoSelecionado, qtdVenda, setQtdVenda, erroOperacao, sucesso, carregandoVenda,
    vendaPronta: versaoVenda !== null,
    excluir, abrirModalVenda, fecharModalVenda, confirmarVenda, limparFeedback, recarregarVenda,
  };
}
