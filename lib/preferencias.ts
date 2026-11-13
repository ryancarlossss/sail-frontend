export type PreferenciaTema = 'system' | 'light' | 'dark';

export function validarPreferenciaTema(valor: string | null): PreferenciaTema {
  return valor === 'light' || valor === 'dark' ? valor : 'system';
}

export const rotulosTema: Record<PreferenciaTema, string> = { system: 'Sistema', light: 'Claro', dark: 'Escuro' };
