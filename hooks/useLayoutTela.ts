import { useWindowDimensions, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { dimensao, espaco } from '../theme/design';

export function useLayoutTela() {
  const { width, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const compacto = width < 360 || fontScale >= 1.3;
  const conteudo: ViewStyle = {
    width: '100%', maxWidth: dimensao.larguraMaxima, alignSelf: 'center',
    paddingHorizontal: width <= 430 ? espaco.padrao : espaco.amplo,
    paddingTop: espaco.pequeno, paddingBottom: espaco.padrao,
  };
  return { compacto, conteudo, insets };
}
