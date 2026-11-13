import { useState, type ReactNode } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { AppText } from './AppText';
import { useTema } from '../../hooks/useTema';
import { dimensao, espaco, interacao, raio, tipografia } from '../../theme/design';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
  containerClassName?: string;
}

export function Input({ label, error, leftElement, rightElement, containerClassName, style, onFocus, onBlur, ...props }: InputProps) {
  const { cores } = useTema();
  const [focado, setFocado] = useState(false);
  return <View className={containerClassName} style={{ gap: espaco.pequeno, minWidth: 0 }}>
    {label && <AppText variant="legenda">{label}</AppText>}
    <View style={{ justifyContent: 'center' }}>
      <TextInput {...props} accessibilityLabel={props.accessibilityLabel ?? label} placeholderTextColor={cores.textoSecundario}
        onFocus={evento => { setFocado(true); onFocus?.(evento); }} onBlur={evento => { setFocado(false); onBlur?.(evento); }}
        style={[tipografia.corpo, { minHeight: dimensao.toque, paddingVertical: espaco.pequeno,
          paddingLeft: leftElement ? dimensao.toque : espaco.padrao, paddingRight: rightElement ? dimensao.toque : espaco.padrao,
          borderRadius: raio.padrao, borderWidth: interacao.foco, borderColor: error ? cores.perigo : focado ? cores.destaque : cores.bordaEntrada,
          backgroundColor: cores.entrada, color: cores.texto, width: '100%' }, style]} />
      {leftElement && <View pointerEvents="none" style={{ position: 'absolute', left: espaco.padrao }}>{leftElement}</View>}
      {rightElement && <View style={{ position: 'absolute', right: 0 }}>{rightElement}</View>}
    </View>
    {error && <AppText variant="legenda" tone="perigo" accessibilityRole="alert">{error}</AppText>}
  </View>;
}
