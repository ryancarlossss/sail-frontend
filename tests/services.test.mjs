import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AxiosHeaders } from 'axios';
import { criarClienteApi } from '../lib/clienteApi.ts';
import { criarServicoProdutos } from '../services/produtos.ts';
import { criarServicoUsuarios } from '../services/usuarios.ts';
import { criarServicoHistorico } from '../services/historico.ts';
import { RespostaInvalidaError } from '../lib/contratos.ts';

const produto = { id: 1, nome: 'Produto', quantidade: 8, preco: 12.5 };
const dados = { nome: produto.nome, quantidade: produto.quantidade, preco: produto.preco };
const sessao = { id: 1, nome: 'Teste', email: 'teste@example.invalid', token: 'token-de-teste', expiraEm: new Date(Date.now() + 1800000).toISOString() };

function preparar(responder) {
  const cliente = criarClienteApi('http://sail.test', 'servicos-teste');
  cliente.definirSessao(sessao);
  cliente.http.defaults.adapter = async config => ({ config, status: 200, statusText: 'OK', headers: new AxiosHeaders({ etag: '"versao-1"' }), data: await responder(config) });
  return cliente.http;
}

test('serviço de produtos preserva rotas, métodos, corpo, versão e quantidade', async () => {
  const chamadas = [];
  const controller = new AbortController();
  const http = preparar(config => {
    chamadas.push(config);
    if (config.method === 'delete') return 'Produto removido do estoque com sucesso!';
    return config.url === '/produtos' && config.method === 'get' ? [produto] : produto;
  });
  const servico = criarServicoProdutos(http);
  assert.deepEqual(await servico.listar(controller.signal), [{ ...produto, imagem: undefined }]);
  assert.deepEqual(await servico.obter(1, controller.signal), { produto: { ...produto, imagem: undefined }, versao: '"versao-1"' });
  await servico.cadastrar(dados, controller.signal);
  await servico.atualizar(1, dados, '"versao-1"', controller.signal);
  await servico.vender(1, 2, controller.signal);
  assert.equal(await servico.excluir(1, controller.signal), undefined);
  assert.deepEqual(chamadas.map(({ method, url }) => [method, url]), [
    ['get', '/produtos'], ['get', '/produtos/1'], ['post', '/produtos'],
    ['put', '/produtos/1'], ['post', '/produtos/1/vender'], ['delete', '/produtos/1'],
  ]);
  assert.deepEqual(JSON.parse(chamadas[2].data), dados);
  assert.deepEqual(JSON.parse(chamadas[3].data), dados);
  assert.equal(chamadas[3].headers.get('If-Match'), '"versao-1"');
  assert.deepEqual(chamadas[4].params, { quantidade: 2 });
  assert.ok(chamadas[2].headers.get('Idempotency-Key'));
  assert.ok(chamadas[4].headers.get('Idempotency-Key'));
  assert.ok(chamadas.every(config => config.signal === controller.signal));
});

test('leitura sem versão não permite iniciar edição sem proteção', async () => {
  const http = preparar(() => produto);
  http.defaults.adapter = async config => ({ config, status: 200, statusText: 'OK', headers: new AxiosHeaders(), data: produto });
  await assert.rejects(criarServicoProdutos(http).obter(1), RespostaInvalidaError);
});

test('venda envia a versão efetivamente revisada pelo usuário', async () => {
  const servico = criarServicoProdutos(preparar(config => {
    assert.equal(config.url, '/produtos/1/vender');
    assert.equal(config.headers.get('If-Match'), '"preco-revisado"');
    assert.ok(config.headers.get('Idempotency-Key'));
    return produto;
  }));
  await servico.vender(1, 2, undefined, '"preco-revisado"');
});

