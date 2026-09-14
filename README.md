# Satanabe Admin

Painel web administrativo para gerenciar as licenças do projeto 3105.

## Recursos

- Login com Supabase Auth
- Lista e busca de licenças
- Exibição e cópia da key completa quando ela estiver cadastrada
- Novas keys já ficam disponíveis para exibição no painel
- Keys antigas podem ser cadastradas para exibição ao colar a key completa na busca uma vez
- Criar nova key
- Desativar e reativar
- Adicionar +1 dia, +7 dias, +30 dias ou +1 ano
- Resetar aparelhos
- Alterar limite de aparelhos e observação
- Excluir permanentemente todas as keys expiradas com confirmação

## Publicação no GitHub Pages

Envie `index.html`, `styles.css`, `app.js` e `README.md` para a raiz do repositório e configure:

Settings → Pages → Deploy from a branch → `main` → `/(root)`.

## Segurança

A interface usa apenas a Publishable Key do Supabase. O acesso administrativo depende do usuário autenticado e da allowlist configurada no banco. As tabelas administrativas ficam protegidas por RLS e as rotinas administrativas verificam a allowlist antes de executar.
