import { View } from 'react-native';
import { Card } from '../ui/Card';
import { AppText } from '../ui/AppText';
import { Skeleton } from '../ui/StatePanel';
import { useLayoutTela } from '../../hooks/useLayoutTela';
import { espaco } from '../../theme/design';
import { formatCurrency } from '../../lib/utils';
import type { ResumoEstoque } from '../../lib/contratos';

export function IndicadoresEstoque({ dados, carregando, oculto }: { dados: ResumoEstoque | null; carregando: boolean; oculto: boolean }) {
  const { compacto } = useLayoutTela();
  return <Card style={{ padding: espaco.medio, marginBottom: espaco.pequeno }}>
    {carregando ? <Skeleton label="Carregando indicadores do estoque" /> : <View style={{ flexDirection: compacto ? 'column' : 'row', gap: espaco.medio }}>
      <View style={{ flex: 1, minWidth: 0, gap: espaco.minimo }}>
        <AppText variant="legenda" tone="secundario">Produtos cadastrados</AppText>
        <AppText variant="destaque">{dados?.quantidadeProdutos.toLocaleString('pt-BR') ?? '—'}</AppText>
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: espaco.minimo }}>
        <AppText variant="legenda" tone="secundario">Valor em estoque</AppText>
        <AppText variant="destaque">{dados === null ? '—' : oculto ? '••••' : formatCurrency(dados.valorEstoque)}</AppText>
      </View>
    </View>}
  </Card>;
}
