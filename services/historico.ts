import type { AxiosInstance } from 'axios';
import type { Historico, PaginaHistorico } from '../lib/contratos.ts';

export interface PeriodoHistorico {
  mes: number;
  ano: number;
}

export function criarServicoHistorico(http: AxiosInstance) {
  return {
    async totalPeriodo(periodo: PeriodoHistorico, signal?: AbortSignal): Promise<number> {
      return (await http.get<PaginaHistorico>('/historico/pagina', { params: { ...periodo, tamanho: 1 }, signal })).data.totalDoMes;
    },
    async listarPagina(periodo: PeriodoHistorico, cursor: string | null, signal?: AbortSignal): Promise<PaginaHistorico> {
      return (await http.get<PaginaHistorico>('/historico/pagina', { params: { ...periodo, tamanho: 50, cursor: cursor ?? undefined }, signal })).data;
    },
    async listar(periodo: PeriodoHistorico, signal?: AbortSignal): Promise<Historico> {
      return (await http.get<Historico>('/historico', { params: periodo, signal })).data;
    },
  };
}
