# Changelog — Satanabe Admin

## v1.0.0 Alpha — 2026-09-16

Primeira entrega grande do novo Satanabe Admin, construída sobre a versão-base enviada pelo usuário.

### Overview
- Cards para keys ativas, vencimentos de hoje, amanhã e próximos 3 dias.
- Contagem de aparelhos conectados.
- Patches ativos exibidos como `ativos/total` (ex.: `7/7`, `3/7`).
- Receita do mês.
- Fila rápida de clientes para cobrança/renovação.
- PIX copia e cola com botão para copiar.
- Mensagem de renovação configurável.
- Backup administrativo mantido.

### Keys
- Busca por cliente, telefone ou key.
- Busca exata preservada para keys antigas.
- Resumo por status: ativas, pendentes, expiradas e revogadas.
- Filtros por status.
- Criação vinculada a cliente, com pesquisa por nome/telefone.
- Tabela de planos integrada:
  - 3 horas — teste grátis
  - 3 horas — R$ 4
  - 10 horas — R$ 8
  - 1 dia — R$ 14
  - 3 dias — R$ 30
  - 7 dias — R$ 40
  - 1 mês — R$ 70
- Valor e total da venda preenchidos automaticamente.
- Limite de aparelhos por key e geração em lote de até 100 keys.
- Ações em massa reorganizadas.
- Novo painel individual por key com copiar, editar, aparelhos, reset, renovar, WhatsApp, adicionar tempo, desativar/reativar e excluir.

### Clientes
- Cadastro simplificado para somente nome e telefone.
- Busca por nome ou telefone.
- Ações: WhatsApp, histórico, renovar, editar e excluir.
- Histórico financeiro, keys e contatos.

### Renovações e notificações
- Sino de notificações no topo.
- Alertas para vencidas, vencem hoje, amanhã e em até 3 dias.
- Acesso direto ao WhatsApp e renovação.
- Registro de cliente contatado.
- Fila de renovação com filtros de hoje/vencidas, amanhã, 3 dias, 7 dias e não contatadas.
- Planos de renovação operacionais compatíveis com a API atual: 1 dia, 7 dias e 1 mês.

### Visual
- Nova identidade em preto, carvão e vermelho controlado.
- Botões menores e mais próximos de um painel administrativo tradicional.
- Cards, filtros e modais mais compactos.
- Responsividade para desktop, tablet e iPhone.
- Sem `backdrop-filter` para evitar artefatos no Safari/iPhone.

### Mantido
- Patches: mesmas operações e API da versão-base.
- Logs/Atividade: mesma origem de dados e comportamento da versão-base.
- Supabase Auth e allowlist existentes.
