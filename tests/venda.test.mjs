import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validarQuantidadeVenda, obterMensagemErroEstoque } from '../lib/venda.ts';

for (const entrada of ['', ' ', '0', '-2', '1.5', '1,5', '2abc', '1e2', 'Infinity', 'NaN', '2147483648', '9007199254740993']) {
  test(`rejeita quantidade inválida: ${JSON.stringify(entrada)}`, () => {
    assert.equal(validarQuantidadeVenda(entrada, 10).erro, 'Informe uma quantidade inteira maior que zero.');
  });
}

test('aceita inteiro positivo com espaços nas extremidades', () => {
  assert.deepEqual(validarQuantidadeVenda(' 2 ', 10), { quantidade: 2 });
});

test('aceita venda de todo o saldo', () => {
  assert.deepEqual(validarQuantidadeVenda('10', 10), { quantidade: 10 });
});

test('rejeita venda maior que o saldo sem estoque negativo', () => {
  assert.match(validarQuantidadeVenda('11', 10).erro, /Estoque insuficiente/);
  assert.match(validarQuantidadeVenda('1', 0).erro, /Estoque insuficiente/);
});

test('mostra a rejeição de negócio retornada pela API', () => {
  const erro = { isAxiosError: true, response: { status: 400, data: { mensagem: 'Estoque insuficiente para essa venda.' } } };
  assert.equal(obterMensagemErroEstoque(erro, 'venda'), erro.response.data.mensagem);
});

test('trata 400 sem mensagem ou com mensagem inválida', () => {
  for (const data of [undefined, null, {}, '', { mensagem: '' }, { mensagem: {} }]) {
    assert.match(obterMensagemErroEstoque({ isAxiosError: true, response: { status: 400, data } }, 'venda'), /Confira a quantidade/);
  }
});

test('falha de servidor não expõe detalhes e não garante que a venda foi desfeita', () => {
  const erro = { isAxiosError: true, response: { status: 500, data: { mensagem: 'detalhe interno do banco' } } };
  const mensagem = obterMensagemErroEstoque(erro, 'venda');
  assert.match(mensagem, /Consulte o estoque e o histórico/);
  assert.doesNotMatch(mensagem, /detalhe interno/);
});

test('rede e timeout apresentam resultado incerto da venda', () => {
  for (const erro of [new Error('network'), { isAxiosError: true, code: 'ECONNABORTED' }]) {
    assert.match(obterMensagemErroEstoque(erro, 'venda'), /Não foi possível confirmar a venda/);
  }
});

test('falha na listagem oferece recuperação sem apresentar dados fictícios', () => {
  assert.match(obterMensagemErroEstoque(new Error(), 'listagem'), /atualizar o estoque/);
});

test('falha na exclusão não inventa uma restrição do banco', () => {
  assert.match(obterMensagemErroEstoque(new Error(), 'exclusao'), /Atualize o estoque/);
  assert.doesNotMatch(obterMensagemErroEstoque(new Error(), 'exclusao'), /MySQL|corromperia/);
});
