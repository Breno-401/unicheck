# UniCheck - Architecture Overview

Este documento descreve a arquitetura real do projeto UniCheck no estado atual do repositório. Ele serve como referencia para pessoas e para IA entenderem a estrutura, os fluxos, as dependencias e os pontos que precisam ser mantidos consistentes ao evoluir o sistema.

## 1. Visao geral

O UniCheck e uma aplicacao web sem framework de build, composta por paginas HTML, CSS e JavaScript puro, organizada em duas areas principais:

- `landing/` como camada externa de apresentacao, captura e entrada do usuario.
- `platform/` como area interna autenticada, onde ficam dashboard, checklists, configuracoes de perfil e paginas de recursos.

O projeto usa Supabase como backend para autenticacao e como fonte canônica dos perfis, do catalogo de checklists, do progresso, das atividades, das notificacoes e dos favoritos. `js/checklist-data.js` carrega `checklists` e `checklist_items` e mantem uma copia local do catalogo para acelerar as proximas aberturas e tolerar indisponibilidade temporaria. `localStorage` tambem funciona como cache local-first, fila offline onde o modulo oferece esse comportamento e armazenamento de preferencias de interface.

Nao existe etapa de bundling, transpile ou framework SPA. A navegacao e feita por arquivos estaticos, links relativos e algumas rotinas de redirecionamento e restauracao de estado.

## 2. Objetivo do produto

O UniCheck foi construído para orientar estudantes na jornada academica, com foco em:

- onboarding e primeiros passos na universidade;
- organizacao de tarefas e fases de checklists;
- curadoria de ferramentas, programas educacionais e descontos verificaveis para estudantes;
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
  - [`platform/manual/manual-aluno.html`](./platform/manual/manual-aluno.html)
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
- tabelas do banco para perfil, catalogo e progresso remoto dos checklists
- `js/checklist-data.js` como adaptador e cache local do catalogo canônico no Supabase
- `localStorage` para tema, perfil cacheado, cache local-first de favoritos, progresso por `user_id` e filas de sincronizacao

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
- [`platform/manual/`](./platform/manual) guarda a central navegavel do Manual do Aluno e sua experiencia de leitura.
- [`platform/PLATAFORMAS/`](./platform/PLATAFORMAS) guarda o modulo Beneficios para Estudantes.
- [`platform/CONFIGURACOES PERFIL/`](./platform/CONFIGURACOES%20PERFIL) guarda o modulo de configuracao de perfil.
- [`platform/ajuda/`](./platform/ajuda) guarda a central interna de Ajuda e Suporte, seu FAQ e a configuracao vazia dos futuros canais institucionais.

### Backend e banco

- [`supabase/00_inventory.sql`](./supabase/00_inventory.sql)
- [`supabase/checklist_progress_and_seed.sql`](./supabase/checklist_progress_and_seed.sql)
- [`supabase/20260824_prerelease_reset.sql`](./supabase/20260824_prerelease_reset.sql)
- [`supabase/20260824_post_reset_validation.sql`](./supabase/20260824_post_reset_validation.sql)

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

- percentual geral calculado por tarefas concluidas sobre o total de tarefas do catalogo canônico carregado;
- fases concluidas, fase atual e primeira tarefa pendente dessa fase;
- CTA que abre diretamente a fase atual por hash de rota;
- mapa visual das sete fases, derivado do progresso real, com estados concluida, em andamento, proxima e bloqueada;
- XP, nivel atual e avanco para o proximo nivel calculados deterministicamente a partir das tarefas e fases concluidas.

A Home usa uma hierarquia enxuta: cabecalho compartilhado, um bloco principal de progresso, a visao compacta `Sua Jornada` com o contexto das sete fases e uma faixa institucional secundaria da Fundacao Bradesco / Escola Virtual. Nivel, XP e avanco para o proximo nivel ficam associados ao perfil na sidebar compartilhada, em vez de ocuparem um bloco proprio na Home. Os antigos cards grandes de gerenciamento de checklists, notificacoes e biblioteca de plataformas, assim como os tres atalhos estatisticos redundantes, nao fazem mais parte da Home; as funcionalidades continuam disponiveis na sidebar, no sino e nas paginas proprias. A Home nao exibe busca enquanto nao houver uma acao real para ela; as buscas funcionais continuam preservadas nas paginas especificas.

