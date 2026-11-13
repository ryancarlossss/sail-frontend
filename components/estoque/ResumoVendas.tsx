import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { AppText } from '../ui/AppText';
import { IconButton } from '../ui/IconButton';
import { Skeleton } from '../ui/StatePanel';
import Feedback from '../Feedback';
import { useTema } from '../../hooks/useTema';
import { variacaoVendas } from '../../lib/estoque';
import { formatCurrency } from '../../lib/utils';
import { dimensao, espaco, raio } from '../../theme/design';

interface ResumoVendasProps {
  total: number | null;
  anterior: number | null;
  carregando: boolean;
  comparando: boolean;
  erro: string | null;
  erroComparacao: string | null;
  oculto: boolean;
  periodo: string;
  aoAtualizar: () => void;
  aoHistorico: () => void;
}

export function ResumoVendas({ total, anterior, carregando, comparando, erro, erroComparacao, oculto, periodo, aoAtualizar, aoHistorico }: ResumoVendasProps) {
  const { cores } = useTema();
  const variacao = comparando || erroComparacao ? null : variacaoVendas(total, anterior);
  const valor = total === null ? '—' : oculto ? '••••' : formatCurrency(total);
  return <Card elevated style={{ padding: espaco.medio, marginBottom: espaco.pequeno }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: espaco.pequeno, marginBottom: espaco.pequeno }}>
      <View style={{ width: dimensao.iconeFundo, height: dimensao.iconeFundo, borderRadius: raio.pequeno, alignItems: 'center', justifyContent: 'center', backgroundColor: cores.destaqueSuave }}>
        <Feather name="trending-up" size={dimensao.icone} color={cores.destaque} />
      </View>
      <AppText variant="rotulo" tone="secundario" style={{ flex: 1 }}>VENDAS TOTAIS</AppText>
      <IconButton icon="arrow-up-right" label="Ver histórico de vendas" onPress={aoHistorico} />
    </View>
    {carregando ? <Skeleton label="Carregando total de vendas" /> : erro ? <Feedback mensagem={erro} aoTentarNovamente={aoAtualizar} /> : <>
      <AppText variant={valor.length > 20 ? 'secao' : 'valor'} accessibilityLabel={oculto ? 'Total de vendas oculto' : 'Total de vendas: ' + valor}>{valor}</AppText>
      <AppText variant="legenda" tone="secundario" style={{ marginTop: espaco.minimo }}>Vendas registradas em {periodo}</AppText>
      {!oculto && variacao !== null && <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: espaco.minimo, marginTop: espaco.pequeno, alignSelf: 'flex-start', paddingHorizontal: espaco.pequeno, paddingVertical: espaco.minimo, borderRadius: raio.circular, backgroundColor: cores.destaqueSuave }}>
        <Feather name={variacao > 0 ? 'trending-up' : variacao < 0 ? 'trending-down' : 'minus'} size={dimensao.iconePequeno} color={cores.destaque} />
        <AppText variant="legenda" style={{ color: cores.textoSucesso }}>{variacao > 0 ? '+' : ''}{variacao.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% vs. mês anterior</AppText>
      </View>}
      {!oculto && variacao === null && <AppText variant="legenda" tone="secundario" style={{ marginTop: espaco.pequeno }}>{comparando ? 'Comparando períodos…' : erroComparacao ? 'Comparação indisponível no momento.' : 'Sem base para comparação com o mês anterior.'}</AppText>}
    </>}
  </Card>;
}
