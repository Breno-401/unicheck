# Checklist Acadêmico — conteúdo enriquecido

Registro editorial interno. A primeira rodada utilizou a pesquisa de 43 páginas; materiais privados de consulta não são versionados. A rodada de 13/09/2026 usa `UNICHECK - CHECKLIST DE PESQUISA.pdf` (25 páginas), lido integralmente em texto e com inspeção das páginas renderizadas, incluindo os prints.

Fonte complementar recebida em `C:/Users/breno/Documents/UNICHECK - CHECKLIST DE PESQUISA.pdf`. SHA-256: `9949DFF300466E13AE32FA343587381C2809194FA69F580DCE39A35F1A587AAA`. Os números de página abaixo contam a capa como 1. Não se confundem com as páginas do Manual 2024 nem com a pesquisa anterior.

Base de integração: `origin/main` em `4095644ce4c19aa459f53cafca7a218a361952b1`, após fetch. A branch local antiga (`bcb0850`) estava desatualizada e o histórico remoto havia sido reescrito. Para preservar a versão atual da main, foi criada `codex/checklist-conteudo-academico` diretamente sobre ela e reaplicado apenas o diff desta rodada. A branch antiga e o stash `42e528fe995c08d4e6ae809f0b645756031bc24b` ficaram preservados. O resumo da jornada, os ajustes de logos, a sidebar e as demais correções da main não foram substituídos pela versão antiga.

## Escopo publicado

- Os 28 cards possuem orientação operacional associada aos UUIDs canônicos atuais: 001–008 preservados, exceto a orientação conflitante de senha inicial do card 006; 009–012 receberam correções pontuais; 013–028 foram enriquecidos.
- Passos visuais continuam pertencendo ao card original e não criam novas unidades de progresso.
- As fases 4, 6 e 7 passam a exibir Biblioteca Virtual Pearson, AVA e Monitoria e apoio acadêmico. Um mapa de apresentação em `checklist-data.js`, indexado pelo UUID da fase, sobrepõe somente título e descrição na saída de `getChecklists()`, inclusive após atualização remota. O catálogo bruto, os UUIDs, a ordem e as quatro tarefas por fase permanecem intactos.
- O conteúdo enriquecido fica em `Unicheck/js/data/checklist-content.js`; nenhum texto tutorial foi gravado no Supabase.
- CTAs de plataforma reutilizam `guide-action-link`; suporte reutiliza `UniCheckContacts.multiatendimento`, a mesma referência de Ajuda e Suporte. Nenhum número ou e-mail de TI foi copiado para o conteúdo.
- A Home consulta o título enriquecido da próxima tarefa pelo UUID, para não reapresentar frases antigas como reservas/downloads ou Plataforma A+.

## Experiência de consumo

- A fase usa um player de trilha em duas colunas no desktop: lista compacta à esquerda e uma única etapa selecionada à direita.
- Seleção, conclusão e revisão são estados separados. Navegar não altera progresso; o indicador não é interativo; uma etapa pendente só pode ser concluída definitivamente pelo botão no fim do painel.
- Ao entrar, a primeira etapa pendente é selecionada. Quando todas estão concluídas, a primeira etapa fica disponível para revisão.
- No mobile, a lista aparece primeiro e o detalhe possui a ação “Voltar para a trilha”.
- Próxima ação, passos, critério de conclusão, contexto e ajuda não são repetidos na lista.

## Informações incorporadas nesta rodada