Na abertura, o dashboard carrega o catalogo canônico por `js/checklist-data.js`, identifica o `user_id` e combina a estrutura com o cache local de progresso. Em paralelo, tenta esvaziar a fila de progresso, consulta `user_checklist_item_progress` e restaura `user_activity`. Os resultados remotos atualizam os caches, o bloco principal, `Sua Jornada` e a secao `Atividade recente`; alteracoes de progresso ainda pendentes localmente prevalecem durante a reconciliacao.

O historico e implementado por [`js/activity.js`](./js/activity.js). Eventos sao registrados em interacoes efetivas do checklist, dos favoritos e do perfil. A gravacao ocorre diretamente em `user_activity`; quando o banco confirma a insercao, o modulo atualiza `unicheck_activity_v1:<user_id>` e a secao da Home. A restauracao busca ate 20 eventos da conta, mantem o mesmo limite no cache e exibe os cinco mais recentes no dashboard. Uma falha de gravacao e reportada no console e nao produz um evento apenas local.

O sino das paginas internas e gerenciado centralmente por [`js/notifications.js`](./js/notifications.js). O modulo valida a sessao, renderiza `unicheck_notifications_v1:<user_id>` imediatamente e executa uma restauracao remota por carregamento de pagina. O painel diferencia itens lidos e nao lidos, mostra contador e marca individualmente uma notificacao como lida ao abrir seu destino. O botao de fechar e `Escape` fecham o painel.

Notificacao e atividade possuem papeis distintos. A conclusao de uma tarefa/fase continua no historico; uma notificacao e criada quando a fase seguinte e desbloqueada ou quando toda a jornada e concluida. Chaves semanticas como `phase_unlocked:<checklist_id>` impedem que a mesma comunicacao seja criada novamente por re-renderizacao ou reconclusao.

A faixa de parceiro educacional apresenta somente Fundacao Bradesco / Escola Virtual, com CTA externo para `https://www.ev.org.br/` aberto em nova aba com `noopener noreferrer`; ela nao participa de progresso, atividade ou persistencia.

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

Fluxo canônico com cache local:

- `js/checklist-data.js` consulta fases e tarefas em `checklists` e `checklist_items`, normaliza o catalogo e salva `unicheck_checklist_catalog_v1`;
- se uma consulta posterior falhar e ja houver catalogo valido em cache, usa essa copia local como fallback;
- identifica o usuario pela sessao ja validada e le `unicheck_checklist_progress_v2:<user_id>`;
- renderiza o progresso local assim que o catalogo esta disponivel;
- faz em background uma unica consulta a `user_checklist_item_progress` e combina o resultado com o estado local;
- aplica regra de bloqueio entre fases;
- mostra lista de fases;
- abre a visao detalhada de uma fase com o mesmo padrao de cards de conclusao para todas as etapas;
- exibe conteudo informativo especifico por fase dentro da propria tela de checklist;
- trabalha com fases ja estruturadas com tarefas reais, de forma que o desbloqueio entre fases possa ser testado de ponta a ponta;
- permite marcar itens como concluido;
- ao marcar ou desmarcar, atualiza UI e `localStorage` imediatamente e sincroniza o Supabase em background;
- a camada de apresentacao interpola barra, percentual, contador, checkbox e estado do card usando o estado local anterior e o novo, sem aguardar o Supabase;
- ao concluir uma fase, a interface destaca a conclusao e sinaliza visualmente o desbloqueio da fase seguinte quando a lista e exibida;
- ao concluir uma tarefa, mostra feedback visual curto de `+10 XP`; quando a mesma acao conclui a fase, mostra tambem `+50 XP`, sem persistir um contador de XP;
- falhas remotas nao revertem a UI: a alteracao permanece numa fila `unicheck_checklist_pending_sync_v1:<user_id>`, tentada novamente em uma nova alteracao ou quando o navegador volta a ficar online;
- libera a fase seguinte quando a atual e finalizada.

Regra central do modulo:

- o checklist e ordenado por `ordem`;
- os UUIDs usados pelo frontend vem das tabelas preservadas no Supabase e mantem compatibilidade com as FKs de `user_checklist_item_progress`;
- a primeira fase nao e bloqueada;
- uma fase posterior fica bloqueada ate a anterior estar concluida;
- a visao de detalhe usa um unico padrao de cards de conclusao, variando apenas o texto e o conteudo de apoio de cada checklist;
- o tutorial TOTVS em tela separada foi removido para evitar duplicacao de fluxo e concentrar a experiencia no checklist.

