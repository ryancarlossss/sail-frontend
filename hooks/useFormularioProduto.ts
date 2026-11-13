import { useCallback, useEffect, useRef, useState } from 'react';
import { useEnvio } from './useEnvio.ts';
import { validarFormularioProduto } from '../lib/validacao.ts';
import { codigoErro, foiCancelado, mensagemErro } from '../lib/erros.ts';
import type { ServicoProdutos } from '../services/produtos.ts';

export function useFormularioProduto(servico: ServicoProdutos, id: string | string[] | undefined) {
  const isEditing = id !== undefined;
  const produtoId = typeof id === 'string' && /^\d+$/.test(id) && Number.isSafeInteger(Number(id)) && Number(id) > 0 ? Number(id) : null;
  const [titulo, setTitulo] = useState('');
  const [valor, setValor] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [imagem, setImagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [versao, setVersao] = useState<string | null>(null);
  const [carregandoProduto, setCarregandoProduto] = useState(isEditing);
  const [precisaRecarregar, setPrecisaRecarregar] = useState(false);
  const { enviando: isLoading, executar, estaAtivo } = useEnvio();
  const consulta = useRef<AbortController | null>(null);
  const bloqueado = isLoading || carregandoProduto || !!sucesso;

  const carregarProduto = useCallback(async () => {
    if (!isEditing) return;
    if (!produtoId) {
      setErro('O produto informado é inválido. Volte ao estoque e selecione novamente.');
      setCarregandoProduto(false);
      return;
    }
    consulta.current?.abort();
    const controller = new AbortController();
    consulta.current = controller;
    setCarregandoProduto(true);
    setErro(null);
    try {
      const resposta = await servico.obter(produtoId, controller.signal);
      if (!estaAtivo() || controller.signal.aborted) return;
      setTitulo(resposta.produto.nome);
      setValor(resposta.produto.preco.toFixed(2).replace('.', ','));
      setQuantidade(String(resposta.produto.quantidade));
      setImagem(resposta.produto.imagem ?? null);
      setVersao(resposta.versao);
      setPrecisaRecarregar(false);
    } catch (falha) {
      if (estaAtivo() && !controller.signal.aborted && !foiCancelado(falha)) setErro(mensagemErro(falha, 'produto'));
    } finally {
      if (estaAtivo() && !controller.signal.aborted) setCarregandoProduto(false);
    }
  }, [servico, isEditing, produtoId, estaAtivo]);

  useEffect(() => {
    void carregarProduto();
    return () => consulta.current?.abort();
  }, [carregarProduto]);

  const handleSalvar = async () => {
    if (bloqueado || precisaRecarregar) return;
    setErro(null);
    const validacao = validarFormularioProduto(titulo, valor, quantidade);
    if (validacao.campos) {
      setErro(Object.values(validacao.campos).join('\n'));
      return;
    }
    if (isEditing && (!produtoId || !versao)) {
      setErro('Carregue os dados atuais do produto antes de salvar.');
      return;
    }
    try {
      const resposta = await executar(signal => isEditing
        ? servico.atualizar(produtoId!, validacao.dados, versao!, signal)
        : servico.cadastrar(validacao.dados, signal));
      if (!resposta || !estaAtivo()) return;
      setSucesso(isEditing ? 'Produto atualizado com sucesso.' : 'Produto cadastrado com sucesso.');
    } catch (falha) {
      if (estaAtivo() && !foiCancelado(falha)) {
        setErro(mensagemErro(falha, 'produto'));
        if (codigoErro(falha) === 'PRODUTO_ALTERADO') setPrecisaRecarregar(true);
      }
    }
  };

  return {
    isEditing, produtoId, titulo, setTitulo, valor, setValor, quantidade, setQuantidade, imagem, setImagem,
    erro, setErro, sucesso, versao, carregandoProduto, precisaRecarregar, isLoading, bloqueado,
    carregarProduto, handleSalvar, estaAtivo,
  };
}
