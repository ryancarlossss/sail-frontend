import { test, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: dom.window.navigator });
const { renderHook, act, cleanup } = await import('@testing-library/react');
const { useEffect } = await import('react');
const { useEnvio } = await import('../hooks/useEnvio.ts');

afterEach(cleanup);
after(() => dom.window.close());

function tarefaPendente() {
  let resolver;
  let rejeitar;
  const promise = new Promise((resolve, reject) => { resolver = resolve; rejeitar = reject; });
  return { promise, resolver, rejeitar };
}

test('dois acionamentos rápidos enviam uma única operação', async () => {
  const { result } = renderHook(() => useEnvio());
  const tarefa = tarefaPendente();
  let chamadas = 0;
  let primeira;
  act(() => { primeira = result.current.executar(() => { chamadas++; return tarefa.promise; }); });
  const segunda = await result.current.executar(() => { chamadas++; return Promise.resolve('duplicada'); });
  assert.equal(chamadas, 1);
  assert.equal(segunda, undefined);
  assert.equal(result.current.enviando, true);
  await act(async () => { tarefa.resolver('confirmada'); assert.equal(await primeira, 'confirmada'); });
  assert.equal(result.current.enviando, false);
});

test('uma falha libera o formulário para uma nova tentativa', async () => {
  const { result } = renderHook(() => useEnvio());
  const tarefa = tarefaPendente();
  let primeira;
  act(() => { primeira = result.current.executar(() => tarefa.promise); });
  const rejeicao = assert.rejects(primeira, /Falha de teste/);
  await act(async () => { tarefa.rejeitar(new Error('Falha de teste')); await rejeicao; });
  assert.equal(result.current.enviando, false);
  await act(async () => { assert.equal(await result.current.executar(async () => 'confirmada'), 'confirmada'); });
});

test('sair da tela cancela a requisição e descarta conclusão atrasada', async () => {
  const { result, unmount } = renderHook(() => useEnvio());
  const tarefa = tarefaPendente();
  let signal;
  let pendente;
  act(() => { pendente = result.current.executar(atual => { signal = atual; return tarefa.promise; }); });
  unmount();
  assert.equal(signal.aborted, true);
  tarefa.resolver('resposta atrasada');
  assert.equal(await pendente, undefined);
});

test('StrictMode não conserva envio cancelado nem deixa resposta antiga liberar outro envio', async () => {
  const tarefas = [];
  const promessas = [];
  const { result } = renderHook(() => {
    const envio = useEnvio();
    useEffect(() => {
      promessas.push(envio.executar(signal => {
        const tarefa = tarefaPendente();
        tarefas.push({ ...tarefa, signal });
        return tarefa.promise;
      }));
    }, [envio.executar]);
    return envio;
  }, { reactStrictMode: true });
  assert.equal(tarefas.length, 2);
  assert.equal(tarefas[0].signal.aborted, true);
  assert.equal(tarefas[1].signal.aborted, false);
  await act(async () => { tarefas[0].resolver('antiga'); await promessas[0]; });
  assert.equal(result.current.enviando, true);
  await act(async () => { tarefas[1].resolver('atual'); assert.equal(await promessas[1], 'atual'); });
  assert.equal(result.current.enviando, false);
});
