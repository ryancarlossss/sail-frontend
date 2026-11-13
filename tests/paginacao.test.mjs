import { test, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { AxiosHeaders } from 'axios';
import { criarClienteApi } from '../lib/clienteApi.ts';
import { criarServicoProdutos } from '../services/produtos.ts';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: dom.window.navigator });
const { renderHook, act, cleanup, waitFor } = await import('@testing-library/react');
const { useListaPaginada } = await import('../hooks/useListaPaginada.ts');
const { useMovimentacoesEstoque } = await import('../hooks/useMovimentacoesEstoque.ts');
const { useCallback, useEffect } = await import('react');
afterEach(cleanup);
after(() => dom.window.close());

function pendente() { let resolver; let rejeitar; const promise = new Promise((resolve, reject) => { resolver = resolve; rejeitar = reject; }); return { promise, resolver, rejeitar }; }
const item = (id, quantidade = 10) => ({ id, nome: 'Produto ' + id, preco: 12.5, quantidade });
const pagina = (itens, proximoCursor = null) => ({ itens, proximoCursor });

test('lista busca uma página inicial e agrupa acionamentos repetidos', async () => {
  const envio = pendente();
  let chamadas = 0;
  const carregar = async cursor => { chamadas++; assert.equal(cursor, null); return envio.promise; };
  const { result } = renderHook(() => useListaPaginada(carregar, 'listagem'));
  let primeira;
  act(() => { primeira = result.current.iniciar(); void result.current.atualizar(); });
  assert.equal(chamadas, 1);
  assert.equal(result.current.carregando, true);
  await act(async () => { envio.resolver(pagina([item(3)], '3')); await primeira; });
  assert.deepEqual(result.current.dados, [item(3)]);
  assert.equal(result.current.temMais, true);
  assert.equal(result.current.carregado, true);
});

test('fim da lista envia uma única próxima página e não duplica itens', async () => {
  const envio = pendente();
  const cursores = [];
  const carregar = async cursor => { cursores.push(cursor); return cursor === null ? pagina([item(3)], '3') : envio.promise; };
  const { result } = renderHook(() => useListaPaginada(carregar, 'listagem'));
  await act(async () => { await result.current.iniciar(); });
  let primeira;
  act(() => { primeira = result.current.carregarProxima(); void result.current.carregarProxima(); });
  assert.deepEqual(cursores, [null, '3']);
  await act(async () => { envio.resolver(pagina([item(3), item(2), item(2), item(1)])); await primeira; });
  assert.deepEqual(result.current.dados.map(item => item.id), [3, 2, 1]);
  assert.equal(result.current.temMais, false);
  await act(async () => { await result.current.carregarProxima(); });
  assert.equal(cursores.length, 2);
});

test('falha de paginação conserva dados e exige tentativa explícita', async () => {
  const cursores = [];
  let falhar = true;
  const carregar = async cursor => {
    cursores.push(cursor);
    if (cursor === null) return pagina([item(2)], '2');
    if (falhar) throw new Error('Falha de conexão simulada');
    return pagina([item(1)]);
  };
  const { result } = renderHook(() => useListaPaginada(carregar, 'listagem'));
  await act(async () => { await result.current.iniciar(); await result.current.carregarProxima(); });
  assert.ok(result.current.erroMais);
  assert.deepEqual(result.current.dados, [item(2)]);
  await act(async () => { await result.current.carregarProxima(); });
  assert.deepEqual(cursores, [null, '2']);
  falhar = false;
  await act(async () => { await result.current.tentarProxima(); });
  assert.deepEqual(cursores, [null, '2', '2']);
  assert.deepEqual(result.current.dados, [item(2), item(1)]);
  assert.equal(result.current.erroMais, null);
});

test('atualizar cancela página antiga e descarta sua resposta atrasada', async () => {
  const envio = pendente();
  let sinal;
  let leituras = 0;
  const carregar = async (cursor, signal) => {
    if (cursor !== null) { sinal = signal; return envio.promise; }
    return pagina([item(++leituras === 1 ? 2 : 4)], 'novo-' + leituras);
  };
  const { result } = renderHook(() => useListaPaginada(carregar, 'listagem'));
  await act(async () => { await result.current.iniciar(); });
  let antiga;
  act(() => { antiga = result.current.carregarProxima(); });
  await act(async () => { await result.current.atualizar(); });
  assert.equal(sinal.aborted, true);
  await act(async () => { envio.resolver(pagina([item(1)])); await antiga; });
  assert.deepEqual(result.current.dados, [item(4)]);
  assert.equal(result.current.carregandoMais, false);
});

test('venda confirmada durante consulta não é sobrescrita por saldo antigo', async () => {
  const envio = pendente();
  const carregar = async () => envio.promise;
  const { result } = renderHook(() => useListaPaginada(carregar, 'listagem'));
  let leitura;
  act(() => { leitura = result.current.iniciar(); result.current.confirmarItem(1, item(1, 8)); });
  await act(async () => { envio.resolver(pagina([item(1, 10)])); await leitura; });
  assert.deepEqual(result.current.dados, [item(1, 8)]);
});

