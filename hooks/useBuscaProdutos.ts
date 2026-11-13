import { useEffect, useMemo, useState } from 'react';
import { filtrarProdutos, type FiltroEstoque } from '../lib/estoque.ts';
import type { Produto } from '../lib/contratos.ts';

interface FonteProdutos {
  dados: Produto[];
  temMais: boolean;
  carregando: boolean;
  carregandoMais: boolean;
  erro: string | null;
  erroMais: string | null;
  carregarProxima: () => Promise<void>;
}

export function useBuscaProdutos(consulta: FonteProdutos) {
  const [busca, setBusca] = useState('');
  const [estavel, setEstavel] = useState('');
  const [filtro, setFiltro] = useState<FiltroEstoque>('todos');
  useEffect(() => {
    const timer = setTimeout(() => setEstavel(busca), 300);
    return () => clearTimeout(timer);
  }, [busca]);
  const ativa = busca.trim() !== '' || filtro !== 'todos';
  const { temMais, carregando, carregandoMais, erro, erroMais, carregarProxima } = consulta;
  useEffect(() => {
    if (ativa && estavel === busca && temMais && !carregando && !carregandoMais && !erro && !erroMais) void carregarProxima();
  }, [ativa, estavel, busca, filtro, temMais, carregando, carregandoMais, erro, erroMais, carregarProxima, consulta.dados.length]);
  const produtos = useMemo(() => filtrarProdutos(consulta.dados, busca, filtro), [consulta.dados, busca, filtro]);
  return { busca, setBusca, filtro, setFiltro, produtos, ativa,
    buscando: ativa && (carregando || carregandoMais || temMais) && !erro && !erroMais };
}
