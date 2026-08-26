# Benefícios para Estudantes — UniCheck

## Visão geral

Central local de benefícios estudantis verificados em fontes oficiais. A curadoria inclui ferramentas, educação, tecnologia, entretenimento, compras, direitos públicos e mobilidade.

## Estrutura

- `beneficios-data.js`: dataset, categorias, canais de acesso e última verificação.
- `beneficios-estudantis.js`: busca, filtros, modal e persistência local-first dos favoritos.
- `beneficios-estudantis.css`: cards, logos, temas e responsividade.
- `logos/`: SVGs locais leves de marcas, provenientes da biblioteca Simple Icons.

## Dados e busca

Os 34 registros são pesquisados localmente por nome, descrição, benefício, categoria, subcategoria, disponibilidade, elegibilidade, tags, canal e método de acesso. Nenhum conteúdo é consultado no Supabase.

## Favoritos

Favoritos usam `platformFavorites:<user_id>` como cache, fila offline compactada e `user_platform_favorites` como persistência remota. Somente interações explícitas geram atividade.

## Política editorial

- Fonte oficial prevalece sobre agregadores.
- Preços, percentuais, créditos e duração promocional usam `lastVerified` e `volatileFields`.
- Benefícios governamentais e regionais informam claramente público e território.
- Marcas usam logos locais quando disponíveis; fallbacks tipográficos são usados quando a biblioteca não possui a marca; direitos públicos usam ícones semânticos.
