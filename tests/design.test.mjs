import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { dimensao } from '../theme/design.ts';
import { validarPreferenciaTema } from '../lib/preferencias.ts';
import { filtrarProdutos, periodoVendas, variacaoVendas } from '../lib/estoque.ts';

const require = createRequire(import.meta.url);
const { temas } = require('../theme/tokens.json');
function luminancia(hex) {
  const [r, g, b] = hex.slice(1).match(/../g).map(parte => parseInt(parte, 16) / 255).map(cor => cor <= 0.04045 ? cor / 12.92 : ((cor + 0.055) / 1.055) ** 2.4);
  return r * 0.2126 + g * 0.7152 + b * 0.0722;
}
function contraste(a, b) { const x = luminancia(a); const y = luminancia(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }

test('temas compartilham os mesmos tokens semânticos', () => {
  assert.deepEqual(Object.keys(temas.claro).sort(), Object.keys(temas.escuro).sort());
  assert.ok(dimensao.toque >= 44);
  assert.ok(dimensao.toqueCompacto >= 44);
});

for (const [nome, cores] of Object.entries(temas)) {
  test('contraste de textos, botões e estados no tema ' + nome, () => {
    for (const [texto, fundo] of [[cores.texto, cores.fundo], [cores.texto, cores.superficie], [cores.textoSecundario, cores.fundo],
      [cores.textoSecundario, cores.superficie], [cores.textoContraste, cores.destaque], [cores.textoSucesso, cores.fundoSucesso],
      [cores.textoSucesso, cores.botaoDiscreto], [cores.textoErro, cores.fundoErro]]) {
      assert.ok(contraste(texto, fundo) >= 4.5, nome + ': ' + texto + ' sobre ' + fundo);
    }
    assert.ok(contraste(cores.bordaEntrada, cores.entrada) >= 3);
  });
}

test('preferências desconhecidas usam o tema do sistema', () => {
  assert.equal(validarPreferenciaTema(null), 'system');
  assert.equal(validarPreferenciaTema('invalido'), 'system');
  assert.equal(validarPreferenciaTema('light'), 'light');
  assert.equal(validarPreferenciaTema('dark'), 'dark');
});

test('busca ignora acentos e combina nome e saldo sem alterar dados originais', () => {
  const produtos = [{ id: 3, nome: 'Café especial', quantidade: 10, preco: 12.5 }, { id: 2, nome: 'Café orgânico', quantidade: 0, preco: 10 }, { id: 1, nome: 'Bolsa', quantidade: 1, preco: 500 }];
  assert.deepEqual(filtrarProdutos(produtos, ' CAFE ', 'todos').map(item => item.id), [3, 2]);
  assert.deepEqual(filtrarProdutos(produtos, 'cafe', 'sem-estoque').map(item => item.id), [2]);
  assert.deepEqual(filtrarProdutos(produtos, '', 'com-estoque').map(item => item.id), [3, 1]);
  assert.equal(produtos.length, 3);
  assert.equal(produtos[0].quantidade, 10);
});

test('períodos de vendas atravessam anos corretamente', () => {
  const referencia = new Date(2026, 0, 31);
  assert.deepEqual(periodoVendas(0, referencia), { mes: 1, ano: 2026 });
  assert.deepEqual(periodoVendas(1, referencia), { mes: 12, ano: 2025 });
  assert.deepEqual(periodoVendas(2, referencia), { mes: 11, ano: 2025 });
});

test('comparação de vendas exige uma base real e finita', () => {
  assert.equal(variacaoVendas(null, 100), null);
  assert.equal(variacaoVendas(100, null), null);
  assert.equal(variacaoVendas(100, 0), null);
  assert.equal(variacaoVendas(Infinity, 100), null);
  assert.equal(variacaoVendas(125, 100), 25);
  assert.equal(variacaoVendas(50, 100), -50);
  assert.equal(variacaoVendas(0, 100), -100);
});
