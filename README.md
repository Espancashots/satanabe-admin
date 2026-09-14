# Satanabe Admin

Painel web estático para administrar as licenças do projeto Supabase.

## Publicar no GitHub Pages

1. Crie um repositório separado, por exemplo `satanabe-admin`.
2. Envie `index.html`, `styles.css` e `app.js` para a raiz do repositório.
3. No GitHub, abra **Settings → Pages**.
4. Em **Build and deployment**, escolha **Deploy from a branch**.
5. Selecione `main` e `/ (root)` e salve.
6. Abra a URL fornecida pelo GitHub Pages.

## Login

Use o usuário criado no Supabase Authentication. Apenas e-mails habilitados em `admin_allowlist` passam pela API administrativa.

## Segurança

- O navegador contém somente a Publishable Key do Supabase, que é pública por design.
- A chave secreta/service role fica apenas na Edge Function `admin-licenses-api`.
- A Edge Function exige JWT válido do Supabase Auth e também verifica `admin_allowlist`.
- As ações administrativas são registradas em `admin_audit_log`.

## Recursos

- Resumo de keys ativas, pendentes, expiradas e revogadas.
- Busca local por observação/status.
- Busca exata ao colar a key completa.
- Criar key.
- Desativar e reativar.
- Adicionar +1 dia, +7 dias, +30 dias ou +1 ano.
- Resetar aparelhos.
- Alterar limite de aparelhos.
- Editar observação.
