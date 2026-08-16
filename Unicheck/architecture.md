# UniCheck - Architecture Overview

Este documento descreve a arquitetura real do projeto UniCheck no estado atual do repositório. Ele serve como referencia para pessoas e para IA entenderem a estrutura, os fluxos, as dependencias e os pontos que precisam ser mantidos consistentes ao evoluir o sistema.

## 1. Visao geral

O UniCheck e uma aplicacao web sem framework de build, composta por paginas HTML, CSS e JavaScript puro, organizada em duas areas principais:

- `landing/` como camada externa de apresentacao, captura e entrada do usuario.
- `platform/` como area interna autenticada, onde ficam dashboard, checklists, configuracoes de perfil e paginas de recursos.

O projeto usa Supabase como backend para autenticacao e persistencia dos dados individuais importantes: perfil, progresso, atividade e notificacoes. A definicao estrutural dos checklists do MVP e local no frontend. `localStorage` funciona como cache local-first, fila offline e armazenamento de preferencias de interface.

Nao existe etapa de bundling, transpile ou framework SPA. A navegacao e feita por arquivos estaticos, links relativos e algumas rotinas de redirecionamento e restauracao de estado.

## 2. Objetivo do produto

O UniCheck foi construído para orientar estudantes na jornada academica, com foco em:

- onboarding e primeiros passos na universidade;
- organizacao de tarefas e fases de checklists;
- centralizacao de plataformas gratuitas ou com desconto para estudantes;
- sincronizacao basica de perfil;
- experiencia visual mais guiada e menos dispersa.

Na pratica, a landing explica o produto e leva o usuario para autenticacao. A area interna entrega o uso operacional do sistema.

## 3. Ponto de entrada e navegaçao

### Entrada raiz

- [`/index.html`](./index.html) e a porta de entrada do projeto.
- Ele nao exibe a aplicacao diretamente; funciona como pagina de redirecionamento.
- O comportamento esta ligado a [`redirect.js`](./redirect.js) e [`redirect.css`](./redirect.css).

### Fluxo externo

- [`landing/index.html`](./landing/index.html) e a landing page principal.
- [`landing/login_cadastro.html`](./landing/login_cadastro.html) concentra login e cadastro.
- O login redireciona para a area interna quando a autenticacao da certo.

### Fluxo interno

- [`platform/index-interno.html`](./platform/index-interno.html) e o dashboard principal.
- Dela partem as paginas:
  - [`platform/CHECKLIST ACADEMICO/checklist-academico.html`](./platform/CHECKLIST%20ACADEMICO/checklist-academico.html)
  - [`platform/PLATAFORMAS/plataformas-gratuitas.html`](./platform/PLATAFORMAS/plataformas-gratuitas.html)
  - [`platform/CONFIGURACOES PERFIL/configuracoes.html`](./platform/CONFIGURACOES%20PERFIL/configuracoes.html)
  - [`platform/ajuda/ajuda-suporte.html`](./platform/ajuda/ajuda-suporte.html)

## 4. Stack e dependencias

### Frontend

- HTML5 semantico
- CSS3 modularizado por pagina e por componente
- JavaScript vanilla em modulos autoexecutaveis

### Dependencias externas

- Supabase JS via CDN
- Lucide Icons via CDN
- Google Fonts
- Imagens locais em `landing/img/` e `platform/img-interno/`

### Persistencia

- Supabase Auth para sessao
- tabelas do banco para perfil e progresso remoto dos checklists
- `js/checklist-data.js` como fonte estrutural local dos checklists do MVP
- `localStorage` para tema, perfil cacheado, favoritos, progresso por `user_id` e fila de sincronizacao

## 5. Estrutura do repositório

### Camada publica

- [`landing/index.html`](./landing/index.html) e a vitrine do produto.
- [`landing/login_cadastro.html`](./landing/login_cadastro.html) e a tela de autenticacao.
- [`landing/css/`](./landing/css) concentra o visual da landing.
- [`landing/js/`](./landing/js) concentra interacoes de login, cadastro e comportamento geral.

