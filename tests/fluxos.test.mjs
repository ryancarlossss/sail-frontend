import { test, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: dom.window.navigator });
const { renderHook, act, cleanup, waitFor } = await import('@testing-library/react');
const { useFormularioProduto } = await import('../hooks/useFormularioProduto.ts');
const { useMovimentacoesEstoque } = await import('../hooks/useMovimentacoesEstoque.ts');
afterEach(cleanup);
after(() => dom.window.close());

const produto = { id: 1, nome: 'Produto', quantidade: 10, preco: 12.5 };
function pendente() { let resolver; const promise = new Promise(resolve => { resolver = resolve; }); return { promise, resolver }; }
function servico(metodos = {}) {
  const inesperado = async () => { throw new Error('Chamada não esperada no teste'); };
  return { listar: inesperado, obter: async () => ({ produto, versao: '"v1"' }), cadastrar: inesperado, atualizar: inesperado, vender: inesperado, excluir: inesperado, ...metodos };
}
function falha(status, codigo, mensagem) { return Object.assign(new Error(mensagem), { isAxiosError: true, response: { status, data: { codigo, mensagem } } }); }
function preencher(result) { act(() => { result.current.setTitulo('Produto'); result.current.setValor('12,50'); result.current.setQuantidade('10'); }); }

test('cadastro inválido não chama o serviço', async () => {
  let chamadas = 0;
  const api = servico({ cadastrar: async () => { chamadas++; return produto; } });
  const { result } = renderHook(() => useFormularioProduto(api, undefined));
  await act(async () => { await result.current.handleSalvar(); });
  assert.equal(chamadas, 0);
  assert.ok(result.current.erro);
  assert.equal(result.current.sucesso, null);
});

test('cadastro aguarda confirmação e dois acionamentos geram um único envio', async () => {
  const envio = pendente();
  let chamadas = 0;
  const api = servico({ cadastrar: async dados => { chamadas++; assert.deepEqual(dados, { nome: 'Produto', preco: 12.5, quantidade: 10 }); return envio.promise; } });
  const { result } = renderHook(() => useFormularioProduto(api, undefined));
  preencher(result);
  let primeira;
  act(() => { primeira = result.current.handleSalvar(); void result.current.handleSalvar(); });
  assert.equal(chamadas, 1);
  assert.equal(result.current.sucesso, null);
  assert.equal(result.current.isLoading, true);
  await act(async () => { envio.resolver(produto); await primeira; });
  assert.match(result.current.sucesso, /cadastrado/);
  assert.equal(result.current.bloqueado, true);
});

test('edição preserva rascunho em conflito e exige recarregar uma versão atual', async () => {
  let leituras = 0;
  const versoes = [];
  const api = servico({
    obter: async () => ({ produto, versao: '"v' + (++leituras) + '"' }),
    atualizar: async (id, dados, versao) => {
      versoes.push(versao);
      if (versoes.length === 1) throw falha(412, 'PRODUTO_ALTERADO', 'Produto alterado.');
      return { id, ...dados };
    },
  });
  const { result } = renderHook(() => useFormularioProduto(api, '1'));
  await waitFor(() => assert.equal(result.current.carregandoProduto, false));
  act(() => result.current.setTitulo('Rascunho'));
  await act(async () => { await result.current.handleSalvar(); });
  assert.equal(result.current.titulo, 'Rascunho');
  assert.equal(result.current.precisaRecarregar, true);
  await act(async () => { await result.current.handleSalvar(); });
  assert.equal(versoes.length, 1);
  await act(async () => { await result.current.carregarProduto(); });
  assert.equal(result.current.precisaRecarregar, false);
  assert.equal(result.current.titulo, produto.nome);
  await act(async () => { await result.current.handleSalvar(); });
  assert.deepEqual(versoes, ['"v1"', '"v2"']);
  assert.match(result.current.sucesso, /atualizado/);
});

test('identificador de produto inválido não inicia consulta', async () => {
  let consultas = 0;
  const api = servico({ obter: async () => { consultas++; return { produto, versao: '"v1"' }; } });
  const { result } = renderHook(() => useFormularioProduto(api, '1&outro=2'));
  assert.equal(consultas, 0);
  assert.equal(result.current.carregandoProduto, false);
  assert.match(result.current.erro, /inválido/);
});

test('desmontar formulário cancela consulta e descarta resposta atrasada', async () => {
  const consulta = pendente();
  let signal;
  const api = servico({ obter: async (_id, atual) => { signal = atual; return consulta.promise; } });
  const { result, unmount } = renderHook(() => useFormularioProduto(api, '1'));
  unmount();
  assert.equal(signal.aborted, true);
  await act(async () => { consulta.resolver({ produto, versao: '"v1"' }); await consulta.promise; });
  assert.equal(result.current.titulo, '');
});

test('venda valida quantidade e só confirma saldo após resposta do serviço', async () => {
  const envio = pendente();
  let vendas = 0;
  const confirmados = [];
  const api = servico({ vender: async (id, quantidade) => { vendas++; assert.equal(id, 1); assert.equal(quantidade, 2); return envio.promise; } });
  const { result } = renderHook(() => useMovimentacoesEstoque(api, { aoVender: async atual => { confirmados.push(atual); }, aoExcluir: async () => {} }));
  act(() => { result.current.abrirModalVenda(produto); result.current.setQtdVenda('11'); });
  await waitFor(() => assert.equal(result.current.vendaPronta, true));
  await act(async () => { await result.current.confirmarVenda(); });
  assert.equal(vendas, 0);
  assert.ok(result.current.erroOperacao);
  act(() => result.current.setQtdVenda('2'));
  let primeira;
  act(() => { primeira = result.current.confirmarVenda(); void result.current.confirmarVenda(); });
  assert.equal(vendas, 1);
  assert.deepEqual(confirmados, []);
  assert.equal(result.current.modalVisible, true);
  act(() => result.current.fecharModalVenda());
  assert.equal(result.current.modalVisible, true);
  await act(async () => { envio.resolver({ ...produto, quantidade: 8 }); await primeira; });
  assert.deepEqual(confirmados, [{ ...produto, quantidade: 8 }]);
  assert.equal(result.current.modalVisible, false);
  assert.match(result.current.sucesso, /2 unidade/);
});

