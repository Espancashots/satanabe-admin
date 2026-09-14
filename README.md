# Satanabe Admin v5

Painel web privado para administrar keys e patches pelo iPhone.

## Patches

- Ativar/desativar todos.
- Ativar/desativar individualmente.
- Importar um novo arquivo `.3105` diretamente para o Storage privado do Supabase.
- Editar o nome e a descrição exibidos no aplicativo.
- Substituir o arquivo `.3105` de um patch já cadastrado.
- Ao substituir um arquivo, o estado salvo daquele patch é zerado antes de voltar a ficar disponível.

O painel não interpreta o conteúdo dos arquivos `.3105`; ele apenas envia e referencia os arquivos no Storage.

Para publicar, substitua `index.html`, `styles.css`, `app.js` e `README.md` no repositório usado pelo GitHub Pages.


## v6
- Botão **Remover** em cada patch: remove o registro do catálogo, preferências relacionadas e tenta apagar o arquivo correspondente do Storage.
- Campo **Quantidade de keys** em Criar key (1 a 100 por vez).
- Resultado de criação em lote mostra todas as keys, uma por linha, com botão para copiar todas.