### Camada interna

- [`platform/index-interno.html`](./platform/index-interno.html) e o dashboard inicial.
- [`platform/js/`](./platform/js) guarda configuracoes compartilhadas da area interna.
- [`platform/css-interno/`](./platform/css-interno) guarda estilos base e componentes reutilizados.
- [`platform/css-interno/ui-polish.css`](./platform/css-interno/ui-polish.css) e a camada final compartilhada de temas, estados interativos e breakpoints das paginas internas principais.
- [`platform/css-interno/notifications.css`](./platform/css-interno/notifications.css) estiliza o painel compartilhado de notificacoes, incluindo estados lido/nao lido e adaptacao mobile.
- [`platform/CHECKLIST ACADEMICO/`](./platform/CHECKLIST%20ACADEMICO) guarda o modulo de checklist academico.
- [`platform/PLATAFORMAS/`](./platform/PLATAFORMAS) guarda o modulo de plataformas gratuitas.
- [`platform/CONFIGURACOES PERFIL/`](./platform/CONFIGURACOES%20PERFIL) guarda o modulo de configuracao de perfil.
- [`platform/ajuda/`](./platform/ajuda) guarda a central interna de Ajuda e Suporte, seu FAQ e a configuracao vazia dos futuros canais institucionais.

### Backend e banco

- [`supabase/checklist_progress_and_seed.sql`](./supabase/checklist_progress_and_seed.sql)
- [`supabase/users_profile_policies.sql`](./supabase/users_profile_policies.sql)

## 6. Fluxo funcional do sistema

### 6.1 Landing page

A landing apresenta:

- proposta de valor do UniCheck;
- seções institucionais;
- recursos principais;
- FAQs;
- chamadas para login e cadastro.

O comportamento dinamico principal da landing esta em [`landing/js/script.js`](./landing/js/script.js), que controla:

- menu mobile;
- observacao de seções para animacoes;
- carrossel de cards;
- contador animado;
- accordion do FAQ;
- ano do rodape;
- feedback dos formularios de contato e newsletter.

### 6.2 Login e cadastro

O fluxo de autenticacao esta em [`landing/login_cadastro.html`](./landing/login_cadastro.html) e [`landing/js/login.js`](./landing/js/login.js).

Comportamento:

- valida email e senha;
- cadastra usuario no Supabase Auth;
- grava metadados do usuario no registro de autenticacao;
- faz login por email e senha;
- redireciona para [`platform/index-interno.html`](./platform/index-interno.html) quando a sessao e valida.

Observacao importante:

- o login nao e apenas visual; ele conversa com Supabase Auth;
- a senha segue regra minima de complexidade no frontend.

### 6.3 Dashboard interno

O dashboard principal esta em [`platform/index-interno.html`](./platform/index-interno.html).

O script principal e [`platform/script-interno.js`](./platform/script-interno.js), que controla:

- inicializacao da dashboard;
- tema claro/escuro;
- loading de entrada;
- sidebar expandida/colapsada;
- menu mobile;
- dropdown de usuario;
- animacoes e ajustes de acessibilidade;
- logout;
- sincronizacao com o perfil local.

O painel inicial da dashboard renderiza primeiro o estado local do usuario e o reconcilia em background com a persistencia remota:

- percentual geral calculado por tarefas concluidas sobre o total de tarefas da estrutura local;
- fases concluidas, fase atual e primeira tarefa pendente dessa fase;
- CTA que abre diretamente a fase atual por hash de rota;
- quantidade de plataformas favoritadas a partir do `localStorage`;
- ate cinco atividades recentes do historico por usuario.

Na abertura, o cache de progresso e de atividades e exibido assim que a sessao identifica o `user_id`. Em paralelo, o dashboard tenta esvaziar filas pendentes e faz uma consulta consolidada a `user_checklist_item_progress` e uma consulta aos eventos recentes de `user_activity`. Os resultados remotos atualizam cache e UI sem bloquear a primeira renderizacao. Alteracoes de progresso que continuem na fila local prevalecem durante a reconciliacao.

