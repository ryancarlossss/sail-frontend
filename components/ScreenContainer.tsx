import { View, type ViewProps } from 'react-native';
import { useTema } from '../hooks/useTema';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenContainerProps extends ViewProps {
  safeArea?: boolean;
}

export default function ScreenContainer({ style, safeArea = true, ...props }: ScreenContainerProps) {
  const { cores } = useTema();
  const insets = useSafeAreaInsets();
  return <View {...props} style={[{ flex: 1, minHeight: 0, backgroundColor: cores.fundo,
    paddingTop: safeArea ? insets.top : 0, paddingLeft: safeArea ? insets.left : 0, paddingRight: safeArea ? insets.right : 0 }, style]} />;
}
