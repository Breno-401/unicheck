(function () {
    "use strict";

    const TASK_ID_PREFIX = "20000000-0000-4000-8000-";
    const ACCESS = {
        ava: { label: "Abrir AVA", url: "https://unisales.grupoa.education/plataforma/auth/signin" },
        webmail: { label: "Abrir Webmail", url: "https://unisales.br/institucional/webmail/" },
        teams: { label: "Abrir Teams", url: "https://teams.microsoft.com/" },
        monitoria: { label: "Abrir página de Monitoria", url: "https://unisales.br/institucional/manual-do-aluno/" }
    };

    function supportHelp(title, text) {
        return { title, text, action: { contact: "multiatendimento", label: "Falar com o Multiatendimento" } };
    }

    function taskId(number) {
        return `${TASK_ID_PREFIX}${String(number).padStart(12, "0")}`;
    }

    const GUIDES = [
        {
            id: taskId(1),
            title: "Identificar o representante de turma",
            description: "Descubra qual aluno foi escolhido pela maioria para representar as demandas coletivas da turma.",
            nextAction: "Pergunte aos colegas ou professores quem é o representante de turma e anote uma forma adequada de contato.",
            where: "Em sala ou no grupo principal da turma",
            steps: [
                { text: "Pergunte aos colegas ou professores se a turma já escolheu o representante." },
                { text: "Se ainda não escolheu, combine a votação entre os alunos; normalmente isso acontece nos primeiros dias de aula." },
                { text: "Depois da escolha, confirme o nome e guarde uma forma adequada de contato, de preferência o e-mail acadêmico." }
            ],
            completionCriteria: "Você sabe quem é o representante de turma e possui uma forma adequada de contato.",
            whyItMatters: "O representante leva demandas coletivas aos professores e à coordenação e ajuda a repassar informações da turma.",
            quickHelp: [
                {
                    title: "O que essa pessoa faz?",
                    text: "Mantém contato com professores e coordenação para demandas coletivas e repasses, como datas de provas e atividades avaliativas."
                },
                {
                    title: "O que essa pessoa não faz?",
                    text: "Não controla presença, notas, comportamento dos alunos nem resolve conflitos pessoais."
                }
            ],
            sourcePages: [7, 8]
        },
        {
            id: taskId(2),
            title: "Encontrar o grupo principal da turma",
            description: "Localize o canal de conversa criado pelos próprios alunos para os primeiros combinados da turma.",
            nextAction: "Peça a um colega o convite para o grupo principal que a turma está usando.",
            where: "Entre os próprios alunos; o WhatsApp é comum, mas não é obrigatório institucionalmente",
            steps: [
                { text: "Pergunte aos colegas qual grupo a turma está usando para conversar e trocar avisos." },
                { text: "Peça o link, QR code ou inclusão diretamente a um aluno que já esteja no grupo." },
                { text: "Reconheça que esse é um canal combinado pelos estudantes, não um canal institucional da UniSales." }
            ],
            completionCriteria: "Você entrou no grupo principal usado pelos alunos da sua turma.",
            whyItMatters: "Esse canal ajuda a acompanhar combinados cotidianos sem confundir a conversa dos alunos com uma comunicação institucional.",
            quickHelp: [
                {
                    title: "Quem cria o grupo?",
                    text: "Não existe responsável oficial. Ele costuma ser criado pelos próprios estudantes nos primeiros dias de aula."
                }
            ],
            sourcePages: [8, 9]
        },
        {
            id: taskId(3),
            title: "Confirmar que você entrou no grupo certo",
            description: "Verifique curso, turma e período antes de confiar nos avisos compartilhados no grupo.",
            nextAction: "Confira o nome e a descrição do grupo e peça a um colega ou administrador para confirmar sua turma.",
            where: "No nome, na descrição e com os participantes do grupo",
            steps: [
                { text: "Leia o nome e a descrição do grupo e procure referências ao seu curso, turma, turno ou período." },
                { text: "Confirme com colegas que já estão há mais tempo se aquele é o grupo usado pela sua sala." },
                { text: "Se houver dois grupos parecidos, pergunte aos administradores qual corresponde à sua turma." }
            ],
            completionCriteria: "O nome ou a descrição confere e um colega ou administrador confirmou que o grupo corresponde à sua turma.",
            whyItMatters: "A confirmação reduz o risco de seguir datas e combinados de outra turma.",
            quickHelp: [
                {
                    title: "Proteja os dados da turma",
                    text: "Não é necessário compartilhar prints de conversas nem dados pessoais para concluir este card."
                }
            ],
            sourcePages: [9, 10]
        },
        {
            id: taskId(4),
            title: "Consultar o calendário e saber qual setor procurar",
            description: "Encontre as datas do seu período letivo e diferencie demandas da coordenação e da secretaria.",
            nextAction: "Abra o calendário acadêmico oficial e confira o documento correspondente ao período e à modalidade vigentes.",
            where: "Site da UniSales — Calendário Acadêmico",
            steps: [
                { text: "Abra a página oficial do Calendário Acadêmico." },
                { text: "Leia a identificação antes de abrir ou baixar o documento e confirme período e modalidade vigentes." },
                { text: "Localize início das aulas, feriados, avaliações, rematrícula e férias." },
                { text: "Guarde o acesso e use a orientação abaixo para procurar o setor correto quando precisar." }
            ],
            completionCriteria: "Você localizou as principais datas do período vigente e sabe diferenciar quando procurar coordenação ou secretaria.",
            whyItMatters: "O calendário reduz surpresas com prazos, enquanto o setor correto evita encaminhamentos desnecessários.",
            quickHelp: [
                {
                    title: "Coordenação",
                    text: "Procure para questões de curso, disciplinas, professores, grade, atividades acadêmicas ou situações que envolvam a turma. O contato varia por curso."
                },
                {
                    title: "Secretaria",
                    text: "Procure para documentos, histórico, declarações, matrícula, transferência e registros acadêmicos."
                }
            ],
            access: {
                label: "Abrir calendário acadêmico",
                url: "https://unisales.br/calendario-academico/"
            },
            sourcePages: [10, 11, 12]
        },
        {
            id: taskId(5),
            title: "Abrir o Portal Acadêmico TOTVS",
            description: "Acesse o Portal do Aluno correto pelo navegador e reconheça a tela do sistema TOTVS.",
            nextAction: "Abra o Portal Acadêmico no navegador e confirme que a tela de entrada do TOTVS carregou.",
            where: "Portal Acadêmico TOTVS, com acesso pela web",
            steps: [
                { text: "Use o acesso direto abaixo em um navegador no computador ou no celular." },
                { text: "Aguarde a tela de login do Portal do Aluno, administrada pelo sistema TOTVS." },
                { text: "Confirme que aparecem os campos de acesso antes de informar seus dados." }
            ],
            completionCriteria: "A tela correta do Portal do Aluno/TOTVS está aberta e pronta para receber suas credenciais.",
            whyItMatters: "Começar pelo endereço validado evita confundir o portal acadêmico com outros sistemas da UniSales.",
            quickHelp: [
                {
                    title: "Preciso instalar um aplicativo?",
                    text: "Não. O acesso ao Portal Acadêmico é feito pelo navegador."
                }
            ],
            access: {
                label: "Abrir Portal Acadêmico",
                url: "https://inspetoriasao142819.rm.cloudtotvs.com.br/FrameHTML/Web/App/Edu/PortalEducacional/login/"
            },
            sourcePages: [12, 13, 14]
        },
        {
            id: taskId(6),
            title: "Fazer o primeiro login no Portal TOTVS",
            description: "Entre com o RA numérico e conclua a troca da senha inicial solicitada pelo Portal Acadêmico.",
            nextAction: "Digite seu RA usando apenas números e siga o primeiro acesso com a senha inicial do Portal TOTVS.",
            where: "Tela de login do Portal Acadêmico TOTVS",
            credential: "RA apenas com números; a orientação da senha inicial chega ao e-mail pessoal",
            steps: [
                { text: "Confira a mensagem de primeiro acesso enviada ao seu e-mail pessoal e tenha seu RA em mãos." },
                { text: "Digite o RA somente com números, sem pontos ou caracteres especiais. Use a senha inicial indicada para o seu Portal Acadêmico na orientação de primeiro acesso; se já a alterou, use sua senha atual." },
                { text: "Após entrar, conclua a troca obrigatória de senha na janela exibida pelo Portal." },
                { text: "Na tela inicial, confirme seu curso e a situação da matrícula na Central do Aluno." }
            ],
            completionCriteria: "A Central do Aluno abriu e você reconheceu seu curso e a situação da matrícula.",
            whyItMatters: "Esse acesso é a porta para consultas acadêmicas, documentos e informações financeiras.",
            quickHelp: [
                {
                    title: "A senha inicial não funcionou?",
                    text: "Use “Esqueceu a senha?” no Portal. Se ainda não conseguir acessar, fale com o atendimento.",
                    action: {
                        contact: "multiatendimento",
                        label: "Falar com o Multiatendimento"
                    }
                },
                {
                    title: "Não procure o semestre nessa tela",
                    text: "A página inicial mostra dados pessoais, curso e situação da matrícula, mas não indica o período letivo do aluno."
                }
            ],
            access: {
                label: "Abrir Portal Acadêmico",
                url: "https://inspetoriasao142819.rm.cloudtotvs.com.br/FrameHTML/Web/App/Edu/PortalEducacional/login/"
            },
            sourcePages: [14, 15, 16, 17]
        },
        {
            id: taskId(7),
            title: "Localizar notas, faltas e grade curricular",
            description: "Aprenda os três caminhos de consulta sem depender de já haver notas lançadas.",
            nextAction: "No menu ☰, abra Central do Aluno → Notas e depois repita a consulta para Faltas e Grade Curricular.",
            where: "Portal TOTVS — menu ☰ no canto superior esquerdo",
            steps: [
                { text: "Abra a consulta de notas.", path: "☰ → Central do Aluno → Notas" },
                { text: "Volte ao menu e abra a consulta de faltas.", path: "☰ → Central do Aluno → Faltas" },
                { text: "Volte ao menu e abra sua grade.", path: "☰ → Grade Curricular" },
                { text: "Confira se as disciplinas correspondem ao seu curso. No início do semestre, a tela de notas pode mostrar as matérias ainda sem pontuação." }
            ],
            completionCriteria: "Você localizou suas disciplinas e sabe exatamente onde voltar para consultar notas e faltas, mesmo que ainda não existam lançamentos.",
            whyItMatters: "Conhecer esses caminhos deixa as consultas acadêmicas previsíveis durante o semestre.",
            sourcePages: [17, 18, 19]
        },
        {
            id: taskId(8),
            title: "Encontrar requerimentos, relatórios e financeiro",
            description: "Reconheça onde ficam serviços da secretaria, documentos e pagamentos sem gerar nada agora.",
            nextAction: "No menu ☰, localize Secretaria → Requerimentos, Relatórios e Financeiro.",
            where: "Portal TOTVS — menu ☰ no canto superior esquerdo",
            steps: [
                { text: "Localize os serviços da secretaria.", path: "☰ → Secretaria → Requerimentos" },
                { text: "Abra Relatórios e reconheça a lista de documentos disponíveis para download.", path: "☰ → Relatórios" },
                { text: "Abra Financeiro e reconheça onde aparecem pagamentos realizados e pendentes.", path: "☰ → Financeiro" },
                { text: "Se for útil para sua situação, localize o Relatório de Pendências do Aluno; não é necessário gerar boleto, requerimento ou documento para concluir." }
            ],
            completionCriteria: "Você sabe voltar aos três menus e reconhece onde consultar documentos, requerimentos e situação financeira.",
            whyItMatters: "Saber onde cada recurso fica reduz a dependência de atendimento para consultas simples.",
            quickHelp: [
                {
                    title: "Benefícios e bolsas",
                    text: "A área “Benefícios” descreve bolsa ou desconto; para bolsistas, a mensalidade pode aparecer como R$ 0,00."
                },
                {
                    title: "Algo não apareceu?",
                    text: "Procure o Multiatendimento para verificar boletos ou documentos ausentes."
                }
            ],
            sourcePages: [19, 20, 21, 22, 23]
        },
        {
            id: taskId(9),
            title: "Descobrir seu e-mail institucional completo",
            description: "Consulte o endereço criado para você em vez de depender apenas de uma fórmula de nomes.",
            nextAction: "No AVA, abra Minha conta e copie exatamente o endereço terminado em @souunisales.com.br.",
            where: "AVA — canto superior direito → Minha conta",
            credential: "No AVA: RA e sua senha; no primeiro acesso, CPF como senha inicial",
            steps: [
                { text: "Entre no AVA e abra o menu no canto superior direito." },
                { text: "Selecione “Minha conta” e localize o campo do e-mail institucional." },
                { text: "Copie o endereço completo exatamente como aparece. Ele costuma seguir o padrão nome.ultimonome@souunisales.com.br, mas use sempre a conta exibida para você." },
                { text: "Se preferir, confira também a mensagem de criação da conta enviada ao seu e-mail pessoal após a matrícula." }
            ],
            completionCriteria: "Você sabe exatamente qual é o seu endereço institucional completo em @souunisales.com.br.",
            whyItMatters: "Esse endereço identifica sua conta acadêmica e é necessário para acessar os serviços Microsoft.",
            quickHelp: [
                {
                    title: "O endereço não apareceu ou está diferente?",
                    text: "Não tente adivinhar o endereço pelo padrão. Procure o Multiatendimento para confirmar a conta criada.",
                    action: { contact: "multiatendimento", label: "Falar com o Multiatendimento" }
                }
            ],
            access: {
                label: "Abrir AVA para consultar a conta",
                url: "https://unisales.grupoa.education/plataforma/auth/signin"
            },
            sourcePages: [23, 24, 25]
        },
        {
            id: taskId(10),
            title: "Entrar no e-mail institucional pelo Webmail",
            description: "Entre pelo navegador ou aplicativo com o endereço institucional completo e reconheça a conta de aluno.",
            nextAction: "Abra o Webmail da UniSales e entre com seu endereço completo @souunisales.com.br.",
            where: "Site UniSales → Portal do Aluno → Webmail",
            credential: "Conta @souunisales.com.br e senha da sua conta Microsoft institucional",
            steps: [
                { text: "Abra o Webmail pelo botão abaixo de “O que fazer agora” ou pelo menu Portal do Aluno no site da UniSales." },
                { text: "Digite o endereço institucional completo que você confirmou no card anterior." },
                { text: "Use a senha da conta Microsoft institucional. No primeiro acesso, siga as orientações recebidas para essa conta e as verificações solicitadas na tela." },
                { text: "Abra o perfil no Outlook e confira se o endereço termina em @souunisales.com.br." }
            ],
            completionCriteria: "A caixa de e-mail abriu no Outlook e o perfil mostra seu endereço @souunisales.com.br.",
            whyItMatters: "A conta correta dá acesso ao e-mail institucional e evita misturar o ambiente acadêmico com uma conta Microsoft pessoal.",
            quickHelp: [
                supportHelp("Não recebeu os dados ou não conseguiu entrar?", "Peça ao Multiatendimento orientação sobre sua conta Microsoft; ele pode encaminhar o problema à TI. As senhas iniciais do Portal e do AVA não devem ser usadas como regra para o Microsoft 365.")
            ],
            access: ACCESS.webmail,
            sourceDocument: "pesquisa-complementar-2026-09",
            sourcePages: [2, 3, 5, 7, 8]
        },
        {
            id: taskId(11),
            title: "Trocar ou recuperar a senha do Microsoft 365",
            description: "Confira o acesso à conta institucional e saiba como recuperar a senha quando precisar.",
            nextAction: "Entre pelo Webmail com sua senha atual. Se a tela solicitar uma nova senha, conclua a alteração; se não lembrar, use a recuperação.",
            where: "Fluxo de acesso e recuperação do Microsoft 365",
            credential: "Conta completa @souunisales.com.br",
            steps: [
                { text: "Abra o Webmail com o endereço completo @souunisales.com.br e sua senha atual." },
                { text: "Se houver solicitação de troca, crie a senha seguindo os requisitos exibidos pelo Microsoft 365." },
                { text: "Se não lembrar a senha, escolha a opção de recuperação da tela de entrada e siga a verificação oferecida. Ela pode depender de dados de recuperação cadastrados anteriormente." },
                { text: "Depois de trocar ou recuperar a senha, entre novamente e confirme que abriu a mesma conta institucional. Se já consegue entrar, apenas reconheça onde iniciar a recuperação quando precisar." }
            ],
            completionCriteria: "Você consegue entrar na conta institucional e sabe onde iniciar a recuperação caso esqueça a senha.",
            whyItMatters: "Validar a senha agora reduz bloqueios quando você precisar do e-mail ou de outros serviços Microsoft.",
            quickHelp: [
                supportHelp("A recuperação não funcionou?", "Se não conseguir usar os dados de recuperação ou a conta continuar bloqueada, procure o Multiatendimento para orientação e encaminhamento à TI."),
                {
                    title: "Não misture as senhas",
                    text: "Teams e Outlook usam a mesma senha quando estão na mesma conta Microsoft institucional. Portal TOTVS, AVA e Biblioteca têm seus próprios acessos."
                }
            ],
            access: ACCESS.webmail,
            sourceDocument: "pesquisa-complementar-2026-09",
            sourcePages: [4, 5, 6, 8]
        },
        {
            id: taskId(12),
            title: "Testar envio e recebimento no e-mail institucional",
            description: "Faça um teste simples para confirmar que a caixa @souunisales.com.br envia e recebe mensagens.",
            nextAction: "Envie uma mensagem curta pelo e-mail institucional para outro endereço seu ou de um colega e peça uma resposta.",
            where: "Caixa de e-mail da conta institucional no Microsoft 365",
            steps: [
                { text: "Crie uma mensagem simples usando a conta @souunisales.com.br como remetente." },
                { text: "Envie para outro endereço seu ou para um colega que concordou em responder." },
                { text: "Confirme que a mensagem aparece entre os itens enviados." },
                { text: "Peça uma resposta e confirme que ela chegou à sua caixa de entrada institucional." }
            ],
            completionCriteria: "Uma mensagem foi enviada pelo seu @souunisales.com.br e a resposta chegou à caixa de entrada.",
            whyItMatters: "O teste comprova as duas direções da comunicação antes de chegarem avisos acadêmicos importantes.",
            quickHelp: [
                supportHelp("A mensagem não saiu ou a resposta não chegou?", "Confira o destinatário e a pasta de lixo eletrônico. Se o problema continuar, procure o Multiatendimento para orientação e encaminhamento à TI."),
                {
                    title: "Use uma mensagem segura",
                    text: "Não inclua senha, RA, notas, documentos ou outros dados sensíveis no teste."
                }
            ],
            access: ACCESS.webmail,
            sourcePages: [28, 29]
        },
        {
            id: taskId(13),
            title: "Entrar na Biblioteca Virtual Pearson pelo AVA",
            description: "Abra a Biblioteca pelo ambiente da UniSales para começar o acesso ao acervo digital.",
            nextAction: "Entre no AVA e localize o acesso à Biblioteca Virtual Pearson na página inicial.",
            where: "Site UniSales → Portal do Aluno → AVA → Biblioteca Virtual Pearson",
            credential: "No AVA: RA e sua senha; no primeiro acesso, CPF como senha inicial",
            access: { ...ACCESS.ava, label: "Abrir AVA para acessar a Biblioteca" },
            steps: [
                { text: "Abra o AVA pelo botão de acesso e entre com seu RA e a senha do AVA. Se for o primeiro acesso, use o CPF e conclua a troca de senha quando solicitada." },
                { text: "Na página inicial, procure o acesso “biblioteca virtual” identificado com Pearson." },
                { text: "Abra esse acesso e siga as instruções exibidas pela própria Biblioteca. Se houver cadastro ou login, continue nos próximos cards." }
            ],
            completionCriteria: "A tela da Biblioteca Virtual Pearson carregou, mesmo que ainda esteja pedindo cadastro ou login.",
            whyItMatters: "Entrar pelo AVA ajuda a chegar ao acervo vinculado à UniSales.",
            quickHelp: [supportHelp("O acesso à Biblioteca não apareceu?", "Confira se entrou no AVA da UniSales. Se o acesso estiver ausente ou apresentar erro, procure o Multiatendimento e diga em qual tela parou.")],
            sourceDocument: "pesquisa-complementar-2026-09",
            sourcePages: [9]
        },
        {
            id: taskId(14),
            title: "Concluir o cadastro inicial da Biblioteca",
            description: "Use seu e-mail institucional para confirmar o cadastro e escolher a senha da Biblioteca.",
            nextAction: "Abra a Pearson pelo AVA e siga o cadastro apresentado, com o Webmail institucional acessível.",
            where: "Biblioteca Virtual Pearson, aberta pelo AVA; confirmação no Webmail",
            credential: "E-mail @souunisales.com.br; a senha da Biblioteca é escolhida por você",
            access: { ...ACCESS.ava, label: "Abrir AVA para acessar a Biblioteca" },
            steps: [
                { text: "Entre no AVA com RA e sua senha, abra a Biblioteca Pearson e siga a orientação de cadastro exibida. Se já tem cadastro, use sua conta existente." },
                { text: "Informe seu endereço completo @souunisales.com.br nos campos solicitados." },
                { text: "Abra o Webmail dessa conta, localize a mensagem de confirmação da Biblioteca e siga a orientação recebida." },
                { text: "Escolha uma senha para a Biblioteca conforme os requisitos da tela e finalize o cadastro para continuar o acesso." }
            ],
            completionCriteria: "Seu cadastro está concluído e você consegue seguir para a autenticação da Biblioteca; se já tinha conta, conseguiu usá-la.",
            whyItMatters: "Confirmar o e-mail permite validar o cadastro e recuperar o acesso à Biblioteca quando necessário.",
            quickHelp: [supportHelp("A confirmação não chegou?", "Confira o endereço informado e o lixo eletrônico do Webmail. Se não conseguir acessar o e-mail ou finalizar o cadastro, procure o Multiatendimento. Não use a senha do AVA como senha da Biblioteca por suposição.")],
            sourceDocument: "pesquisa-complementar-2026-09",
            sourcePages: [9, 10]
        },
        {
            id: taskId(15),
            title: "Validar o login e saber recuperar o acesso à Biblioteca",
            description: "Entre com os dados do seu cadastro e use a recuperação somente se precisar redefinir a senha.",
            nextAction: "Na tela de login da Pearson, use seu e-mail institucional cadastrado e a senha que escolheu para a Biblioteca.",
            where: "Biblioteca Virtual Pearson → Login",
            credential: "E-mail institucional cadastrado e senha própria da Biblioteca",
            access: { ...ACCESS.ava, label: "Abrir AVA para acessar a Biblioteca" },
            steps: [
                { text: "Abra a Pearson pelo AVA. Se o acervo já abriu, seu acesso está funcionando; caso apareça Login, informe o e-mail institucional cadastrado e a senha da Biblioteca." },
                { text: "Se esqueceu a senha, selecione “Esqueci minha senha” na tela de login." },
                { text: "Na recuperação, preencha o e-mail ou CPF que já consta no seu cadastro e selecione “Redefinir minha senha”. Siga as instruções apresentadas pela plataforma." },
                { text: "Depois de redefinir, volte ao login e confira se o acervo abre. Se não precisou recuperar, basta reconhecer esse caminho para quando precisar." }
            ],
            completionCriteria: "Você abriu o acervo com sua conta e sabe onde recuperar a senha da Biblioteca, se precisar.",
            whyItMatters: "Conferir o login evita descobrir um bloqueio de acesso quando precisar de um livro para estudar.",
            quickHelp: [supportHelp("A recuperação não reconhece seus dados?", "Use apenas o e-mail ou CPF já cadastrado. Se continuar sem acesso, procure o Multiatendimento. A opção “Esqueci minha senha” serve para redefinir a senha; ela não substitui a confirmação de cadastro.")],
            sourceDocument: "pesquisa-complementar-2026-09",
            sourcePages: [11]
        },
        {
            id: taskId(16),
            title: "Pesquisar e abrir o primeiro livro na Pearson",
            description: "Faça uma busca ligada à sua disciplina e teste a abertura de um livro do acervo.",
            nextAction: "Na Biblioteca aberta, digite um título ou tema da sua disciplina na busca e abra um resultado.",
            where: "Biblioteca Virtual Pearson — busca do acervo",
            credential: "Conta cadastrada com seu e-mail institucional e senha da Biblioteca",
            access: { ...ACCESS.ava, label: "Abrir AVA para acessar a Biblioteca" },
            steps: [
                { text: "Entre no AVA com RA e sua senha, abra a Pearson e faça login na Biblioteca se solicitado." },
                { text: "Use o campo de busca no topo para pesquisar um livro, título ou tema relacionado à disciplina." },
                { text: "Abra um resultado e acesse a leitura ou o recurso disponível para conferir se o conteúdo carrega." },
                { text: "Reconheça os acessos de favoritos, anotações e sugestões de leitura que aparecem na Biblioteca; não é necessário preencher todos para concluir." }
            ],
            completionCriteria: "Você conseguiu pesquisar e abrir um livro ou recurso do acervo da Biblioteca Virtual.",
            whyItMatters: "Testar um conteúdo real confirma que você consegue usar a Biblioteca para estudar.",
            quickHelp: [supportHelp("Não encontrou ou não abriu o livro?", "Tente outra palavra do título ou um tema mais amplo. Se o título indicado pelo professor não aparecer, confirme a referência com ele; para erro de acesso ao acervo, procure o Multiatendimento.")],
            sourceDocument: "pesquisa-complementar-2026-09",
            sourcePages: [10, 12]
        },
        {
            id: taskId(17),
            title: "Entrar no Teams com a conta acadêmica",
            description: "Use a mesma identidade Microsoft institucional que você utiliza no Outlook e no Microsoft 365.",
            nextAction: "Abra o Teams, entre com sua conta @souunisales.com.br e confira o endereço no perfil.",
            where: "Microsoft Teams, no navegador do computador ou no aplicativo",
            credential: "Conta @souunisales.com.br e a mesma senha Microsoft usada no Outlook",
            access: ACCESS.teams,
            steps: [
                { text: "Abra o Teams pelo botão no computador ou pelo aplicativo que utiliza no seu dispositivo." },
                { text: "Selecione a conta @souunisales.com.br. Se aparecer uma conta pessoal, escolha outra conta e informe seu endereço acadêmico completo." },
                { text: "Entre com a senha dessa conta Microsoft e siga as verificações solicitadas." },
                { text: "Abra o perfil e confira se a conta ativa é a sua conta @souunisales.com.br." }
            ],
            completionCriteria: "O Teams abriu e o perfil mostra sua conta acadêmica @souunisales.com.br ativa.",
            whyItMatters: "A conta institucional identifica você no ambiente acadêmico e permite acessar os recursos vinculados à UniSales.",
            quickHelp: [supportHelp("Não consegue entrar na conta acadêmica?", "Use a recuperação apresentada pela Microsoft. Se ela não resolver ou você não recebeu os dados de acesso, procure o Multiatendimento para encaminhamento à TI.")],
            sourceDocument: "pesquisa-complementar-2026-09",
            sourcePages: [5, 13, 14]
        },
        {
            id: taskId(18),
            title: "Encontrar a equipe da turma ou disciplina",
            description: "Identifique o ambiente da sua turma entre as equipes e canais disponíveis no Teams.",
            nextAction: "Confira os nomes das equipes e canais e abra o ambiente correspondente à sua disciplina ou turma.",
            where: "Microsoft Teams — equipes e canais disponíveis na sua conta",
            credential: "Conta Microsoft acadêmica @souunisales.com.br",
            access: ACCESS.teams,
            steps: [
                { text: "Abra o Teams e confirme no perfil que a conta ativa termina em @souunisales.com.br." },
                { text: "Procure as equipes e os canais disponíveis e leia os nomes para identificar seu curso, turma ou disciplina." },
                { text: "Abra a equipe correspondente e um de seus canais; confira se as mensagens se referem à sua turma." },
                { text: "Se houver nomes parecidos ou nenhuma equipe correspondente, peça ao professor ou à coordenação que confirme qual ambiente sua disciplina utiliza." }
            ],
            completionCriteria: "Você abriu a equipe ou o canal correto e reconheceu a turma ou disciplina nas informações exibidas.",
            whyItMatters: "Identificar o ambiente correto evita acompanhar materiais e avisos de outra turma.",
            quickHelp: [supportHelp("Nenhuma equipe apareceu?", "Confirme a conta acadêmica. Para falha de acesso, procure o Multiatendimento; para inclusão na turma ou organização da disciplina, procure a coordenação do curso. Se não souber como encontrá-la, peça o encaminhamento ao atendimento.")],
            sourceDocument: "pesquisa-complementar-2026-09",
            sourcePages: [13, 14]
        },
        {
            id: taskId(19),
            title: "Acompanhar comunicados no Teams e no Outlook",
            description: "Mantenha os dois acessos disponíveis para consultar mensagens da sua conta institucional.",
            nextAction: "Confira os avisos da turma no Teams e abra a caixa de entrada do Webmail com a mesma conta acadêmica.",
            where: "Microsoft Teams e Outlook/Webmail institucional",
            credential: "A mesma conta @souunisales.com.br no Teams e no Outlook",
            access: ACCESS.webmail,
            steps: [
                { text: "No Teams, confirme a conta acadêmica e abra o canal da turma para consultar os avisos disponíveis." },
                { text: "Abra o Webmail pelo botão e confira o endereço institucional no perfil do Outlook." },
                { text: "Consulte a caixa de entrada: comunicados da conta institucional também podem chegar por e-mail." },
                { text: "Guarde os dois acessos para sua rotina de consulta. Mesmo sem mensagens novas, confirme que consegue voltar ao canal e à caixa de entrada." }
            ],
            completionCriteria: "Você consegue consultar o canal da turma no Teams e a caixa de entrada do Outlook usando a mesma conta institucional.",
            whyItMatters: "Consultar Teams e e-mail ajuda a acompanhar os avisos distribuídos entre esses canais.",
            quickHelp: [supportHelp("Um dos acessos falhou?", "Confira se os dois aplicativos usam seu @souunisales.com.br. Se a conta continuar sem abrir ou o e-mail não funcionar, procure o Multiatendimento.")],
            sourceDocument: "pesquisa-complementar-2026-09",
            sourcePages: [5, 13, 15]
        },
        {
            id: taskId(20),
            title: "Localizar materiais e avisos de encontros da turma",
            description: "Reconheça o que sua disciplina compartilha no Teams e quando consultar também o AVA e o Portal.",
            nextAction: "Abra o canal da disciplina, procure materiais compartilhados e confira onde o professor divulga os encontros.",
            where: "Teams da turma; AVA para conteúdos e Portal para consultas acadêmicas",
            credential: "Teams: conta Microsoft @souunisales.com.br; AVA e Portal: RA e a senha de cada sistema",
            access: ACCESS.teams,
            steps: [
                { text: "No Teams com sua conta acadêmica, abra a equipe e o canal que você identificou como corretos." },
                { text: "Leia as mensagens e procure materiais ou links compartilhados. Abra um recurso disponível para reconhecer como acessá-lo." },
                { text: "Procure um aviso de encontro ou aula e confira data, horário e canal indicados. Se ainda não houver aviso, confirme com o professor onde ele será divulgado." },
                { text: "Quando a orientação levar ao AVA ou ao Portal, consulte o sistema indicado com suas credenciais próprias. Guarde onde voltar para comunicação, conteúdos e consultas acadêmicas." }
            ],
            completionCriteria: "Você sabe onde acompanhar a comunicação da turma e encontrar os recursos disponíveis, além de onde serão divulgados os encontros.",
            whyItMatters: "Reconhecer o papel de cada ambiente evita procurar todos os recursos da disciplina em um único aplicativo.",
            quickHelp: [supportHelp("Não há materiais ou avisos?", "Confirme com o professor ou a coordenação quais recursos já foram publicados e em qual plataforma. Para erro ao abrir a conta ou o ambiente, procure o Multiatendimento.")],
            sourceDocument: "pesquisa-complementar-2026-09",
            sourcePages: [14, 16, 17]
        },
        {
            id: taskId(21),
            title: "Fazer o primeiro acesso ao AVA",
            description: "Entre no Ambiente Virtual de Aprendizagem com seu RA e configure a senha do AVA no primeiro acesso.",
            nextAction: "Abra o AVA da graduação, informe seu RA e use o CPF como senha inicial se ainda não a alterou.",
            where: "Site UniSales → Portal do Aluno → Ambiente Virtual de Aprendizagem (AVA) – Graduação",
            credential: "Usuário: RA; senha inicial: CPF; depois, use a senha que você definiu no AVA",
            access: ACCESS.ava,
            steps: [
                { text: "Abra o AVA pelo botão ou pelo menu Portal do Aluno no site da UniSales." },
                { text: "Preencha o campo de usuário com seu RA. No primeiro acesso, informe seu CPF como senha; se já trocou a senha do AVA, use a atual." },
                { text: "Entre e conclua a troca de senha quando solicitada, seguindo os requisitos exibidos na tela." },
                { text: "Aguarde a página inicial do AVA carregar e reconheça os acessos a disciplinas e recursos acadêmicos." }
            ],
            completionCriteria: "A página inicial do AVA carregou após o login com seu RA e a troca de senha, quando solicitada.",
            whyItMatters: "O AVA reúne os conteúdos e atividades que você vai usar para estudar durante o semestre.",
            quickHelp: [supportHelp("O RA ou a senha não funcionou?", "Se já acessou antes, use sua senha atual ou “Esqueci minha senha” na tela de entrada. Se continuar sem acesso, procure o Multiatendimento. As senhas do Microsoft 365 e da Biblioteca pertencem a outros sistemas.")],
            sourceDocument: "pesquisa-complementar-2026-09",
            sourcePages: [17, 18]
        },
        {
            id: taskId(22),
            title: "Encontrar e abrir suas disciplinas no AVA",
            description: "Confira as disciplinas vinculadas à sua matrícula e abra uma delas para reconhecer o ambiente de estudo.",
            nextAction: "Na home do AVA, localize suas disciplinas; use “Disciplinas” para consultar a lista e abra uma do seu curso.",
            where: "AVA — home e opção Disciplinas",
            credential: "RA e sua senha atual do AVA",
            access: ACCESS.ava,
            steps: [
                { text: "Entre no AVA e procure as disciplinas da sua matrícula na página inicial." },
                { text: "Abra “Disciplinas” para consultar a lista e leia os nomes dos componentes disponíveis." },
                { text: "Confira se os nomes correspondem ao seu curso e período e selecione uma disciplina que está cursando." },
                { text: "Verifique se o ambiente aberto mostra o nome da disciplina escolhida e seu conteúdo." }
            ],
            completionCriteria: "Você conseguiu abrir uma disciplina real da sua matrícula e reconheceu seu nome no ambiente do AVA.",
            whyItMatters: "Conferir as disciplinas no início ajuda a perceber uma ausência antes de precisar entregar atividades.",
            quickHelp: [supportHelp("Uma disciplina está faltando ou não corresponde à matrícula?", "Confirme a oferta com a coordenação do curso. Se não conseguir acessar a lista ou precisar de encaminhamento à coordenação, procure o Multiatendimento e informe qual disciplina está faltando.")],
            sourceDocument: "pesquisa-complementar-2026-09",
            sourcePages: [18, 19, 20]
        },
        {
            id: taskId(23),
            title: "Abrir um conteúdo da disciplina no AVA",
            description: "Localize o material do professor ou uma Unidade de Aprendizagem e teste a abertura do conteúdo.",
            nextAction: "Abra uma disciplina e procure seu conteúdo para acessar pelo menos um material de estudo.",
            where: "AVA → Disciplinas → disciplina escolhida → Seu conteúdo",
            credential: "RA e sua senha atual do AVA",
            access: ACCESS.ava,
            steps: [
                { text: "Entre no AVA com seu RA e a senha atual e abra uma disciplina da sua matrícula." },
                { text: "Procure “Seu conteúdo” e localize o material publicado pelo professor ou uma Unidade de Aprendizagem disponível." },
                { text: "Abra um conteúdo e confira se consegue ler o texto, visualizar o arquivo ou acessar o vídeo apresentado." },
                { text: "Volte à disciplina e reconheça onde encontrar esse material novamente." }
            ],
            completionCriteria: "Você abriu corretamente pelo menos um conteúdo da disciplina e sabe onde encontrá-lo de novo.",
            whyItMatters: "Acessar um material real prepara você para acompanhar os estudos e identificar dificuldades técnicas cedo.",
            quickHelp: [supportHelp("O conteúdo não aparece ou não abre?", "Confirme com o professor se o material já foi publicado. Se ele estiver disponível, mas apresentar erro de abertura, procure o Multiatendimento e informe a disciplina e o nome do conteúdo.")],
            sourceDocument: "pesquisa-complementar-2026-09",
            sourcePages: [17, 19]
        },
        {
            id: taskId(24),
            title: "Localizar atividades e a Grade de Notas no AVA",
            description: "Reconheça onde consultar uma atividade ou avaliação e acompanhar as notas disponíveis.",
            nextAction: "Abra uma disciplina, procure uma atividade ou avaliação e localize o acesso à Grade de Notas.",
            where: "AVA — disciplina aberta e Grade de Notas",
            credential: "RA e sua senha atual do AVA",
            access: ACCESS.ava,
            steps: [
                { text: "Entre no AVA e abra uma disciplina. Procure as atividades ou avaliações disponíveis entre seus conteúdos." },
                { text: "Abra uma atividade para consultar as instruções e o prazo, quando exibido. Você não precisa iniciar uma avaliação ou enviar uma resposta para concluir este card." },
                { text: "Localize e abra “Grade de Notas” da disciplina. Reconheça a lista de avaliações e os campos de entrega, status e nota, quando disponíveis." },
                { text: "Confira orientações ou feedback que já tenham sido publicados. Se ainda não há atividade ou nota, confirme com o professor onde acompanhar a publicação e volte a consultar esse acesso depois." }
            ],
            completionCriteria: "Você localizou onde consultar uma atividade ou avaliação e reconheceu onde acompanhar as notas da disciplina, mesmo que ainda não existam lançamentos.",
            whyItMatters: "Saber onde consultar instruções, prazos e resultados ajuda a acompanhar o que cada disciplina exige.",
            quickHelp: [supportHelp("Não encontrou prazo, atividade ou nota?", "Peça ao professor orientação sobre publicação, prazo e feedback da disciplina. Para falha de acesso à tela, procure o Multiatendimento e informe o nome da disciplina e da atividade.")],
            sourceDocument: "pesquisa-complementar-2026-09",
            sourcePages: [19, 20]
        },
        {
            id: taskId(25),
            title: "Entender quando procurar a Monitoria",
            description: "Reconheça como alunos monitores podem ajudar com disciplinas, estudo e uso das ferramentas acadêmicas.",
            nextAction: "Leia a seção Monitoria na página institucional e identifique uma situação em que esse apoio seria útil para você.",
            where: "Site UniSales — Manual do Aluno → seção Monitoria",
            credential: "A consulta à página é pública; para atendimento no Teams, use @souunisales.com.br",
            access: ACCESS.monitoria,
            steps: [
                { text: "Abra a página institucional pelo botão e procure a seção “Monitoria”." },
                { text: "Reconheça os assuntos de apoio: dúvidas sobre disciplinas, modelo de aprendizagem, métodos de estudo, AVA, Biblioteca Virtual e Portal." },
                { text: "Pense em uma dúvida de conteúdo ou uso de ferramenta que poderia levar a um monitor. Não é necessário ter uma dificuldade agora." },
                { text: "Diferencie os encaminhamentos: organização do curso e disciplinas com a coordenação; conta bloqueada ou problema de acesso com o Multiatendimento." }
            ],
            completionCriteria: "Você consegue identificar quando procurar a Monitoria e quando sua dúvida precisa da coordenação ou do Multiatendimento.",
            whyItMatters: "Escolher o apoio adequado ajuda a resolver dúvidas de estudo e de uso das ferramentas com mais clareza.",
            quickHelp: [supportHelp("Ainda não sabe qual setor procurar?", "Descreva brevemente sua necessidade ao Multiatendimento e peça orientação sobre o setor adequado.")],
            sourceDocument: "pesquisa-complementar-2026-09",
            sourcePages: [21, 22, 23]
        },
        {
            id: taskId(26),
            title: "Encontrar o monitor e o horário de atendimento",
            description: "Consulte os horários publicados por curso e identifique como chegar ao atendimento.",
            nextAction: "Na seção Monitoria, localize “Veja os horários dos monitores” e procure seu curso ou área.",
            where: "Página institucional Manual do Aluno → Monitoria → Veja os horários dos monitores",
            credential: "Página pública; no Teams, entre com sua conta Microsoft @souunisales.com.br",
            access: ACCESS.monitoria,
            steps: [
                { text: "Abra a página institucional e procure “Monitoria” e “Veja os horários dos monitores”." },
                { text: "Localize seu curso ou área e identifique o monitor indicado." },
                { text: "Confira o dia, horário e canal divulgados. Para atendimento pelo Teams, mantenha sua conta acadêmica acessível." },
                { text: "Guarde o nome e o acesso para voltar depois. Confira a vigência do horário e, se ela não estiver indicada, confirme com a coordenação antes do atendimento." }
            ],
            completionCriteria: "Você identificou o monitor do seu curso ou área e sabe o horário e o canal para procurá-lo, com a vigência conferida.",
            whyItMatters: "Consultar a agenda e o canal evita procurar um monitor fora do horário de atendimento.",
            quickHelp: [supportHelp("Seu curso, horário ou canal não aparece?", "Peça à coordenação o contato e o horário de Monitoria do período atual. Se precisar localizar a coordenação ou resolver o acesso ao Teams, procure o Multiatendimento.")],
            sourceDocument: "pesquisa-complementar-2026-09",
            sourcePages: [21, 22]
        },
        {
            id: taskId(27),
            title: "Preparar uma dúvida para levar ao monitor",
            description: "Organize o tema e o ponto em que precisa de ajuda para aproveitar o atendimento.",
            nextAction: "Anote a disciplina ou ferramenta, resuma sua dúvida e confira qual monitor e canal podem ajudar.",
            where: "Nas suas anotações; atendimento no canal e horário divulgados pela Monitoria",
            credential: "Use @souunisales.com.br para o atendimento pelo Teams ou e-mail institucional",
            access: ACCESS.monitoria,
            steps: [
                { text: "Identifique a disciplina, o tema ou a ferramenta em que encontrou dificuldade." },
                { text: "Resuma o que tentou fazer e em qual ponto ficou com dúvida. Separe o material de estudo que ajuda a explicar a situação." },
                { text: "Consulte a seção Monitoria e confira o monitor, horário e canal relacionados ao assunto." },
                { text: "Deixe sua dúvida pronta para levar ao atendimento. Se ainda não tem uma, prepare uma pergunta sobre sua rotina de estudo ou o uso de uma ferramenta acadêmica." }
            ],
            completionCriteria: "Você tem uma dúvida ou pergunta clara e sabe a qual monitor e canal levá-la no horário divulgado.",
            whyItMatters: "Explicar o ponto exato da dificuldade ajuda o monitor a orientar seu próximo passo.",
            quickHelp: [supportHelp("A dúvida é sobre bloqueio de conta?", "Procure o Multiatendimento para problemas de acesso. Ao explicar o erro, não compartilhe senhas nem códigos de recuperação.")],
            sourceDocument: "pesquisa-complementar-2026-09",
            sourcePages: [22]
        },
        {
            id: taskId(28),
            title: "Saber como chegar ao atendimento e retornar ao monitor",
            description: "Guarde o canal de apoio e reconheça como continuar uma orientação quando precisar.",
            nextAction: "Confira o canal e o horário do monitor e deixe o acesso disponível para sua próxima dúvida.",
            where: "Canal divulgado pela Monitoria: Teams, e-mail institucional ou local presencial indicado",
            credential: "Conta @souunisales.com.br no Teams e no e-mail; presencial conforme local e horário divulgados",
            access: ACCESS.monitoria,
            steps: [
                { text: "Volte à seção Monitoria e confira o contato e o horário do monitor do seu curso ou área." },
                { text: "Se o atendimento for pelo Teams ou e-mail, abra a conta institucional e localize o contato divulgado. Se for presencial, confira o local e o horário informados antes de ir." },
                { text: "Guarde o canal para retornar. Se já recebeu orientação, anote o próximo passo combinado; se ainda não procurou atendimento, mantenha sua pergunta preparada." },
                { text: "Quando precisar continuar a conversa, use o canal divulgado e explique o que conseguiu fazer desde a última orientação." }
            ],
            completionCriteria: "Você conseguiu localizar o canal de atendimento e sabe como retornar ao monitor quando precisar, sem depender de receber uma resposta para concluir.",
            whyItMatters: "Ter o canal à mão facilita pedir ajuda e continuar o estudo ao longo do semestre.",
            quickHelp: [supportHelp("O contato não funciona ou o atendimento mudou?", "Confira a agenda novamente e peça à coordenação o canal atual da Monitoria. O Multiatendimento pode ajudar a localizar o setor ou orientar problemas de acesso.")],
            sourceDocument: "pesquisa-complementar-2026-09",
            sourcePages: [22, 23]
        }
    ];

    const guideById = new Map(GUIDES.map(guide => [guide.id, guide]));

    function cloneGuide(guide) {
        if (!guide) return null;
        return {
            ...guide,
            steps: (guide.steps || []).map(step => ({ ...step })),
            quickHelp: (guide.quickHelp || []).map(item => ({ ...item })),
            access: guide.access ? { ...guide.access } : null,
            sourcePages: [...(guide.sourcePages || [])]
        };
    }

    function getGuide(taskIdValue) {
        return cloneGuide(guideById.get(taskIdValue));
    }

    function getAllGuides() {
        return GUIDES.map(cloneGuide);
    }

    window.UniCheckChecklistContent = {
        getGuide,
        getAllGuides
    };
})();
