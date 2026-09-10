# Central de orientação e navegação compartilhada — revisão de produto

Branch: `integration/mvp-pre-release`.

## Integração anterior à implementação

Worktree inicial limpo, na main. Fetch de origin com prune concluído.
Integration inicial: `b000ac6b358d494f311c6d8d11f1d8f5da655eb9`.
Origin/main: `59ee9d76ac50e7477fe1b02d46d2d752d6e9ba8f`.
Upstream da integration já sincronizado. `git merge origin/main` resultou em fast-forward para `59ee9d7`, sem conflitos, sem rebase. Os 77 testes iniciais passaram; diff check e status limpos antes das alterações.

## Diagnóstico

Manual: 8 categorias, 41 orientações, 9 com procedimentos, 28 com destinos e 17 com ressalvas temporais. A busca já aceitava acentos e termos separados. A home repetia os mesmos conteúdos em 8 atalhos e até 24 prévias de categorias. O cabeçalho institucional tinha maior destaque que a pergunta. Estado de busca ficava apenas em memória; atualizar o artigo perdia esse contexto. Artigos terminavam com suporte genérico, apesar dos destinos acadêmicos cadastrados.

Navegação: cinco páginas exibem a sidebar global (Dashboard, Checklist, Manual, Benefícios e Ajuda). Configurações de Perfil também carrega platform-shell.js, mas tem layout e navegação próprios; foi auditada e mantida. O CSS da sidebar estava duplicado integralmente no agregado style.css e no componente. Logo era ocultada na rail, controle usava hambúrguer azul e havia handlers duplicados de mobile. O active dependia parcialmente de ícones, enquanto page-state.js corrigia parte dos casos posteriormente. aria-expanded era alterado por wrapper registrado depois do listener de clique. Tooltips CSS podiam ser cortados pelo overflow da sidebar.

Referências visuais examinadas no código: superfícies, bordas, radius e accent de ui-polish.css; grade por largura disponível em Benefícios; trilha e painel do Checklist; progresso e jornada do Dashboard. A imagem local da marca foi inspecionada: contém o símbolo, separado do wordmark em texto. Não houve inspeção renderizada das páginas: o runtime do navegador retornou “No browser is available” e a descoberta retornou lista vazia.

## Arquitetura implementada

1. Identificação compacta: Manual do Aluno.
2. Pergunta principal e busca: “Qual é a sua dúvida?”.
3. Atalhos do dia a dia: curadoria existente, com rótulos curtos e superfícies neutras; nenhuma alegação de popularidade.
4. Exploração secundária: oito entradas compactas, com descrição e quantidade. Nenhuma prévia de artigo na home. Selecionar uma categoria revela apenas suas orientações.
5. Busca ativa: lista de resultados ordenados, resumo, categoria discreta, trecho real quando disponível, ação de leitura, quantidade, filtros e limpeza. Atalhos e categorias da home saem de cena.
6. Orientação: resumo, contexto, passos existentes, destino, atenção e detalhes complementares expansíveis. Fonte e ressalvas continuam presentes.
7. Próximo passo: destinos cadastrados são conectados às orientações existentes sobre esses serviços, sem prometer acesso externo. Quando não há destino conectável, a continuidade usa o primeiro conteúdo relacionado cadastrado.

A home oferece 8 atalhos e 8 entradas de assunto, em vez de expor dezenas de orientações. Categorias foram preservadas porque agrupam de 4 a 6 conteúdos cada; uma lista de entradas leva rapidamente a uma seleção curta e dispensa expansões aninhadas.

## Busca e histórico

Normalização de acentos e caixa; termos separados com AND; remoção de palavras funcionais; termos de até dois caracteres exigem palavra inteira para evitar falsos positivos como RA. O índice inclui título, palavras-chave, resumo, conteúdo, títulos e itens das seções e nomes das categorias.

Ranking por termo: título 16, palavras-chave 8, resumo 4, presença no índice 1. Bônus de título exato 100, ou de frase no título 30. Empates preservam ordem do catálogo. Sinônimos existentes já integram palavras-chave; foi acrescentado “segunda via boleto” como vocabulário de descoberta, sem criar procedimento. A busca nova atravessa todas as categorias; filtros continuam disponíveis nos resultados.

O fragmento mantém compatibilidade com `#conteudo=id` e aceita `busca` e `categoria`. Digitação usa replaceState; abertura de artigo e seleção de categoria usam pushState. Atualizar, abrir URL copiada, navegar entre artigos e voltar recuperam o contexto. Ctrl/Cmd/clique modificado preserva o comportamento nativo dos links. IDs inválidos retornam à descoberta sem erro. O foco vai ao título da orientação e retorna ao acionador disponível ou à busca.

Estado vazio usa exemplos que existem no catálogo (boleto, histórico, frequência), oferece limpar busca/filtros e identifica Ajuda como destino para problemas com o UniCheck. Não há respostas geradas nem sugestões de conteúdo inexistente.

