# Validação da rodada Manual/avatar — 10/09/2026

## Base e escopo

Branch: integration/mvp-pre-release. HEAD inicial antes da limpeza: 7c2fc037dc1e73f869c966c351e9415d2b565b1e. HEAD sanitizado de partida do desenvolvimento: 5ac4eaf9dd3216548c7b08ed2ff4b6ee24f95502.

O Manual passou de 41 para 53 orientações em oito categorias. Ver [auditoria por orientação](manual-auditoria-conteudo-20260910.md) e [diagnóstico do avatar](avatar-causa-raiz-20260910.md). A sidebar aprovada não foi redesenhada. Benefícios e Checklist não tiveram código funcional alterado.

## Resultado

- Suíte Node: 121/121 casos, incluindo 97 preexistentes, 20 novos do avatar e quatro do Manual. Duas expectativas anteriores foram adaptadas à remoção da fonte visual e à próxima ação específica de mensalidades.
- Sintaxe: todos os 35 arquivos .js rastreados aprovados por node --check; arquivos .cjs novos executados nas respectivas suítes.
- Referências locais: 282 href/src de HTML verificados; nenhum destino ausente.
- git diff --check: aprovado.
- Edge headless: 101 verificações de layout; nenhum overflow horizontal ou erro JavaScript de página.
- Home, orientação longa e acordeões abertos: 1920, 1600, 1440, 1366×768, 1280, 1024, 768 e 390, nos dois temas. Todas as 53 orientações também verificadas expandidas em 390, dark.
- Imagem real com atraso controlado, slots do shell, rail, navegação para Benefícios, retorno de outra aba e pageshow: aprovados no navegador.
- Capturas revisadas em desktop e mobile, light/dark. O overflow de cabeçalho/menu em 390 foi corrigido apenas no CSS do Manual. O gradiente original do fallback é preservado ao remover a imagem inline.

O navegador conectado do ambiente não estava disponível; foi usado Edge headless local. O teste substitui explicitamente Auth e serviço de perfil por fixtures. Os testes de concorrência usam VM/DOM simulado; não são apresentados como testes de backend ou de uma conta real. Cache/latência do Storage implantado e a reprodução na conta do usuário permanecem fora da validação desta sessão.

## Arquivos da evolução

- Unicheck/js/data/manual-data.js
- Unicheck/platform/pages/manual-aluno/manual-aluno.html
- Unicheck/platform/pages/manual-aluno/manual-aluno.css
- Unicheck/platform/pages/manual-aluno/manual-aluno.js
- Unicheck/js/core/auth.js
- Unicheck/js/services/profile.js
- Unicheck/platform/shared/js/profile-ui.js
- Unicheck/platform/shared/js/profile-sync.js
- Unicheck/platform/pages/configuracoes-perfil/configuracoes-perfil.js
- tests/avatar-lifecycle.test.cjs
- tests/discovery-ux.test.cjs
- tests/manual-avatar.browser.cjs
- docs/architecture/application.md
- docs/development/manual-auditoria-conteudo-20260910.md
- docs/development/avatar-causa-raiz-20260910.md
- docs/development/validacao-manual-avatar-20260910.md

As alterações de privacidade anteriores são exclusão histórica do PDF e .gitignore. A cópia segura, o relatório de sanitização e todo material privado ficam fora dos commits de desenvolvimento. Main e backup foram modificados somente pela limpeza autorizada; nenhum desenvolvimento foi integrado a eles.

## Revisão humana

Confirmar as regras temporais listadas na auditoria contra os regulamentos atuais. Conferir a experiência com conta real, especialmente avatar salvo, logout/login e mudanças entre abas. Não foram feitos PR, deploy, migration, alteração remota do Supabase ou merge da integration para main.
