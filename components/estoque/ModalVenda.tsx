import { View } from 'react-native';
import Feedback from '../Feedback';
import { AppSheet } from '../ui/AppSheet';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { espaco } from '../../theme/design';
import { validarQuantidadeVenda, formatarTotalVenda } from '../../lib/venda';
import { formatCurrency } from '../../lib/utils';
import { Card } from '../ui/Card';
import { LoadingState } from '../ui/StatePanel';

interface ModalVendaProps {
  visivel: boolean;
  nomeProduto?: string;
  preco?: number;
  saldo?: number;
  valoresOcultos?: boolean;
  carregando: boolean;
  pronta: boolean;
  quantidade: string;
  enviando: boolean;
  erro: string | null;
  aoAlterarQuantidade: (quantidade: string) => void;
  aoFechar: () => void;
  aoConfirmar: () => void;
  aoRecarregar: () => void;
}

export default function ModalVenda({ visivel, nomeProduto, preco, saldo, valoresOcultos, carregando, pronta, quantidade, enviando, erro, aoAlterarQuantidade, aoFechar, aoConfirmar, aoRecarregar }: ModalVendaProps) {
  const validacao = validarQuantidadeVenda(quantidade, saldo ?? 0);
  const total = validacao.quantidade !== undefined && preco !== undefined ? formatarTotalVenda(preco, validacao.quantidade) : null;
  return <AppSheet visible={visivel} title="Registrar venda" onClose={aoFechar} busy={enviando}>
    <AppText>Quantas unidades de {nomeProduto} deseja vender?</AppText>
    <Feedback mensagem={erro} />
    {carregando && <LoadingState label="Atualizando preço e saldo…" />}
    {!carregando && !pronta && <Button variant="outline" icon="refresh-cw" onPress={aoRecarregar}>Atualizar dados da venda</Button>}
    {pronta && <AppText variant="legenda" tone="secundario">{saldo} unidade(s) disponível(is) · {valoresOcultos ? '••••' : formatCurrency(preco ?? 0)} por unidade</AppText>}
    <Input label="Quantidade" accessibilityLabel="Quantidade da venda" editable={!enviando} value={quantidade} onChangeText={aoAlterarQuantidade}
      keyboardType="number-pad" returnKeyType="done" onSubmitEditing={() => { if (!enviando && pronta && total) aoConfirmar(); }} selectTextOnFocus />
    {pronta && <Card style={{ padding: espaco.medio }}>
      <AppText variant="legenda" tone="secundario">Total da venda</AppText>
      <AppText variant="destaque" accessibilityLiveRegion="polite">{total ? valoresOcultos ? '••••' : total : '—'}</AppText>
      {validacao.erro && <AppText variant="legenda" tone="perigo" accessibilityRole="alert">{validacao.erro}</AppText>}
      {!validacao.erro && !total && <AppText variant="legenda" tone="perigo">Revise o preço deste produto antes de vender.</AppText>}
    </Card>}
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: espaco.medio }}>
      <Button variant="secondary" disabled={enviando} onPress={aoFechar} style={{ flex: 1 }}>Cancelar</Button>
      <Button icon="shopping-bag" loading={enviando && !carregando} disabled={!pronta || !total || carregando} onPress={aoConfirmar} accessibilityLabel="Confirmar venda" style={{ flex: 1 }}>Vender</Button>
    </View>
  </AppSheet>;
}
