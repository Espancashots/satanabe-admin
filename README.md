# Satanabe Admin v1.1 Alpha

Painel administrativo responsivo para gerenciamento de keys, clientes, cobranças/renovações, revendedores, patches e logs.

## Publicar no GitHub Pages

Envie **todo o conteúdo deste ZIP para a raiz do repositório** do Satanabe Admin, substituindo os arquivos antigos.

Arquivos principais:
- `index.html`
- `app.js`
- `styles.css`
- `VERSION`
- `CHANGELOG.md`
- `README.md`

A publicação continua estática e compatível com GitHub Pages. O backend Supabase do projeto já possui a estrutura e a Edge Function necessárias para a área de revendedores.

## Revendedores

A aba **Revendedores** permite:
- criar a conta-base de um revendedor;
- definir nome da loja, responsável, e-mail, WhatsApp e PIX;
- preparar o identificador/slug que será usado futuramente pela Store;
- permitir ou remover acesso futuro às abas Overview, Keys e Clientes;
- visualizar receita, keys e clientes separados por revendedor;
- entrar no painel interno de cada revendedor pelo Admin;
- ativar/desativar o revendedor;
- ativar/desativar as keys pertencentes a ele.

Nesta versão, **não é criado ainda o site/Store nem o login do revendedor**. Essa será a próxima etapa.

## Isolamento dos dados

Keys, clientes e transações agora podem receber um `reseller_id`. Os registros que já existiam continuam sem `reseller_id` e permanecem classificados como vendas diretas do Admin.

## Preços configurados

| Plano | Valor |
|---|---:|
| 3 horas — teste | R$ 0 |
| 3 horas | R$ 4 |
| 10 horas | R$ 8 |
| 1 dia | R$ 14 |
| 3 dias | R$ 30 |
| 7 dias | R$ 40 |
| 1 mês | R$ 70 |

## Segurança

A área de revendedores usa uma Edge Function protegida por sessão do Supabase Auth e pela mesma allowlist administrativa do restante do painel. A tabela de revendedores possui RLS ativado e não é lida diretamente pelo navegador.

## Versão

`1.1.0-alpha`
