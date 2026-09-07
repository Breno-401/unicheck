(function () {
    "use strict";

    const TASK_ID_PREFIX = "20000000-0000-4000-8000-";

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
                { text: "Digite o RA somente com números, sem pontos ou caracteres especiais. Para o Portal TOTVS, use a data de nascimento, apenas números, como senha inicial." },
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
                    text: "Não tente adivinhar o endereço pelo padrão. Procure o Multiatendimento para confirmar a conta criada."
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
            title: "Fazer o primeiro acesso ao Microsoft 365",
            description: "Entre pelo navegador ou aplicativo com o endereço institucional completo e reconheça a conta de aluno.",
            nextAction: "Abra o Microsoft 365 e entre com seu endereço completo @souunisales.com.br.",
            where: "Microsoft 365, pelo navegador ou aplicativo",
            credential: "Endereço institucional completo; no primeiro acesso, use o RA como senha provisória do Microsoft 365",
            steps: [
                { text: "Abra o Microsoft 365 no navegador ou no aplicativo." },
                { text: "Digite o endereço institucional completo que você confirmou no card anterior." },
                { text: "No primeiro acesso, use o RA como senha provisória, crie uma nova senha quando solicitado e siga os termos de uso exibidos pelo Microsoft 365." },
                { text: "Abra o perfil e confirme a identificação de aluno, a UniSales e o domínio @souunisales.com.br." }
            ],
            completionCriteria: "O Microsoft 365 abriu com a sua conta institucional e você reconheceu a identificação de aluno e da UniSales.",
            whyItMatters: "A conta correta dá acesso ao e-mail institucional e evita misturar o ambiente acadêmico com uma conta Microsoft pessoal.",
            quickHelp: [
                {
                    title: "Navegador ou aplicativo?",
                    text: "Os dois acessos funcionam. Use a opção mais conveniente para sua rotina."
                }
            ],
            sourcePages: [25, 26, 27]
        },
        {
            id: taskId(11),
            title: "Trocar ou recuperar a senha do Microsoft 365",
            description: "Finalize a senha própria da conta institucional e conheça a rota de recuperação antes de precisar dela.",
            nextAction: "Se ainda usa a senha provisória, conclua a criação da nova senha no Microsoft 365 e teste o acesso novamente.",
            where: "Fluxo de acesso e recuperação do Microsoft 365",
            credential: "Conta completa @souunisales.com.br",
            steps: [
                { text: "No primeiro acesso, conclua a criação da nova senha solicitada pelo Microsoft 365." },
                { text: "Siga exatamente os requisitos de senha apresentados na própria tela do Microsoft 365." },
                { text: "Saia e entre novamente para confirmar que a nova senha abre a mesma conta institucional." },
                { text: "Se esquecer a senha depois, use o fluxo de recuperação exibido no acesso do e-mail institucional." }
            ],
            completionCriteria: "Sua senha própria abre novamente a conta institucional correta no Microsoft 365.",
            whyItMatters: "Validar a senha agora reduz bloqueios quando você precisar do e-mail ou de outros serviços Microsoft.",
            quickHelp: [
                {
                    title: "A recuperação não funcionou?",
                    text: "Procure o Multiatendimento. Se a conta abre, mas não envia ou recebe mensagens, fale com o suporte de TI: tecnologia@unisales.br."
                },
                {
                    title: "Não misture as senhas",
                    text: "As respostas sobre o Portal TOTVS e o Microsoft 365 usam credenciais iniciais diferentes; siga este card somente para a conta Microsoft."
                }
            ],
            sourcePages: [26, 27, 28]
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
                {
                    title: "A mensagem não saiu ou a resposta não chegou?",
                    text: "Fale com o suporte de TI da UniSales: tecnologia@unisales.br."
                },
                {
                    title: "Use uma mensagem segura",
                    text: "Não inclua senha, RA, notas, documentos ou outros dados sensíveis no teste."
                }
            ],
            sourcePages: [28, 29]
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
