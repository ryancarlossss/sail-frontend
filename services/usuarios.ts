import type { AxiosInstance } from 'axios';
import type { Sessao, UsuarioResumo } from '../lib/contratos.ts';

interface Credenciais {
  email: string;
  senha: string;
}

interface DadosCadastro extends Credenciais {
  nome: string;
}

export function criarServicoUsuarios(http: AxiosInstance) {
  return {
    async entrar(dados: Credenciais, signal?: AbortSignal): Promise<Sessao> {
      return (await http.post<Sessao>('/usuarios/login', dados, { signal })).data;
    },
    async cadastrar(dados: DadosCadastro, signal?: AbortSignal): Promise<UsuarioResumo> {
      return (await http.post<UsuarioResumo>('/usuarios/cadastrar', dados, { signal })).data;
    },
  };
}
