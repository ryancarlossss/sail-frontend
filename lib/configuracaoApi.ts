export function resolverEnderecoApi(configurado: string | undefined, hostExpo: string | null | undefined, desenvolvimento: boolean, padrao: string): string {
  if (configurado?.trim()) return configurado.trim();
  if (desenvolvimento) {
    const host = hostExpo?.match(/^(localhost|\d{1,3}(?:\.\d{1,3}){3})(?::\d{1,5})?$/)?.[1];
    if (host === 'localhost') return 'http://localhost:8080';
    if (host) {
      const partes = host.split('.').map(Number);
      const local = partes[0] === 10 || partes[0] === 127 || partes[0] === 192 && partes[1] === 168
        || partes[0] === 172 && partes[1] >= 16 && partes[1] <= 31;
      if (local && partes.every(parte => parte >= 0 && parte <= 255)) return 'http://' + host + ':8080';
    }
  }
  return padrao;
}
