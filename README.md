# Satanabe Admin v1.0.1 Alpha

Painel administrativo responsivo para gerenciamento de keys, clientes, cobranças/renovações, patches e logs.

## Publicar no GitHub Pages

Envie **todo o conteúdo desta pasta/ZIP para a raiz do repositório** do Satanabe Admin, substituindo os arquivos antigos quando o GitHub perguntar.

Arquivos principais:
- `index.html`
- `app.js`
- `styles.css`
- `VERSION`
- `CHANGELOG.md`
- `README.md`

A publicação continua estática e compatível com GitHub Pages. O painel usa as Edge Functions e o Supabase já configurados no `app.js`.

## Versão

`1.0.0-alpha`

A versão aparece no cabeçalho do próprio painel e também no arquivo `VERSION`.

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

## Observações

- O status que o backend chama de `revoked` aparece na interface como revogada/desativada; é o mesmo estado já usado pelo Supabase atual.
- A criação de keys aceita os planos 3h, 10h, 1d, 3d, 7d e 1m que a API atual já suporta.
- A renovação usa os períodos atualmente aceitos pela API de clientes: 1 dia, 7 dias e 1 mês.
- Patches e Logs continuam usando as APIs já existentes no projeto.