O historico e implementado por [`js/activity.js`](./js/activity.js). Eventos sao registrados apenas em interacoes efetivas do checklist e dos favoritos (tarefa concluida, fase concluida, fase desbloqueada, plataforma favoritada ou removida). Cada evento recebe UUID estavel, entra imediatamente em `unicheck_activity:<user_id>` e em `unicheck_activity_sync_queue:<user_id>`, e e enviado em background para `user_activity`. A fila usa insercao idempotente pelo UUID, e falhas de rede nunca removem o cache. O modulo mantem no maximo 100 eventos no cache por usuario; o dashboard exibe os cinco mais recentes e nunca cria eventos durante renderizacao.

O sino das paginas internas e gerenciado centralmente por [`js/notifications.js`](./js/notifications.js). O modulo valida a sessao, renderiza `unicheck_notifications:<user_id>` imediatamente e executa uma unica restauracao remota por carregamento de pagina. O painel diferencia itens lidos e nao lidos, mostra contador, permite marcar todos como lidos e resolve destinos internos sem depender da profundidade da pagina atual. Clique fora e `Escape` fecham o painel.

Notificacao e atividade possuem papeis distintos. A conclusao de uma tarefa/fase continua no historico; uma notificacao e criada quando a fase seguinte e desbloqueada ou quando toda a jornada e concluida. Chaves semanticas como `phase_unlocked:<checklist_id>` impedem que a mesma comunicacao seja criada novamente por re-renderizacao ou reconclusao.

Esses cards funcionam como atalhos para as areas principais da plataforma.

O dashboard tambem usa:

- [`platform/js/core-config.js`](./platform/js/core-config.js) para rotas e chaves de storage;
- [`platform/js/profile-manager.js`](./platform/js/profile-manager.js) para sincronizacao de avatar e nome;
- [`platform/js/loading-navigation.js`](./platform/js/loading-navigation.js) para navegacao com loading;
- [`platform/script-profile-sync.js`](./platform/script-profile-sync.js) para refletir o perfil na interface.

As paginas de dashboard, checklist e plataformas carregam `ui-polish.css` por ultimo e usam classes no `body` (`page-dashboard`, `page-checklist` e `page-platforms`). Isso permite compartilhar tokens de superficie, borda, texto, foco e estado sem deixar seletores genericos de um modulo alterarem os cards de outro.

### 6.4 Checklists academicos

O modulo de checklist academico e uma das partes mais importantes do sistema.

Arquivos principais:

- [`platform/CHECKLIST ACADEMICO/checklist-academico.html`](./platform/CHECKLIST%20ACADEMICO/checklist-academico.html)
- [`js/checklist.js`](./js/checklist.js)
- [`js/checklist-data.js`](./js/checklist-data.js)
- [`platform/CHECKLIST ACADEMICO/checklist-view.js`](./platform/CHECKLIST%20ACADEMICO/checklist-view.js)
- [`platform/CHECKLIST ACADEMICO/checklist-detail.js`](./platform/CHECKLIST%20ACADEMICO/checklist-detail.js)
- [`platform/CHECKLIST ACADEMICO/checklist-academico.js`](./platform/CHECKLIST%20ACADEMICO/checklist-academico.js)

Fluxo local-first:

- carrega fases, titulos, descricoes, ordem, tarefas e UUIDs imediatamente de `js/checklist-data.js`;
- identifica o usuario pela sessao ja validada e le `unicheck_checklist_progress_v2:<user_id>`;
- renderiza a estrutura e o progresso local sem aguardar a Data API;
- faz em background uma unica consulta a `user_checklist_item_progress` e combina o resultado com o estado local;
- nao consulta `checklists` nem `checklist_items` durante a renderizacao;
- aplica regra de bloqueio entre fases;
- mostra lista de fases;
- abre a visao detalhada de uma fase com o mesmo padrao de cards de conclusao para todas as etapas;
- exibe conteudo informativo especifico por fase dentro da propria tela de checklist;
- trabalha com fases ja estruturadas com tarefas reais, de forma que o desbloqueio entre fases possa ser testado de ponta a ponta;
- permite marcar itens como concluido;
- ao marcar ou desmarcar, atualiza UI e `localStorage` imediatamente e sincroniza o Supabase em background;
- a camada de apresentacao interpola barra, percentual, contador, checkbox e estado do card usando o estado local anterior e o novo, sem aguardar o Supabase;
- ao concluir uma fase, a interface destaca a conclusao e sinaliza visualmente o desbloqueio da fase seguinte quando a lista e exibida;
- falhas remotas nao revertem a UI: a alteracao permanece numa fila `unicheck_checklist_pending_sync_v1:<user_id>`, tentada novamente em uma nova alteracao ou quando o navegador volta a ficar online;
- libera a fase seguinte quando a atual e finalizada.