| Cards | Páginas do novo PDF | Orientação publicada e critério observável |
| --- | --- | --- |
| 006, 009–012 | 2–8 | Senhas separadas por sistema; Webmail como entrada; perfil @souunisales.com.br; recuperação condicionada aos dados cadastrados; envio/recebimento preservado; Multiatendimento para encaminhar à TI. |
| 013 | 9 | Entrar no AVA, localizar o acesso identificado com Pearson e carregar a tela da Biblioteca. |
| 014 | 9–10 | Cadastro com e-mail institucional, confirmação recebida e senha própria da Biblioteca; permite usar cadastro já existente. |
| 015 | 11 | Login e recuperação pela opção “Esqueci minha senha”, usando e-mail ou CPF cadastrado; conclusão exige acervo acessível. |
| 016 | 10, 12 | Buscar título/tema, abrir um recurso de leitura e reconhecer favoritos, anotações e sugestões disponíveis. |
| 017 | 5, 13–14 | Teams com a mesma conta Microsoft institucional do Outlook; conferir o endereço no perfil. |
| 018 | 13–14 | Reconhecer turma/disciplina nas equipes e canais; acesso com Multiatendimento, organização acadêmica com coordenação. |
| 019 | 5, 13, 15 | Consultar canal da turma e caixa de entrada; comunicados podem chegar ao e-mail, sem exclusividade. |
| 020 | 14, 16–17 | Procurar materiais e divulgação de encontros; seguir a plataforma indicada pelo professor, distinguindo Teams, AVA e Portal. |
| 021 | 17–18 | Login AVA com RA e CPF inicial, senha atual em acessos posteriores, troca quando solicitada e home carregada. |
| 022 | 18–20 | Home/Disciplinas, conferência da matrícula e abertura de uma disciplina real. |
| 023 | 17, 19 | “Seu conteúdo” na disciplina, material do professor/Unidade de Aprendizagem e abertura de um material. |
| 024 | 19–20 | Atividade/avaliação e “Grade de Notas”, campos de entrega/status/nota quando presentes; nenhum caminho inventado para prazo ou feedback. |
| 025 | 21–23 | Quando procurar Monitoria, coordenação ou atendimento, sem exigir uma dificuldade atual. |
| 026 | 21–22 | Seção Monitoria e “Veja os horários dos monitores”; identificar curso, monitor, horário e canal, conferindo vigência. |
| 027 | 22 | Preparar disciplina/tema, tentativa e dúvida para o monitor; nenhuma inscrição ou protocolo criado. |
| 028 | 22–23 | Encontrar o canal divulgado e saber retornar; nenhuma resposta ou prazo de atendimento é condição para concluir. |

As recomendações de conferir o domínio, guardar o acesso, resumir a dúvida e procurar o setor adequado são orientações seguras de uso; não representam regras institucionais adicionais.

## Ambiguidades e informações omitidas

- Portal: a pesquisa anterior associava a data de nascimento ao TOTVS; o novo PDF (p. 3) e a página institucional citam outra senha inicial. O card 006 orienta usar a credencial recebida para o Portal, sem universalizar nenhuma delas. Não se alterou o restante da fase.
- Microsoft: removido RA como senha provisória universal. A senha inicial e a obrigatoriedade de troca não ficam consistentemente comprovadas no novo material (p. 3–4). Seguir a orientação individual e as solicitações da própria tela.
- MFA/Authenticator: omitida a afirmação de opcionalidade permanente (p. 7). Não se recomenda ignorar verificações.
- TI: os endereços citados divergem (p. 8, 24). Ambos ficam fora da UI; Multiatendimento é o encaminhamento compartilhado. Não foram acrescentados telefones, WhatsApps ou contatos por curso.
- Pearson: o texto sobre código de validação mistura confirmação inicial e redefinição de senha. O print da p. 11 demonstra recuperação por e-mail/CPF cadastrado, não geração, formato, entrega ou expiração de um código inicial. Não foram publicados esses comportamentos nem campos/regras de senha não demonstrados.
- Pearson: reservas, download, offline, histórico e políticas do acervo físico não foram prometidos como recursos da Biblioteca Virtual.
- Teams: omitidas exclusividade de notificações no Outlook, obrigatoriedade de dispositivo, caminhos de Atividade, Calendário, gravações e menus não demonstrados. Prints das p. 13–16 mostram conta Microsoft/Copilot/Outlook/site, não um tutorial da home/equipe do Teams.
- AVA/A+: omitidas as alegações de manutenção/gestão do software. AVA é o rótulo funcional, sem modificar o UUID. “Grade de Notas” está demonstrada; posições exatas de prazo/feedback e o caminho até essa tela não estão completos.
- Monitoria: a página oficial publica uma grade, mas a consulta de 13/09/2026 não comprova sua vigência para o semestre atual. A UI não copia nomes nem horários e orienta conferir vigência com a coordenação. Não foram criados agendamento obrigatório, formulário, protocolo, preferência presencial ou SLA.

## Links de acesso e confirmação

As URLs novas foram localizadas em páginas oficiais; o AVA direto já existia no projeto. Consulta e verificação HTTP em 13/09/2026:

| Destino | URL | Verificação |
| --- | --- | --- |
| Webmail | https://unisales.br/institucional/webmail/ | HTTP 200; opção Webmail no menu Portal do Aluno. |
| AVA | https://unisales.grupoa.education/plataforma/auth/signin | HTTP 200, normaliza barra final; mantido o endereço existente. |
| Teams | https://teams.microsoft.com/ | Endereço da documentação oficial Microsoft; HTTP 200 redirecionou o cliente HTTP para unsupported-browser. Isso não valida login nem compatibilidade móvel; no celular o guia admite aplicativo. |
| Monitoria | https://unisales.br/institucional/manual-do-aluno/ | HTTP 200; seção Monitoria e horários presentes, sem âncora fictícia. |

