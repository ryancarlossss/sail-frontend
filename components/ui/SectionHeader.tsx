import { View } from 'react-native';
import { AppText } from './AppText';
import { Button } from './Button';
import { espaco } from '../../theme/design';

export function SectionHeader({ title, label = false, action, onPress }: { title: string; label?: boolean; action?: string; onPress?: () => void }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: espaco.pequeno, marginBottom: espaco.pequeno }}>
    <AppText accessibilityRole="header" variant={label ? 'rotulo' : 'secao'} tone={label ? 'secundario' : 'principal'}>{label ? title.toLocaleUpperCase('pt-BR') : title}</AppText>
    {action && onPress && <Button variant="ghost" size="sm" onPress={onPress} style={{ paddingHorizontal: espaco.pequeno }}>{action}</Button>}
  </View>;
}
