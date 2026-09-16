# Satanabe Admin — v0.2 Alpha

Segunda versão da nova linha de versionamento do painel administrativo. A **v0.1 Alpha** é a baseline original enviada pelo usuário; a **v0.2 Alpha** faz a primeira atualização visual sem reescrever as APIs existentes.

## O que mudou na v0.2 Alpha
- Nova identidade **preto + vermelho**, com vermelho usado apenas em ações e destaques.
- Fundo preto profundo, cards em grafite e bordas mais discretas.
- Botões menores e mais proporcionais no desktop.
- Botões mobile continuam com área de toque confortável, mas ocupam menos espaço visual.
- Abas, filtros, cards e botões receberam estados de hover/press mais suaves.
- Inputs e foco agora usam a identidade vermelha.
- Patches e Logs mantêm a lógica funcional da baseline.
- Título, cache-busting e identificação interna atualizados para `v0.2 Alpha`.

## Arquivos para publicar no GitHub Pages
Substitua/adicone na raiz do repositório:
- `index.html`
- `app.js`
- `styles.css`
- `README.md`
- `CHANGELOG.md`
- `VERSION`

Depois que o deploy do GitHub Pages concluir, abra o site normalmente. Se o navegador insistir em mostrar o CSS antigo, recarregue a página; `index.html` já referencia `styles.css?v=0.2-alpha` e `app.js?v=0.2-alpha`.

## Próximas versões planejadas
- **v0.3 Alpha:** painel de clientes simplificado e fluxo cliente → key.
- **v0.4 Alpha:** criação de keys com planos/preços integrados, busca e ações em massa refinadas.
- **v0.5 Alpha:** overview completo e métricas de vencimento/receita.
- **v0.6 Alpha:** notificações administrativas de renovação/cobrança.
- **v0.7 Beta:** testes, responsividade e correções gerais.
- **v0.9 RC:** candidata a versão estável.
- **v1.0:** primeira versão estável.
