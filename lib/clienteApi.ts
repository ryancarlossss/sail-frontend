import axios, { type InternalAxiosRequestConfig } from 'axios';
import { RespostaInvalidaError, validarHistorico, validarPaginaHistorico, validarPaginaProdutos, validarProduto, validarProdutos, validarResumoEstoque, validarSessao, validarUsuario, type Sessao } from './contratos.ts';

type Configuracao = InternalAxiosRequestConfig & { geracaoSessao?: number; assinaturaOperacao?: string; chaveOperacao?: string };

export class SessaoInvalidaError extends Error {
  readonly codigo = 'SESSAO_INVALIDA';

  constructor() { super('Sua sessão expirou. Entre novamente.'); }
}

export function criarClienteApi(baseURL: string, idSessao: string) {
  const http = axios.create({ baseURL: baseURL.replace(/\/$/, ''), timeout: 10000, allowAbsoluteUrls: false });
  let sessao: Sessao | null = null;
  let geracao = 0;
  let sequencia = 0;
  let aviso = '';
  const ouvintes = new Set<() => void>();
  const ouvintesEstoque = new Set<() => void>();
  let versaoEstoque = 0;
  const operacoes = new Map<string, string>();

  const notificar = () => ouvintes.forEach(ouvinte => ouvinte());
  const encerrarSessao = (mensagem = '') => {
    sessao = null;
    aviso = mensagem;
    geracao++;
    operacoes.clear();
    notificar();
  };

  http.interceptors.request.use(configuracao => {
    const config = configuracao as Configuracao;
    if (!config.url?.startsWith('/') || config.url.startsWith('//')) throw new Error('Destino de requisição inválido.');
    const publica = config.url === '/usuarios/login' || config.url === '/usuarios/cadastrar';
    if (!publica) {
      if (!sessao || Date.parse(sessao.expiraEm) <= Date.now()) {
        encerrarSessao('Sua sessão expirou. Entre novamente.');
        throw new SessaoInvalidaError();
      }
      config.geracaoSessao = geracao;
      config.headers.set('Authorization', `Bearer ${sessao.token}`);
      config.headers.set('usuarioId', String(sessao.id));
      if (config.method === 'post' && (config.url === '/produtos' || /^\/produtos\/\d+\/vender$/.test(config.url ?? ''))) {
        const assinatura = JSON.stringify([sessao.id, config.url, config.params ?? null, config.data ?? null]);
        let chave = operacoes.get(assinatura);
        if (!chave) {
          if (operacoes.size >= 1000) throw new Error('Verifique as operações pendentes antes de continuar.');
          chave = `${idSessao}:${++sequencia}`;
          operacoes.set(assinatura, chave);
        }
        config.assinaturaOperacao = assinatura;
        config.chaveOperacao = chave;
        config.headers.set('Idempotency-Key', chave);
      }
    }
    return config;
  });

  http.interceptors.response.use(resposta => {
    const config = resposta.config as Configuracao;
    if (config.geracaoSessao !== undefined && config.geracaoSessao !== geracao) throw new SessaoInvalidaError();
    const rota = config.url ?? '';
    if (rota === '/usuarios/login') resposta.data = validarSessao(resposta.data);
    else if (rota === '/usuarios/cadastrar') resposta.data = validarUsuario(resposta.data);
    else if (rota === '/produtos/pagina') resposta.data = validarPaginaProdutos(resposta.data);
    else if (rota === '/produtos/resumo') resposta.data = validarResumoEstoque(resposta.data);
    else if (rota === '/historico/pagina') resposta.data = validarPaginaHistorico(resposta.data);
    else if (rota === '/produtos' && config.method === 'get') resposta.data = validarProdutos(resposta.data);
    else if (rota === '/historico') resposta.data = validarHistorico(resposta.data);
    else if (config.method === 'delete' && /^\/produtos\/\d+$/.test(rota)) {
      if (resposta.data !== 'Produto removido do estoque com sucesso!') throw new RespostaInvalidaError();
    } else if (rota === '/produtos' || /^\/produtos\/\d+(\/vender)?$/.test(rota)) resposta.data = validarProduto(resposta.data);
    if (config.assinaturaOperacao && operacoes.get(config.assinaturaOperacao) === config.chaveOperacao) {
      operacoes.delete(config.assinaturaOperacao);
    }
    if (config.method !== 'get' && (rota === '/produtos' || /^\/produtos\/\d+(\/vender)?$/.test(rota))) {
      versaoEstoque++;
      ouvintesEstoque.forEach(ouvinte => ouvinte());
    }
    return resposta;
  }, erro => {
    if (axios.isAxiosError(erro) && erro.response?.status === 401) {
      const config = erro.config as Configuracao | undefined;
      if (config?.geracaoSessao !== undefined && config.geracaoSessao === geracao) {
        encerrarSessao('Sua sessão expirou. Entre novamente.');
      }
    }
    return Promise.reject(erro);
  });

  return {
    http,
    obterSessao: () => sessao,
    obterAvisoSessao: () => aviso,
    obterVersaoEstoque: () => versaoEstoque,
    assinarEstoque: (ouvinte: () => void) => { ouvintesEstoque.add(ouvinte); return () => { ouvintesEstoque.delete(ouvinte); }; },
    definirSessao: (valor: unknown) => {
      const validada = validarSessao(valor);
      sessao = validada;
      aviso = '';
      geracao++;
      operacoes.clear();
      notificar();
    },
    encerrarSessao,
    assinarSessao: (ouvinte: () => void) => { ouvintes.add(ouvinte); return () => { ouvintes.delete(ouvinte); }; },
  };
}
