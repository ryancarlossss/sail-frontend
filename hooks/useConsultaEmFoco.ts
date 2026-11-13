import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { foiCancelado, mensagemErro, type ContextoErro } from '../lib/erros';

export function useConsultaEmFoco<T>(carregar: (signal: AbortSignal) => Promise<T>, contexto: ContextoErro) {
  const [dados, setDados] = useState<T | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);
  const ativo = useRef(false);

  const atualizar = useCallback(async () => {
    if (!ativo.current) return;
    controller.current?.abort();
    const atual = new AbortController();
    controller.current = atual;
    setCarregando(true);
    setErro(null);
    try {
      const resultado = await carregar(atual.signal);
      if (ativo.current && !atual.signal.aborted) setDados(resultado);
    } catch (falha) {
      if (ativo.current && !atual.signal.aborted && !foiCancelado(falha)) setErro(mensagemErro(falha, contexto));
    } finally {
      if (ativo.current && !atual.signal.aborted) setCarregando(false);
    }
  }, [carregar, contexto]);

  useFocusEffect(useCallback(() => {
    ativo.current = true;
    setDados(null);
    void atualizar();
    return () => { ativo.current = false; controller.current?.abort(); };
  }, [atualizar]));

  const confirmarDados = useCallback((confirmados: T) => {
    if (ativo.current) {
      controller.current?.abort();
      setDados(confirmados);
      setCarregando(false);
    }
  }, []);

  return { dados, carregando, erro, atualizar, confirmarDados };
}
