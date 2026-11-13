import { useColorScheme } from 'nativewind';
import { obterCores } from '../theme/tema';

export function useTema() {
  const { colorScheme } = useColorScheme();
  return { isDark: colorScheme === 'dark', cores: obterCores(colorScheme) };
}