test('serviço de usuários mantém os contratos públicos sem anexar token', async () => {
  const chamadas = [];
  const servico = criarServicoUsuarios(preparar(config => {
    chamadas.push(config);
    assert.equal(config.headers.get('Authorization'), undefined);
    return config.url.endsWith('/login') ? sessao : { id: 1, nome: sessao.nome, email: sessao.email };
  }));
  const credenciais = { email: sessao.email, senha: 'Senha exclusiva de teste' };
  assert.deepEqual(await servico.entrar(credenciais), sessao);
  assert.equal((await servico.cadastrar({ nome: sessao.nome, ...credenciais })).id, 1);
  assert.deepEqual(chamadas.map(config => config.url), ['/usuarios/login', '/usuarios/cadastrar']);
  assert.deepEqual(JSON.parse(chamadas[0].data), credenciais);
});

test('serviço de histórico mantém o período solicitado e não inventa registros', async () => {
  const periodo = { mes: 10, ano: 2026 };
  const servico = criarServicoHistorico(preparar(config => {
    assert.equal(config.url, '/historico');
    assert.deepEqual(config.params, periodo);
    return { totalDoMes: 0, lancamentos: [] };
  }));
  assert.deepEqual(await servico.listar(periodo), { totalDoMes: 0, lancamentos: [] });
});

test('paginação de produtos limita os lotes e transporta cursor e cancelamento', async () => {
  const controller = new AbortController();
  const chamadas = [];
  const servico = criarServicoProdutos(preparar(config => {
    chamadas.push(config);
    return { itens: [produto], proximoCursor: '1' };
  }));
  assert.equal((await servico.listarPagina(null, controller.signal)).itens.length, 1);
  await servico.listarPagina('1', controller.signal);
  assert.deepEqual(chamadas.map(config => config.params), [{ tamanho: 50, antesDe: undefined }, { tamanho: 50, antesDe: '1' }]);
  assert.ok(chamadas.every(config => config.url === '/produtos/pagina' && config.signal === controller.signal));
});

test('perfil recebe somente resumo agregado com números validados', async () => {
  const servico = criarServicoProdutos(preparar(config => {
    assert.equal(config.url, '/produtos/resumo');
    return { quantidadeProdutos: 1200, valorEstoque: 150000 };
  }));
  assert.deepEqual(await servico.resumo(), { quantidadeProdutos: 1200, valorEstoque: 150000 });
});

test('histórico paginado preserva período, cursor e total do período', async () => {
  const servico = criarServicoHistorico(preparar(config => {
    assert.equal(config.url, '/historico/pagina');
    assert.deepEqual(config.params, { mes: 6, ano: 1888, tamanho: 50, cursor: 'cursor-teste' });
    return { itens: [], totalDoMes: 30000, proximoCursor: null };
  }));
  assert.deepEqual(await servico.listarPagina({ mes: 6, ano: 1888 }, 'cursor-teste'), { itens: [], totalDoMes: 30000, proximoCursor: null });
});

test('card de vendas solicita apenas um registro para obter o total real do período', async () => {
  const servico = criarServicoHistorico(preparar(config => {
    assert.equal(config.url, '/historico/pagina');
    assert.deepEqual(config.params, { mes: 10, ano: 2026, tamanho: 1 });
    return { itens: [{ id: 1, acao: 'VENDA', quantidade: 1, dataHora: '2026-10-01T12:00:00', usuario: null, produto }], totalDoMes: 1250, proximoCursor: null };
  }));
  assert.equal(await servico.totalPeriodo({ mes: 10, ano: 2026 }), 1250);
});

test('respostas paginadas inesperadas não são apresentadas como uma lista válida', async () => {
  for (const dados of [[], {}, { itens: [produto] }, { itens: [], proximoCursor: '1' }, { itens: [produto], proximoCursor: '2' }, { itens: [produto, produto], proximoCursor: null }]) {
    const servico = criarServicoProdutos(preparar(() => dados));
    await assert.rejects(servico.listarPagina(null), RespostaInvalidaError);
  }
  await assert.rejects(criarServicoProdutos(preparar(() => ({ quantidadeProdutos: '1200', valorEstoque: 150000 }))).resumo(), RespostaInvalidaError);
});
