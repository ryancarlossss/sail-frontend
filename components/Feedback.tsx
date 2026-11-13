import { View } from 'react-native';
import { AppText } from './ui/AppText';
import { Button } from './ui/Button';
import { useTema } from '../hooks/useTema';
import { espaco, raio } from '../theme/design';

interface FeedbackProps {
  mensagem: string | null;
  sucesso?: boolean;
  aoTentarNovamente?: () => void;
  desabilitado?: boolean;
  textoAcao?: string;
}

export default function Feedback({ mensagem, sucesso = false, aoTentarNovamente, desabilitado, textoAcao = 'Tentar novamente' }: FeedbackProps) {
  const { cores } = useTema();
  if (!mensagem) return null;
  return <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={{ borderRadius: raio.padrao, padding: espaco.padrao, marginBottom: espaco.padrao, gap: espaco.pequeno, backgroundColor: sucesso ? cores.fundoSucesso : cores.fundoErro }}>
    <AppText style={{ color: sucesso ? cores.textoSucesso : cores.textoErro }}>{mensagem}</AppText>
    {aoTentarNovamente && <Button variant={sucesso ? 'secondary' : 'danger'} disabled={desabilitado} onPress={aoTentarNovamente}>{textoAcao}</Button>}
  </View>;
}