Regra central do modulo:

- o checklist e ordenado por `ordem`;
- os UUIDs locais sao os mesmos das tabelas preservadas no Supabase, mantendo compatibilidade com as FKs de `user_checklist_item_progress`;
- a primeira fase nao e bloqueada;
- uma fase posterior fica bloqueada ate a anterior estar concluida;
- a visao de detalhe usa um unico padrao de cards de conclusao, variando apenas o texto e o conteudo de apoio de cada checklist;
- o tutorial TOTVS em tela separada foi removido para evitar duplicacao de fluxo e concentrar a experiencia no checklist.

### 6.5 Plataformas gratuitas

Arquivos principais:

- [`platform/PLATAFORMAS/plataformas-gratuitas.html`](./platform/PLATAFORMAS/plataformas-gratuitas.html)
- [`platform/PLATAFORMAS/plataformas-gratuitas.js`](./platform/PLATAFORMAS/plataformas-gratuitas.js)
- [`platform/PLATAFORMAS/platform-styles.css`](./platform/PLATAFORMAS/platform-styles.css)
- [`platform/PLATAFORMAS/plataformas-gratuitas.css`](./platform/PLATAFORMAS/plataformas-gratuitas.css)

Fluxo:

- renderiza uma lista fixa e ampliada de plataformas;
- permite busca por nome, descricao e features;
- filtra por categoria;
- salva favoritos no `localStorage` com ícone padronizado de bookmark;
- comunica o favorito também por preenchimento, contraste, animação breve, `aria-pressed` e `aria-label` atualizado;
- mostra modais de detalhes e tutorial;
- abre links externos em nova aba;
- exibe cards simples com a logo real da plataforma quando disponivel, badge de desconto e a informacao essencial para leitura rapida;
- nao exibe botao de tutorial por plataforma;
- a pagina foi ajustada para ser responsiva em desktop, tablet e mobile, com header em grade, filtros com rolagem horizontal em telas pequenas, cards em coluna unica e modais adaptados.

Esta pagina tambem depende da infraestrutura de dashboard e autenticacao, porque reaproveita sidebar, tema, logout e sincronizacao de perfil.

### 6.6 Configuracoes de perfil

Arquivos principais:

- [`platform/CONFIGURACOES PERFIL/configuracoes.html`](./platform/CONFIGURACOES%20PERFIL/configuracoes.html)
- [`platform/CONFIGURACOES PERFIL/configuracoes.js`](./platform/CONFIGURACOES%20PERFIL/configuracoes.js)

Fluxo:

- mostra dados pessoais do usuario;
- permite trocar nome, email e foto;
- permite salvar a foto como base64 no estado atual do frontend;
- permite alterar senha via Supabase Auth;
- permite alternar entre secoes internas de configuracao.

### 6.7 Ajuda e Suporte

Arquivos principais:

- [`platform/ajuda/ajuda-suporte.html`](./platform/ajuda/ajuda-suporte.html)
- [`platform/ajuda/ajuda-suporte.css`](./platform/ajuda/ajuda-suporte.css)
- [`platform/ajuda/ajuda-suporte.js`](./platform/ajuda/ajuda-suporte.js)
- [`platform/ajuda/support-config.js`](./platform/ajuda/support-config.js)

Fluxo:

