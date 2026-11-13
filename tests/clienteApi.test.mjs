import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AxiosError, AxiosHeaders } from 'axios';
import { criarClienteApi, SessaoInvalidaError } from '../lib/clienteApi.ts';
import { RespostaInvalidaError } from '../lib/contratos.ts';

const produto = { id: 1, nome: 'Produto de teste', preco: 10, quantidade: 9 };
const sessao = (id = 1) => ({ id, nome: 'Teste', email: 'teste@example.invalid', token: 'token-de-teste-' + id, expiraEm: new Date(Date.now() + 1800000).toISOString() });
const resposta = (config, data, status = 200) => ({ config, data, status, statusText: 'Teste', headers: new AxiosHeaders() });
function falha(config, status) { return new AxiosError('Falha de teste', 'ERR_BAD_RESPONSE', config, undefined, resposta(config, {}, status)); }
function porta() { let resolver; const promise = new Promise(resolve => { resolver = resolve; }); return { promise, resolver }; }

test('somente alterações confirmadas invalidam leitores de resumo e histórico', async () => {
  const cliente = criarClienteApi('http://sail.test', 'invalida-teste');
  cliente.definirSessao(sessao());
  let notificacoes = 0;
  const remover = cliente.assinarEstoque(() => { notificacoes++; });
  cliente.http.defaults.adapter = async config => resposta(config, config.method === 'get' ? [produto] : produto);
  await cliente.http.get('/produtos');
  assert.equal(cliente.obterVersaoEstoque(), 0);
  await cliente.http.post('/produtos/1/vender', {}, { params: { quantidade: 1 } });
  assert.equal(cliente.obterVersaoEstoque(), 1);
  assert.equal(notificacoes, 1);
  cliente.http.defaults.adapter = async config => resposta(config, '<html>resposta inválida</html>');
  await assert.rejects(cliente.http.post('/produtos', {}), RespostaInvalidaError);
  cliente.http.defaults.adapter = async config => { throw falha(config, 500); };
  await assert.rejects(cliente.http.put('/produtos/1', {}));
  assert.equal(cliente.obterVersaoEstoque(), 1);
  assert.equal(notificacoes, 1);
  remover();
  cliente.http.defaults.adapter = async config => resposta(config, 'Produto removido do estoque com sucesso!');
  await cliente.http.delete('/produtos/1');
  assert.equal(cliente.obterVersaoEstoque(), 2);
  assert.equal(notificacoes, 1);
});

test('sem sessão não envia requisições protegidas', async () => {
  const cliente = criarClienteApi('http://sail.test', 'teste');
  let chamadas = 0;
  cliente.http.defaults.adapter = async config => { chamadas++; return resposta(config, []); };
  await assert.rejects(cliente.http.get('/produtos'), SessaoInvalidaError);
  assert.equal(chamadas, 0);
});

test('sessão autenticada define cabeçalhos a partir da identidade validada', async () => {
  const cliente = criarClienteApi('http://sail.test', 'teste');
  cliente.definirSessao(sessao());
  cliente.http.defaults.adapter = async config => {
    assert.equal(config.headers.get('Authorization'), 'Bearer token-de-teste-1');
    assert.equal(config.headers.get('usuarioId'), '1');
    return resposta(config, []);
  };
  await cliente.http.get('/produtos', { headers: { usuarioId: '999' } });
});

test('login público não envia credencial anterior nem trata senha incorreta como expiração', async () => {
  const cliente = criarClienteApi('http://sail.test', 'teste');
  cliente.definirSessao(sessao());
  cliente.http.defaults.adapter = async config => {
    assert.equal(config.headers.get('Authorization'), undefined);
    throw falha(config, 401);
  };
  await assert.rejects(cliente.http.post('/usuarios/login', {}));
  assert.equal(cliente.obterSessao().id, 1);
});

test('401 protegido encerra sessão e não repete requisição', async () => {
  const cliente = criarClienteApi('http://sail.test', 'teste');
  cliente.definirSessao(sessao());
  let chamadas = 0;
  cliente.http.defaults.adapter = async config => { chamadas++; throw falha(config, 401); };
  await assert.rejects(cliente.http.get('/produtos'));
  assert.equal(cliente.obterSessao(), null);
  assert.equal(chamadas, 1);
  assert.match(cliente.obterAvisoSessao(), /sessão expirou/);
});

test('resposta 401 antiga não encerra uma sessão mais recente', async () => {
  const cliente = criarClienteApi('http://sail.test', 'teste');
  cliente.definirSessao(sessao());
  const liberacao = porta();
  const iniciada = porta();
  cliente.http.defaults.adapter = async config => { iniciada.resolver(); await liberacao.promise; throw falha(config, 401); };
  const pendente = cliente.http.get('/produtos');
  await iniciada.promise;
  cliente.definirSessao(sessao(2));
  liberacao.resolver();
  await assert.rejects(pendente);
  assert.equal(cliente.obterSessao().id, 2);
});

