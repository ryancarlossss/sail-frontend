import { useSyncExternalStore } from 'react';
import { cliente } from '../lib/api';

export function useVersaoEstoque() {
  return useSyncExternalStore(cliente.assinarEstoque, cliente.obterVersaoEstoque, () => 0);
}
