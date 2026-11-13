import { View, Platform, type ViewProps } from 'react-native';
import { useTema } from '../../hooks/useTema';
import { espaco, interacao, raio, sombra } from '../../theme/design';

interface CardProps extends ViewProps {
  elevated?: boolean;
}

export function Card({ style, elevated = false, ...props }: CardProps) {
  const { cores, isDark } = useTema();
  const elevacao = elevated && !isDark ? Platform.select({
    web: { boxShadow: `0px ${sombra.deslocamento}px ${sombra.raio}px ${cores.sombraWeb}` },
    default: { shadowColor: cores.sombra, shadowOpacity: sombra.opacidade, shadowRadius: sombra.raio, shadowOffset: { width: 0, height: sombra.deslocamento }, elevation: sombra.elevacao },
  }) : {};
  return <View {...props} style={[{ backgroundColor: cores.superficie, borderWidth: interacao.borda, borderColor: cores.borda,
    borderRadius: raio.card, overflow: 'hidden' }, elevacao, style]} />;
}

export function CardHeader({ style, ...props }: CardProps) {
  const { cores } = useTema();
  return <View {...props} style={[{ paddingHorizontal: espaco.padrao, paddingVertical: espaco.medio, borderBottomWidth: interacao.borda, borderBottomColor: cores.borda }, style]} />;
}

export function CardContent({ style, ...props }: CardProps) {
  return <View {...props} style={[{ padding: espaco.padrao }, style]} />;
}

export function CardFooter({ style, ...props }: CardProps) {
  const { cores } = useTema();
  return <View {...props} style={[{ paddingHorizontal: espaco.padrao, paddingVertical: espaco.medio, borderTopWidth: interacao.borda, borderTopColor: cores.borda }, style]} />;
}