### 6.5 Beneficios para Estudantes

Arquivos principais:

- [`platform/PLATAFORMAS/plataformas-gratuitas.html`](./platform/PLATAFORMAS/plataformas-gratuitas.html)
- [`platform/PLATAFORMAS/benefits-data.js`](./platform/PLATAFORMAS/benefits-data.js)
- [`platform/PLATAFORMAS/plataformas-gratuitas.js`](./platform/PLATAFORMAS/plataformas-gratuitas.js)
- [`platform/PLATAFORMAS/plataformas-gratuitas.css`](./platform/PLATAFORMAS/plataformas-gratuitas.css)

Fluxo:

- trata a pagina como central de beneficios estudantis verificaveis, reunindo software, educacao, tecnologia, compras, entretenimento, direitos publicos e mobilidade relevante para estudantes brasileiros;
- a curadoria local possui 34 beneficios em nove categorias: Desenvolvimento, Produtividade & Estudos, Design & Criatividade, Cloud & Dados, Educacao, Tecnologia, Entretenimento, Compras & Beneficios e Direitos & Mobilidade;
- `benefits-data.js` e a fonte central dos cards e registra `id`, nome, categoria e subcategoria, tipo e rotulo do beneficio, disponibilidade, publico, verificacao, elegibilidade, descricao, tags, URL oficial, data da ultima verificacao e status;
- `sourceChannel` diferencia acesso direto, GitHub Student Developer Pack, UNiDAYS, ISIC, instituicao e governo; `accessMethod` descreve verificacao estudantil, email institucional, GitHub Education, SheerID, elegibilidade governamental, loja educacional ou dependencia institucional;
- `lastVerified` informa quando a referencia oficial foi conferida; campos volateis como preco, percentual e credito sao identificados por `volatileFields` e recebem contexto no detalhe;
- `status: institution_dependent` e `benefitType: institution_dependent` distinguem ofertas cujo acesso depende da participacao ou elegibilidade da instituicao;
- permite busca local por nome, descricao, beneficio, publico, verificacao, elegibilidade, disponibilidade, tags e categorias;
- gera apenas filtros de categoria que possuem oferta e combina esse filtro com um seletor simples de gratuitos, descontos ou dependencia institucional, alem de um filtro local para exibir somente os favoritos da conta;
- mostra imediatamente os favoritos do cache `platformFavorites:<user_id>` com icone padronizado de bookmark;
- mantem IDs anteriores somente quando representam o mesmo produto; IDs removidos sao ignorados na leitura do cache, da fila e do resultado remoto, sem criar cards fantasma ou atividade artificial;
- ao favoritar ou remover, atualiza UI e cache sem aguardar a rede e registra a ultima intencao por plataforma em `unicheck_favorites_sync_queue:<user_id>`;
- sincroniza a fila em lote com `user_platform_favorites` na inicializacao, na proxima interacao e no evento `online`, sem polling;
- depois da sessao, faz uma unica leitura consolidada dos favoritos remotos e reconcilia o resultado preservando operacoes locais ainda pendentes;
- restauracao e reconciliacao nunca criam atividade recente; somente cliques efetivos continuam registrando plataforma favoritada ou removida;
- comunica o favorito também por preenchimento, contraste, animação breve, `aria-pressed` e `aria-label` atualizado;
- mostra detalhes com beneficio, publico, verificacao, forma de acesso, disponibilidade, elegibilidade, fonte oficial e aviso localizado quando um dado e volatil; o rodape diferencia a acao secundaria de fechar do CTA primario que abre a oferta oficial em nova aba, ocultando-o quando a URL nao e valida;
- abre links externos em nova aba;
- exibe cards com hierarquia para beneficio, publico elegivel, tags, data de verificacao e favorito, sem afirmar gratuidade universal quando ha dependencia institucional; o CTA `Ver detalhes` e explicito e permanece alinhado no rodape;
- logos comerciais sao assets locais leves: primeiro reutilizam arquivos existentes, depois usam SVGs da biblioteca Simple Icons; quando uma marca nao esta disponivel, o card usa fallback tipografico consistente. Direitos publicos e mobilidade usam apenas icones semanticos, sem logotipos inventados;
- beneficios governamentais registram `sourceChannel: government`; beneficios regionais registram disponibilidade e badge territorial, como o Cartao Transcol Escolar no Espirito Santo;
- a listagem aplica busca, categoria, tipo e favoritos antes de paginar localmente os resultados em lotes fixos de 12; filtros e novas buscas retornam a pagina 1, enquanto remocoes no modo Favoritados ajustam apenas paginas que deixarem de existir;
- a pagina atual e refletida em `?page=N`, restaurada no recarregamento e integrada ao historico do navegador; a navegacao explicita informa o intervalo visivel, usa `aria-current` e retorna ao inicio da secao de resultados respeitando `prefers-reduced-motion`;
- a pagina usa quatro colunas apenas em desktop amplo com espaco confortavel, tres em notebooks, duas em tablets e uma no mobile; filtros possuem rolagem horizontal e o modal se reorganiza em uma coluna.

