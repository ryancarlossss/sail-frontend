import type { DadosProduto } from './contratos.ts';

export function validarEmail(email: string): boolean {
  return email.trim().length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validarCadastro(nome: string, email: string, senha: string): Record<string, string> {
  const campos: Record<string, string> = {};
  if (!nome.trim() || nome.trim().length > 255) campos.nome = 'Informe seu nome com até 255 caracteres.';
  if (!validarEmail(email)) campos.email = 'Informe um e-mail válido.';
  if (!senha.trim() || senha.length < 8 || senha.length > 128) campos.senha = 'A senha deve ter entre 8 e 128 caracteres.';
  return campos;
}

type ProdutoValidado = { dados: DadosProduto; campos?: never }
  | { dados?: never; campos: Record<string, string> };

export function validarFormularioProduto(nome: string, valor: string, estoque: string): ProdutoValidado {
  const campos: Record<string, string> = {};
  if (!nome.trim() || nome.trim().length > 255) campos.nome = 'Informe um nome com até 255 caracteres.';
  const quantidade = Number(estoque.trim());
  if (!/^\d+$/.test(estoque.trim()) || !Number.isSafeInteger(quantidade) || quantidade > 2147483647) {
    campos.quantidade = 'Informe uma quantidade inteira maior ou igual a zero.';
  }
  let entrada = valor.trim();
  if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(entrada)) entrada = entrada.replace(/\./g, '').replace(',', '.');
  else if (/^\d+([.,]\d{1,2})?$/.test(entrada)) entrada = entrada.replace(',', '.');
  else campos.preco = 'Informe um preço não negativo com até duas casas decimais.';
  const preco = Number(entrada);
  if (!Number.isFinite(preco) || preco < 0 || preco >= 1000000000000) campos.preco = 'Informe um preço válido com até 12 dígitos inteiros.';
  return Object.keys(campos).length ? { campos } : { dados: { nome: nome.trim(), quantidade, preco } };
}
