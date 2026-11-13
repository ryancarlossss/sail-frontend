export const espaco = { minimo: 4, pequeno: 8, medio: 12, padrao: 16, amplo: 24, secao: 32, grande: 40 } as const;
export const raio = { pequeno: 12, padrao: 16, card: 20, grande: 28, circular: 999 } as const;
export const dimensao = { toque: 48, toqueCompacto: 44, iconePequeno: 16, icone: 20, iconeGrande: 24, iconeFundo: 32, avatar: 44, produto: 48, aba: 60, larguraMaxima: 720, logoLargura: 100, logoAltura: 44, ponto: 6 } as const;
export const interacao = { opacidadeToque: 0.76, opacidadeDesabilitado: 0.46, borda: 1, foco: 2 } as const;
export const sombra = { opacidade: 0.06, deslocamento: 8, raio: 20, elevacao: 2 } as const;
export const tipografia = {
  titulo: { fontSize: 26, lineHeight: 32, fontWeight: '700', letterSpacing: -0.5 },
  secao: { fontSize: 20, lineHeight: 26, fontWeight: '700', letterSpacing: -0.3 },
  destaque: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
  corpo: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  botao: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  legenda: { fontSize: 12, lineHeight: 18, fontWeight: '400' },
  rotulo: { fontSize: 11, lineHeight: 16, fontWeight: '600', letterSpacing: 0.7 },
  valor: { fontSize: 30, lineHeight: 38, fontWeight: '700', letterSpacing: -0.7 },
} as const;
