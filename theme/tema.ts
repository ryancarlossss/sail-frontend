import tokens from './tokens.json';

export function obterCores(colorScheme: string | null | undefined) {
  return colorScheme === 'dark' ? tokens.temas.escuro : tokens.temas.claro;
}

export const coresComuns = tokens.comum;
