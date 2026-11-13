import { useState, type ReactNode } from 'react';
import { TouchableOpacity, ActivityIndicator, type TouchableOpacityProps } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AppText } from './AppText';
import { useTema } from '../../hooks/useTema';
import { dimensao, espaco, interacao, raio } from '../../theme/design';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  loading?: boolean;
  textClassName?: string;
  icon?: keyof typeof Feather.glyphMap;
}

export function Button({ variant = 'primary', size = 'md', children, loading = false, disabled, style, textClassName, icon, onFocus, onBlur, ...props }: ButtonProps) {
  const { cores } = useTema();
  const [focado, setFocado] = useState(false);
  const bloqueado = disabled || loading;
  const fundos = { primary: cores.destaque, secondary: cores.botaoDiscreto, outline: cores.superficie, ghost: cores.transparente, danger: cores.fundoErro };
  const texto = variant === 'primary' ? cores.textoContraste : variant === 'danger' ? cores.perigo : variant === 'secondary' ? cores.textoSucesso : cores.destaque;
  const borda = focado ? cores.destaque : variant === 'outline' ? cores.borda : fundos[variant];
  return (
    <TouchableOpacity {...props} accessibilityRole="button" accessibilityLabel={props.accessibilityLabel ?? (typeof children === 'string' ? children : undefined)} accessibilityState={{ ...props.accessibilityState, disabled: !!bloqueado, busy: loading }}
      aria-disabled={!!bloqueado} aria-busy={loading} aria-expanded={props.accessibilityState?.expanded} aria-pressed={props.accessibilityState?.selected}
      disabled={bloqueado} activeOpacity={interacao.opacidadeToque}
      onFocus={evento => { setFocado(true); onFocus?.(evento); }} onBlur={evento => { setFocado(false); onBlur?.(evento); }}
      style={[{ minHeight: size === 'sm' ? dimensao.toqueCompacto : dimensao.toque, minWidth: dimensao.toque,
        paddingHorizontal: size === 'lg' ? espaco.amplo : espaco.padrao, paddingVertical: espaco.pequeno,
        borderRadius: raio.pequeno, borderWidth: interacao.foco, borderColor: borda, backgroundColor: fundos[variant],
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: espaco.pequeno,
        opacity: bloqueado ? interacao.opacidadeDesabilitado : 1 }, style]}>
      {loading ? <ActivityIndicator color={texto} /> : <>
        {icon && <Feather name={icon} size={dimensao.iconePequeno} color={texto} />}
        {typeof children === 'string' ? <AppText variant="botao" className={textClassName} style={{ color: texto, textAlign: 'center' }}>{children}</AppText> : children}
      </>}
    </TouchableOpacity>
  );
}
