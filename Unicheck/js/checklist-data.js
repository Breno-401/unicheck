(function () {
    // Conteudo estrutural versionado do MVP. Os UUIDs correspondem aos
    // registros existentes em public.checklists e public.checklist_items.
    const checklists = [
        {
            id: "7c748d89-cf1f-4f9c-ba2d-7ffed9ab5f6d",
            phase: 1,
            title: "Primeiros passos na faculdade",
            description: "Estruture os combinados iniciais da turma, defina os contatos principais e prepare o onboarding para a rotina academica.",
            tasks: [
                { id: "4500fc78-dce5-4ae9-9ec2-1ad4c276e31d", order: 1, text: "Definir o lider da turma" },
                { id: "1ef93584-8d88-4110-adc1-7902fffb8a01", order: 2, text: "Criar o grupo oficial da turma" },
                { id: "790e6c98-2ce2-4a04-87f4-96fda0302a35", order: 3, text: "Entrar no grupo da turma" },
                { id: "144a3c69-1a0e-4445-9765-a192db5c3e67", order: 4, text: "Confirmar calendario e canais da coordenacao" }
            ]
        },
        {
            id: "f583649a-555b-49b4-bf22-87025dc22aeb",
            phase: 2,
            title: "Portal Acadêmico TOTVS",
            description: "Aprenda a acessar o Portal do Aluno, entrar com RA e senha e localizar a central do aluno e os documentos mais usados.",
            tasks: [
                { id: "c8f06edc-7747-415b-8675-2e96792d7098", order: 1, text: "Abrir o Portal do Aluno UniSales" },
                { id: "9c6ee19a-5893-4aea-bff6-fa8abb1cba6e", order: 2, text: "Fazer login com RA e senha inicial" },
                { id: "4bd8b284-2289-466c-aa0e-7b44ef247495", order: 3, text: "Localizar a Central do Aluno e a Secretaria" },
                { id: "7849da4a-14cc-40ea-8633-5e6bee544377", order: 4, text: "Baixar boletos, comprovantes e relatorios" }
            ]
        },
        {
            id: "7d2d3b1a-606d-4fe2-bf9c-31e5f2205b99",
            phase: 3,
            title: "Configuração de Email",
            description: "Valide o email institucional, entre no Outlook/Webmail e prepare a conta para avisos, comunicados e recuperacao.",
            tasks: [
                { id: "1b6f741d-070a-475e-8e7c-20aa27b47966", order: 1, text: "Confirmar o email institucional" },
                { id: "39f7d735-cd68-47fc-988f-7c9f9e0ad9f0", order: 2, text: "Entrar no Outlook/Webmail" },
                { id: "633ba42d-1661-468b-9455-8f854791214a", order: 3, text: "Alterar a senha provisoria" },
                { id: "5a163625-1c4b-4779-a5b5-5a6c8b21ec83", order: 4, text: "Testar envio e recebimento de mensagens" }
            ]
        },
        {
            id: "4144c1d0-d5dc-44ea-817e-f5f3544cde9a",
            phase: 4,
            title: "Biblioteca Virtual",
            description: "Prepare a consulta ao acervo, livros, artigos e bases digitais para estudo e pesquisa.",
            tasks: [
                { id: "2892f866-e9ee-4068-ba19-7b574c160f3c", order: 1, text: "Entrar na biblioteca virtual" },
                { id: "1d8d10b9-c937-4fff-ba75-1f2139e5211b", order: 2, text: "Buscar um livro da disciplina" },
                { id: "87faecc0-11c6-45fc-8df8-0ff5e1395884", order: 3, text: "Abrir uma base digital ou artigo" },
                { id: "e737adf1-2e11-499c-a2a7-32b99ee8253f", order: 4, text: "Verificar reservas, downloads ou historico" }
            ]
        },
        {
            id: "762058f8-d049-4ead-908e-62083b7db992",
            phase: 5,
            title: "Microsoft Teams",
            description: "Organize a conta, os canais e a rotina de uso do Teams para aulas, recados, encontros e arquivos da turma.",
            tasks: [
                { id: "b3a330be-d755-49bd-9cde-36e04d74611c", order: 1, text: "Entrar com a conta institucional" },
                { id: "b3a057e3-7f7b-4586-a0e7-3fb049fe847d", order: 2, text: "Abrir a equipe da turma" },
                { id: "0a07c2fc-ea42-4839-ae25-33d9d368fa25", order: 3, text: "Ajustar notificacoes e perfil" },
                { id: "a8d44406-d8d6-4d4c-89f3-ff7a8fea4e81", order: 4, text: "Localizar canais, arquivos e reunioes" }
            ]
        },
        {
            id: "d2aa0eeb-4d05-4128-95e0-fcd5e23d6c53",
            phase: 6,
            title: "Plataforma A+",
            description: "Conclua a configuracao minima da Plataforma A+ para materiais e recursos extras do fluxo academico.",
            tasks: [
                { id: "8c468091-33a0-47ea-a291-1db9abe6d815", order: 1, text: "Acessar a Plataforma A+" },
                { id: "670927d1-4f5c-463f-858d-f6f8e4e276a4", order: 2, text: "Concluir o login inicial" },
                { id: "ed06b94a-772d-47b6-9206-ddc6e231a313", order: 3, text: "Identificar materiais e recursos principais" },
                { id: "d8ec2f5d-ea1b-4184-99cc-ae56fe631f01", order: 4, text: "Registrar acesso ou pendencias da ferramenta" }
            ]
        },
        {
            id: "c8c31453-fc33-40fd-b862-7b6a178910b2",
            phase: 7,
            title: "Mentorias",
            description: "Entenda como acionar o acompanhamento, registrar demandas e usar os canais de apoio ao estudante.",
            tasks: [
                { id: "3ab3e83a-d671-4492-9662-864d79715be0", order: 1, text: "Identificar o canal de apoio" },
                { id: "677dc8e1-7fd8-4514-8a58-726ccfcc91cd", order: 2, text: "Localizar regras ou agenda de atendimento" },
                { id: "c4377cae-a2a9-4211-92b7-7b4f01dae009", order: 3, text: "Registrar duvidas ou necessidades" },
                { id: "8ed36c5a-f4d8-4b7e-a88f-ebdc4c42774c", order: 4, text: "Confirmar o encaminhamento ou retorno" }
            ]
        }
    ];

    function getChecklists() {
        return checklists.map(checklist => ({
            ...checklist,
            tasks: checklist.tasks.map(task => ({ ...task, checklistId: checklist.id, completed: false }))
        }));
    }

    window.UniCheckChecklistData = Object.freeze({ getChecklists });
})();
