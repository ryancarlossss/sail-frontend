import { Image, View } from 'react-native';
import { IconButton } from './ui/IconButton';
import { usePreferenciasInterface } from '../theme/PreferenciasProvider';
import { dimensao, espaco } from '../theme/design';

export default function AppHeader({ onNotifications, alert = false, showActions = true }: { onNotifications?: () => void; alert?: boolean; showActions?: boolean }) {
  const { valoresOcultos, alternarValores } = usePreferenciasInterface();
  return <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: dimensao.toque, gap: espaco.medio, marginBottom: espaco.medio }}>
    <Image source={require('../assets/images/logo-completa.png')} accessibilityLabel="Sail" resizeMode="contain" style={{ width: dimensao.logoLargura, height: dimensao.logoAltura }} />
    {showActions && <View style={{ flexDirection: 'row', gap: espaco.pequeno }}>
      <IconButton icon={valoresOcultos ? 'eye-off' : 'eye'} label={valoresOcultos ? 'Mostrar valores' : 'Ocultar valores'} onPress={alternarValores} selected={valoresOcultos} outlined />
      {onNotifications && <IconButton icon="bell" label="Alertas do estoque" onPress={onNotifications} badge={alert} outlined />}
    </View>}
  </View>;
}
