import type { AxiosInstance } from 'axios';
import { RespostaInvalidaError, type DadosProduto, type Pagina, type Produto, type ProdutoVersionado, type ResumoEstoque } from '../lib/contratos.ts';

export function criarServicoProdutos(http: AxiosInstance) {
  return {
    async listarPagina(cursor: string | null, signal?: AbortSignal): Promise<Pagina<Produto>> {
      return (await http.get<Pagina<Produto>>('/produtos/pagina', { params: { tamanho: 50, antesDe: cursor ?? undefined }, signal })).data;
    },
    async resumo(signal?: AbortSignal): Promise<ResumoEstoque> {
      return (await http.get<ResumoEstoque>('/produtos/resumo', { signal })).data;
    },
    async listar(signal?: AbortSignal): Promise<Produto[]> {
      return (await http.get<Produto[]>('/produtos', { signal })).data;
    },
    async obter(id: number, signal?: AbortSignal): Promise<ProdutoVersionado> {
      const resposta = await http.get<Produto>(`/produtos/${id}`, { signal });
      const versao = resposta.headers.etag;
      if (typeof versao !== 'string' || !versao) throw new RespostaInvalidaError();
      return { produto: resposta.data, versao };
    },
    async cadastrar(dados: DadosProduto, signal?: AbortSignal): Promise<Produto> {
      return (await http.post<Produto>('/produtos', dados, { signal })).data;
    },
    async atualizar(id: number, dados: DadosProduto, versao: string, signal?: AbortSignal): Promise<Produto> {
      return (await http.put<Produto>(`/produtos/${id}`, dados, { signal, headers: { 'If-Match': versao } })).data;
    },
    async excluir(id: number, signal?: AbortSignal): Promise<void> {
      await http.delete(`/produtos/${id}`, { signal });
    },
    async vender(id: number, quantidade: number, signal?: AbortSignal, versao?: string): Promise<Produto> {
      return (await http.post<Produto>(`/produtos/${id}/vender`, {}, { params: { quantidade }, signal,
        headers: versao ? { 'If-Match': versao } : undefined })).data;
    },
  };
}

export type ServicoProdutos = ReturnType<typeof criarServicoProdutos>;
