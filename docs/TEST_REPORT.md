# Relatório de testes — NeuroFisio Fase 1

Data da preparação: 23/11/2026. Escopo: versão inicial para fins educacionais.

## Testes executados e aprovados

1. **Verificação estrutural** (`node tests/structure.cjs`): arquivos essenciais, quatro modalidades, manifesto PWA, React/TypeScript/Vite configurados, build presente.
2. **Geração estática offline** (`node scripts/build-offline.cjs`): transpilação dos três módulos TS/TSX e criação do `dist/` com HTML, CSS, JS, vendor local, ícones, manifesto e service worker.
3. **Sintaxe de service workers** (`node --check`): versão para Vite e versão da distribuição offline aprovadas.
4. **Navegação por interface em Chromium headless**: visão geral, sete ambientes, alternância de modalId por busca e menus.
5. **Study**: seleção de tópico, marcação de revisão e entrada de nota.
6. **Signal Lab demonstrativo**: Canvas renderiza; seleção de 8 canais, controle de grade.
7. **Report Studio**: três campos editáveis e download do texto educacional.
8. **Biblioteca**: download do modelo JSON; importação de um índice de teste sem conteúdo clínico; o item aparece no Atlas e na Case Room.
9. **Busca**: pesquisa por termo curricular e abertura do módulo correspondente.
10. **Temas e mobile**: alternância escuro/claro e abertura/fechamento da navegação responsiva.
11. **Erros de execução JS**: nenhum erro detectado na rodada de testes da distribuição offline.

## Limitações do ambiente de testes

- O Chromium do ambiente não pode navegar diretamente para endereços HTTP/HTTPS ou `file://` (bloqueio administrativo). Para validar a interface, os arquivos compilados foram injetados em uma página de testes local do navegador, sem testar efetivamente o site publicado por URL.
- O registro npm ficou indisponível. Não foi possível executar uma instalação `npm install`, checagem completa dos tipos com os pacotes React ou `vite build`. O pacote está configurado para o Vite, mas esta rota exige verificação posterior quando o ambiente tiver acesso às dependências.
- O **PWA não foi testado de ponta a ponta**: instalação e persistência offline em Cloudflare Pages, Android e iOS dependem de testes em HTTPS.
- A gravação persistente entre reinícios do navegador não pôde ser testada num contexto de origem HTTP/HTTPS porque o navegador de testes bloqueou a navegação. A lógica local (localStorage e IndexedDB) foi implementada; a importação de índice foi testada com um armazenamento em memória emularado.
- Nenhum sinal ou exemplo clínico foi criado ou validado. Os sinais do Canvas foram explicitamente identificados como gráficos demonstrativos.

## Resultado

**Aprovado como protótipo funcional de Fase 1 para publicação experimental**, com validação pendente de compilação nativa Vite e PWA em um ambiente HTTP/HTTPS real. Não há autorização para utilizar o software em diagnóstico ou laudos assistenciais.
