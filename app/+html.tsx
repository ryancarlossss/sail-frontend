import { ScrollViewStyleReset, useServerDocumentContext } from 'expo-router/html';
import type { PropsWithChildren } from 'react';
import { espaco } from '../theme/design';
import tokens from '../theme/tokens.json';

const estilos = `
:root {
  --sail-inset-top: env(safe-area-inset-top, 0px);
  --sail-inset-right: env(safe-area-inset-right, 0px);
  --sail-inset-bottom: env(safe-area-inset-bottom, 0px);
  --sail-inset-left: env(safe-area-inset-left, 0px);
}
#root {
  box-sizing: border-box;
  padding: var(--sail-inset-top) var(--sail-inset-right) var(--sail-inset-bottom) var(--sail-inset-left);
  background: ${tokens.temas.claro.fundo};
}
.dark #root { background: ${tokens.temas.escuro.fundo}; }
.sail-safe-sheet {
  padding-bottom: calc(${espaco.amplo}px + var(--sail-inset-bottom)) !important;
  padding-left: max(${espaco.amplo}px, calc(var(--sail-inset-left) + ${espaco.pequeno}px)) !important;
  padding-right: max(${espaco.amplo}px, calc(var(--sail-inset-right) + ${espaco.pequeno}px)) !important;
}
`;

export default function RootHtml({ children }: PropsWithChildren) {
  const { headNodes, bodyNodes, htmlAttributes, bodyAttributes } = useServerDocumentContext();
  return <html {...htmlAttributes} lang="pt-BR">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      <ScrollViewStyleReset />
      {headNodes}
      <style>{estilos}</style>
    </head>
    <body {...bodyAttributes}>{children}{bodyNodes}</body>
  </html>;
}
