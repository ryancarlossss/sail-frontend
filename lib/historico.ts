import type { Registro } from './contratos.ts';
import { periodoVendas } from './estoque.ts';

export function periodoHistoricoInicial(mes: unknown, ano: unknown, referencia = new Date()) {
  if (typeof mes === 'string' && /^\d{1,2}$/.test(mes) && typeof ano === 'string' && /^\d{1,4}$/.test(ano)) {
    const periodo = { mes: Number(mes), ano: Number(ano) };
    if (periodo.mes >= 1 && periodo.mes <= 12 && periodo.ano >= 1 && periodo.ano <= 9999) return periodo;
  }
  return periodoVendas(0, referencia);
}

export function descreverMovimentacao(registro: Pick<Registro, 'acao' | 'quantidade'>) {
  const quantidade = registro.quantidade.toLocaleString('pt-BR');
  if (registro.acao === 'VENDA') return 'Saída por venda: ' + quantidade + ' unidade(s)';
  if (registro.acao === 'CADASTRO') return 'Saldo inicial: ' + quantidade + ' unidade(s)';
  if (registro.acao === 'AJUSTE') {
    if (registro.quantidade === 0) return 'Ajuste sem alteração de saldo';
    return (registro.quantidade > 0 ? 'Entrada por ajuste: ' : 'Saída por ajuste: ')
      + Math.abs(registro.quantidade).toLocaleString('pt-BR') + ' unidade(s)';
  }
  if (registro.acao === 'EDICAO') return 'Informações do produto atualizadas';
  if (registro.acao === 'ARQUIVAMENTO') return 'Produto removido do estoque';
  return 'Quantidade registrada: ' + quantidade;
}
