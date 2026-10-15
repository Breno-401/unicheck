# Plano de implementação do UniMatch

> Plano revisado após orientação do usuário: construir motor próprio de correlação sem consumir endpoints do portal de referência.

**Objetivo:** incorporar ao UniCheck uma busca pública de possíveis correspondências curriculares, com dados atribuídos às fontes oficiais UniSales e uma heurística lexical/conceitual determinística e explicável.

**Arquitetura:** preservar a aplicação estática HTML/CSS/JS. Manter catálogo e motor em módulos ESM testáveis; expor API via Netlify Functions; criar `/unimatch`; integrar link e seção exclusiva na landing. Sem dependência de LLM externo, login adicional ou novo schema Supabase.

**Limites:** o portal original processa o cálculo no servidor e o algoritmo não foi recuperado. O motor próprio não pode ser anunciado como equivalente ao original nem como decisão de aproveitamento. O catálogo reúne 21 matrizes/1.018 componentes nominais de 16 formações; as fontes consultadas não fornecem ementas nem cargas horárias individuais de destino.

## Tarefas

### 1. Catálogo e motor de correlação

Arquivos: `Unicheck/unimatch/domain/normalization.mjs`, `Unicheck/unimatch/domain/matcher.mjs`, `Unicheck/unimatch/data/curricula.mjs`, testes `tests/unimatch-matcher.test.cjs`.

- [x] Escrever testes-first para acentos/tokenização, aliases conceituais, texto de origem, resultados sem relação, ruído lexical e carga horária desconhecida.
- [x] Executar a implementação em vermelho e confirmar a passagem da suíte do domínio após o motor.
- [x] Criar catálogo a partir de documentos oficiais localizados; registrar fonte/ano/modalidade disponível e manter ementas/cargas ausentes como ausentes.
- [x] Implementar normalização em português, 45 grupos de conceitos, relação de domínio documentada e ranqueamento com evidências legíveis.
- [x] Tratar a regra formal de 75% somente quando as duas cargas forem conhecidas; a base atual não permite aplicá-la.
- [x] Reexecutar testes e acrescentar casos contra correspondência baseada em termo genérico isolado.
- [x] Commitar domínio, dados e testes.

### 2. API própria Netlify

Arquivos previstos: `netlify/functions/unimatch-api.mjs`, `netlify.toml`, `tests/unimatch-api.test.cjs`.

- [x] Testar métodos/status, carga inválida, matrizes ausentes, consultas múltiplas e limite do corpo.
- [x] Implementar `GET /api/unimatch/catalog` e `POST /api/unimatch/match` em Netlify Functions.
- [x] Manter a integração independente; nenhuma chamada do app é encaminhada ao portal original.
- [x] Verificar que respostas incluem fonte oficial, racional, rótulo heurístico e nenhuma aprovação institucional.
- [x] Commitar API e testes.

### 3. Página e navegação UniMatch

Arquivos previstos: `Unicheck/unimatch/index.html`, `Unicheck/unimatch/css/unimatch.css`, `Unicheck/unimatch/js/unimatch.js`, `Unicheck/landing/index.html`, CSS da landing e `tests/unimatch-navigation.test.cjs`.

- [x] Escrever testes estruturais para rota, SEO, navegação, CTA, sitemap e configuração de CSS no Netlify.
- [x] Implementar link ativo, seção conceitual e CTA sem substituir o CTA final existente.
- [x] Implementar consulta pública, validação, estados de carregamento/erro/sem resultados, resultado e nova consulta.
- [x] Exibir similaridade heurística, evidências, fontes e limites acadêmicos.
- [x] Preservar temas/navbar; aplicar suporte a teclado, breakpoints e `prefers-reduced-motion`.
- [x] Revisar em navegador os layouts 320×568, 390×844, 768×1024 e 1280×600; a checagem responsiva usou um iframe com a largura/altura de cada viewport.
- [x] Commitar página, landing e testes.

### 4. Verificação, relatório e publicação da branch

- [x] Rodar a suíte completa e o verificador de referências depois dos últimos ajustes.
- [x] Executar os endpoints localmente em Node. O projeto não tem comando de build e o Netlify CLI não está instalado no ambiente.
- [x] Revisar desktop claro/escuro e os tamanhos anotados acima; `prefers-reduced-motion` tem regra CSS mas não foi emulado no navegador.
- [x] Registrar a cobertura nominal e a ausência de paridade com o portal original em `docs/development/unimatch-scope.md`.
- [x] Revisar working tree/histórico, fazer commits organizados e confirmar branch isolada sem PR/merge/deploy.
- [x] Enviar `feature/unimatch-integration` ao remoto.
