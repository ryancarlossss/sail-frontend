import { View, type ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppText } from './AppText';
import { Button } from './Button';
import { useTema } from '../../hooks/useTema';
import { dimensao, espaco, interacao, raio } from '../../theme/design';

interface SettingsRowProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  last?: boolean;
  selected?: boolean;
  disabled?: boolean;
  unavailable?: boolean;
}

export function SettingsRow({ icon, title, subtitle, onPress, last = false, selected, disabled, unavailable = false }: SettingsRowProps) {
  const { cores } = useTema();
  const interativo = !!onPress && !unavailable;
  const estilo: ViewStyle = { backgroundColor: cores.superficie, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start',
    minHeight: dimensao.toque, paddingHorizontal: espaco.medio, paddingVertical: espaco.pequeno, gap: espaco.medio, borderRadius: 0 };
  const conteudo = <>
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
      style={{ width: dimensao.iconeFundo, height: dimensao.iconeFundo, borderRadius: raio.pequeno, backgroundColor: cores.destaqueSuave, alignItems: 'center', justifyContent: 'center' }}>
      <Feather name={icon} color={cores.destaque} size={dimensao.icone} />
    </View>
    <View style={{ flex: 1, minWidth: 0, gap: espaco.minimo }}>
      <AppText variant="botao">{title}</AppText>
      {subtitle && <AppText variant="legenda" tone="secundario">{subtitle}</AppText>}
      {unavailable && <AppText variant="legenda" tone="secundario">Indisponível nesta versão</AppText>}
    </View>
    {interativo && <Feather name={selected ? 'check' : 'chevron-right'} color={selected ? cores.destaque : cores.textoSecundario} size={dimensao.iconePequeno} />}
  </>;
  return <View>
    {interativo ? <Button variant="ghost" onPress={onPress} disabled={disabled} accessibilityLabel={title} accessibilityHint={subtitle} accessibilityState={{ selected }} style={estilo}>
      {conteudo}
    </Button> : <View accessible accessibilityLabel={[title, subtitle, unavailable ? 'Indisponível nesta versão' : null].filter(Boolean).join('. ')}
      accessibilityState={{ disabled: unavailable }} aria-disabled={unavailable || undefined} style={estilo}>{conteudo}</View>}
    {!last && <View style={{ height: interacao.borda, backgroundColor: cores.borda, marginLeft: dimensao.iconeFundo + espaco.amplo, marginRight: espaco.padrao }} />}
  </View>;
}
