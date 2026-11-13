import { AppSheet } from './ui/AppSheet';
import { AppText } from './ui/AppText';
import { Button } from './ui/Button';

export function AlertasEstoqueSheet({ visible, onClose, onView }: { visible: boolean; onClose: () => void; onView: () => void }) {
  return <AppSheet visible={visible} title="Alertas do estoque" onClose={onClose}>
    <AppText>Confira os produtos sem unidades disponíveis e mantenha seu estoque em dia.</AppText>
    <Button icon="package" onPress={onView}>Ver produtos sem estoque</Button>
    <AppText variant="legenda" tone="secundario">Os avisos deste aplicativo podem ser consultados aqui. As notificações do dispositivo ainda não estão disponíveis nesta versão.</AppText>
  </AppSheet>;
}
