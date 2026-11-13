import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/StatePanel';
import { useTema } from '../../hooks/useTema';
import { useLayoutTela } from '../../hooks/useLayoutTela';
import { dimensao, espaco, interacao, raio } from '../../theme/design';
import { formatCurrency } from '../../lib/utils';
import type { UsuarioResumo, ResumoEstoque } from '../../lib/contratos';

export function ProfileHeader({ usuario, aoEditar }: { usuario: UsuarioResumo | null; aoEditar: () => void }) {
  const { cores } = useTema();
  const nome = usuario?.nome.trim() || 'Conta Sail';
  return <Card testID="identificacao-perfil" elevated style={{ marginBottom: espaco.medio }}>
    <Button variant="ghost" onPress={aoEditar} accessibilityLabel="Ver dados" accessibilityHint={[nome, usuario?.email].filter(Boolean).join('. ')}
      style={{ padding: espaco.medio, justifyContent: 'flex-start', gap: espaco.medio, borderRadius: raio.card }}>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
        style={{ width: dimensao.avatar, height: dimensao.avatar, borderRadius: raio.circular, backgroundColor: cores.destaqueSuave, alignItems: 'center', justifyContent: 'center' }}>
        <Feather name="user" size={dimensao.iconeGrande} color={cores.destaque} />
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: espaco.minimo }}>
        <AppText variant="destaque">{nome}</AppText>
        <AppText variant="legenda" tone="secundario">{usuario?.email}</AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: espaco.minimo }}>
          <AppText variant="legenda" tone="destaque">Ver dados</AppText>
          <Feather name="chevron-right" size={dimensao.iconePequeno} color={cores.destaque} />
        </View>
      </View>
    </Button>
  </Card>;
}

export function MetricasPerfil({ dados, carregando, oculto }: { dados: ResumoEstoque | null; carregando: boolean; oculto: boolean }) {
  const { cores } = useTema();
  const { compacto } = useLayoutTela();
  const metricas = [
    { label: dados?.quantidadeProdutos === 1 ? 'Produto' : 'Produtos', valor: dados?.quantidadeProdutos.toLocaleString('pt-BR') ?? '—' },
    { label: 'Em estoque', valor: dados === null ? '—' : oculto ? '••••' : formatCurrency(dados.valorEstoque) },
  ];
  return <Card style={{ paddingVertical: espaco.pequeno, marginBottom: espaco.amplo }}>
    {carregando ? <View style={{ paddingHorizontal: espaco.medio }}><Skeleton label="Carregando resumo do estoque" /></View>
      : <View style={{ flexDirection: compacto ? 'column' : 'row' }}>{metricas.map((metrica, indice) => <View key={metrica.label}
        style={{ flex: compacto ? undefined : 1, minWidth: 0, alignItems: 'center', padding: espaco.pequeno, gap: espaco.minimo,
          borderRightWidth: !compacto && indice === 0 ? interacao.borda : 0, borderRightColor: cores.borda }}>
        <AppText variant={metrica.valor.length > 10 ? 'botao' : 'destaque'} style={{ textAlign: 'center' }}>{metrica.valor}</AppText>
        <AppText variant="legenda" tone="secundario" style={{ textAlign: 'center' }}>{metrica.label}</AppText>
      </View>)}</View>}
  </Card>;
}