test('exclusão confirmada não reaparece quando uma página pendente chega', async () => {
  const envio = pendente();
  const carregar = async cursor => cursor === null ? pagina([item(3)], '3') : envio.promise;
  const { result } = renderHook(() => useListaPaginada(carregar, 'listagem'));
  await act(async () => { await result.current.iniciar(); });
  let leitura;
  act(() => { leitura = result.current.carregarProxima(); result.current.confirmarItem(2, null); });
  await act(async () => { envio.resolver(pagina([item(2), item(1)])); await leitura; });
  assert.deepEqual(result.current.dados.map(item => item.id), [3, 1]);
});

test('nova leitura após venda pode receber uma alteração mais recente do servidor', async () => {
  let quantidade = 10;
  const carregar = async () => pagina([item(1, quantidade)]);
  const { result } = renderHook(() => useListaPaginada(carregar, 'listagem'));
  await act(async () => { await result.current.iniciar(); });
  act(() => result.current.confirmarItem(1, item(1, 8)));
  quantidade = 5;
  await act(async () => { await result.current.atualizar(); });
  assert.deepEqual(result.current.dados, [item(1, 5)]);
});

test('perder foco cancela requisições e voltar não apresenta dados da visita anterior', async () => {
  const envio = pendente();
  let sinal;
  const carregar = async (cursor, signal) => { if (cursor === null) return pagina([item(2)], '2'); sinal = signal; return envio.promise; };
  const { result } = renderHook(() => useListaPaginada(carregar, 'listagem'));
  await act(async () => { await result.current.iniciar(); });
  let antiga;
  act(() => { antiga = result.current.carregarProxima(); result.current.parar(); });
  assert.equal(sinal.aborted, true);
  await act(async () => { envio.resolver(pagina([item(1)])); await antiga; });
  assert.deepEqual(result.current.dados, [item(2)]);
  await act(async () => { await result.current.iniciar(); });
  assert.deepEqual(result.current.dados, [item(2)]);
});

test('desmontagem cancela consulta inicial e não aplica resposta posterior', async () => {
  const envio = pendente();
  let sinal;
  const carregar = async (_cursor, signal) => { sinal = signal; return envio.promise; };
  const { result, unmount } = renderHook(() => useListaPaginada(carregar, 'listagem'));
  let leitura;
  act(() => { leitura = result.current.iniciar(); });
  unmount();
  assert.equal(sinal.aborted, true);
  envio.resolver(pagina([item(1)]));
  await leitura;
  assert.deepEqual(result.current.dados, []);
});

test('cursor repetido é tratado como resposta inválida sem repetir automaticamente', async () => {
  let chamadas = 0;
  const carregar = async () => { chamadas++; return pagina([item(2)], '2'); };
  const { result } = renderHook(() => useListaPaginada(carregar, 'listagem'));
  await act(async () => { await result.current.iniciar(); await result.current.carregarProxima(); });
  assert.ok(result.current.erroMais);
  await act(async () => { await result.current.carregarProxima(); });
  assert.equal(chamadas, 2);
  assert.deepEqual(result.current.dados, [item(2)]);
});

test('falha inicial não inventa dados e uma nova tentativa recupera a lista', async () => {
  let falhar = true;
  const carregar = async () => { if (falhar) throw new Error('Falha simulada'); return pagina([item(1)]); };
  const { result } = renderHook(() => useListaPaginada(carregar, 'listagem'));
  await act(async () => { await result.current.iniciar(); });
  assert.ok(result.current.erro);
  assert.equal(result.current.carregando, false);
  assert.equal(result.current.carregado, false);
  assert.deepEqual(result.current.dados, []);
  falhar = false;
  await act(async () => { await result.current.atualizar(); });
  assert.equal(result.current.erro, null);
  assert.deepEqual(result.current.dados, [item(1)]);
});

test('voltar à tela aguarda dados novos sem mostrar saldos da visita anterior', async () => {
  const envio = pendente();
  let leituras = 0;
  const carregar = async () => ++leituras === 1 ? pagina([item(1, 10)]) : envio.promise;
  const { result } = renderHook(() => useListaPaginada(carregar, 'listagem'));
  await act(async () => { await result.current.iniciar(); });
  act(() => result.current.parar());
  let retorno;
  act(() => { retorno = result.current.iniciar(); });
  assert.deepEqual(result.current.dados, []);
  assert.equal(result.current.carregando, true);
  await act(async () => { envio.resolver(pagina([item(1, 8)])); await retorno; });
  assert.deepEqual(result.current.dados, [item(1, 8)]);
});

