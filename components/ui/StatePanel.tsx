import { ActivityIndicator, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppText } from './AppText';
import { Button } from './Button';
import { useTema } from '../../hooks/useTema';
import { dimensao, espaco, raio } from '../../theme/design';

export function LoadingState({ label = 'Carregando produtos' }: { label?: string }) {
  const { cores } = useTema();
  return <View accessibilityRole="progressbar" accessibilityLabel={label} style={{ alignItems: 'center', padding: espaco.amplo, gap: espaco.medio }}>
    <ActivityIndicator color={cores.destaque} /><AppText tone="secundario">{label}</AppText>
  </View>;
}

export function EmptyState({ title, message, action, onPress }: { title: string; message: string; action?: string; onPress?: () => void }) {
  const { cores } = useTema();
  return <View style={{ alignItems: 'center', paddingVertical: espaco.secao, gap: espaco.medio }}>
    <View style={{ width: dimensao.avatar, height: dimensao.avatar, borderRadius: raio.card, backgroundColor: cores.destaqueSuave, alignItems: 'center', justifyContent: 'center' }}>
      <Feather name="package" size={dimensao.iconeGrande} color={cores.destaque} />
    </View>
    <AppText variant="destaque" style={{ textAlign: 'center' }}>{title}</AppText>
    <AppText tone="secundario" style={{ textAlign: 'center' }}>{message}</AppText>
    {action && onPress && <Button onPress={onPress}>{action}</Button>}
  </View>;
}

export function Skeleton({ label }: { label: string }) {
  const { cores } = useTema();
  return <View accessibilityRole="progressbar" accessibilityLabel={label} style={{ gap: espaco.pequeno, paddingVertical: espaco.pequeno }}>
    <View style={{ width: '72%', height: espaco.amplo, borderRadius: raio.pequeno, backgroundColor: cores.esqueleto }} />
    <View style={{ width: '48%', height: espaco.medio, borderRadius: raio.pequeno, backgroundColor: cores.esqueleto }} />
  </View>;
}
