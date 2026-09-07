# Checklist Acadêmico — conteúdo enriquecido

Registro da implementação baseada na pesquisa `docs/checklist-academico-pesquisa.pdf` (43 páginas, 2026).

## Escopo publicado

- Os cards 001–012 possuem orientação operacional associada aos UUIDs canônicos atuais.
- Passos visuais continuam pertencendo ao card original e não criam novas unidades de progresso.
- Os cards 013–028 preservam o conteúdo existente porque a pesquisa marca seus fluxos como `não confirmado — pesquisa pendente`.
- O conteúdo enriquecido fica em `Unicheck/js/data/checklist-content.js`; nenhum texto tutorial foi gravado no Supabase.

## Experiência de consumo

- A fase usa um player de trilha em duas colunas no desktop: lista compacta à esquerda e uma única etapa selecionada à direita.
- Seleção e conclusão são estados independentes. Navegar não altera progresso; marcar ou desmarcar não troca a etapa aberta.
- Ao entrar, a primeira etapa pendente é selecionada. Quando todas estão concluídas, a primeira etapa fica disponível para revisão.
- No mobile, a lista aparece primeiro e o detalhe possui a ação “Voltar para a trilha”.
- Próxima ação, passos, critério de conclusão, contexto e ajuda não são repetidos na lista.

## Decisões diante de contradições ou lacunas

- Portal TOTVS: o RA é numérico e a pesquisa associa a senha inicial baseada na data de nascimento exclusivamente ao fluxo do Portal Acadêmico.
- Microsoft 365: a resposta específica do card 010 associa o RA à senha provisória do primeiro acesso. As respostas do card 011 misturam Portal e Microsoft 365; por isso, a regra citada de “uma letra maiúscula e um número” não foi publicada como política do Microsoft 365.
- Microsoft 365: a pesquisa não fornece uma URL exata. O card orienta navegador/aplicativo, mas não publica CTA inventado.
- Plataforma A+ × AVA: a relação permanece sem confirmação. A fase não foi renomeada, seu tutorial não foi completado com conteúdo do AVA e suas URLs não foram alteradas.
- Biblioteca Pearson, Teams, Plataforma A+ e Mentorias: não foram criados fluxos tela a tela sem confirmação.

## Screenshots a exportar da pesquisa

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