test('resposta de sucesso antiga também não atualiza dados da nova sessão', async () => {
  const cliente = criarClienteApi('http://sail.test', 'teste');
  cliente.definirSessao(sessao());
  const liberacao = porta();
  const iniciada = porta();
  cliente.http.defaults.adapter = async config => { iniciada.resolver(); await liberacao.promise; return resposta(config, [produto]); };
  const pendente = cliente.http.get('/produtos');
  await iniciada.promise;
  cliente.definirSessao(sessao(2));
  liberacao.resolver();
  await assert.rejects(pendente, SessaoInvalidaError);
});

test('403 mantém a sessão para permitir outras operações autorizadas', async () => {
  const cliente = criarClienteApi('http://sail.test', 'teste');
  cliente.definirSessao(sessao());
  cliente.http.defaults.adapter = async config => { throw falha(config, 403); };
  await assert.rejects(cliente.http.get('/produtos'));
  assert.equal(cliente.obterSessao().id, 1);
});

test('timeout conserva identificação para repetição manual segura', async () => {
  const cliente = criarClienteApi('http://sail.test', 'teste');
  cliente.definirSessao(sessao());
  const chaves = [];
  cliente.http.defaults.adapter = async config => {
    chaves.push(config.headers.get('Idempotency-Key'));
    if (chaves.length === 1) throw new AxiosError('Timeout de teste', 'ECONNABORTED', config);
    return resposta(config, produto);
  };
  await assert.rejects(cliente.http.post('/produtos/1/vender', {}, { params: { quantidade: 1 } }));
  await cliente.http.post('/produtos/1/vender', {}, { params: { quantidade: 1 } });
  await cliente.http.post('/produtos/1/vender', {}, { params: { quantidade: 1 } });
  assert.equal(chaves[0], chaves[1]);
  assert.notEqual(chaves[1], chaves[2]);
});

test('resposta inesperada não confirma operação nem perde a chave da tentativa', async () => {
  const cliente = criarClienteApi('http://sail.test', 'teste');
  cliente.definirSessao(sessao());
  const chaves = [];
  cliente.http.defaults.adapter = async config => {
    chaves.push(config.headers.get('Idempotency-Key'));
    return resposta(config, chaves.length === 1 ? {} : produto);
  };
  await assert.rejects(cliente.http.post('/produtos', { nome: 'Teste', quantidade: 1, preco: 1 }), RespostaInvalidaError);
  await cliente.http.post('/produtos', { nome: 'Teste', quantidade: 1, preco: 1 });
  assert.equal(chaves[0], chaves[1]);
});

test('envios iguais simultâneos compartilham identificação no servidor', async () => {
  const cliente = criarClienteApi('http://sail.test', 'teste');
  cliente.definirSessao(sessao());
  const chaves = [];
  const liberacao = porta();
  const iniciadas = porta();
  cliente.http.defaults.adapter = async config => {
    chaves.push(config.headers.get('Idempotency-Key'));
    if (chaves.length === 2) iniciadas.resolver();
    await liberacao.promise;
    return resposta(config, produto);
  };
  const primeira = cliente.http.post('/produtos', { nome: 'Teste', quantidade: 1, preco: 1 });
  const segunda = cliente.http.post('/produtos', { nome: 'Teste', quantidade: 1, preco: 1 });
  await iniciadas.promise;
  assert.equal(chaves[0], chaves[1]);
  liberacao.resolver();
  await Promise.all([primeira, segunda]);
});

test('listagem e exclusão com respostas incompatíveis falham explicitamente', async () => {
  const cliente = criarClienteApi('http://sail.test', 'teste');
  cliente.definirSessao(sessao());
  cliente.http.defaults.adapter = async config => resposta(config, '<html>não é uma resposta da API</html>');
  await assert.rejects(cliente.http.get('/produtos'), RespostaInvalidaError);
  await assert.rejects(cliente.http.delete('/produtos/1'), RespostaInvalidaError);
});

test('sessão expirada é rejeitada antes do envio e URLs externas não recebem credenciais', async t => {
  const cliente = criarClienteApi('http://sail.test', 'teste');
  const atual = sessao();
  cliente.definirSessao(atual);
  let chamadas = 0;
  cliente.http.defaults.adapter = async config => { chamadas++; return resposta(config, []); };
  await assert.rejects(cliente.http.get('https://outro.test/produtos'), /Destino/);
  t.mock.method(Date, 'now', () => Date.parse(atual.expiraEm) + 1);
  await assert.rejects(cliente.http.get('/produtos'), SessaoInvalidaError);
  assert.equal(chamadas, 0);
});