- reutiliza a sidebar, o header, o perfil, o sino de notificacoes, os controles de tema e o menu mobile da area interna;
- oferece busca local por pergunta, resposta e categoria, sem requisicao remota;
- permite selecionar uma das oito categorias e rola para o FAQ ja filtrado;
- renderiza um accordion acessivel com estado por `aria-expanded`, relacao por `aria-controls` e controles nativos de teclado;
- explica conta, checklist, plataformas, perfil e sincronizacao somente conforme os comportamentos existentes no projeto;
- mantem email (`atendimento@salesiano.br`), WhatsApp (`(27) 9 8123 4566`) e portal UniSales centralizados em [`platform/ajuda/support-config.js`](./platform/ajuda/support-config.js); email abre o cliente de email e os dois canais web abrem em nova aba com isolamento da pagina de origem;
- usa a rota interna `platform/ajuda/ajuda-suporte.html`, sem espacos, para reduzir ambiguidades em links relativos.

A sidebar do dashboard usa `ajuda/ajuda-suporte.html`; checklists e plataformas usam `../ajuda/ajuda-suporte.html`. A pagina de configuracoes, que possui layout proprio sem a sidebar global, oferece um atalho equivalente no cabecalho. A central de ajuda retorna para dashboard, checklists, plataformas e configuracoes por links relativos proprios e marca Ajuda e Suporte como item ativo.

## 7. Modulos compartilhados

### `js/config.js`

- inicializa o cliente Supabase;
- expõe `window.UniCheckSupabase`;
- concentra URL e anon key do projeto;
- define se a aplicacao tem cliente pronto para uso.

### `js/auth.js`

- encapsula login, cadastro, logout e restauracao de sessao;
- gera e salva perfil basico em `localStorage`;
- expõe utilitarios como `requireAuth`, `getSession` e `normalizeErrorMessage`.
- usa a sessao persistida restaurada por `getSession()` como fonte de verdade do guard;
- uma falha isolada de consulta remota de usuario, perfil ou dados funcionais nao e interpretada como logout;
- cada pagina interna e protegida pelo guard compartilhado carregado em `platform/script-interno.js`.

### `js/profile.js`

- busca e atualiza o perfil do usuario em Supabase;
- faz upsert do perfil local;
- sincroniza nome, email e foto;
- atualiza o cache local de perfil.
- a interface interna renderiza primeiro o perfil cacheado e atualiza em background quando a consulta remota termina.

### `js/notifications.js`

- centraliza cache, fila, restauracao remota e UI do sino;
- persiste em `user_notifications` com UUID e `event_key` idempotente;
- grava localmente antes de sincronizar em background;
- sincroniza filas em oportunidades naturais de inicializacao, nova notificacao e evento `online`;
- nao usa polling, realtime, consulta em `focus` ou `service_role`.

### `platform/js/core-config.js`

- centraliza chaves de `localStorage`;
- centraliza rotas da area interna;
- normaliza caminhos para navegacao entre paginas.

### `platform/js/profile-manager.js`

- sincroniza o perfil cacheado entre paginas da area interna;
- atualiza avatar, nome e email em varios pontos da UI;
- reage a `focus` e ao evento `storage`.

### `platform/js/loading-navigation.js`

- mostra a tela de loading antes de navegações especificas;
- lida com `data-action="navigate-with-loading"` e `data-action="navigate-platforms"`.

### `platform/css-interno/ui-polish.css`

- centraliza tokens semanticos dos temas claro e escuro (`surface`, bordas, textos, destaque, sucesso, alerta e foco);
- normaliza sidebar, header, inputs, dropdowns e estados interativos;
- diferencia visualmente os estados dos cards de checklist e os cards de plataformas;
- define a progressao responsiva para desktop amplo, notebook, tablet e celulares de 430/390 px;
- respeita `prefers-reduced-motion`.

### `platform/script-page-state.js`

- oculta o loading apos um atraso;
- marca o menu lateral ativo com base no caminho atual.

### `platform/script-profile-sync.js`

