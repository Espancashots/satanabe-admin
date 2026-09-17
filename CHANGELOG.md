# v1.1.3 Alpha — Login e senha do revendedor no Admin

- Adicionado Login do painel e Senha do painel ao cadastro/edição de revendedores.
- Adicionado botão Gerenciar acesso para trocar login ou senha depois.
- Removido o e-mail como credencial de acesso na interface de revendedores.
- Integração com `admin-reseller-credentials-api`.
- Botão Abrir painel agora leva à tela de login por usuário + senha.

## v1.1.2 Alpha

- Adiciona botão **Remover** na lista de revendedores e **Remover revendedor** dentro do painel individual.
- A remoção exclui o cadastro do revendedor e sua conta de autenticação.
- Keys, clientes e transações existentes são preservados e ficam sem `reseller_id`.
- A confirmação exige digitar exatamente o nome da loja.
- Atualiza o endereço do painel para `https://espancashots.github.io/revendedor-site-/`.

## v1.1.1 Alpha
- Integração do acesso do revendedor com Supabase Auth.
- Envio e reenvio de acesso por e-mail quando SMTP permitir.
- Fallback com link de acesso manual para copiar e enviar por WhatsApp.
- Status de acesso vinculado/pendente.
- Nova permissão Receita.
- Atalho para o painel do revendedor.
- Funções administrativas antigas do banco deixaram de ser executáveis por usuários autenticados comuns.

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

## v1.0.1 Alpha — 2026-09-16
- Corrigido: pressionar Enter no campo de busca de cliente não cria mais uma key.
- Corrigido: busca de cliente por telefone agora ignora máscara, espaços, parênteses, hífen e `+55` quando aplicável.
- Melhorado: busca por nome ignora acentos e maiúsculas/minúsculas.
- Melhorado: um único cliente encontrado é selecionado automaticamente; vários resultados exigem escolha explícita.
- Melhorado: botão `Buscar` separado (`type=button`) e mensagem de quantidade de resultados.
- Melhorado: ao abrir `Criar key`, o painel tenta recarregar os clientes se a lista local estiver vazia.
## v1.1.0 Alpha — 2026-09-16
- Adicionada nova aba **Revendedores** no Satanabe Admin.
- Cadastro de revendedor com nome da loja, responsável, e-mail, WhatsApp, PIX, slug futuro da Store e permissões.
- Resumo global de revendedores: total, ativos, keys ativas, clientes e receita do mês.
- Acesso interno ao painel de cada revendedor com subabas **Overview / Keys / Clientes**.
- Overview individual mostra keys, clientes, aparelhos e receita registrada do revendedor.
- Admin pode ativar/desativar o revendedor sem revogar automaticamente as keys dos clientes.
- Admin pode ativar/desativar individualmente keys pertencentes ao revendedor.
- Estrutura multi-loja preparada no Supabase com `reseller_id` em keys, clientes e transações. Registros antigos permanecem como vendas diretas do Admin.
- Nova Edge Function administrativa `admin-resellers-api`, protegida pelo login e allowlist existentes.
- Receita geral do Overview continua somando todas as transações e agora possui separação interna entre receita direta e de revendedores para uso futuro.
- Backup administrativo passa a incluir a tabela de revendedores.
- A Store/painel público do revendedor ainda não é criado nesta versão; esta entrega prepara e administra a conta-base de cada revendedor.

