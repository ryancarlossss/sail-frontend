import { AppSheet } from '../ui/AppSheet';
import { Card } from '../ui/Card';
import { SettingsRow } from '../ui/SettingsRow';
import { rotulosFiltro, type FiltroEstoque } from '../../lib/estoque';

const filtros: FiltroEstoque[] = ['todos', 'com-estoque', 'sem-estoque'];

export function FiltrosEstoqueSheet({ visible, filtro, onClose, onSelect }: { visible: boolean; filtro: FiltroEstoque; onClose: () => void; onSelect: (filtro: FiltroEstoque) => void }) {
  return <AppSheet visible={visible} title="Filtrar produtos" onClose={onClose}>
    <Card>{filtros.map((opcao, indice) => <SettingsRow key={opcao} icon="package" title={rotulosFiltro[opcao]}
      onPress={() => onSelect(opcao)} selected={filtro === opcao} last={indice === filtros.length - 1} />)}</Card>
  </AppSheet>;
}