- replica o perfil salvo no `localStorage` para os elementos da interface interna;
- funciona como camada adicional de sincronizacao visual.

## 8. Ordem de carregamento

### Landing

1. CSS da pagina
2. HTML da landing
3. `landing/js/script.js`

### Login e cadastro

1. Supabase JS
2. `js/config.js`
3. `js/auth.js`
4. `landing/js/login.js`

### Dashboard e paginas internas

1. Supabase JS
2. `js/config.js`
3. `js/auth.js`
4. `js/profile.js`
5. `js/notifications.js`
6. `platform/js/core-config.js`
7. `platform/js/profile-manager.js`
8. `platform/js/loading-navigation.js`
9. `platform/script-interno.js`
10. `platform/script-profile-sync.js`
11. `platform/script-page-state.js` quando a pagina usa esse utilitario
12. `js/checklist.js` e modulos do checklist quando a pagina e de checklist
13. `platform/PLATAFORMAS/plataformas-gratuitas.js` quando a pagina e de plataformas
14. `platform/CONFIGURACOES PERFIL/configuracoes.js` quando a pagina e de configuracoes
15. `platform/ajuda/support-config.js` e `platform/ajuda/ajuda-suporte.js` quando a pagina e de ajuda; ambos operam apenas com conteudo local

## 9. Dados e armazenamento

### LocalStorage

Chaves relevantes atualmente:

- `theme`
- `sidebarCollapsed`
- `userProfile`
- `platformFavorites:<user_id>`
- `unicheck_checklist_progress_v2:<user_id>`
- `unicheck_activity:<user_id>` (historico local, limitado a 100 eventos; dashboard exibe os 5 mais recentes)
- `unicheck_activity_sync_queue:<user_id>` (eventos com UUID aguardando persistencia remota)
- `unicheck_notifications:<user_id>` (cache das notificacoes da conta)
- `unicheck_notifications_sync_queue:<user_id>` (insercoes e marcacoes de leitura pendentes)

### Supabase Auth

- login com email e senha;
- cadastro com `user_metadata`;
- restauracao de sessao persistida com `persistSession` e renovacao com `autoRefreshToken`;
- logout;
- atualizacao de senha;
- atualizacao de email, quando aplicavel.

### Supabase Database

O projeto depende de pelo menos estas estruturas conceituais:

- `checklists`
- `checklist_items`
- `users_profile`
- `user_checklist_item_progress`
- `user_activity` (eventos duraveis da jornada, com SELECT/INSERT restritos ao proprio usuario por RLS)
- `user_notifications` (comunicacoes duraveis, com SELECT/INSERT e UPDATE apenas da coluna `read`, protegidos por RLS)

Distincao de persistencia:

- dados estruturais relativamente estaticos, como fases, textos, ordem e tarefas, ficam versionados no frontend;
- estado individual importante, como progresso e atividade, tem o Supabase como persistencia duravel e fonte para restauracao entre dispositivos;
- `localStorage` e cache local-first, fila de escrita e fallback offline, nunca a unica copia pretendida desses dados individuais;
- favoritos continuam locais nesta etapa, embora os eventos de favoritar e remover sejam persistidos em `user_activity`.

## 10. Regras de negocio importantes

- Checklists seguem ordem de fase.
- Fase posterior depende da conclusao da anterior.
- Progresso pode vir do banco ou do cache local.
- A estrutura do checklist e um modulo local versionado e nao usa cache nem consulta estrutural remota; o progresso continua obrigatoriamente separado por `user_id`.
- Alteracoes de tarefa atualizam primeiro a UI e o cache por usuario e depois sincronizam com Supabase.
- O dashboard calcula imediatamente progresso e proxima acao usando `js/checklist-data.js` e o cache `unicheck_checklist_progress_v2:<user_id>`, depois reconcilia esse cache com `user_checklist_item_progress` em background.
- Atividades recentes sao isoladas por `user_id`, persistidas em `user_activity` e mantidas em cache/fila local para operacao offline.
- Notificacoes sao isoladas por `user_id`, persistidas em `user_notifications` e usam cache/fila local-first; atividade recente e notificacao nao sao tratadas como o mesmo registro.
- Falha de sincronizacao do progresso nao impede a estrutura local do checklist de aparecer nem o usuario de continuar marcando tarefas.
- Perfil e refletido em varias telas internas.
- Logout deve limpar sessao e redirecionar para a area publica.
- Somente a ausencia confirmada de sessao causa redirecionamento de uma pagina interna para o login; erros de perfil, checklist ou rede nao equivalem a logout.
- Favoritos das plataformas estao sendo tratados no frontend como demonstracao.

