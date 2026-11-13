import { useCallback, useEffect, useRef, useState } from 'react';
import { RespostaInvalidaError, type Pagina } from '../lib/contratos.ts';
import { foiCancelado, mensagemErro, type ContextoErro } from '../lib/erros.ts';

export function useListaPaginada<T extends { id: number }>(carregar: (cursor: string | null, signal: AbortSignal) => Promise<Pagina<T>>, contexto: ContextoErro) {
  const [dados, setDados] = useState<T[]>([]);
  const [carregado, setCarregado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [erroMais, setErroMais] = useState<string | null>(null);
  const [temMais, setTemMais] = useState(false);
  const ativo = useRef(false);
  const geracao = useRef(0);
  const inicial = useRef<AbortController | null>(null);
  const proxima = useRef<AbortController | null>(null);
  const cursor = useRef<string | null>(null);
  const falhaProxima = useRef(false);
  const cursores = useRef(new Set<string>());
  const revisao = useRef(0);
  const confirmados = useRef(new Map<number, { revisao: number; item: T | null }>());

  const aplicarConfirmacoes = useCallback((itens: T[], inicio: number) => itens.flatMap(item => {
    const confirmado = confirmados.current.get(item.id);
    if (!confirmado || confirmado.revisao <= inicio) return [item];
    return confirmado.item ? [confirmado.item] : [];
  }), []);

  const atualizar = useCallback(async () => {
    if (!ativo.current || inicial.current) return;
    proxima.current?.abort();
    proxima.current = null;
    const atual = new AbortController();
    inicial.current = atual;
    const rodada = ++geracao.current;
    const inicio = revisao.current;
    cursor.current = null;
    cursores.current.clear();
    confirmados.current.clear();
    falhaProxima.current = false;
    setTemMais(false);
    setCarregando(true);
    setCarregandoMais(false);
    setErro(null);
    setErroMais(null);
    try {
      const pagina = await carregar(null, atual.signal);
      if (!ativo.current || atual.signal.aborted || rodada !== geracao.current) return;
      if (pagina.itens.length === 0 && pagina.proximoCursor !== null) throw new RespostaInvalidaError();
      cursor.current = pagina.proximoCursor;
      setDados(aplicarConfirmacoes(pagina.itens, inicio));
      setTemMais(pagina.proximoCursor !== null);
      setCarregado(true);
    } catch (falha) {
      if (ativo.current && !atual.signal.aborted && rodada === geracao.current && !foiCancelado(falha)) setErro(mensagemErro(falha, contexto));
    } finally {
      if (inicial.current === atual) {
        inicial.current = null;
        confirmados.current.clear();
        if (ativo.current && rodada === geracao.current) setCarregando(false);
      }
    }
  }, [carregar, contexto, aplicarConfirmacoes]);

  const carregarMais = useCallback(async (repetir = false) => {
    const anterior = cursor.current;
    if (!ativo.current || inicial.current || proxima.current || anterior === null || (falhaProxima.current && !repetir)) return;
    const atual = new AbortController();
    proxima.current = atual;
    const rodada = geracao.current;
    const inicio = revisao.current;
    falhaProxima.current = false;
    setCarregandoMais(true);
    setErroMais(null);
    try {
      const pagina = await carregar(anterior, atual.signal);
      if (!ativo.current || atual.signal.aborted || rodada !== geracao.current) return;
      if (pagina.proximoCursor === anterior || (pagina.proximoCursor !== null && cursores.current.has(pagina.proximoCursor))
          || (pagina.itens.length === 0 && pagina.proximoCursor !== null)) throw new RespostaInvalidaError();
      cursores.current.add(anterior);
      cursor.current = pagina.proximoCursor;
      const itens = aplicarConfirmacoes(pagina.itens, inicio);
      setDados(anteriores => {
        const ids = new Set(anteriores.map(item => item.id));
        const novos = itens.filter(item => { if (ids.has(item.id)) return false; ids.add(item.id); return true; });
        return [...anteriores, ...novos];
      });
      setTemMais(pagina.proximoCursor !== null);
    } catch (falha) {
      if (ativo.current && !atual.signal.aborted && rodada === geracao.current && !foiCancelado(falha)) {
        falhaProxima.current = true;
        setErroMais(mensagemErro(falha, contexto));
      }
    } finally {
      if (proxima.current === atual) {
        proxima.current = null;
        confirmados.current.clear();
        if (ativo.current && rodada === geracao.current) setCarregandoMais(false);
      }
    }
  }, [carregar, contexto, aplicarConfirmacoes]);

  const carregarProxima = useCallback(() => carregarMais(), [carregarMais]);
  const tentarProxima = useCallback(() => carregarMais(true), [carregarMais]);

  const confirmarItem = useCallback((id: number, item: T | null) => {
    if (!ativo.current) return;
    const versao = ++revisao.current;
    if (inicial.current || proxima.current) confirmados.current.set(id, { revisao: versao, item });
    setDados(anteriores => item ? anteriores.map(atual => atual.id === id ? item : atual) : anteriores.filter(atual => atual.id !== id));
  }, []);

  const parar = useCallback(() => {
    ativo.current = false;
    geracao.current++;
    inicial.current?.abort();
    proxima.current?.abort();
    inicial.current = null;
    proxima.current = null;
    confirmados.current.clear();
  }, []);

  const iniciar = useCallback(() => {
    ativo.current = true;
    setDados([]);
    setCarregado(false);
    return atualizar();
  }, [atualizar]);

  useEffect(() => parar, [parar]);

  return { dados, carregado, carregando, carregandoMais, erro, erroMais, temMais, atualizar, carregarProxima, tentarProxima, confirmarItem, iniciar, parar };
}