test('falha na venda mantém modal para recuperação e não altera saldo confirmado', async () => {
  let confirmacoes = 0;
  const api = servico({ vender: async () => { throw new Error('Falha de conexão simulada'); } });
  const { result } = renderHook(() => useMovimentacoesEstoque(api, { aoVender: async () => { confirmacoes++; }, aoExcluir: async () => {} }));
  act(() => result.current.abrirModalVenda(produto));
  await waitFor(() => assert.equal(result.current.vendaPronta, true));
  await act(async () => { await result.current.confirmarVenda(); });
  assert.equal(confirmacoes, 0);
  assert.equal(result.current.modalVisible, true);
  assert.equal(result.current.sucesso, null);
  assert.match(result.current.erroOperacao, /Não foi possível confirmar/);
  assert.equal(result.current.enviando, false);
});

test('exclusão não confirma remoção antes da API e permite tentar novamente após falha', async () => {
  let chamadas = 0;
  const confirmados = [];
  const api = servico({ excluir: async () => { if (++chamadas === 1) throw new Error('Falha simulada'); } });
  const { result } = renderHook(() => useMovimentacoesEstoque(api, { aoVender: async () => {}, aoExcluir: async id => { confirmados.push(id); } }));
  await act(async () => { await result.current.excluir(1); });
  assert.deepEqual(confirmados, []);
  assert.equal(result.current.sucesso, null);
  assert.ok(result.current.erroOperacao);
  await act(async () => { await result.current.excluir(1); });
  assert.deepEqual(confirmados, [1]);
  assert.match(result.current.sucesso, /removido/);
});

test('venda aguarda preço e saldo atuais antes de permitir confirmação', async () => {
  const leitura = pendente();
  let vendas = 0;
  const api = servico({ obter: async () => leitura.promise, vender: async (_id, quantidade, _signal, versao) => {
    vendas++;
    assert.equal(versao, '"atual"');
    assert.equal(quantidade, 1);
    return { ...produto, preco: 20, quantidade: 2 };
  } });
  const { result } = renderHook(() => useMovimentacoesEstoque(api, { aoVender: async () => {}, aoExcluir: async () => {} }));
  act(() => result.current.abrirModalVenda(produto));
  await act(async () => { await result.current.confirmarVenda(); });
  assert.equal(vendas, 0);
  assert.equal(result.current.vendaPronta, false);
  await act(async () => { leitura.resolver({ produto: { ...produto, preco: 20, quantidade: 3 }, versao: '"atual"' }); });
  assert.equal(result.current.produtoSelecionado.preco, 20);
  assert.equal(result.current.produtoSelecionado.quantidade, 3);
  await act(async () => { await result.current.confirmarVenda(); });
  assert.equal(vendas, 1);
});

test('preço alterado exige nova leitura e nova confirmação sem enviar a versão antiga', async () => {
  let leituras = 0;
  const versoes = [];
  const api = servico({ obter: async () => ({ produto: { ...produto, preco: ++leituras === 1 ? 12.5 : 20 }, versao: '"v' + leituras + '"' }),
    vender: async (_id, _quantidade, _signal, versao) => {
      versoes.push(versao);
      if (versoes.length === 1) throw falha(412, 'PRODUTO_ALTERADO', 'Recarregue os dados.');
      return { ...produto, quantidade: 9 };
    } });
  const { result } = renderHook(() => useMovimentacoesEstoque(api, { aoVender: async () => {}, aoExcluir: async () => {} }));
  act(() => result.current.abrirModalVenda(produto));
  await waitFor(() => assert.equal(result.current.vendaPronta, true));
  await act(async () => { await result.current.confirmarVenda(); });
  assert.equal(result.current.vendaPronta, false);
  assert.equal(result.current.modalVisible, true);
  assert.equal(result.current.sucesso, null);
  await act(async () => { await result.current.confirmarVenda(); });
  assert.equal(versoes.length, 1);
  await act(async () => { result.current.recarregarVenda(); });
  assert.equal(result.current.produtoSelecionado.preco, 20);
  await act(async () => { await result.current.confirmarVenda(); });
  assert.deepEqual(versoes, ['"v1"', '"v2"']);
});

test('erro ao consultar a venda permite recuperar e desmontagem cancela a leitura', async () => {
  let chamadas = 0;
  let signal;
  const espera = pendente();
  const api = servico({ obter: async (_id, atual) => {
    signal = atual;
    if (++chamadas === 1) throw new Error('Falha de conexão simulada');
    return espera.promise;
  } });
  const { result, unmount } = renderHook(() => useMovimentacoesEstoque(api, { aoVender: async () => {}, aoExcluir: async () => {} }));
  act(() => result.current.abrirModalVenda(produto));
  await waitFor(() => assert.equal(result.current.carregandoVenda, false));
  assert.equal(result.current.vendaPronta, false);
  assert.ok(result.current.erroOperacao);
  act(() => result.current.recarregarVenda());
  unmount();
  assert.equal(signal.aborted, true);
  await act(async () => { espera.resolver({ produto, versao: '"v2"' }); });
});
