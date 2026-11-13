import type { ReactNode } from 'react';
import ScreenContainer from './ScreenContainer';

interface BackgroundWrapperProps {
  children: ReactNode;
}

export default function BackgroundWrapper({ children }: BackgroundWrapperProps) {
  return <ScreenContainer safeArea={false}>{children}</ScreenContainer>;
}