Esta pagina tambem depende da infraestrutura de dashboard e autenticacao, porque reaproveita sidebar, tema, logout e sincronizacao de perfil.

### 6.6 Configuracoes de perfil

Arquivos principais:

- [`platform/CONFIGURACOES PERFIL/configuracoes.html`](./platform/CONFIGURACOES%20PERFIL/configuracoes.html)
- [`platform/CONFIGURACOES PERFIL/configuracoes.js`](./platform/CONFIGURACOES%20PERFIL/configuracoes.js)

Fluxo:

- carrega e persiste nome e email em `users_profile`, usando `id = auth.users.id`;
- mantem no perfil somente o email confirmado pelo Supabase Auth;
- envia JPG, PNG ou WebP de ate 2 MB para o bucket `avatars`, isolado pela pasta do usuario;
- exige reautenticacao com a senha atual antes de alterar a senha;
- oferece apenas as secoes funcionais de dados pessoais, aparencia e seguranca;
- usa grid fluido no desktop, reduz a navegacao no tablet e empilha formulario, avatar e acoes no mobile;
- nao usa `overflow-x: hidden` como correcao e nao possui larguras fixas maiores que a viewport em 320–390 px.

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

### 6.8 Manual do Aluno

Arquivos principais:

- [`platform/manual/manual-aluno.html`](./platform/manual/manual-aluno.html)
- [`platform/manual/manual-aluno.css`](./platform/manual/manual-aluno.css)
- [`platform/manual/manual-aluno.js`](./platform/manual/manual-aluno.js)
- [`js/manual-data.js`](./js/manual-data.js)

O modulo transforma o Manual do Aluno 2024 do UniSales em uma central de conhecimento web, sem reproduzir o PDF pagina a pagina. A fonte institucional foi lida integralmente e o conteudo foi agrupado semanticamente em oito categorias: comeco no UniSales, vida academica, ferramentas digitais, avaliacoes e frequencia, campus e biblioteca, apoio ao estudante, formacao e carreira e utilidades. Embora preserve corretamente o nome `Manual do Aluno 2024 — UniSales`, esse PDF e a ultima referencia institucional disponibilizada ao UniCheck em 2026 e, por isso, seu conteudo e presumido vigente ate a publicacao de fonte institucional mais nova.

A area possui 41 conteudos mapeados. A descoberta exibe um hero objetivo, seis acessos rapidos definidos editorialmente e cards compactos para as oito categorias. Nao ha indicador, porcentagem ou estado visual de progresso enquanto leitura e conclusao nao possuirem comportamento real. Ao selecionar uma categoria, a pagina lista as orientacoes correspondentes; ao selecionar um conteudo, a mesma rota abre uma leitura web nativa pelo hash estavel `#conteudo=<id>`.

A busca e inteiramente local e normaliza maiusculas, minusculas e acentos. Ela pesquisa titulo, categoria, resumo, corpo, palavras-chave e termos comuns. Consultas curtas como `RA` usam correspondencia por palavra para evitar falsos positivos. Durante a busca ou filtragem, a grade de categorias e substituida por uma lista editorial de resultados com titulo, resumo, categoria e acao de leitura. Os filtros usam as oito categorias e podem ser combinados com a busca. Nenhuma operacao do Manual consulta ou grava no Supabase.

