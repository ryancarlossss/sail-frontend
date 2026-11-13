import { View } from 'react-native';
import { AppText } from './AppText';
import { useTema } from '../../hooks/useTema';
import { dimensao, espaco, raio } from '../../theme/design';

export function StatusBadge({ label, danger = false }: { label: string; danger?: boolean }) {
  const { cores } = useTema();
  const cor = danger ? cores.perigo : cores.textoSucesso;
  return <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: espaco.minimo,
    paddingHorizontal: espaco.medio, paddingVertical: espaco.minimo, borderRadius: raio.circular, backgroundColor: danger ? cores.fundoErro : cores.destaqueSuave }}>
    <View style={{ width: dimensao.ponto, height: dimensao.ponto, borderRadius: raio.circular, backgroundColor: cor }} />
    <AppText variant="legenda" style={{ color: cor, fontWeight: '600' }}>{label}</AppText>
  </View>;
}