Fontes complementares de conferência: [Webmail UniSales](https://unisales.br/institucional/webmail/), [Manual do Aluno e Monitoria](https://unisales.br/institucional/manual-do-aluno/), [Biblioteca UniSales](https://unisales.br/institucional/biblioteca/), [entrada institucional do AVA](https://unisales.br/institucional/ava-graduacao/) e [acesso ao Teams, Microsoft](https://support.microsoft.com/pt-br/teams/meetings/how-to-log-in-to-microsoft-teams). O novo PDF segue sendo a fonte principal do conteúdo.

Ainda dependem de confirmação: senha inicial Microsoft por aluno, endereço canônico da TI, contatos/horários vigentes de Monitoria e coordenação, posições atuais de prazo/feedback no AVA e eventual validação inicial da Pearson. Nenhum desses pontos gera link ou contato fictício.

## Capturas do novo PDF a exportar e associar

Não foram encontrados arquivos independentes das capturas operacionais no repositório. Conforme o escopo autorizado, mantido o suporte já existente por passo (`image`, `imageAlt`, `imageCaption`), sem capturar novamente imagens de páginas renderizadas ou publicar dados pessoais. Não há caminhos de imagens inexistentes na UI. As páginas foram renderizadas apenas para análise privada.

| Arquivo proposto em `platform/assets/tutorial/` | Origem | Associação depois da exportação |
| --- | --- | --- |
| F6_C021_P01_login-ava.png | p. 17 | Card 021, passo 1, tela de entrada. |
| F4_C013_P02_acesso-pearson-ava.png | p. 9 | Card 013, passo 2, home com acesso Pearson. |
| F6_C022_P02_disciplinas.png | p. 18; lista adicional p. 20 | Card 022, passo 2, Disciplinas. |
| F6_C023_P02_disciplina-conteudo.png | p. 19 | Card 023, passo 2, “Seu conteúdo”. |
| F6_C024_P03_grade-notas.png | p. 20, captura inferior | Card 024, passo 3; prioridade, retirar notas/dados do aluno antes de associar. |
| F4_C015_P01_login-pearson.png | p. 11, captura superior | Card 015, passo 1, Login. |
| F4_C015_P03_recuperacao-pearson.png | p. 11, captura inferior | Card 015, passo 3, e-mail ou CPF cadastrado. |
| F4_C016_P02_busca-pearson.png | p. 10 ou 12 | Card 016, passo 2, acervo aberto e busca. |
| F5_C017_P02_conta-microsoft.png | p. 8 ou 13 | Card 017, passo 2; é identificação da conta Microsoft, não home do Teams. |
| F7_C026_P01_monitoria.png | p. 21 | Card 026, passo 1, página de Monitoria; usar recorte do cabeçalho sem cristalizar nomes/horários não vigentes. |

Exportar preferencialmente os objetos de imagem originais, conservar nitidez e conferir em 1366/390 e light/dark. Anonimizar nomes, RA, e-mail, foto, notas, faltas e demais dados do aluno; não reconstruir menus com geração de imagem. Vincular somente após inspeção da imagem final. Não existe captura válida de equipe/home do Teams neste PDF; é uma captura futura, não uma exportação pendente.

## Capturas da pesquisa anterior ainda pendentes

O repositório possui logos de TOTVS e Outlook, mas não contém as capturas operacionais do documento como arquivos independentes. A interface aceita uma imagem por passo por meio dos campos `image`, `imageAlt` e `imageCaption` em cada passo do guia.

Exportações prioritárias, sempre com nome, RA, e-mail, foto, notas, faltas, valores e documentos anonimizados:

- `F1_C004_P01_calendario-academico.png`: página oficial e identificação do calendário vigente.
- `F2_C005_P01_login-portal-totvs.png`: tela de login reconhecível do Portal TOTVS.
- `F2_C006_P01_campos-ra-senha.png`: campos de RA e senha.
- `F2_C006_P02_troca-senha.png`: janela de troca do primeiro acesso.
- `F2_C006_P03_recuperacao-senha.png`: opção e fluxo “Esqueceu a senha?”.
- `F2_C006_P04_central-aluno.png`: tela inicial com curso e situação da matrícula anonimizados.
- `F2_C007_P01_menu-notas.png`: `☰ → Central do Aluno → Notas`.
- `F2_C007_P02_menu-faltas.png`: `☰ → Central do Aluno → Faltas`.
- `F2_C007_P03_grade-curricular.png`: `☰ → Grade Curricular`.
- `F2_C008_P01_requerimentos.png`: `☰ → Secretaria → Requerimentos`.
- `F2_C008_P02_relatorios.png`: menu e lista de relatórios.
- `F2_C008_P03_financeiro.png`: pagamentos realizados e pendentes anonimizados.
- `F2_C008_P04_beneficios.png`: área Benefícios sem valores ou dados pessoais.
- `F3_C009_P01_minha-conta-ava.png`: caminho até “Minha conta”.
- `F3_C009_P02_email-institucional.png`: campo do endereço institucional anonimizado.
- `F3_C010_P01_login-microsoft-365.png`: primeiro acesso, sem credenciais reais.
- `F3_C010_P02_conta-aluno.png`: identificação de aluno e instituição anonimizada.
- `F3_C011_P01_recuperacao-email.png`: fluxo de recuperação de senha.
- `F3_C012_P01_nova-mensagem.png`: composição de mensagem fictícia.
- `F3_C012_P02_enviados.png`: confirmação em itens enviados.
- `F3_C012_P03_resposta-caixa-entrada.png`: resposta fictícia recebida.

Ao exportar, conservar também a versão limpa, registrar a data e informar se a captura é desktop, mobile ou ambas, seguindo o protocolo da pesquisa.

## Validação e higiene do repositório

- Suíte automatizada completa: 125 testes unitários, incluindo 7 fases/28 tarefas, UUIDs/ordem, 28 guias enriquecidos, separação de credenciais, CTAs HTTPS, suporte canônico, linguagem editorial e apresentação após refresh remoto. A regressão da Home reproduziu o título legado antes da correção e passou depois, com fallback preservado.
- `scripts/test-checklist-browser.cjs`: 72 cenários (fases 4–7 × 1920×1080/1366×768/390×844 × light/dark × parcial/última tarefa/revisão), com auditoria dos quatro cards e 48 recarregamentos. Verifica proteção de seis segundos, critério visível, conclusão, cliques repetidos, XP, Phase Complete, Level Up, revisão e ausência de overflow/erros de console.
- `tests/visual-refinement.browser.cjs`, vindo da main: 32 verificações responsivas do shell real, resumo 0/7, 3/7 e 7/7, busca, logos e teclado, preservadas.
- Inspeção adicional do HTML de produção: 16 combinações (fases 4–7 × 1366×768/390×844 × light/dark), quarto card em revisão, com Lucide e fontes carregados. Sem cortes, overflow ou erros de console; retorno à trilha mobile conferido. Evidências em `private-context/checklist-browser/real-shell/`; script de inspeção em `tmp/`, sem versionamento.
- Os testes de navegador usam sessão e persistência simuladas, sem autenticar nas plataformas acadêmicas nem gravar em produção. O harness de interação não carrega Lucide externo; suas capturas validam conteúdo/layout, não os ícones. O teste de página real complementa essa inspeção.
- A referência de screenshots por passo continua suportada e testada. Capturas operacionais do novo PDF aguardam exportação e anonimização conforme a matriz acima.
- `tmp/` está ignorado integralmente no `.gitignore`; a verificação com `git ls-files -- tmp/` não encontrou arquivos rastreados. Não houve remoção do índice nem exclusão local. `git check-ignore -v` confirmou texto extraído, PNG e JSON temporário. `private-context/` já era ignorado na main e também é usado para evidências visuais.
- PDFs privados, imagens de inspeção, resultados intermediários e arquivos de navegador não entram nos commits. Assets reais da aplicação não foram movidos nem ignorados. Nenhum push foi realizado.
- Referências locais, sintaxe dos sete arquivos JS/CJS alterados/adicionados e `git diff --check` passaram. Comparação com `origin/main` confirmou ausência de alterações em autenticação, serviços de progresso/XP, Supabase, CSS e HTML do Checklist.

Arquivos desta rodada: `.gitignore`; `Unicheck/js/data/checklist-content.js`; `Unicheck/js/data/checklist-data.js`; `Unicheck/platform/pages/checklist-academico/checklist-detail.js`; `Unicheck/platform/pages/checklist-academico/checklist-view.js`; `Unicheck/platform/index-interno.html`; `Unicheck/platform/shared/js/platform-shell.js`; `tests/checklist-content.test.cjs`; `tests/checklist-player-browser-test.html`; `scripts/test-checklist-browser.cjs`; `docs/architecture/application.md`; este documento.
