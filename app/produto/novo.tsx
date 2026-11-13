import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { produtosService } from '../../services';
import { useFormularioProduto } from '../../hooks/useFormularioProduto';
import Feedback from '../../components/Feedback';
import { useTema } from '../../hooks/useTema';
import BackgroundWrapper from '../../components/BackgroundWrapper';

export default function NovoProdutoScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const { isDark, cores } = useTema();
  const primaryColor = cores.destaque;
  const {
    isEditing, produtoId, titulo, setTitulo, valor, setValor, quantidade, setQuantidade, imagem, setImagem,
    erro, setErro, sucesso, versao, carregandoProduto, precisaRecarregar, isLoading, bloqueado,
    carregarProduto, handleSalvar, estaAtivo,
  } = useFormularioProduto(produtosService, params.id);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 1,
      });
      if (!result.canceled && estaAtivo()) {
        const foto = result.assets[0];
        if (foto.fileSize && foto.fileSize > 5 * 1024 * 1024) {
          setErro('Selecione uma foto de até 5 MB.');
          return;
        }
        setImagem(foto.uri);
      }
    } catch (falha) {
      if (estaAtivo()) setErro('Não foi possível abrir suas fotos. Verifique a permissão de acesso e tente novamente.');
    }
  };

  return (
    <BackgroundWrapper>
      <View className="flex-1" style={{ paddingTop: insets.top + 20 }}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 24 }}>
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-transparent">
              <Feather name="arrow-left" size={24} color={primaryColor} />
            </TouchableOpacity>
            <Text className={`text-3xl font-bold italic absolute w-full text-center -z-10 ${isDark ? "text-[#5BE096]" : "text-[#2E8B57]"}`}>Sail.</Text>
            <View className="w-12" />
          </View>

          <View className="items-center mb-8">
            <Text className="text-3xl font-bold text-black dark:text-white mb-2">{isEditing ? "Editar Produto" : "Novo Produto"}</Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm">Preencha as informações do produto</Text>
          </View>

          <Feedback mensagem={erro} aoTentarNovamente={isEditing && (!versao || precisaRecarregar) && !!produtoId ? carregarProduto : undefined} textoAcao="Recarregar dados do produto" desabilitado={bloqueado} />
          <Feedback sucesso mensagem={sucesso} />
          {carregandoProduto && <ActivityIndicator accessibilityLabel="Carregando produto" color={primaryColor} className="mb-4" />}
          {sucesso && <TouchableOpacity onPress={() => router.back()} className="py-3 mb-4"><Text style={{ color: primaryColor }}>Voltar ao estoque</Text></TouchableOpacity>}
          <View className="mb-6">
            <Text className="text-sm font-bold text-black dark:text-white mb-2">Foto do Produto</Text>
            <TouchableOpacity disabled={bloqueado} onPress={pickImage} className={`w-full h-48 border-2 border-dashed rounded-2xl items-center justify-center bg-white/90 dark:bg-zinc-900/90 overflow-hidden ${isDark ? 'border-[#5BE096]' : 'border-[#2E8B57]'}`}>
              {imagem ? (
                <Image source={{ uri: imagem }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <View className="items-center">
                  <Feather name="camera" size={32} color={primaryColor} className="mb-2" />
                  <Text className={`font-bold ${isDark ? "text-[#5BE096]" : "text-[#2E8B57]"}`}>Adicionar foto</Text>
                  <Text className="text-gray-400 dark:text-gray-500 text-xs mt-1">PNG, JPG ou WEBP • Máx. 5MB</Text>
                </View>
              )}
            </TouchableOpacity>
            {imagem && <Text className="text-gray-500 dark:text-gray-400 text-xs mt-2">A foto selecionada é uma prévia local e ainda não será salva com o produto.</Text>}
            <View className={`rounded-xl p-4 flex-row items-center mt-4 bg-white/90 dark:bg-zinc-900/90 border border-gray-200 dark:border-transparent`}>
              <Feather name="image" size={18} color={primaryColor} className="mr-3" />
              <Text className={`text-xs font-medium ${isDark ? "text-[#5BE096]" : "text-[#2E8B57]"}`}>Uma boa foto ajuda a vender mais!</Text>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-bold text-black dark:text-white mb-2">Título do Produto</Text>
            <View className="relative justify-center">
              <View className="absolute left-4 z-10">
                <Feather name="tag" size={20} color={primaryColor} />
              </View>
              <TextInput editable={!bloqueado} value={titulo} onChangeText={setTitulo} placeholder="Ex: Bolsa Couro Ecológico" placeholderTextColor={isDark ? "#4b5563" : "#9CA3AF"} className={`w-full bg-white/90 dark:bg-zinc-900/90 text-black dark:text-white border rounded-2xl pl-12 pr-4 py-4 text-base ${isDark ? 'border-[#5BE096]' : 'border-[#2E8B57]'}`} />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-bold text-black dark:text-white mb-2">Valor</Text>
            <View className="relative justify-center">
              <View className="absolute left-4 z-10">
                <Text className={`font-bold text-base ${isDark ? "text-[#5BE096]" : "text-[#2E8B57]"}`}>R$</Text>
              </View>
              <TextInput editable={!bloqueado} value={valor} onChangeText={setValor} placeholder="0,00" placeholderTextColor={isDark ? "#4b5563" : "#9CA3AF"} keyboardType="numeric" className={`w-full bg-white/90 dark:bg-zinc-900/90 text-black dark:text-white border rounded-2xl pl-12 pr-4 py-4 text-base ${isDark ? 'border-[#5BE096]' : 'border-[#2E8B57]'}`} />
            </View>
          </View>

          <View className="mb-8">
            <Text className="text-sm font-bold text-black dark:text-white mb-2">Quantidade em Estoque</Text>
            <View className="relative justify-center">
              <View className="absolute left-4 z-10">
                <Feather name="package" size={20} color={primaryColor} />
              </View>
              <TextInput editable={!bloqueado} value={quantidade} onChangeText={setQuantidade} placeholder="0" placeholderTextColor={isDark ? "#4b5563" : "#9CA3AF"} keyboardType="numeric" className={`w-full bg-white/90 dark:bg-zinc-900/90 text-black dark:text-white border rounded-2xl pl-12 pr-4 py-4 text-base ${isDark ? 'border-[#5BE096]' : 'border-[#2E8B57]'}`} />
            </View>
          </View>

          <TouchableOpacity onPress={handleSalvar} disabled={bloqueado || precisaRecarregar || (isEditing && !versao)} className={`w-full py-4 rounded-2xl flex-row justify-center items-center mb-6 ${isLoading ? 'bg-gray-300 dark:bg-zinc-700' : 'bg-[#5BE096]'}`} activeOpacity={0.8}>
            {isLoading ? <ActivityIndicator color="#000000" /> : <><Feather name="save" size={20} color="#000000" className="mr-2" /><Text className="text-black font-bold text-lg">{sucesso ? "Salvo" : isEditing ? "Salvar Alterações" : "Salvar Produto"}</Text></>}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </BackgroundWrapper>
  );
}
