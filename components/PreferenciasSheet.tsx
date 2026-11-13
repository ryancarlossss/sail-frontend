import { AppSheet } from './ui/AppSheet';
import { AppText } from './ui/AppText';
import { Card } from './ui/Card';
import { SettingsRow } from './ui/SettingsRow';
import Feedback from './Feedback';
import { usePreferenciasInterface } from '../theme/PreferenciasProvider';
import { rotulosTema, type PreferenciaTema } from '../lib/preferencias';

const opcoes: { tema: PreferenciaTema; icon: 'monitor' | 'sun' | 'moon'; descricao: string }[] = [
  { tema: 'system', icon: 'monitor', descricao: 'Acompanhar a aparência do dispositivo' },
  { tema: 'light', icon: 'sun', descricao: 'Uma interface clara e leve' },
  { tema: 'dark', icon: 'moon', descricao: 'Uma interface escura e confortável' },
];

export function PreferenciasSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { tema, definirTema, salvando, erro } = usePreferenciasInterface();
  return <AppSheet visible={visible} title="Aparência" onClose={onClose}>
    <AppText tone="secundario">Escolha como o Sail aparece neste dispositivo.</AppText>
    <Card>{opcoes.map((opcao, indice) => <SettingsRow key={opcao.tema} title={rotulosTema[opcao.tema]} subtitle={opcao.descricao}
      icon={opcao.icon} onPress={() => { void definirTema(opcao.tema); }} selected={tema === opcao.tema} disabled={salvando} last={indice === opcoes.length - 1} />)}</Card>
    <Feedback mensagem={erro} />
  </AppSheet>;
}
