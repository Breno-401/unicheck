# Revisão de UX: Benefícios e Manual

Base da implementação: `origin/main` em `09932d7`. Branch: `feat/ux-manual-beneficios`.

## Diagnóstico e decisões

- Benefícios tinha definições concorrentes de grid: o seletor compartilhado `.page-platforms .platforms-grid` vencia o seletor local, impondo colunas por viewport. Isso desconsiderava a largura útil após sidebar e padding. O rodapé juntava data e CTA sem quebra, dentro de um card com overflow oculto.
- Os filtros exigiam rolagem horizontal; o CSS compartilhado ainda impunha `nowrap !important` no mobile. O componente agora tem uma classe própria, wrap e expansão nativa, sem depender dessa regra legada.
- A apresentação editorial e as datas de revisão ocupavam espaço de descoberta. A interface agora mostra orientação curta e fonte oficial nos detalhes. Datas internas continuam no catálogo.
- Os 34 benefícios têm prioridade editorial explícita. A abertura apresenta Spotify, YouTube, Microsoft 365, Adobe, Notion e Apple Music. Essa ordem não representa métricas de popularidade. Preços, condições, elegibilidade, URLs e disponibilidade não foram alterados nem revalidados comercialmente.
- Amazon e Canva não estão no catálogo: são oportunidades para pesquisa futura, não novas ofertas nesta entrega.
- O Manual tinha 8 categorias e 41 orientações, mas escondia os assuntos atrás de cards genéricos e repetia introdução e navegação. Agora o índice apresenta três orientações por categoria, com acesso a todas, priorizando vida acadêmica, ferramentas e utilidades.
- Busca do Manual indexa título, resumo, palavras-chave, conteúdo e seções práticas uma vez. Aceita termos separados, ignora acentos e palavras de ligação, prioriza títulos e incorpora vocabulário como “emitir boleto”. Não é uma busca semântica ou tolerante a qualquer erro de digitação.
- A leitura preserva conteúdo, fonte, ressalvas e relações. Passos, destino e atenção aparecem antes dos complementos expansíveis. Voltar mantém a busca; links profundos e abertura em nova aba continuam disponíveis.

## Layout e acessibilidade

O grid de benefícios usa `auto-fill` com mínimo de `19rem`, limitado a 100% do contêiner. O índice do Manual usa mínimo de `20rem`. Colunas dependem da largura disponível, sem quantidade fixa por resolução. Container queries adaptam controles e leitura ao espaço restante. Não há altura fixa nos cards: descrição limitada a três linhas, oferta e elegibilidade completas, no máximo duas tags e CTA ao final.

Categorias de Benefícios ficam abertas inicialmente no desktop e recolhidas até 600px; a expansão permanece disponível em qualquer tamanho. Filtros do Manual aparecem durante busca ou navegação por categoria. Ambas as páginas têm contagem e limpeza de filtros.

Os componentes usam as cores de cada tema, foco visível, áreas de ação de ao menos 44px nos controles principais, estados `aria-pressed`, links para navegação e botões para ações. O modal mantém foco preso e a página de fundo inerte enquanto aberto; Escape fecha e devolve o foco. Mudanças não modificam sidebar ou serviços de persistência.

## Validação automatizada

```sh
node --test tests/*.test.cjs
node scripts/check-local-references.mjs
git diff --check
```

`tests/discovery-ux.test.cjs` executa os scripts reais em contexto isolado com elementos simulados, sem rede. Cobre preservação integral do catálogo comercial por hash, ordenação, filtros combinados, paginação, favorito, detalhes, busca, estados vazios, retorno e referências dos artigos. Não calcula layout nem substitui um navegador.

## Revisão visual pendente

O navegador da sessão não estava disponível. Nenhuma medição visual ou de overflow foi declarada aprovada. Testar as páginas reais, autenticadas em ambiente autorizado, sem modificar dados remotos:

| Viewport | Sidebar | Temas | Estado |
| --- | --- | --- | --- |
| 1920 × 1080 | Expandida e compactada | Claro e escuro | Pendente |
| 1600 × 900 | Expandida e compactada | Claro e escuro | Pendente |
| 1440 × 900 | Expandida e compactada | Claro e escuro | Pendente |
| 1366 × 768 | Expandida e compactada | Claro e escuro | Pendente prioritário |
| 1280 × 800 | Expandida e compactada | Claro e escuro | Pendente |
| 1024 × 768 | Menu fechado e aberto | Claro e escuro | Pendente |
| 768 × 1024 | Menu fechado e aberto | Claro e escuro | Pendente |
| 390 × 844 | Menu fechado e aberto | Claro e escuro | Pendente |

Em cada configuração, conferir largura do documento e dos grids, cards completos, CTA visível, categorias sem corte ou scrollbar horizontal, nomes longos, resultados vazios, todas as páginas do catálogo e modal com rolagem interna. Repetir em zoom de 125%, 150% e 200% e com altura reduzida/teclado virtual.

No Manual, buscar “matrícula”, “portal”, “biblioteca”, “financeiro”, “documentos”, “estágio”, “atividades” e “atendimento”. Abrir orientação, expandir complementos, seguir relacionados e voltar aos resultados. Conferir Tab, Shift+Tab, Enter, Espaço em controles apropriados, Escape no modal, foco restaurado e anúncio da contagem por leitor de tela.

Favoritos remotos não foram exercitados nesta rodada. Usar conta de teste e autorização específica para qualquer teste que persista dados remotos. Nenhuma dependência nova, mudança no Supabase ou migration faz parte desta implementação.