test('StrictMode cancela a primeira consulta sem liberar ou substituir a segunda', async () => {
  const envios = [];
  const promessas = [];
  const carregar = async (_cursor, signal) => { const envio = pendente(); envios.push({ ...envio, signal }); return envio.promise; };
  const { result } = renderHook(() => {
    const lista = useListaPaginada(carregar, 'listagem');
    useEffect(() => { promessas.push(lista.iniciar()); return lista.parar; }, [lista.iniciar, lista.parar]);
    return lista;
  }, { reactStrictMode: true });
  assert.equal(envios.length, 2);
  assert.equal(envios[0].signal.aborted, true);
  await act(async () => { envios[0].resolver(pagina([item(1, 10)])); await promessas[0]; });
  assert.equal(result.current.carregando, true);
  assert.deepEqual(result.current.dados, []);
  await act(async () => { envios[1].resolver(pagina([item(1, 8)])); await promessas[1]; });
  assert.deepEqual(result.current.dados, [item(1, 8)]);
  assert.equal(result.current.carregando, false);
});

test('1200 produtos são lidos em lotes e venda e exclusão confirmadas dispensam outra listagem', async () => {
  let estoque = Array.from({ length: 1200 }, (_, indice) => item(1200 - indice));
  const cliente = criarClienteApi('http://sail.test', 'paginacao-integracao');
  cliente.definirSessao({ id: 1, nome: 'Teste', email: 'teste@example.invalid', token: 'token-de-teste', expiraEm: new Date(Date.now() + 1800000).toISOString() });
  const chamadas = [];
  cliente.http.defaults.adapter = async config => {
    chamadas.push([config.method, config.url]);
    assert.equal(config.headers.get('Authorization'), 'Bearer token-de-teste');
    let data;
    if (config.url === '/produtos/pagina') {
      assert.equal(config.params.tamanho, 50);
      const lote = estoque.filter(produto => !config.params.antesDe || produto.id < Number(config.params.antesDe)).slice(0, 51);
      data = pagina(lote.slice(0, 50), lote.length > 50 ? String(lote[49].id) : null);
    } else if (config.method === 'get' && /^\/produtos\/\d+$/.test(config.url)) {
      data = estoque.find(produto => produto.id === Number(config.url.split('/')[2]));
    } else if (config.method === 'post') {
      const id = Number(config.url.split('/')[2]);
      const atual = estoque.find(produto => produto.id === id);
      atual.quantidade -= config.params.quantidade;
      data = atual;
    } else if (config.method === 'delete') {
      estoque = estoque.filter(produto => produto.id !== Number(config.url.split('/')[2]));
      data = 'Produto removido do estoque com sucesso!';
    } else throw new Error('Requisição inesperada no teste');
    return { config, data, status: 200, statusText: 'OK', headers: new AxiosHeaders({ etag: '"versao-1"' }) };
  };
  const servico = criarServicoProdutos(cliente.http);
  const { result } = renderHook(() => {
    const consulta = useListaPaginada(servico.listarPagina, 'listagem');
    const confirmarItem = consulta.confirmarItem;
    const aoVender = useCallback(async produto => { confirmarItem(produto.id, produto); }, [confirmarItem]);
    const aoExcluir = useCallback(async id => { confirmarItem(id, null); }, [confirmarItem]);
    const movimentos = useMovimentacoesEstoque(servico, { aoVender, aoExcluir });
    return { consulta, movimentos };
  });
  await act(async () => { await result.current.consulta.iniciar(); });
  assert.equal(result.current.consulta.dados.length, 50);
  await act(async () => { await result.current.consulta.carregarProxima(); });
  assert.equal(result.current.consulta.dados.length, 100);
  const outraLinha = result.current.consulta.dados[1];
  const abrir = result.current.movimentos.abrirModalVenda;
  const excluir = result.current.movimentos.excluir;
  act(() => { abrir(result.current.consulta.dados[0]); result.current.movimentos.setQtdVenda('2'); });
  await waitFor(() => assert.equal(result.current.movimentos.vendaPronta, true));
  assert.equal(result.current.movimentos.abrirModalVenda, abrir);
  assert.equal(result.current.movimentos.excluir, excluir);
  await act(async () => { await result.current.movimentos.confirmarVenda(); });
  assert.equal(result.current.consulta.dados[0].quantidade, 8);
  assert.equal(result.current.consulta.dados[1], outraLinha);
  assert.equal(chamadas.filter(([metodo, rota]) => metodo === 'get' && rota === '/produtos/pagina').length, 2);
  assert.equal(chamadas.filter(([metodo, rota]) => metodo === 'get' && rota === '/produtos/1200').length, 1);
  await act(async () => { await result.current.movimentos.excluir(1200); });
  assert.equal(result.current.consulta.dados.length, 99);
  assert.equal(chamadas.filter(([metodo, rota]) => metodo === 'get' && rota === '/produtos/pagina').length, 2);
  assert.equal(cliente.obterVersaoEstoque(), 2);
  await act(async () => { await result.current.consulta.carregarProxima(); });
  assert.equal(result.current.consulta.dados.length, 149);
  assert.equal(new Set(result.current.consulta.dados.map(item => item.id)).size, 149);
});
