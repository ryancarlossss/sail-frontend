import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Button } from './Button';
import { useTema } from '../../hooks/useTema';
import { dimensao, espaco, raio } from '../../theme/design';

interface IconButtonProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  selected?: boolean;
  danger?: boolean;
  badge?: boolean;
  outlined?: boolean;
}

export function IconButton({ icon, label, onPress, disabled, selected, danger, badge, outlined }: IconButtonProps) {
  const { cores } = useTema();
  return <Button onPress={onPress} accessibilityLabel={label} accessibilityState={{ selected }} disabled={disabled}
    variant={danger ? 'danger' : outlined ? 'outline' : 'secondary'}
    style={{ width: dimensao.toque, height: dimensao.toque, paddingHorizontal: 0, position: 'relative' }}>
    <Feather name={icon} size={dimensao.icone} color={danger ? cores.perigo : outlined ? cores.texto : cores.destaque} />
    {badge && <View pointerEvents="none" style={{ position: 'absolute', top: espaco.minimo, right: espaco.minimo, width: dimensao.ponto, height: dimensao.ponto, borderRadius: raio.circular, backgroundColor: cores.destaque }} />}
  </Button>;
}
