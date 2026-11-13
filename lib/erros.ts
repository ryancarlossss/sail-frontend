import axios from 'axios';

export type ContextoErro = 'login' | 'cadastro' | 'produto' | 'venda' | 'exclusao' | 'listagem' | 'historico';

export function foiCancelado(erro: unknown): boolean {
  return axios.isCancel(erro) || (erro instanceof Error && erro.name === 'AbortError');
}

export function codigoErro(erro: unknown): string | undefined {
  if (axios.isAxiosError(erro) && typeof erro.response?.data?.codigo === 'string') return erro.response.data.codigo;
  if (typeof erro === 'object' && erro !== null && 'codigo' in erro && typeof erro.codigo === 'string') return erro.codigo;
  return undefined;
}

export function camposErro(erro: unknown): Record<string, string> {
  if (!axios.isAxiosError(erro) || erro.response?.status !== 400) return {};
  const campos = erro.response.data?.campos;
  if (!campos || typeof campos !== 'object' || Array.isArray(campos)) return {};
  return Object.fromEntries(Object.entries(campos).filter(([chave, valor]) =>
    ['nome', 'email', 'senha', 'quantidade', 'preco', 'id'].includes(chave) && typeof valor === 'string' && valor.length <= 300)) as Record<string, string>;
}

export function mensagemErro(erro: unknown, contexto: ContextoErro): string {
  if (codigoErro(erro) === 'SESSAO_INVALIDA' || (axios.isAxiosError(erro) && erro.response?.status === 401 && contexto !== 'login')) {
    return 'Sua sessão expirou. Entre novamente.';
  }
  if (axios.isAxiosError(erro)) {
    const status = erro.response?.status;
    if (status && [400, 401, 403, 404, 409, 412, 422].includes(status)) {
      const dados = erro.response?.data;
      if (typeof dados?.mensagem === 'string' && dados.mensagem.trim() && dados.mensagem.length <= 400) {
        const campos = camposErro(erro);
        return Object.values(campos)[0] ?? dados.mensagem;
      }
      if (status === 401) return 'E-mail ou senha incorretos.';
      if (status === 403) return 'Você não tem permissão para realizar esta operação.';
      if (status === 404) return 'O recurso não foi encontrado. Atualize as informações.';
      if (status === 412) return 'Este produto foi alterado. Recarregue os dados antes de salvar.';
      if (contexto === 'venda') return 'Não foi possível concluir a venda. Confira a quantidade e atualize o estoque.';
    }
  }
  if (contexto === 'venda') return 'Não foi possível confirmar a venda. Consulte o estoque e o histórico antes de tentar novamente.';
  if (contexto === 'exclusao') return 'Não foi possível confirmar a exclusão. Atualize o estoque antes de tentar novamente.';
  if (contexto === 'produto') return 'Não foi possível confirmar a alteração. Verifique o estoque antes de tentar novamente.';
  if (contexto === 'cadastro') return 'Não foi possível confirmar seu cadastro. Tente entrar na sua conta antes de repetir a solicitação.';
  if (codigoErro(erro) === 'RESPOSTA_INVALIDA') return 'Não foi possível confirmar os dados recebidos. Tente atualizar novamente.';
  if (contexto === 'login') return 'Não foi possível conectar ao serviço. Verifique sua conexão e tente novamente.';
  return contexto === 'historico'
    ? 'Não foi possível atualizar o histórico. Verifique sua conexão e tente novamente.'
    : 'Não foi possível atualizar o estoque. Verifique sua conexão e tente novamente.';
}