## 11. Estado de consistencia e pontos de atencao

O projeto funciona, mas existem inconsistencias tecnicas que precisam ser conhecidas para nao documentar algo errado:

- [`js/checklist.js`](./js/checklist.js) e [`supabase/checklist_progress_and_seed.sql`](./supabase/checklist_progress_and_seed.sql) agora estao alinhados em `user_checklist_item_progress`, com `user_id` e `checklist_item_id`.
- O cache local do checklist e separado por usuario autenticado para evitar vazamento de progresso entre contas no mesmo navegador.
- Consultas do checklist possuem timeout de 30 segundos e registram `message`, `code`, `details` e `hint` no console quando o Supabase retorna erro.
- Consultas e gravacoes de atividade possuem timeout de 15 segundos, sem polling ou retries agressivos; novas oportunidades ocorrem na inicializacao, em novas interacoes e no evento `online`.
- [`supabase/20260816_create_user_activity.sql`](./supabase/20260816_create_user_activity.sql) cria `user_activity`, indice de leitura recente e policies RLS somente para `SELECT` e `INSERT` do proprio usuario. A migration deve ser executada manualmente.
- [`supabase/20260816_create_user_notifications.sql`](./supabase/20260816_create_user_notifications.sql) cria `user_notifications`, indice, idempotencia por evento e policies RLS para leitura/insercao proprias e atualizacao exclusiva de `read`. A migration deve ser executada manualmente.
- [`supabase/checklist_rls_policies.sql`](./supabase/checklist_rls_policies.sql) restaura policies explicitas: usuarios autenticados leem as definicoes e cada usuario le e grava somente o proprio progresso. O arquivo precisa ser aplicado manualmente no projeto remoto.
- [`js/profile.js`](./js/profile.js) e [`supabase/users_profile_policies.sql`](./supabase/users_profile_policies.sql) estao alinhados em `users_profile.user_id` como chave de relacionamento com `auth.users`.
- Alguns documentos auxiliares em `platform/PLATAFORMAS/` e `platform/CHECKLIST ACADEMICO/` descrevem funcionalidades de forma mais antiga do que o comportamento atual do codigo.

Isto nao invalida a arquitetura geral, mas significa que este `architecture.md` deve ser tratado como a fonte de contexto mais fiel do estado atual do projeto.

## 12. Como pensar o projeto ao alterar codigo

Se for preciso mudar alguma parte do sistema, a leitura correta e esta:

- alteracao em landing mexe com captacao e entrada do usuario;
- alteracao em auth mexe com sessao, cadastro, login e logout;
- alteracao em profile mexe com toda a area interna que exibe nome, avatar e email;
- alteracao em checklist mexe com persistencia, bloqueio de fases, navegacao de detalhe e integracao com Supabase;
- alteracao em plataformas mexe com filtros, favoritos, modais e persistencia local;
- alteracao em configuracoes mexe com perfil, senha e preferencia visual;
- alteracao em qualquer rota interna pode quebrar links relativos entre pastas.

## 13. Regra obrigatoria de manutencao

Sempre que algo for mudado no projeto e isso envolver fluxo, arquitetura, dependencia, comportamento complexo, integracao com Supabase, persistencia local, navegacao entre paginas ou qualquer parte relevante da experiencia, **e extremamente necessario atualizar este `architecture.md` junto com a mudanca**. Se o fluxo mudar e o documento nao mudar, o projeto fica mal documentado e passa a induzir erro para pessoas e para IA.