Todo item em `js/manual-data.js` possui ID estavel, categoria, titulo, resumo, conteudo, palavras-chave, paginas de origem, tempo estimado, secoes editoriais, destinos, campos temporais e IDs relacionados. A leitura adapta os blocos ao assunto e pode apresentar `Em poucas palavras`, `O que voce precisa saber`, `O que fazer`, `Onde resolver` e `Atencao`, sem forcar secoes sem suporte documental. Breadcrumb, retorno para a categoria, anterior/proximo na ordem da categoria e dois ou tres relacionados definidos semanticamente mantem a navegacao contextual. A fonte e suas paginas aparecem de forma discreta ao final do texto.

A politica temporal separa regra institucional de dado operacional volatil. Conceitos, procedimentos e dependencias de Calendario, edital, Regimento ou norma continuam vigentes conforme a ultima fonte disponivel e nao recebem alerta generico. `temporalFields` identifica somente partes que podem mudar independentemente de uma nova edicao completa, como nomes de pessoas, telefones, e-mails, links, horarios, datas, valores, multas, quantidades, credenciais, fornecedores e dados de seguro. A interface mostra uma nota pequena e contextual junto ao fim da orientacao. `requiresValidation` fica reservado aos cinco conteudos cujo objeto central e volatil: calendario/horarios, prazos de documentos, tabela de servicos/taxas, contatos/atendimento e seguro escolar.

A sidebar compartilhada posiciona `Manual do Aluno` entre `Checklists Academicos` e `Beneficios Estudantis`, usa o icone inequivoco `book-open` e preserva os comportamentos existentes de estado ativo, recolhimento e menu mobile. A rota da area e `platform/manual/manual-aluno.html` e tambem esta registrada em `platform/js/core-config.js`.

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
- atualiza somente os campos editaveis do proprio perfil e insere um perfil ausente como fallback;
- sincroniza nome, email e foto;
- atualiza o cache local de perfil.
- a interface interna renderiza primeiro o perfil cacheado e atualiza em background quando a consulta remota termina.

### `js/notifications.js`

- centraliza cache, restauracao remota e UI do sino;
- persiste em `user_notifications` com UUID e `event_key` idempotente;
- atualiza o cache depois que insercoes e marcacoes de leitura sao confirmadas pelo Supabase;
- nao usa polling, realtime, consulta em `focus` ou `service_role`.

### `js/progression.js`

- centraliza as recompensas de 10 XP por tarefa e 50 XP por fase completa;
- calcula XP exclusivamente a partir do estado atual do progresso, sem tabela ou chave de armazenamento propria;
- centraliza os cinco niveis e thresholds: Calouro (0), Explorador (90), Conectado (180), Veterano (360) e Expert Academico (540);
- informa nivel atual, proximo nivel, XP restante e percentual dentro do nivel;
- aceita campos futuros de secoes concluidas e bonus do Manual do Aluno, mantidos com peso zero ate o recurso ser implementado;
- fornece as recompensas visuais do clique, mas nao cria atividades nem notificacoes.

### `platform/js/core-config.js`

- centraliza chaves de `localStorage`;
- centraliza rotas da area interna;
- normaliza caminhos para navegacao entre paginas.

### `platform/js/profile-manager.js`

- sincroniza o perfil cacheado entre paginas da area interna;
- atualiza avatar, nome e email em varios pontos da UI;
- reage a `focus` e ao evento `storage`.

### `platform/js/progression-profile.js`

- injeta a representacao compacta de nivel, XP e barra abaixo do perfil nas sidebars das paginas internas que usam esse layout;
- calcula a apresentacao usando `js/progression.js`, o catalogo carregado dos checklists e o cache de progresso da conta, sem armazenar XP ou nivel;
- na sidebar recolhida, oculta textos e barra, mantendo somente um indicador numerico com tooltip acessivel;
- reage ao cache alterado por outra aba e ao evento local `unicheck:progression-updated` emitido imediatamente pelo checklist;
- mostra um toast transitorio somente quando uma interacao local atravessa um threshold de nivel; nao cria notificacao nem atividade.

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
13. `js/progression.js` antes dos consumidores de XP
14. `platform/js/progression-profile.js` depois de checklist, progressao e autenticacao nas paginas com sidebar compartilhada
15. `platform/PLATAFORMAS/plataformas-gratuitas.js` quando a pagina e de plataformas
16. `platform/CONFIGURACOES PERFIL/configuracoes.js` quando a pagina e de configuracoes
17. `platform/ajuda/support-config.js` e `platform/ajuda/ajuda-suporte.js` quando a pagina e de ajuda; ambos operam apenas com conteudo local
18. `js/manual-data.js` e `platform/manual/manual-aluno.js` quando a pagina e do Manual; ambos operam apenas com conteudo local e o primeiro e a fonte central de textos e metadados

