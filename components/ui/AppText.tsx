import { Text, type TextProps } from 'react-native';
import { useTema } from '../../hooks/useTema';
import { tipografia } from '../../theme/design';

interface AppTextProps extends TextProps {
  variant?: keyof typeof tipografia;
  tone?: 'principal' | 'secundario' | 'destaque' | 'perigo' | 'contraste';
}

export function AppText({ variant = 'corpo', tone = 'principal', style, ...props }: AppTextProps) {
  const { cores } = useTema();
  const coresTexto = { principal: cores.texto, secundario: cores.textoSecundario, destaque: cores.destaque, perigo: cores.perigo, contraste: cores.textoContraste };
  return <Text {...props} style={[tipografia[variant], { color: coresTexto[tone], flexShrink: 1, minWidth: 0 }, style]} />;
}
