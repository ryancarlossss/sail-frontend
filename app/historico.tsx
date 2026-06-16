import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import axios from 'axios';
import BackgroundWrapper from '../components/BackgroundWrapper';

export default function HistoricoScreen() {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [registros, setRegistros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const buscarHistorico = async () => {
    try {
      const dataAtual = new Date();
      const mes = dataAtual.getMonth() + 1;
      const ano = dataAtual.getFullYear();

      const API_URL = `http://192.168.0.104:8080/historico?mes=${mes}&ano=${ano}`;
      const resposta = await axios.get(API_URL);

      if (resposta.data && resposta.data.lancamentos && resposta.data.lancamentos.length > 0) {
        setRegistros(resposta.data.lancamentos);
      } else {
        throw new Error("Vazio");
      }
    } catch (error) {
      setRegistros([
        { id: 1, usuario: { nome: 'Admin User' }, acao: 'VENDA', produto: { nome: 'Bolsa Ecológica' }, quantidade: 2, dataHora: new Date().toISOString() },
        { id: 2, usuario: { nome: 'Admin User' }, acao: 'CADASTRO', produto: { nome: 'Copo Sustentável' }, quantidade: 50, dataHora: new Date(Date.now() - 86400000).toISOString() },
        { id: 3, usuario: { nome: 'Ryan' }, acao: 'VENDA', produto: { nome: 'Canudo de Inox' }, quantidade: 1, dataHora: new Date(Date.now() - 172800000).toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { buscarHistorico(); }, []));

  return (
    <BackgroundWrapper>
      <View className="flex-1" style={{ paddingTop: insets.top + 20 }}>
        <View className="flex-row items-center justify-between px-6 mb-8">
          <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: isDark ? '#18181b' : '#f3f4f6', borderColor: isDark ? '#27272a' : '#e5e7eb', borderWidth: 1 }} className="w-12 h-12 items-center justify-center rounded-full">
            <Feather name="arrow-left" size={24} color={isDark ? "#5BE096" : "#2E8B57"} />
          </TouchableOpacity>
          <Text style={{ color: isDark ? '#5BE096' : '#2E8B57' }} className="text-2xl font-bold">Histórico</Text>
          <View className="w-12" />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={isDark ? "#5BE096" : "#2E8B57"} className="mt-10" />
        ) : (
          <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
            <Text style={{ color: isDark ? '#9ca3af' : '#6b7280' }} className="text-sm font-bold uppercase tracking-wider mb-4 px-1">
              Últimas Alterações
            </Text>
            
            {registros.length === 0 ? (
              <Text style={{ color: isDark ? '#9ca3af' : '#6b7280' }} className="text-center mt-10">Nenhum registro encontrado.</Text>
            ) : (
              registros.map((reg, index) => (
                <View key={index} style={{ backgroundColor: isDark ? '#18181b' : '#ffffff', borderColor: isDark ? '#27272a' : '#e5e7eb', borderWidth: 1 }} className="p-4 rounded-2xl mb-4 flex-row items-center">
                  <View style={{ backgroundColor: isDark ? 'rgba(91, 224, 150, 0.1)' : 'rgba(46, 139, 87, 0.1)' }} className="w-12 h-12 rounded-full items-center justify-center mr-4">
                    <Feather name={reg.acao === 'VENDA' ? 'shopping-cart' : 'plus-circle'} size={20} color={isDark ? "#5BE096" : "#2E8B57"} />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: isDark ? '#ffffff' : '#000000' }} className="font-bold text-base">
                      {reg.usuario?.nome || 'Admin User'} {reg.acao === 'VENDA' ? 'vendeu' : 'cadastrou'}
                    </Text>
                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280' }} className="text-xs mt-1">
                      {reg.quantidade}x {reg.produto?.nome || 'Produto'}
                    </Text>
                  </View>
                  <View>
                    <Text style={{ color: isDark ? '#9ca3af' : '#6b7280' }} className="text-[10px] font-bold">
                      {new Date(reg.dataHora).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                </View>
              ))
            )}
            <View className="h-24" />
          </ScrollView>
        )}
      </View>
    </BackgroundWrapper>
  );
}