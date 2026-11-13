export interface UsuarioResumo {
  id: number;
  nome: string;
  email: string;
}

export interface Sessao extends UsuarioResumo {
  token: string;
  expiraEm: string;
}

export interface Produto {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
  imagem?: string;
}

export interface DadosProduto {
  nome: string;
  quantidade: number;
  preco: number;
}

export interface ProdutoVersionado {
  produto: Produto;
  versao: string;
}

export interface Registro {
  id: number;
  acao: string;
  quantidade: number;
  valorTotal?: number;
  dataHora: string;
  usuario: UsuarioResumo | null;
  produto: Produto;
}

export interface Historico {
  totalDoMes: number;
  lancamentos: Registro[];
}

export interface Pagina<T> {
  itens: T[];
  proximoCursor: string | null;
}

export interface PaginaHistorico extends Pagina<Registro> {
  totalDoMes: number;
}

export interface ResumoEstoque {
  quantidadeProdutos: number;
  valorEstoque: number;
  quantidadeSemEstoque?: number;
}

export class RespostaInvalidaError extends Error {
  readonly codigo = 'RESPOSTA_INVALIDA';

  constructor() {
    super('Não foi possível confirmar os dados recebidos. Atualize as informações e tente novamente.');
  }
}

function objeto(valor: unknown): Record<string, unknown> {
  if (typeof valor !== 'object' || valor === null || Array.isArray(valor)) throw new RespostaInvalidaError();
  return valor as Record<string, unknown>;
}

function texto(valor: unknown): string {
  if (typeof valor !== 'string' || !valor.trim()) throw new RespostaInvalidaError();
  return valor;
}

function identificador(valor: unknown): number {
  if (typeof valor !== 'number' || !Number.isSafeInteger(valor) || valor <= 0) throw new RespostaInvalidaError();
  return valor;
}

function numero(valor: unknown): number {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) throw new RespostaInvalidaError();
  return valor;
}

export function validarUsuario(valor: unknown): UsuarioResumo {
  const dados = objeto(valor);
  if (typeof dados.nome !== 'string') throw new RespostaInvalidaError();
  return { id: identificador(dados.id), nome: dados.nome, email: texto(dados.email) };
}

export function validarSessao(valor: unknown): Sessao {
  const dados = objeto(valor);
  const expiraEm = texto(dados.expiraEm);
  if (!Number.isFinite(Date.parse(expiraEm)) || Date.parse(expiraEm) <= Date.now()) throw new RespostaInvalidaError();
  return { ...validarUsuario(dados), token: texto(dados.token), expiraEm };
}

export function validarProduto(valor: unknown): Produto {
  const dados = objeto(valor);
  const quantidade = numero(dados.quantidade);
  const preco = numero(dados.preco);
  if (!Number.isInteger(quantidade) || typeof dados.nome !== 'string') throw new RespostaInvalidaError();
  if (dados.imagem != null && typeof dados.imagem !== 'string') throw new RespostaInvalidaError();
  return { id: identificador(dados.id), nome: dados.nome, preco, quantidade, imagem: typeof dados.imagem === 'string' ? dados.imagem : undefined };
}

export function validarProdutos(valor: unknown): Produto[] {
  if (!Array.isArray(valor)) throw new RespostaInvalidaError();
  return valor.map(validarProduto);
}

export function validarHistorico(valor: unknown): Historico {
  const dados = objeto(valor);
  if (!Array.isArray(dados.lancamentos)) throw new RespostaInvalidaError();
  return {
    totalDoMes: numero(dados.totalDoMes),
    lancamentos: dados.lancamentos.map(valor => {
      const registro = objeto(valor);
      const dataHora = texto(registro.dataHora);
      if (!Number.isFinite(Date.parse(dataHora)) || !Number.isInteger(registro.quantidade)) throw new RespostaInvalidaError();
      return {
        id: identificador(registro.id), acao: texto(registro.acao), quantidade: numero(registro.quantidade), dataHora,
        ...(registro.valorTotal == null ? {} : { valorTotal: numero(registro.valorTotal) }),
        usuario: registro.usuario == null ? null : validarUsuario(registro.usuario), produto: validarProduto(registro.produto),
      };
    }),
  };
}

function cursor(valor: unknown): string | null {
  if (valor === null) return null;
  const resultado = texto(valor);
  if (resultado.length > 256) throw new RespostaInvalidaError();
  return resultado;
}

export function validarPaginaProdutos(valor: unknown): Pagina<Produto> {
  const dados = objeto(valor);
  const pagina = validarItensPagina(validarProdutos(dados.itens), dados.proximoCursor);
  if (pagina.proximoCursor !== null && pagina.proximoCursor !== String(pagina.itens[pagina.itens.length - 1]?.id)) throw new RespostaInvalidaError();
  return pagina;
}

export function validarPaginaHistorico(valor: unknown): PaginaHistorico {
  const dados = objeto(valor);
  const historico = validarHistorico({ totalDoMes: dados.totalDoMes, lancamentos: dados.itens });
  return { ...validarItensPagina(historico.lancamentos, dados.proximoCursor), totalDoMes: historico.totalDoMes };
}

function validarItensPagina<T extends { id: number }>(itens: T[], valorCursor: unknown): Pagina<T> {
  const proximoCursor = cursor(valorCursor);
  if (itens.length > 100 || new Set(itens.map(item => item.id)).size !== itens.length || (!itens.length && proximoCursor !== null)) throw new RespostaInvalidaError();
  return { itens, proximoCursor };
}

export function validarResumoEstoque(valor: unknown): ResumoEstoque {
  const dados = objeto(valor);
  const quantidadeProdutos = numero(dados.quantidadeProdutos);
  if (!Number.isSafeInteger(quantidadeProdutos) || quantidadeProdutos < 0) throw new RespostaInvalidaError();
  const resumo: ResumoEstoque = { quantidadeProdutos, valorEstoque: numero(dados.valorEstoque) };
  if (dados.quantidadeSemEstoque != null) {
    const quantidadeSemEstoque = numero(dados.quantidadeSemEstoque);
    if (!Number.isSafeInteger(quantidadeSemEstoque) || quantidadeSemEstoque < 0 || quantidadeSemEstoque > quantidadeProdutos) throw new RespostaInvalidaError();
    resumo.quantidadeSemEstoque = quantidadeSemEstoque;
  }
  return resumo;
}