## 9. Dados e armazenamento

### LocalStorage

Chaves relevantes atualmente:

- `theme`
- `sidebarCollapsed`
- `userProfile`
- `platformFavorites:<user_id>`
- `unicheck_favorites_sync_queue:<user_id>` (ultima operacao de adicionar/remover ainda pendente por plataforma)
- `unicheck_favorites_remote_ready:<user_id>` (marca a migracao inicial do antigo cache somente local)
- `unicheck_checklist_catalog_v1` (ultima copia valida de `checklists` e `checklist_items`)
- `unicheck_checklist_progress_v2:<user_id>`
- `unicheck_activity_v1:<user_id>` (historico local, limitado a 20 eventos; dashboard exibe os 5 mais recentes)
- `unicheck_notifications_v1:<user_id>` (cache de ate 30 notificacoes da conta)

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
- `user_platform_favorites` (favoritos unicos por `user_id` e `platform_id`, com SELECT/INSERT/DELETE restritos ao proprio usuario por RLS)

Distincao de persistencia:

- dados estruturais relativamente estaticos, como fases, ordem e tarefas, tem `checklists` e `checklist_items` como fonte canônica e um cache local descartavel no frontend;
- o conteudo editorial do Manual fica versionado em `js/manual-data.js`, com rastreabilidade por pagina e revisao temporal explicita; seu estado de leitura ainda nao e persistido;
- estado individual importante, como progresso e atividade, tem o Supabase como persistencia duravel e fonte para restauracao entre dispositivos;
- `localStorage` e cache local-first, fila de escrita e fallback offline, nunca a unica copia pretendida desses dados individuais;
- favoritos de plataformas tem `user_platform_favorites` como persistencia da conta, `platformFavorites:<user_id>` como cache local-first e uma fila local compactada para operacao offline e restauracao entre dispositivos.

## 10. Regras de negocio importantes

- Checklists seguem ordem de fase.
- Fase posterior depende da conclusao da anterior.
- Progresso pode vir do banco ou do cache local.
- A estrutura do checklist e carregada das tabelas canônicas e usa `unicheck_checklist_catalog_v1` apenas como cache; o progresso continua obrigatoriamente separado por `user_id`.
- Alteracoes de tarefa atualizam primeiro a UI e o cache por usuario e depois sincronizam com Supabase.
- XP e a funcao `tarefas concluidas * 10 + fases completas * 50`; desmarcar e remarcar nunca acumula pontos fora do estado atual.
- Nao existe `user_xp`: em outro dispositivo, o mesmo progresso restaurado produz o mesmo XP e nivel.
- O dashboard calcula imediatamente progresso e proxima acao usando `js/checklist-data.js` e o cache `unicheck_checklist_progress_v2:<user_id>`, depois reconcilia esse cache com `user_checklist_item_progress` em background.
- Atividades recentes sao isoladas por `user_id`, persistidas em `user_activity` e copiadas para um cache local depois da confirmacao remota.
- Notificacoes sao isoladas por `user_id`, persistidas em `user_notifications` e mantidas em cache apos confirmacao remota; atividade recente e notificacao nao sao tratadas como o mesmo registro.
- Quando ja existe um catalogo valido em cache, uma falha temporaria ao consultar a estrutura remota nao impede o checklist de aparecer; alteracoes de progresso continuam na fila local ate a sincronizacao.
- Perfil e refletido em varias telas internas.
- Logout deve limpar sessao e redirecionar para a area publica.
- Somente a ausencia confirmada de sessao causa redirecionamento de uma pagina interna para o login; erros de perfil, checklist ou rede nao equivalem a logout.
- Favoritos pertencem a conta autenticada: o cache responde imediatamente, operacoes remotas usam a chave composta para impedir duplicacao e alteracoes pendentes prevalecem durante a reconciliacao.
- O Manual nao concede XP por abertura e nao altera `progression.js`; integracao de conclusao, persistencia e recompensas fica reservada a uma etapa posterior.
- Conteudo do Manual vinculado a calendario, edital, Regimento ou instrucao normativa deve preservar essa dependencia, mas nao e marcado como desatualizado apenas por constar no Manual 2024. Somente campos operacionais genuinamente volateis usam `temporalFields`; `requiresValidation` e reservado a artigos cujo assunto central depende desses dados.

