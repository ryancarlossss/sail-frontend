import { router } from 'expo-router';
import { AppSheet } from '../ui/AppSheet';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { SettingsRow } from '../ui/SettingsRow';
import { Card } from '../ui/Card';
import { usePreferenciasInterface } from '../../theme/PreferenciasProvider';
import type { UsuarioResumo } from '../../lib/contratos';

export type AcaoConta = 'dados' | 'senha' | 'privacidade' | 'ajuda' | 'sair';
const titulos: Record<AcaoConta, string> = { dados: 'Dados da conta', senha: 'Alterar senha', privacidade: 'Privacidade', ajuda: 'Ajuda e suporte', sair: 'Sair da conta?' };

export function ContaSheet({ acao, usuario, onClose, onLogout }: { acao: AcaoConta | null; usuario: UsuarioResumo | null; onClose: () => void; onLogout: () => void }) {
  const { valoresOcultos, alternarValores } = usePreferenciasInterface();
  return <AppSheet visible={acao !== null} title={acao ? titulos[acao] : ''} onClose={onClose}>
    {acao === 'dados' && <>
      <AppText variant="legenda" tone="secundario">Nome</AppText><AppText>{usuario?.nome || 'Conta Sail'}</AppText>
      <AppText variant="legenda" tone="secundario">E-mail</AppText><AppText>{usuario?.email}</AppText>
      <AppText tone="secundario">A edição dos dados da conta ainda não está disponível nesta versão.</AppText>
    </>}
    {acao === 'senha' && <AppText>A alteração de senha ainda não está disponível nesta versão. Sua senha atual continua sendo usada para entrar.</AppText>}
    {acao === 'privacidade' && <>
      <Card><SettingsRow icon={valoresOcultos ? 'eye-off' : 'eye'} title="Ocultar valores" subtitle="Apenas a exibição neste dispositivo" onPress={alternarValores} selected={valoresOcultos} last /></Card>
      <AppText tone="secundario">Esta preferência não altera os dados do seu estoque. Você também pode usar o ícone de visibilidade no cabeçalho.</AppText>
      <AppText tone="secundario">Ao sair da conta, será necessário entrar novamente para acessar seus dados.</AppText>
    </>}
    {acao === 'ajuda' && <>
      <AppText variant="botao">Como usar seu estoque</AppText>
      <AppText>Cadastre um produto com nome, preço e quantidade. Use Vender para registrar a saída de unidades.</AppText>
      <AppText>Os ícones de edição e exclusão ficam no cartão de cada produto. Ao remover um item, seu histórico é preservado.</AppText>
      <AppText tone="secundario">Se uma operação não for confirmada, atualize o estoque e confira o histórico antes de repetir.</AppText>
      <Button onPress={() => { onClose(); router.push('/historico'); }}>Consultar histórico</Button>
    </>}
    {acao === 'sair' && <>
      <AppText>Você precisará entrar novamente para continuar gerenciando seu estoque.</AppText>
      <Button variant="danger" icon="log-out" onPress={onLogout}>Sair da conta</Button>
    </>}
    <Button variant="secondary" onPress={onClose}>{acao === 'sair' ? 'Cancelar' : 'Concluir'}</Button>
  </AppSheet>;
}
