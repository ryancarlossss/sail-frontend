import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useListaPaginada } from './useListaPaginada';
import type { Pagina } from '../lib/contratos';
import type { ContextoErro } from '../lib/erros';

export function useListaPaginadaEmFoco<T extends { id: number }>(carregar: (cursor: string | null, signal: AbortSignal) => Promise<Pagina<T>>, contexto: ContextoErro) {
  const consulta = useListaPaginada(carregar, contexto);
  const { iniciar, parar } = consulta;
  useFocusEffect(useCallback(() => {
    void iniciar();
    return parar;
  }, [iniciar, parar]));
  return consulta;
}
