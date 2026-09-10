# Checklist: acabamento final para revisão de produção

Branch: `integration/mvp-pre-release`.
HEAD inicial: `2aee24e1f777284e9a8496b399a52eefa040f94a`.
Worktree limpo e upstream sincronizado após `git fetch origin --prune`.

## Auditoria dos logos

Inspeção dos arquivos reais, formato decodificado, canal alpha e pixels de borda, seguida de inspeção visual. O CSS anterior aplicava fundo branco e sombra forte a todos os logos. Esse era o canvas branco percebido no símbolo UniCheck e no TOTVS, que já são transparentes.

| Fase | Asset | Diagnóstico | Tratamento |
| --- | --- | --- | --- |
| Primeiros passos | logo.png | Transparente, com margem interna; branco vinha do CSS | Superfície tonal, padding menor |
| Portal TOTVS | TOTVS.jpg | PNG transparente apesar da extensão; marca horizontal comprimida em tile quadrado | Tile horizontal, proporção preservada |
| Configuração de Email | outlook.png | Transparente, com margem interna | Superfície tonal, padding menor |
| Biblioteca Virtual | bibliotecaV.png | Transparente, símbolo adequado | Container tonal e borda discreta |
| Microsoft Teams | MicrosoftT.png | Transparente, símbolo adequado | Container tonal e borda discreta |
| Plataforma A+ | platafromaA.png | Canvas vermelho opaco da imagem; símbolo branco faz parte da marca | Asset preservado, container tonal |
| Mentorias | logo.png | Mesmo símbolo transparente da primeira fase | Mesmo tratamento da primeira fase |

Nenhum asset precisou ser substituído ou editado. A cópia de TOTVS na landing tem fundo branco incorporado e não é uma alternativa melhor. A extensão incorreta do arquivo existente fica documentada, sem renomear assets compartilhados nesta rodada. Não há pendência de remoção de fundo branco nos logos usados pelo Checklist.

O container usa `--surface-elevated`, `--border` e 6% do accent da fase, sem branco ou preto fixo. `contain`, centralização e ausência de flex-shrink são preservados. Dois tratamentos ópticos, definidos pela proporção natural: compacto e horizontal (razão acima de 1,6). O segundo recebe mais largura, inclusive no mobile. Não há filtro, recorte ou alteração de identidade.

## Resumo da jornada

O hero e suas pills foram substituídos por uma faixa compacta com:

- Sua jornada acadêmica;
- quantidade concluída sobre o total de fases;
- barra nativa `progress`, identificada e com descrição acessível do valor;
- fase atual, quando há exatamente uma fase disponível;
- contagens secundárias de concluídas, ativas e bloqueadas.

A fonte é `state.checklists`, já hidratado por `UniCheckChecklist.applyProgress`. O resumo usa o conjunto completo, independentemente do filtro de busca. A fase atual é a única fase com `completed === false` e `locked === false`; nenhuma regra de desbloqueio foi criada. Se houver ambiguidade, nenhum nome é eleito. Se todas terminarem, aparece “Todas as fases concluídas”. Nenhum XP ou nível é duplicado.

O layout permite quebra natural entre informação, barra e contexto. Nome longo quebra sem truncamento; cada status mantém sua unidade. Em mobile, a barra ocupa sua própria linha. Tokens de superfície e sucesso acompanham light/dark.

## Validação

Teste de navegador existente ampliado para verificar os estados reais 0/7, 3/7 e 7/7, fase atual, total independente da busca e enquadramento horizontal dos logos. Mantidas as verificações anteriores de regressão do Manual, sem alterar a página.

Matriz: 1920, 1600, 1440, 1366, 1280, 1024, 768 e 390, nos dois temas; altura de 768px, incluindo 1366 × 768. Capturas e resultados em `private-context/browser-qa` (ignorados pelo Git). Edge local com autenticação, perfil e progresso simulados; nenhum serviço de produção é acionado.

Resultados: 121 testes da suíte completa aprovados; 32 combinações responsivas e os casos funcionais do resumo aprovados, sem erros de página. Sintaxe dos 47 arquivos JS/CJS/MJS, referências locais e `git diff --check` aprovados. Resumo medido em 78,3px de altura entre 768 e 1920px e 145,8px em 390px, nos dois temas. Inspeção visual das capturas em 1366 × 768, 768 e 390 confirmou integração tonal dos logos e leitura do resumo.

Escopo: apenas CSS e renderização do Checklist, teste de navegador correspondente e este registro. Manual, sidebar/rail/drawer, Benefícios, serviços de progressão, conteúdo das fases, main, Supabase, migrations e deploy não são modificados.
