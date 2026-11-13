import { Image, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { Produto } from '../../lib/contratos';
import { useTema } from '../../hooks/useTema';
import { useLayoutTela } from '../../hooks/useLayoutTela';
import { Card } from '../ui/Card';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';
import { StatusBadge } from '../ui/StatusBadge';
import { dimensao, espaco, interacao, raio } from '../../theme/design';
import { formatCurrency } from '../../lib/utils';

interface ProdutoEstoqueProps {
  produto: Produto;
  enviando: boolean;
  valoresOcultos?: boolean;
  aoVender: (produto: Produto) => void;
  aoEditar: (produto: Produto) => void;
  aoExcluir: (id: number) => void;
}

export default function ProdutoEstoque({ produto, enviando, valoresOcultos = false, aoVender, aoEditar, aoExcluir }: ProdutoEstoqueProps) {
  const { cores } = useTema();
  const { compacto } = useLayoutTela();
  const semEstoque = produto.quantidade <= 0;
  return <Card testID={'produto-' + produto.id} elevated style={{ padding: espaco.medio, marginBottom: espaco.medio }}>
    <View style={{ flexDirection: compacto ? 'column' : 'row', gap: espaco.medio, alignItems: 'flex-start' }}>
      <View style={{ width: dimensao.produto, height: dimensao.produto, borderRadius: raio.padrao, backgroundColor: cores.destaqueSuave, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {produto.imagem ? <Image source={{ uri: produto.imagem }} resizeMode="cover" accessibilityLabel={produto.nome} style={{ width: '100%', height: '100%' }} />
          : <Feather name="package" size={dimensao.iconeGrande} color={cores.destaque} />}
      </View>
      <View style={{ flex: compacto ? undefined : 1, width: compacto ? '100%' : undefined, minWidth: 0, gap: espaco.minimo }}>
        <AppText variant="destaque">{produto.nome || 'Produto sem nome'}</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: espaco.pequeno }}>
          <AppText variant="destaque" tone="destaque" accessibilityLabel={valoresOcultos ? 'Preço oculto' : undefined}>{valoresOcultos ? '••••' : formatCurrency(produto.preco)}</AppText>
          <StatusBadge label={semEstoque ? 'Sem estoque' : 'Ativo'} danger={semEstoque} />
        </View>
        <AppText variant="legenda" tone="secundario">{produto.quantidade === 1 ? '1 unidade disponível' : produto.quantidade + ' unidades disponíveis'}</AppText>
      </View>
    </View>
    <View style={{ height: interacao.borda, backgroundColor: cores.borda, marginVertical: espaco.pequeno }} />
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: espaco.pequeno }}>
      <Button icon="shopping-bag" onPress={() => aoVender(produto)} disabled={semEstoque || enviando} accessibilityLabel={'Vender ' + produto.nome}
        accessibilityHint={semEstoque ? 'Este produto está sem unidades disponíveis' : undefined} style={{ flex: compacto ? undefined : 1, width: compacto ? '100%' : undefined }}>Vender</Button>
      <IconButton icon="edit-2" label={'Editar ' + produto.nome} disabled={enviando} onPress={() => aoEditar(produto)} />
      <IconButton icon="trash-2" label={'Excluir ' + produto.nome} disabled={enviando} danger onPress={() => aoExcluir(produto.id)} />
    </View>
  </Card>;
}
