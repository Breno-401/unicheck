# Refinamento visual do Manual e correções do Checklist

Branch: `integration/mvp-pre-release`. HEAD inicial: `3b24d1efb1e216fb8f63c5bf54ac8743837b3d14`.
Worktree inicialmente limpo; fetch com prune executado; upstream sincronizado sem merge necessário.

## Manual do Aluno

A cascata final removia superfícies e bordas dos atalhos e categorias, deixando uma apresentação plana. A arquitetura de orientação e a busca foram preservadas.

- Topo e busca integrados em uma superfície com gradiente discreto, radius e sombra do produto.
- Hierarquia entre eyebrow, pergunta e descrição; espaçamento adaptado ao espaço disponível.
- Placeholder curto: “Ex.: boleto ou matrícula”; hover, foco, botão de limpeza e contraste refinados.
- Oito atalhos compactos com moldura neutra, área própria para ícones e microinteração.
- Categorias em duas colunas, passando a uma conforme o espaço disponível; bordas, ícones e hierarquia entre título, descrição e contagem.
- Filtro ativo com borda, indicador de confirmação e `aria-pressed`, sem depender apenas de cor.
- Tokens compartilhados de superfície, borda e profundidade, preservando o accent do Manual. Movimento reduzido respeitado.
- Nenhuma mudança no ranking, conteúdo editorial, lógica da busca ou sidebar.

## Checklist Acadêmico

Os logos usavam `object-fit: cover`, que recortava arquivos retangulares, e participavam da compressão do flex. Agora usam `contain`, centralização, padding de 6px, `border-box` e `flex: 0 0 auto`. Fundo branco neutro preserva a leitura dos arquivos existentes em ambos os temas; nenhuma marca foi substituída ou filtrada.

Sistema aplicado aos sete cards: Primeiros passos, TOTVS, Configuração de Email/Outlook, Biblioteca Virtual, Microsoft Teams, Plataforma A+ e Mentorias.

O resumo forçava três colunas iguais (`minmax(0, 1fr)`) dentro de um flex sem quebra. O conteúdo intrínseco dos badges ultrapassava a largura concedida. Uma regra compartilhada também impunha rolagem horizontal no mobile.

A correção permite quebra no resumo e no grupo de badges. Cada pill mantém seu tamanho natural e número junto ao rótulo. O título pode ceder espaço com `min-width: 0`; a regra local evita a rolagem horizontal herdada. Tracking reduzido e singular/plural corrigido, preservando a estrutura do componente.

## Validação

- `node --test tests/*.test.cjs`: 121 testes aprovados.
- `node tests/manual-avatar.browser.cjs`: 101 verificações de layout, artigos expandidos e ciclo de avatar aprovadas.
- `node tests/visual-refinement.browser.cjs`: 32 combinações de página, tema e largura aprovadas, além de busca, vazio, filtro ativo e teclado.
- Larguras: 1920, 1600, 1440, 1366, 1280, 1024, 768 e 390; temas claro e escuro.
- Verificação de geometria dos badges (texto contido e ausência de interseções), proporção e carregamento dos logos e ausência de overflow horizontal.
- Inspeção visual das capturas do Manual e Checklist em 1366 e 390.
- Sintaxe de todos os 47 arquivos JS/CJS/MJS, referências locais e `git diff --check` aprovados.

O Browser integrado não estava disponível. Os testes usam Edge local com autenticação, perfil e progresso simulados, preservando o catálogo e a lógica real de renderização. Não validam conta de produção. Capturas e resultados JSON ficam em `private-context/browser-qa`, ignorado pelo Git.

Escopo preservado: main, Supabase, migrations, deploy e sidebar sem alterações. Sem PR e sem force push.
