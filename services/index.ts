import { api } from '../lib/api';
import { criarServicoProdutos } from './produtos';
import { criarServicoUsuarios } from './usuarios';
import { criarServicoHistorico } from './historico';

export const produtosService = criarServicoProdutos(api);
export const usuariosService = criarServicoUsuarios(api);
export const historicoService = criarServicoHistorico(api);