## 11. Estado de consistencia e pontos de atencao

O projeto funciona, mas existem inconsistencias tecnicas que precisam ser conhecidas para nao documentar algo errado:

- [`js/checklist.js`](./js/checklist.js) e [`supabase/checklist_progress_and_seed.sql`](./supabase/checklist_progress_and_seed.sql) agora estao alinhados em `user_checklist_item_progress`, com `user_id` e `checklist_item_id`.
- O cache local do checklist e separado por usuario autenticado para evitar vazamento de progresso entre contas no mesmo navegador.
- Consultas do checklist possuem timeout de 30 segundos e registram `message`, `code`, `details` e `hint` no console quando o Supabase retorna erro.
- Consultas e gravacoes de atividade possuem timeout de 15 segundos, sem polling ou retries agressivos; novas oportunidades ocorrem na inicializacao, em novas interacoes e no evento `online`.
- [`supabase/20260824_prerelease_reset.sql`](./supabase/20260824_prerelease_reset.sql) remove as tres tabelas legadas, recria vazias as estruturas canônicas de usuario e centraliza RLS, grants, triggers, indices e Storage.
- O reset preserva `auth.users`, `checklists` e `checklist_items`; nenhum historico de desenvolvimento e migrado.
- [`supabase/20260824_post_reset_validation.sql`](./supabase/20260824_post_reset_validation.sql) valida contagens, ausencia do legado, RLS, grants, funcoes, trigger e bucket de avatar.
- [`supabase/AUDIT_2026-08-24.md`](./supabase/AUDIT_2026-08-24.md) registra o inventario remoto, a decisao de descartar dados de teste e os criterios de aceite.
- [`js/profile.js`](./js/profile.js) e o reset estao alinhados em `users_profile.id` como chave primaria e relacionamento com `auth.users.id`.
- O total atual e 630 XP para 28 tarefas e 7 fases. Novas fontes devem ser adicionadas na configuracao de [`js/progression.js`](./js/progression.js), sem espalhar valores pelos consumidores.
- Alguns documentos auxiliares em `platform/PLATAFORMAS/` e `platform/CHECKLIST ACADEMICO/` descrevem funcionalidades de forma mais antiga do que o comportamento atual do codigo.

Isto nao invalida a arquitetura geral, mas significa que este `architecture.md` deve ser tratado como a fonte de contexto mais fiel do estado atual do projeto.

## 12. Como pensar o projeto ao alterar codigo

Se for preciso mudar alguma parte do sistema, a leitura correta e esta:

- alteracao em landing mexe com captacao e entrada do usuario;
- alteracao em auth mexe com sessao, cadastro, login e logout;
- alteracao em profile mexe com toda a area interna que exibe nome, avatar e email;
- alteracao em checklist mexe com persistencia, bloqueio de fases, navegacao de detalhe e integracao com Supabase;
- alteracao nas regras de XP, niveis ou futuras fontes de progressao deve ser centralizada em `js/progression.js`;
- alteracao em plataformas mexe com filtros, favoritos, modais, cache local, fila offline e persistencia remota por conta;
- alteracao em configuracoes mexe com perfil, senha e preferencia visual;
- alteracao em qualquer rota interna pode quebrar links relativos entre pastas.

## 13. Regra obrigatoria de manutencao

Sempre que algo for mudado no projeto e isso envolver fluxo, arquitetura, dependencia, comportamento complexo, integracao com Supabase, persistencia local, navegacao entre paginas ou qualquer parte relevante da experiencia, **e extremamente necessario atualizar este `architecture.md` junto com a mudanca**. Se o fluxo mudar e o documento nao mudar, o projeto fica mal documentado e passa a induzir erro para pessoas e para IA.
