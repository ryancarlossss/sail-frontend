import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatarTotalVenda } from '../lib/venda.ts';
import { descreverMovimentacao, periodoHistoricoInicial } from '../lib/historico.ts';
import { validarHistorico, validarResumoEstoque, RespostaInvalidaError } from '../lib/contratos.ts';
import { resolverEnderecoApi } from '../lib/configuracaoApi.ts';

test('desenvolvimento acompanha a troca do IP do Expo sem reescrever a URL da API', () => {
  for (const host of ['192.168.0.100', '192.168.255.188', '10.0.2.2', '172.20.10.2', 'localhost']) {
    assert.equal(resolverEnderecoApi(undefined, host + ':8081', true, 'http://fallback.test'), 'http://' + host + ':8080');
  }
});

test('configuração explícita da API tem prioridade e metadados externos não substituem o destino', () => {
  assert.equal(resolverEnderecoApi(' https://api.sail.test ', '192.168.0.100:8081', true, 'http://fallback.test'), 'https://api.sail.test');
  for (const host of ['expo-tunnel.example.test:8081', '192.168.999.1:8081', '192.168.0.1@externo.test', '8.8.8.8:8081']) {
    assert.equal(resolverEnderecoApi(undefined, host, true, 'http://fallback.test'), 'http://fallback.test');
  }
  assert.equal(resolverEnderecoApi(undefined, '192.168.0.100:8081', false, 'https://api.sail.test'), 'https://api.sail.test');
});

test('prévia da venda preserva os centavos e aceita preço zero', () => {
  assert.equal(formatarTotalVenda(0.1, 3), 'R$\u00a00,30');
  assert.equal(formatarTotalVenda(12.5, 2), 'R$\u00a025,00');
  assert.equal(formatarTotalVenda(0, 2), 'R$\u00a00,00');
});

test('prévia mantém precisão mesmo quando o total excede os inteiros seguros', () => {
  assert.equal(formatarTotalVenda(999999999999.99, 10000), 'R$\u00a09.999.999.999.999.900,00');
  assert.equal(formatarTotalVenda(999999999999.99, 2147483647), 'R$\u00a02.147.483.646.999.978.525.163,53');
});

test('prévia não calcula total a partir de preço ou quantidade inválidos', () => {
  for (const [preco, quantidade] of [[NaN, 1], [Infinity, 1], [-1, 1], [1.234, 3], [1000000000000, 1], [1, 0], [1, 1.5], [1, Infinity]]) {
    assert.equal(formatarTotalVenda(preco, quantidade), null);
  }
});

test('indicadores aceitam a resposta anterior e validam a contagem global', () => {
  assert.deepEqual(validarResumoEstoque({ quantidadeProdutos: 1200, valorEstoque: 150000 }), { quantidadeProdutos: 1200, valorEstoque: 150000 });
  assert.deepEqual(validarResumoEstoque({ quantidadeProdutos: 1200, valorEstoque: 150000, quantidadeSemEstoque: 75 }),
    { quantidadeProdutos: 1200, valorEstoque: 150000, quantidadeSemEstoque: 75 });
  for (const quantidadeSemEstoque of [-1, 1.5, 1201, '1', NaN]) {
    assert.throws(() => validarResumoEstoque({ quantidadeProdutos: 1200, valorEstoque: 0, quantidadeSemEstoque }), RespostaInvalidaError);
  }
});

test('histórico usa o período do dashboard e trata parâmetros inválidos', () => {
  const referencia = new Date(2026, 0, 15);
  assert.deepEqual(periodoHistoricoInicial('12', '2025', referencia), { mes: 12, ano: 2025 });
  for (const [mes, ano] of [[undefined, undefined], ['13', '2026'], ['0', '0'], [['1'], '2026'], ['1', '0'], ['1abc', '2026']]) {
    assert.deepEqual(periodoHistoricoInicial(mes, ano, referencia), { mes: 1, ano: 2026 });
  }
});

test('histórico distingue saída, entrada e ajustes sem inventar movimentações', () => {
  assert.match(descreverMovimentacao({ acao: 'VENDA', quantidade: 2 }), /Saída por venda: 2/);
  assert.match(descreverMovimentacao({ acao: 'AJUSTE', quantidade: 3 }), /Entrada por ajuste: 3/);
  assert.match(descreverMovimentacao({ acao: 'AJUSTE', quantidade: -3 }), /Saída por ajuste: 3/);
  assert.match(descreverMovimentacao({ acao: 'AJUSTE', quantidade: 0 }), /sem alteração/);
  assert.match(descreverMovimentacao({ acao: 'CADASTRO', quantidade: 10 }), /Saldo inicial: 10/);
  assert.match(descreverMovimentacao({ acao: 'TIPO_LEGADO', quantidade: -7 }), /Quantidade registrada: -7/);
});

test('valor histórico vem do registro, mesmo que o preço atual do produto mude', () => {
  const registro = { id: 1, acao: 'VENDA', quantidade: 2, valorTotal: 25, dataHora: '2026-10-30T10:00:00', usuario: null,
    produto: { id: 1, nome: 'Produto', preco: 99, quantidade: 8 } };
  assert.equal(validarHistorico({ totalDoMes: 25, lancamentos: [registro] }).lancamentos[0].valorTotal, 25);
  const { valorTotal, ...legado } = registro;
  assert.equal(validarHistorico({ totalDoMes: 25, lancamentos: [legado] }).lancamentos[0].valorTotal, undefined);
  assert.throws(() => validarHistorico({ totalDoMes: 25, lancamentos: [{ ...registro, valorTotal: '25' }] }), RespostaInvalidaError);
});
