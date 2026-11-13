import { test, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: dom.window.navigator });
const { renderHook, act, cleanup, waitFor } = await import('@testing-library/react');
const { useListaPaginada } = await import('../hooks/useListaPaginada.ts');
const { useBuscaProdutos } = await import('../hooks/useBuscaProdutos.ts');
afterEach(cleanup);
after(() => dom.window.close());

const produtos = Array.from({ length: 121 }, (_, indice) => ({ id: 121 - indice, nome: indice === 120 ? 'Café especial' : 'Produto ' + indice, quantidade: indice === 120 ? 0 : 10, preco: 12.5 }));
function fonte() {
  const chamadas = [];
  const carregar = async cursor => {
    chamadas.push(cursor);
    const encontrados = produtos.filter(item => cursor === null || item.id < Number(cursor));
    const itens = encontrados.slice(0, 50);
    return { itens, proximoCursor: encontrados.length > 50 ? String(itens.at(-1).id) : null };
  };
  return { carregar, chamadas };
}

test('a tela sem busca mantém a paginação sob demanda', async () => {
  const api = fonte();
  const { result } = renderHook(() => { const consulta = useListaPaginada(api.carregar, 'listagem'); return { consulta, busca: useBuscaProdutos(consulta) }; });
  await act(async () => { await result.current.consulta.iniciar(); });
  assert.equal(api.chamadas.length, 1);
  assert.equal(result.current.busca.produtos.length, 50);
});

test('busca encontra produtos de páginas posteriores e não declara resultado final cedo', async () => {
  const api = fonte();
  const { result } = renderHook(() => { const consulta = useListaPaginada(api.carregar, 'listagem'); return { consulta, busca: useBuscaProdutos(consulta) }; });
  await act(async () => { await result.current.consulta.iniciar(); });
  act(() => result.current.busca.setBusca('cafe'));
  assert.equal(result.current.busca.buscando, true);
  assert.deepEqual(result.current.busca.produtos, []);
  await waitFor(() => assert.equal(result.current.busca.buscando, false), { timeout: 2000 });
  assert.deepEqual(result.current.busca.produtos.map(item => item.id), [1]);
  assert.deepEqual(api.chamadas, [null, '72', '22']);
});

test('filtro de saldo percorre o estoque completo', async () => {
  const api = fonte();
  const { result } = renderHook(() => { const consulta = useListaPaginada(api.carregar, 'listagem'); return { consulta, busca: useBuscaProdutos(consulta) }; });
  await act(async () => { await result.current.consulta.iniciar(); });
  act(() => result.current.busca.setFiltro('sem-estoque'));
  await waitFor(() => assert.equal(result.current.consulta.temMais, false));
  assert.deepEqual(result.current.busca.produtos.map(item => item.id), [1]);
  assert.equal(api.chamadas.length, 3);
});

test('limpar a busca interrompe a leitura automática das próximas páginas', async () => {
  let liberar;
  const segunda = new Promise(resolve => { liberar = resolve; });
  const chamadas = [];
  const carregar = async cursor => {
    chamadas.push(cursor);
    if (cursor === null) return { itens: produtos.slice(0, 50), proximoCursor: '72' };
    return segunda;
  };
  const { result } = renderHook(() => { const consulta = useListaPaginada(carregar, 'listagem'); return { consulta, busca: useBuscaProdutos(consulta) }; });
  await act(async () => { await result.current.consulta.iniciar(); });
  act(() => result.current.busca.setBusca('cafe'));
  await waitFor(() => assert.equal(chamadas.length, 2));
  act(() => result.current.busca.setBusca(''));
  await act(async () => { liberar({ itens: produtos.slice(50, 100), proximoCursor: '22' }); await segunda; });
  assert.equal(result.current.busca.buscando, false);
  assert.equal(result.current.consulta.dados.length, 100);
  assert.equal(chamadas.length, 2);
});

test('falha durante busca não dispara repetição automática e permite recuperar', async () => {
  const api = fonte();
  let falhar = true;
  let chamadas = 0;
  const carregar = async cursor => { chamadas++; if (cursor !== null && falhar) throw new Error('Falha de teste'); return api.carregar(cursor); };
  const { result } = renderHook(() => { const consulta = useListaPaginada(carregar, 'listagem'); return { consulta, busca: useBuscaProdutos(consulta) }; });
  await act(async () => { await result.current.consulta.iniciar(); });
  act(() => result.current.busca.setBusca('cafe'));
  await waitFor(() => assert.ok(result.current.consulta.erroMais));
  assert.equal(result.current.busca.buscando, false);
  assert.equal(chamadas, 2);
  falhar = false;
  await act(async () => { await result.current.consulta.tentarProxima(); });
  await waitFor(() => assert.equal(result.current.consulta.temMais, false));
  assert.deepEqual(result.current.busca.produtos.map(item => item.id), [1]);
  assert.equal(chamadas, 4);
});
