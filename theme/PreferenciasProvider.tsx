import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'nativewind';
import { Platform } from 'react-native';
import { validarPreferenciaTema, type PreferenciaTema } from '../lib/preferencias';

interface PreferenciasInterface {
  tema: PreferenciaTema;
  definirTema: (tema: PreferenciaTema) => Promise<void>;
  salvando: boolean;
  erro: string | null;
  valoresOcultos: boolean;
  alternarValores: () => void;
}

const Contexto = createContext<PreferenciasInterface | null>(null);
const chaveTema = '@sail:aparencia';

export function PreferenciasProvider({ children }: { children: ReactNode }) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const aplicarTema = useRef(setColorScheme);
  aplicarTema.current = setColorScheme;
  const [tema, setTema] = useState<PreferenciaTema>('system');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [valoresOcultos, setValoresOcultos] = useState(false);
  const gravando = useRef(false);
  const revisao = useRef(0);
  const montado = useRef(true);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark', colorScheme === 'dark');
    document.documentElement.style.colorScheme = colorScheme === 'dark' ? 'dark' : 'light';
  }, [tema, colorScheme]);

  useEffect(() => {
    montado.current = true;
    let ativo = true;
    const inicial = revisao.current;
    void AsyncStorage.getItem(chaveTema).then(valor => {
      if (!ativo || revisao.current !== inicial) return;
      const preferencia = validarPreferenciaTema(valor);
      setTema(preferencia);
      aplicarTema.current(preferencia);
    }, () => {
      if (ativo) setErro('Não foi possível recuperar sua preferência de aparência.');
    });
    return () => { ativo = false; montado.current = false; };
  }, []);

  const definirTema = useCallback(async (preferencia: PreferenciaTema) => {
    if (gravando.current) return;
    gravando.current = true;
    revisao.current++;
    setTema(preferencia);
    aplicarTema.current(preferencia);
    setSalvando(true);
    setErro(null);
    try {
      await AsyncStorage.setItem(chaveTema, preferencia);
    } catch {
      if (montado.current) setErro('O tema foi aplicado, mas não foi possível salvar sua preferência neste dispositivo.');
    } finally {
      gravando.current = false;
      if (montado.current) setSalvando(false);
    }
  }, []);

  const alternarValores = useCallback(() => setValoresOcultos(ocultos => !ocultos), []);

  return <Contexto.Provider value={{ tema, definirTema, salvando, erro, valoresOcultos, alternarValores }}>{children}</Contexto.Provider>;
}

export function usePreferenciasInterface() {
  const preferencias = useContext(Contexto);
  if (!preferencias) throw new Error('As preferências de interface precisam de um provedor.');
  return preferencias;
}
