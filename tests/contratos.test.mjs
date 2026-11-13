import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RespostaInvalidaError, validarProdutos, validarHistorico, validarProduto, validarSessao, validarUsuario } from '../lib/contratos.ts';
import { validarCadastro, validarFormularioProduto } from '../lib/validacao.ts';
import { camposErro, mensagemErro } from '../lib/erros.ts';

const produto = { id: 1, nome: 'Produto & teste', preco: 12.5, quantidade: 10 };

test('lista e histórico vazios são resultados válidos', () => {
  assert.deepEqual(validarProdutos([]), []);
  assert.deepEqual(validarHistorico({ totalDoMes: 0, lancamentos: [] }), { totalDoMes: 0, lancamentos: [] });
});

for (const entrada of [null, {}, 'HTML inesperado', { produtos: [] }, [null], [{ ...produto, quantidade: '10' }]]) {
  test(`rejeita formato inesperado na listagem: ${JSON.stringify(entrada)}`, () => {
    assert.throws(() => validarProdutos(entrada), RespostaInvalidaError);
  });
}

test('dados legados inválidos continuam legíveis para permitir correção explícita', () => {
  const legado = validarProduto({ ...produto, nome: '', quantidade: -2, preco: -1 });
  assert.equal(legado.quantidade, -2);
  assert.equal(legado.nome, '');
  assert.ok(validarFormularioProduto(legado.nome, String(legado.preco), String(legado.quantidade)).campos);
});

test('resumos não propagam senha nem campos internos', () => {
  const usuario = validarUsuario({ id: 1, nome: 'Teste', email: 'teste@example.invalid', senha: 'não propagar' });
  assert.equal('senha' in usuario, false);
  const dados = validarProduto({ ...produto, criadoPor: { senha: 'não propagar' }, ativo: true });
  assert.equal('criadoPor' in dados, false);
  assert.equal('ativo' in dados, false);
});

test('sessão exige token e validade futura', () => {
  const usuario = { id: 1, nome: 'Teste', email: 'teste@example.invalid' };
  assert.throws(() => validarSessao(usuario), RespostaInvalidaError);
  assert.throws(() => validarSessao({ ...usuario, token: 'teste', expiraEm: '2000-01-01T00:00:00Z' }), RespostaInvalidaError);
  assert.throws(() => validarSessao({ ...usuario, token: 'teste', expiraEm: 'data inválida' }), RespostaInvalidaError);
});

test('histórico preserva ajustes negativos, ator ausente e registros reais', () => {
  const dados = validarHistorico({ totalDoMes: 0, lancamentos: [{ id: 1, acao: 'AJUSTE', quantidade: -2, dataHora: '2026-10-29T10:00:00', usuario: null, produto }] });
  assert.equal(dados.lancamentos[0].quantidade, -2);
  assert.equal(dados.lancamentos[0].usuario, null);
});

test('histórico inválido não é convertido em registros demonstrativos', () => {
  assert.throws(() => validarHistorico({ lancamentos: 'inesperado' }), RespostaInvalidaError);
  assert.throws(() => validarHistorico({ totalDoMes: 0, lancamentos: [{ id: 1, acao: 'VENDA', quantidade: 1, dataHora: 'inválida', usuario: null, produto }] }), RespostaInvalidaError);
});

for (const [entrada, esperado] of [['0', 0], ['10,50', 10.5], ['10.50', 10.5], ['1.234,56', 1234.56], ['1.234', 1234], ['1.234.567,89', 1234567.89]]) {
  test(`preço brasileiro é interpretado integralmente: ${entrada}`, () => {
    assert.equal(validarFormularioProduto(' Produto ', entrada, '0').dados.preco, esperado);
  });
}

for (const entrada of ['', 'abc', '1e3', '-1', '1,234', '1.2.3', 'Infinity', '1000000000000']) {
  test(`rejeita preço inválido sem conversão parcial: ${entrada}`, () => {
    assert.ok(validarFormularioProduto('Produto', entrada, '1').campos.preco);
  });
}

for (const entrada of ['', '-1', '1.5', '2abc', '1e2', '2147483648']) {
  test(`rejeita estoque inválido: ${entrada}`, () => {
    assert.ok(validarFormularioProduto('Produto', '1', entrada).campos.quantidade);
  });
}

test('nome e cadastro são validados antes do envio', () => {
  assert.ok(validarFormularioProduto(' ', '1', '1').campos.nome);
  assert.ok(validarCadastro(' ', 'email inválido', 'curta').nome);
  assert.ok(validarCadastro('Nome', 'nome@example.invalid', 'curta').senha);
  assert.deepEqual(validarCadastro(' Nome ', 'nome@example.invalid', 'senha de teste'), {});
});

test('mensagens internas do servidor não são exibidas em falhas 500', () => {
  const erro = { isAxiosError: true, response: { status: 500, data: { mensagem: 'SQL interno e credencial' } } };
  for (const contexto of ['login', 'cadastro', 'produto', 'listagem', 'historico', 'venda', 'exclusao']) {
    assert.doesNotMatch(mensagemErro(erro, contexto), /SQL interno|credencial/);
  }
});

test('campos de validação são filtrados e erros de autorização são distinguíveis', () => {
  const erro = { isAxiosError: true, response: { status: 400, data: { campos: { nome: 'Informe nome.', interno: 'não exibir', senha: {} } } } };
  assert.deepEqual(camposErro(erro), { nome: 'Informe nome.' });
  assert.match(mensagemErro({ isAxiosError: true, response: { status: 403, data: {} } }, 'produto'), /permissão/);
  assert.match(mensagemErro({ isAxiosError: true, response: { status: 401, data: {} } }, 'listagem'), /sessão expirou/);
});
