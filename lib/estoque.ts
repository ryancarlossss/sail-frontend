import type { Produto } from './contratos.ts';

export type FiltroEstoque = 'todos' | 'com-estoque' | 'sem-estoque';
export const rotulosFiltro: Record<FiltroEstoque, string> = { todos: 'Todos os produtos', 'com-estoque': 'Com estoque', 'sem-estoque': 'Sem estoque' };

function normalizar(valor: string) {
  return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('pt-BR');
}

export function filtrarProdutos(produtos: Produto[], busca: string, filtro: FiltroEstoque): Produto[] {
  const termo = normalizar(busca);
  return produtos.filter(produto => normalizar(produto.nome).includes(termo)
    && (filtro === 'todos' || (filtro === 'sem-estoque' ? produto.quantidade <= 0 : produto.quantidade > 0)));
}

export function periodoVendas(deslocamento: number, referencia = new Date()) {
  const data = new Date(referencia.getFullYear(), referencia.getMonth() - deslocamento, 1);
  return { mes: data.getMonth() + 1, ano: data.getFullYear() };
}

export function variacaoVendas(atual: number | null, anterior: number | null): number | null {
  if (atual === null || anterior === null || !Number.isFinite(atual) || !Number.isFinite(anterior) || anterior <= 0) return null;
  const variacao = (atual - anterior) / anterior * 100;
  return Number.isFinite(variacao) ? variacao : null;
}
