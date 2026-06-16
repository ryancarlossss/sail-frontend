import React from 'react';
import { ImageBackground } from 'react-native';
import { useColorScheme } from 'nativewind';

interface BackgroundWrapperProps {
  children: React.ReactNode;
}

export default function BackgroundWrapper({ children }: BackgroundWrapperProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';


  const darkBg = require('../assets/images/background_preto.png');
  const lightBg = require('../assets/images/background_branco.png');

  return (
    <ImageBackground
      source={isDark ? darkBg : lightBg}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      {children}
    </ImageBackground>
  );
}