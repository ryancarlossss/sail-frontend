import { mensagemErro } from './erros.ts';

type QuantidadeVenda = { quantidade: number; erro?: never } | { quantidade?: never; erro: string };

export function validarQuantidadeVenda(valor: string, saldo: number): QuantidadeVenda {
  const entrada = valor.trim();
  const quantidade = Number(entrada);

  if (!/^\d+$/.test(entrada) || !Number.isSafeInteger(quantidade) || quantidade <= 0 || quantidade > 2147483647) {
    return { erro: 'Informe uma quantidade inteira maior que zero.' };
  }

  if (quantidade > saldo) {
    return { erro: 'Estoque insuficiente para essa venda. Atualize o estoque se o saldo mudou.' };
  }

  return { quantidade };
}

export function obterMensagemErroEstoque(erro: unknown, operacao: 'listagem' | 'venda' | 'exclusao'): string {
  return mensagemErro(erro, operacao);
}

export function formatarTotalVenda(preco: number, quantidade: number): string | null {
  const centavosUnitarios = Math.round(preco * 100);
  if (!Number.isFinite(preco) || preco < 0 || preco >= 1000000000000 || Number(preco.toFixed(2)) !== preco || !Number.isSafeInteger(centavosUnitarios)
      || !Number.isSafeInteger(quantidade) || quantidade <= 0) return null;
  const centavos = BigInt(centavosUnitarios) * BigInt(quantidade);
  return 'R$\u00a0' + (centavos / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + (centavos % 100n).toString().padStart(2, '0');
}
