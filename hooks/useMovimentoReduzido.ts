import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useMovimentoReduzido() {
  const [reduzido, setReduzido] = useState(true);
  useEffect(() => {
    let ativo = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(valor => { if (ativo) setReduzido(valor); }, () => { if (ativo) setReduzido(true); });
    const evento = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduzido);
    return () => { ativo = false; evento.remove(); };
  }, []);
  return reduzido;
}
