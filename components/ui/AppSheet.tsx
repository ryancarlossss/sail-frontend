import { Modal, View, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import type { ReactNode } from 'react';
import { AppText } from './AppText';
import { IconButton } from './IconButton';
import { useTema } from '../../hooks/useTema';
import { useLayoutTela } from '../../hooks/useLayoutTela';
import { useMovimentoReduzido } from '../../hooks/useMovimentoReduzido';
import { dimensao, espaco, raio } from '../../theme/design';

interface AppSheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  busy?: boolean;
  children: ReactNode;
}

export function AppSheet({ visible, title, onClose, busy = false, children }: AppSheetProps) {
  const { cores } = useTema();
  const { insets } = useLayoutTela();
  const reduzido = useMovimentoReduzido();
  const fechar = () => { if (!busy) onClose(); };
  return <Modal visible={visible} transparent animationType={reduzido ? 'none' : 'fade'} onRequestClose={fechar}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: cores.sobreposicao }}>
      <Pressable accessibilityLabel="Fechar janela" accessibilityRole="button" disabled={busy} onPress={fechar} style={{ flex: 1 }} />
      <View className="sail-safe-sheet" accessibilityViewIsModal style={{ backgroundColor: cores.superficie, maxHeight: '88%', width: '100%', maxWidth: dimensao.larguraMaxima, alignSelf: 'center', borderTopLeftRadius: raio.grande, borderTopRightRadius: raio.grande, padding: espaco.amplo, paddingLeft: Math.max(espaco.amplo, insets.left + espaco.pequeno), paddingRight: Math.max(espaco.amplo, insets.right + espaco.pequeno), paddingBottom: insets.bottom + espaco.amplo }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: espaco.medio, marginBottom: espaco.padrao }}>
          <AppText variant="secao" accessibilityRole="header" style={{ flex: 1 }}>{title}</AppText>
          <IconButton icon="x" label="Fechar" onPress={fechar} disabled={busy} />
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: espaco.padrao }}>
          {children}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  </Modal>;
}