## Sidebar

Desktop acima de 1024px: controle discreto de painel (panel-left-close/open), 44px de área clicável, labels de recolher/expandir e aria-expanded sincronizado. Sidebar 280px e rail 80px compartilham a mesma variável de espaço com o conteúdo. Transição de largura/margem de 200ms, sem temporizadores para recalcular grades. Bootstrap no head aplica a chave já existente `sidebarCollapsed` antes da pintura.

Rail: símbolo visível, ícones centrados, indicador ativo por fundo/borda/faixa e peso, nomes ocultos, avatar e nível compacto. XP detalhado retorna ao expandir; a progressão e sua descrição acessível existentes são preservadas. Tooltips de navegação/tema/sair são renderizados fora do contêiner com overflow, aparecem por foco e hover e fecham com Escape. Tema e logout ficam no grupo “Conta e aparência”. O texto e o ícone do tema refletem a ação seguinte.

Mobile até 1024px: preferência desktop é conservada, mas não aplicada ao drawer. Hambúrguer abre; controle interno X fecha. Overlay, Escape, Tab/Shift+Tab, retorno de foco, inert e restauração do overflow anterior são gerenciados no controlador compartilhado. Navegar fecha explicitamente, eliminando a dupla alternância. Resize fecha o drawer e recupera a preferência desktop.

## Lacunas e limites

- Não há analytics: os atalhos são curadoria de produto.
- O catálogo nomeia serviços, mas não fornece URLs atuais para seus destinos. O botão indica “Ver como funciona”, sem inventar um link de acesso.
- Apenas 9 artigos têm passos cadastrados; os demais preservam a estrutura que o conteúdo sustenta.
- As 17 ressalvas temporais permanecem; regras, prazos, contatos, condições e fonte acadêmica não foram reescritos.
- Há interseção legítima entre orientações sobre setores institucionais no Manual e canais de contato em Ajuda. Foi removido o encaminhamento universal do artigo para Suporte. O Manual explica vida acadêmica; Ajuda explica conta/progresso/uso do UniCheck e canais de contato.
- Não foi alterado Supabase, migrations, autenticação, dados de progressão ou infraestrutura de deploy.

## Matriz para revisão visual

| Largura | Comportamento esperado | Validação nesta rodada |
| --- | --- | --- |
| 1920 | Sidebar ou rail; conteúdo com largura máxima | Lógica testada; visual pendente |
| 1600 | Sidebar ou rail; grades acompanham espaço | Lógica testada; visual pendente |
| 1440 | Sidebar ou rail; grades acompanham espaço | Lógica testada; visual pendente |
| 1366 × 768 | Sidebar aberta como cenário prioritário | Lógica testada; visual pendente |
| 1280 | Sidebar ou rail; detalhe adapta à largura interna | Lógica testada; visual pendente |
| 1024 | Drawer e conteúdo sem margem lateral | Lógica testada; visual pendente |
| 768 | Drawer; exploração e artigos adaptáveis | Lógica testada; visual pendente |
| 390 | Drawer; resultados em uma coluna | Lógica testada; visual pendente |

Revisar cada largura em dark/light, alternando sidebar e navegando entre Benefícios, Manual, Checklist e Dashboard. Conferir overflow horizontal, transição sem piscadas, teclado, leitura dos tooltips, avatar/nível, resultado longo e zero resultados. Os testes sem motor de layout não aprovam responsividade nem contraste renderizado.

## Autoauditoria e verificação

Busca é o caminho principal; categorias não são pré-requisito. Resultados substituem a exploração. Home não exibe os 41 conteúdos. Artigos mantêm todas as seções e a próxima ação tem fundamento no catálogo. Atalhos são curtos, sem duplicação de cards. Desktop não apresenta hambúrguer; rail preserva marca, navegação e nível. Active usa URL real, sem depender do SVG. Tokens são compartilhados em ambos os temas, com foco explícito e reduced motion. Foram removidas mais de mil linhas de regras repetidas/antigas da sidebar. A avaliação estética, contraste final e ausência de layout jump aguardam navegador real.

Testes: preservados os 77 cenários anteriores (a asserção da antiga prévia de categoria foi substituída por cobertura de oito categorias sem artigos expostos). Adicionados 20 cenários: busca/ranking controlado, URL/contexto, categorias, trechos/próximos passos e 16 de navegação compartilhada incluindo as oito larguras. Resultado final: 97/97 testes aprovados, 44 arquivos JavaScript com sintaxe válida, referências locais íntegras e git diff --check sem erros. Comandos executados: `node --test tests/*.test.cjs`, `node --check` em todos os arquivos JavaScript, `node scripts/check-local-references.mjs` e `git diff --check`.

Status de produto: PRONTO PARA REVISÃO VISUAL, após confirmação dos checks e publicação somente na integration. Não equivale a aprovação visual.
