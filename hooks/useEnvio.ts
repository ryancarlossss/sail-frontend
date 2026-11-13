import { useCallback, useEffect, useRef, useState } from 'react';

export function useEnvio() {
  const montado = useRef(true);
  const pendente = useRef<AbortController | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    montado.current = true;
    if (!pendente.current) setEnviando(false);
    return () => {
      montado.current = false;
      pendente.current?.abort();
      pendente.current = null;
    };
  }, []);

  const executar = useCallback(async <T,>(tarefa: (signal: AbortSignal) => Promise<T>): Promise<T | undefined> => {
    if (pendente.current || !montado.current) return undefined;
    const controller = new AbortController();
    pendente.current = controller;
    setEnviando(true);
    try {
      const resultado = await tarefa(controller.signal);
      return montado.current && !controller.signal.aborted ? resultado : undefined;
    } finally {
      if (pendente.current === controller) {
        pendente.current = null;
        if (montado.current) setEnviando(false);
      }
    }
  }, []);

  const estaAtivo = useCallback(() => montado.current, []);
  const estaEnviando = useCallback(() => pendente.current !== null, []);
  return { enviando, executar, estaAtivo, estaEnviando };
}
