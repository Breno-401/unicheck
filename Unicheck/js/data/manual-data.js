(function () {
    const source = 'Manual do Aluno 2024 — UniSales';

    const categories = [
        { id: 'comecando', title: 'Começando no UniSales', shortTitle: 'Começando', icon: 'landmark', description: 'Instituição, proposta educacional, metodologia e organização acadêmica.' },
        { id: 'vida-academica', title: 'Matrícula e vida acadêmica', shortTitle: 'Vida acadêmica', icon: 'graduation-cap', description: 'Matrícula, RA, histórico, trancamento e procedimentos acadêmicos.' },
        { id: 'ferramentas', title: 'Portal e ferramentas digitais', shortTitle: 'Ferramentas', icon: 'monitor-smartphone', description: 'Portal Acadêmico, Meu EduCONNECT, AVA, e-mail e Microsoft Teams.' },
        { id: 'avaliacoes', title: 'Avaliações, notas e frequência', shortTitle: 'Avaliações', icon: 'clipboard-check', description: 'Avaliação, aprovação, faltas, revisão e situações acadêmicas especiais.' },
        { id: 'campus', title: 'Biblioteca e estrutura do campus', shortTitle: 'Campus', icon: 'library', description: 'Bibliotecas, internet, laboratórios, clínicas e espaços do campus.' },
        { id: 'apoio', title: 'Serviços e apoio ao estudante', shortTitle: 'Apoio', icon: 'life-buoy', description: 'Multiatendimento, coordenação, Ouvidoria e núcleos de apoio.' },
        { id: 'formacao', title: 'Formação e carreira acadêmica', shortTitle: 'Formação', icon: 'briefcase-business', description: 'Projetos, estágio, TCC, ENADE, egressos e colação de grau.' },
        { id: 'utilidades', title: 'Utilidades institucionais', shortTitle: 'Utilidades', icon: 'info', description: 'Calendário, documentos, serviços, contatos e informações rápidas.' }
    ];

    const article = (data) => ({
        source,
        estimatedReadingTime: 2,
        requiresValidation: false,
        validationReason: '',
        importantPoints: [],
        ...data
    });

    const baseArticles = [
        article({ id: 'instituicao-salesiana', category: 'comecando', title: 'O UniSales e sua identidade salesiana', summary: 'Conheça a origem institucional e a presença salesiana que orienta a formação.', content: ['O Centro Universitário Salesiano integra as Instituições Universitárias Salesianas (IUS). Sua proposta é inspirada nos princípios de Dom Bosco e associa formação profissional, cidadania e compromisso social.'], keywords: ['instituição', 'unisales', 'salesiano', 'dom bosco', 'ius', 'missão'], sourcePages: [6, 7, 8] }),
        article({ id: 'proposta-educacional', category: 'comecando', title: 'Proposta educacional e aprender fazendo', summary: 'Entenda por que a formação articula conhecimento, prática, colaboração e problemas reais.', content: ['A proposta educacional do UniSales é orientada pela cultura do aprender fazendo. O Manual descreve uma formação que combina rigor técnico-científico, curiosidade, reflexão, colaboração e aplicação do conhecimento a problemas concretos.', 'O estudante assume papel ativo na construção de conhecimentos e competências, com maior interação entre estudantes e professores.'], importantPoints: ['A aprendizagem busca articular teoria e prática.', 'Autonomia e colaboração fazem parte da proposta metodológica.'], keywords: ['metodologia', 'aprender fazendo', 'aprendizagem', 'projeto pedagógico', 'competências'], sourcePages: [14, 15, 16, 22], estimatedReadingTime: 3 }),
        article({ id: 'estrutura-academica', category: 'comecando', title: 'Como a estrutura acadêmica se organiza', summary: 'Veja o papel dos conselhos, colegiados, coordenações, núcleos e setores.', content: ['A estrutura institucional reúne órgãos colegiados, órgãos executivos e setores de apoio. Entre eles estão Conselho Universitário, Colegiado de Curso, Núcleo Docente Estruturante e Comissão Própria de Avaliação.', 'Coordenações, Secretaria Acadêmica, Biblioteca, núcleos de apoio, laboratórios e clínicas integram a estrutura que acompanha a vida universitária.'], keywords: ['estrutura', 'consun', 'colegiado', 'nde', 'cpa', 'secretaria'], sourcePages: [11, 12, 13] }),
        article({ id: 'participacao-estudantil', category: 'comecando', title: 'Representação e participação estudantil', summary: 'Saiba onde os estudantes participam da vida institucional.', content: ['As turmas devem eleger representante. O Manual registra representação discente no Colegiado de Curso, na CPA e no Conselho Superior, além de encontros de avaliação do semestre com representantes institucionais.'], keywords: ['representante', 'colegiado', 'cpa', 'participação', 'turma'], sourcePages: [27] }),

        article({ id: 'ra-identidade-estudantil', category: 'vida-academica', title: 'RA e identidade estudantil', summary: 'Entenda para que serve o Registro Acadêmico e onde ele é utilizado.', content: ['O Registro Acadêmico (RA), também chamado Número de Matrícula, é gerado na matrícula inicial. Ele identifica o estudante e é usado no Portal Acadêmico, em empréstimos da Biblioteca, em requerimentos e em outras situações de identificação institucional.', 'O Manual informa que o RA consta na identidade estudantil, usada também para acesso ao campus.'], importantPoints: ['Guarde seu RA: ele é sua identificação acadêmica.', 'O RA também funciona como login em serviços descritos no Manual.'], keywords: ['ra', 'registro acadêmico', 'número de matrícula', 'matrícula', 'carteirinha', 'identidade estudantil'], sourcePages: [24] }),
        article({ id: 'rematricula', category: 'vida-academica', title: 'Rematrícula', summary: 'Como funciona a renovação semestral do vínculo acadêmico.', content: ['A rematrícula é a renovação semestral do vínculo com o UniSales e deve seguir o edital de renovação e os prazos do Calendário Acadêmico.', 'O Manual vincula a renovação à regularidade acadêmica e financeira e à confirmação no Portal Acadêmico. A frequência passa a ser registrada a partir da efetivação da rematrícula.'], importantPoints: ['Consulte sempre o edital e o Calendário Acadêmico do período.', 'A ausência de renovação é tratada pelo Manual como abandono do curso e implica desvinculação.'], keywords: ['rematrícula', 'renovação', 'matrícula online', 'vínculo', 'portal'], sourcePages: [23], requiresValidation: true, validationReason: 'O procedimento depende do edital e do Calendário Acadêmico vigentes.' }),
        article({ id: 'historico-documentos', category: 'vida-academica', title: 'Histórico escolar e documentos acadêmicos', summary: 'Onde consultar o histórico e como solicitar documentos oficiais.', content: ['O histórico reúne notas e resultados finais dos projetos cursados e é atualizado após a divulgação dos resultados finais. O Portal Acadêmico oferece relatório para simples conferência.', 'Para uma via oficial, o Manual orienta a solicitação pelo Portal Acadêmico e a retirada no Multiatendimento. Prazos de emissão devem ser confirmados antes de serem exibidos como atuais.'], keywords: ['histórico', 'documento', 'declaração', 'certificado', 'diploma', 'portal'], sourcePages: [25, 30], requiresValidation: true, validationReason: 'Prazos de confecção e retirada são dados operacionais publicados em 2024.' }),
        article({ id: 'trancamento-matricula', category: 'vida-academica', title: 'Trancamento de matrícula', summary: 'Entenda a suspensão temporária da matrícula e as condições de retorno.', content: ['O trancamento suspende temporariamente a matrícula sem encerrar imediatamente o vínculo. Segundo o Manual, somente estudantes regularmente matriculados podem solicitá-lo, dentro do prazo do Calendário Acadêmico.', 'O texto vincula limites, reabertura e eventual adaptação curricular ao Regimento e às regras institucionais. Essas dependências devem ser preservadas em qualquer orientação.'], importantPoints: ['A solicitação depende do prazo do Calendário Acadêmico.', 'No retorno, pode haver adaptação ao currículo então vigente, a critério da Instituição.'], keywords: ['trancamento', 'suspender matrícula', 'reabertura', 'retorno', 'regimento'], sourcePages: [25], requiresValidation: true, validationReason: 'Limites e prazos dependem do Regimento e do Calendário Acadêmico vigentes.' }),
        article({ id: 'mudancas-aproveitamento', category: 'vida-academica', title: 'Mudança de curso e aproveitamento de estudos', summary: 'Orientações para transferência interna e análise de conteúdos já cursados.', content: ['A mudança de curso é tratada como Troca de Curso ou Transferência Interna e segue normas regimentais, edital e Calendário Acadêmico.', 'O aproveitamento de estudos exige requerimento e documentação acadêmica correspondente. O deferimento compete à Instituição conforme os critérios regimentais.'], keywords: ['mudança de curso', 'troca', 'transferência interna', 'aproveitamento', 'dispensa', 'ementa'], sourcePages: [26], requiresValidation: true, validationReason: 'Os procedimentos e prazos dependem de edital, calendário e critérios regimentais vigentes.' }),

        article({ id: 'portal-academico', category: 'ferramentas', title: 'Portal Acadêmico', summary: 'Conheça o canal para acompanhar a vida acadêmica e solicitar serviços.', content: ['O Portal Acadêmico é o sistema de comunicação e interação em que o estudante pode acompanhar notas e faltas, solicitar serviços, renovar a matrícula, emitir boletos e consultar relatórios e comprovantes descritos no Manual.'], importantPoints: ['Notas, faltas e serviços acadêmicos ficam centralizados no Portal.', 'Alguns recursos e nomes de relatórios podem mudar; confira a versão atual do sistema.'], keywords: ['portal acadêmico', 'portal do aluno', 'notas', 'faltas', 'boleto', 'mensalidade', 'serviços'], sourcePages: [23] }),
        article({ id: 'meu-educonnect', category: 'ferramentas', title: 'Aplicativo Meu EduCONNECT', summary: 'Acesso móvel a informações acadêmicas, financeiras e da Biblioteca.', content: ['O Manual apresenta o Meu EduCONNECT como aplicativo para consultar informações acadêmicas e financeiras, incluindo avaliações, projetos, histórico, horários, notas e faltas, solicitações e recursos da Biblioteca.'], keywords: ['educonnect', 'aplicativo', 'app', 'notas', 'financeiro', 'biblioteca'], sourcePages: [27], requiresValidation: true, validationReason: 'Disponibilidade, nome e funções do aplicativo precisam ser confirmados no ambiente institucional atual.' }),
        article({ id: 'ava-brightspace', category: 'ferramentas', title: 'Ambiente Virtual de Aprendizagem (AVA)', summary: 'Entenda o papel do Brightspace na aprendizagem e nas atividades acadêmicas.', content: ['O Manual apresenta o Brightspace da D2L como o Ambiente Virtual de Aprendizagem usado para disponibilizar aulas, conteúdos e atividades. O ambiente pode ser acessado por dispositivos móveis e apoia tarefas como exercícios, projetos, fóruns, estudos de caso e trabalhos.'], keywords: ['ava', 'brightspace', 'd2l', 'ambiente virtual', 'aulas', 'atividades'], sourcePages: [38] }),
        article({ id: 'unidades-aprendizagem', category: 'ferramentas', title: 'Unidades de Aprendizagem (UA)', summary: 'Como as UAs organizam conteúdos, desafios e atividades de estudo independente.', content: ['As Unidades de Aprendizagem são recursos que apoiam a interação com conteúdos, professores e colegas. Segundo o Manual, podem reunir apresentação, desafio, infográfico, conteúdo de livro, dica do professor, exercícios, aplicação prática e materiais complementares.'], keywords: ['ua', 'unidade de aprendizagem', 'sagah', 'estudo independente', 'desafio'], sourcePages: [38] }),
        article({ id: 'email-teams-office', category: 'ferramentas', title: 'E-mail institucional, Teams e Office', summary: 'Para que servem a conta acadêmica e as ferramentas Microsoft apresentadas no Manual.', content: ['O Manual orienta o uso do e-mail institucional para acessar o Microsoft Teams, receber comunicações e utilizar ferramentas do Office 365.', 'O Teams é apresentado como ambiente de aulas remotas, comunicação e compartilhamento. Instruções de cadastro, domínio, links e telas precisam ser validadas antes de orientar o acesso atual.'], keywords: ['email institucional', 'e-mail', 'teams', 'microsoft', 'office 365', 'webmail', 'aula remota'], sourcePages: [41, 42, 43, 44, 45, 46], requiresValidation: true, validationReason: 'Domínio, fluxo de cadastro, links e conjunto de ferramentas podem ter mudado desde 2024.' }),

        article({ id: 'modelo-avaliacao', category: 'avaliacoes', title: 'Como funciona a avaliação', summary: 'Visão geral da avaliação de conteúdo e do desenvolvimento de competências.', content: ['O modelo descrito no Manual combina avaliação do conteúdo e avaliação da competência. Entre os instrumentos citados estão estudo independente, provas, avaliação de produto e demonstração de competência.', 'Os detalhes de pesos e instrumentos devem ser lidos junto às orientações do projeto e às normas acadêmicas aplicáveis.'], keywords: ['avaliação', 'nota', 'prova', 'competência', 'estudo independente', 'aprovação'], sourcePages: [35, 36], requiresValidation: true, validationReason: 'Pesos, instrumentos e nota mínima devem ser confirmados nas normas acadêmicas atuais e no projeto correspondente.' }),
        article({ id: 'frequencia-faltas', category: 'avaliacoes', title: 'Frequência, faltas e abono', summary: 'Entenda por que ausência comum não equivale a falta abonada.', content: ['O Manual diferencia faltas comuns de situações legalmente admitidas. Ele informa que motivos como trabalho, transporte, cursos, palestras e eventos não geram automaticamente abono ou compensação.', 'O documento registra abono em razão de obrigações com o serviço militar, mediante requerimento ao Multiatendimento. Consulte a norma vigente para a aplicação atual.'], keywords: ['frequência', 'faltas', 'abono', 'presença', 'serviço militar'], sourcePages: [34], requiresValidation: true, validationReason: 'A aplicação depende da legislação e das normas institucionais vigentes.' }),
        article({ id: 'regime-especial-estudos', category: 'avaliacoes', title: 'Saúde e Regime Especial de Estudos', summary: 'O que fazer quando uma condição de saúde impede a frequência às atividades.', content: ['O Manual orienta que o estudante impossibilitado de frequentar as aulas por problema de saúde apresente atestado e solicite Regime Especial de Estudos (REE).', 'O REE está condicionado à legislação e à instrução normativa citadas no documento. O Manual ressalta que ele não se aplica a estágio supervisionado nem a componentes de natureza laboratorial, hospitalar ou clínica.'], importantPoints: ['O atestado, sozinho, não substitui o protocolo do pedido.', 'As exceções indicadas pelo Manual precisam ser preservadas.'], keywords: ['saúde', 'atestado', 'ree', 'regime especial', 'compensar faltas', 'prova'], sourcePages: [34, 35], requiresValidation: true, validationReason: 'Prazos e requisitos estão vinculados à Instrução Normativa nº 24/2022 e à legislação citada.' }),
        article({ id: 'gestacao', category: 'avaliacoes', title: 'Direitos acadêmicos durante a gestação', summary: 'Orientação inicial sobre afastamento e atividades não realizadas.', content: ['O Manual informa que a estudante gestante deve protocolar atestado médico no Multiatendimento para requerer o afastamento. Após o período concedido, deve requerer as provas e atividades avaliativas não realizadas.', 'Como o procedimento é fundamentado em norma específica, períodos e requisitos precisam ser conferidos antes de uso atual.'], keywords: ['gravidez', 'gestante', 'licença maternidade', 'afastamento', 'provas'], sourcePages: [35], requiresValidation: true, validationReason: 'O período e o procedimento dependem da norma institucional e da legislação vigentes.' }),
        article({ id: 'revisao-notas-faltas', category: 'avaliacoes', title: 'Revisão de notas e faltas', summary: 'Como contestar uma divergência após a publicação dos resultados.', content: ['Havendo divergência após a publicação de notas ou faltas, o Manual orienta protocolar pedido de revisão no Multiatendimento ou no Portal Acadêmico, com justificativa comprovada.', 'A solicitação deve respeitar o prazo do Calendário Acadêmico. O prazo numérico publicado no Manual de 2024 não deve ser presumido como atual.'], keywords: ['revisão', 'nota', 'faltas', 'divergência', 'resultado', 'recurso'], sourcePages: [37], requiresValidation: true, validationReason: 'O prazo de solicitação deve ser validado no Calendário Acadêmico e nas normas vigentes.' }),

        article({ id: 'biblioteca-fisica', category: 'campus', title: 'Biblioteca física e empréstimos', summary: 'Serviços, consulta local, empréstimos, devoluções e cuidados com o acervo.', content: ['A Biblioteca oferece consulta local, empréstimos, renovações, devoluções, computadores e atendimento a usuários com deficiência. Materiais retirados devem ser registrados no atendimento.', 'Quantidade de itens, prazos, horários e multas publicados no Manual são dados operacionais de 2024 e devem ser confirmados antes de exibição. Em caso de perda, dano ou extravio, o Manual remete à reposição e ao Regimento da Biblioteca.'], keywords: ['biblioteca', 'livro', 'empréstimo', 'renovação', 'devolução', 'multa'], sourcePages: [32, 33], requiresValidation: true, validationReason: 'Horários, limites de empréstimo e valores de multa são temporais.' }),
        article({ id: 'biblioteca-virtual', category: 'campus', title: 'Biblioteca virtual', summary: 'Acesso remoto ao acervo digital indicado pela Instituição.', content: ['O Manual informa que a Instituição oferece acervo virtual acessível por computador, tablet ou smartphone, inclusive fora do campus, por meio do ambiente acadêmico.', 'Fornecedores, quantidade de títulos e caminho de acesso precisam ser confirmados no serviço atual.'], keywords: ['biblioteca virtual', 'livro digital', 'pearson', 'grupo a', 'acervo', 'ava'], sourcePages: [33], requiresValidation: true, validationReason: 'Fornecedores, dimensão do acervo e forma de acesso dependem dos contratos atuais.' }),
        article({ id: 'internet-campus', category: 'campus', title: 'Internet no campus', summary: 'Onde o Manual indica acesso à internet e à rede sem fio.', content: ['O Manual informa que estudantes podem utilizar computadores com internet nos laboratórios e conexão sem fio no campus. A orientação publicada usa número de matrícula e CPF como credenciais.', 'Por envolver acesso e segurança, o procedimento atual deve ser confirmado com a Instituição antes de ser exibido como passo a passo.'], keywords: ['internet', 'wifi', 'wi-fi', 'rede', 'campus conectado', 'laboratório'], sourcePages: [33], requiresValidation: true, validationReason: 'Credenciais e processo de acesso à rede podem ter mudado.' }),
        article({ id: 'laboratorios-clinicas', category: 'campus', title: 'Laboratórios e clínicas', summary: 'Regras gerais para utilizar espaços acadêmicos especializados.', content: ['Cada laboratório ou clínica possui regras próprias de utilização. O Manual orienta o estudante a buscar informações com a coordenação do curso ou diretamente no espaço e a zelar por sua conservação.'], keywords: ['laboratório', 'clínica', 'uso', 'normas', 'campus'], sourcePages: [34] }),
        article({ id: 'estacionamento', category: 'campus', title: 'Estacionamento', summary: 'Informação institucional sobre a estrutura de estacionamento.', content: ['O Manual de 2024 registra a existência de estacionamento no campus. Capacidade, regras de acesso e disponibilidade devem ser conferidas antes de serem tratadas como atuais.'], keywords: ['estacionamento', 'carro', 'veículo', 'campus'], sourcePages: [29], requiresValidation: true, validationReason: 'Capacidade, acesso e disponibilidade são informações operacionais temporais.' }),

        article({ id: 'multiatendimento', category: 'apoio', title: 'Multiatendimento', summary: 'A central de orientação, informações e requerimentos acadêmicos e financeiros.', content: ['O Multiatendimento orienta estudantes, egressos e candidatos em questões acadêmicas e financeiras e centraliza informações sobre requerimentos.', 'O próprio Manual ressalta que o setor não fornece informações sobre notas, calendário acadêmico, frequência ou horário de aulas; esses dados devem ser consultados nos canais acadêmicos correspondentes.'], importantPoints: ['Use o setor para requerimentos, documentos e orientação de encaminhamento.', 'Notas, frequência e horários não são informados pelo Multiatendimento segundo o Manual.'], keywords: ['multiatendimento', 'atendimento', 'requerimento', 'documento', 'financeiro', 'bolsa'], sourcePages: [24, 30, 47] }),
        article({ id: 'coordenacao-curso', category: 'apoio', title: 'Coordenação de curso', summary: 'Quando procurar a coordenação e qual é sua função acadêmica.', content: ['A coordenação responde pela gestão acadêmica e operacional do curso, incluindo o Projeto Pedagógico, competências e projetos da formação.', 'O Manual orienta que a coordenação fica disponível nos horários divulgados pelo curso. Nomes, contatos e horários publicados em 2024 exigem validação.'], keywords: ['coordenação', 'coordenador', 'curso', 'ppc', 'atendimento'], sourcePages: [9, 10, 31], requiresValidation: true, validationReason: 'Nomes, contatos e horários de coordenadores são temporais.' }),
        article({ id: 'ouvidoria', category: 'apoio', title: 'Ouvidoria', summary: 'Canal institucional para manifestações da comunidade acadêmica.', content: ['O Manual apresenta a Ouvidoria como canal de comunicação para estudantes, docentes e colaboradores, com possibilidade de anonimato.', 'Formulário, telefone, local e horários publicados em 2024 devem ser validados antes de divulgação.'], keywords: ['ouvidoria', 'reclamação', 'manifestação', 'anonimato', 'fale conosco'], sourcePages: [31], requiresValidation: true, validationReason: 'Canais, endereço e horários podem ter mudado.' }),
        article({ id: 'nucleos-apoio', category: 'apoio', title: 'Apoio psicopedagógico e inclusão', summary: 'Conheça os núcleos indicados para aprendizagem, acessibilidade e inclusão.', content: ['O Núcleo de Educação Inclusiva é apresentado como apoio à inclusão social e à acessibilidade de pessoas com deficiências, síndromes ou transtornos.', 'O Núcleo de Apoio Psicopedagógico atende questões relacionadas a dificuldades de aprendizagem, orientação pedagógica e apoio psicológico. Os contatos publicados precisam ser confirmados.'], keywords: ['nap', 'nei', 'inclusão', 'acessibilidade', 'psicopedagógico', 'aprendizagem'], sourcePages: [47], requiresValidation: true, validationReason: 'Contatos e configuração atual dos serviços devem ser confirmados.' }),
        article({ id: 'pastoral-universitaria', category: 'apoio', title: 'Pastoral Universitária', summary: 'Espaço de convivência, espiritualidade, cultura e diálogo na comunidade acadêmica.', content: ['A Pastoral Universitária promove atividades de espiritualidade, diálogo cultural, artístico e social, buscando integrar a comunidade acadêmica segundo a identidade salesiana.'], keywords: ['pastoral', 'espiritualidade', 'oração', 'cultura', 'salesiano'], sourcePages: [29, 47] }),

        article({ id: 'estrutura-curricular-projetos', category: 'formacao', title: 'Estrutura curricular e Projetos Integradores', summary: 'Como a formação articula períodos, competências e demandas reais da sociedade.', content: ['A estrutura curricular é organizada em períodos e articula projetos de formação e aprendizagem com Projetos Integradores de Extensão.', 'Os Projetos Integradores aproximam universidade e sociedade ao trabalhar problemas reais, pesquisa, extensão, empreendedorismo e mercado profissional.'], keywords: ['estrutura curricular', 'projeto integrador', 'extensão', 'currículo', 'competências'], sourcePages: [17, 18] }),
        article({ id: 'estagio-carreiras', category: 'formacao', title: 'Estágios e Núcleo de Carreiras', summary: 'A relação entre teoria, prática profissional e apoio à carreira.', content: ['O Manual define os estágios supervisionados como momentos de articulação entre teoria e prática. Sua presença e modalidade variam conforme as diretrizes e especificidades de cada curso.', 'O Núcleo de Estágios e Carreiras aparece como setor de apoio à formação e à aproximação profissional. Canais e formas de agendamento devem ser confirmados.'], keywords: ['estágio', 'carreira', 'núcleo', 'emprego', 'prática profissional'], sourcePages: [19, 31, 48], requiresValidation: true, validationReason: 'Canais de atendimento e processos do Núcleo podem ter mudado.' }),
        article({ id: 'tcc', category: 'formacao', title: 'Trabalho de Conclusão de Curso (TCC)', summary: 'Finalidade acadêmica do trabalho de pesquisa descrito no Manual.', content: ['O TCC é apresentado como exigência curricular voltada ao desenvolvimento de pesquisa relacionada aos eixos do curso, com a finalidade de aprofundar aspectos técnico-científicos da formação. A aplicação depende da matriz e das normas do curso.'], keywords: ['tcc', 'trabalho de conclusão', 'pesquisa', 'monografia'], sourcePages: [18] }),
        article({ id: 'enade', category: 'formacao', title: 'ENADE', summary: 'O exame que avalia o desempenho dos estudantes em relação à formação prevista.', content: ['O Manual apresenta o ENADE como exame destinado a aferir o desempenho dos estudantes em relação a habilidades, competências e conteúdos programáticos previstos para a formação. Regras de participação devem ser verificadas na convocação e nas orientações vigentes.'], keywords: ['enade', 'exame', 'desempenho', 'mec', 'avaliação'], sourcePages: [18], requiresValidation: true, validationReason: 'Convocação e regras de participação dependem do ciclo e das orientações vigentes.' }),
        article({ id: 'egressos', category: 'formacao', title: 'Acompanhamento de egressos', summary: 'Como a Instituição busca manter vínculos com quem concluiu a graduação.', content: ['O programa de acompanhamento de egressos busca coletar informações, promover reencontros, participação em eventos, mentorias e aproximação com o mercado, contribuindo também para a avaliação institucional.'], keywords: ['egresso', 'ex-aluno', 'mentoria', 'eventos', 'mercado'], sourcePages: [19, 20] }),
        article({ id: 'colacao-grau', category: 'formacao', title: 'Colação de grau', summary: 'Requisitos gerais para o ato que confere oficialmente o título de graduação.', content: ['A Colação de Grau é o ato público em que quem concluiu integralmente o currículo recebe o título de graduado, presta juramento e assina a ata.', 'O Manual condiciona a participação à integralização de todas as atividades curriculares e ao requerimento no Portal Acadêmico dentro do Calendário Acadêmico.'], importantPoints: ['Concluir todas as atividades curriculares é requisito.', 'O requerimento e os prazos dependem do calendário vigente.'], keywords: ['colação', 'formatura', 'concluinte', 'diploma', 'juramento'], sourcePages: [37], requiresValidation: true, validationReason: 'Prazos e procedimentos dependem do Calendário Acadêmico e do regulamento vigente.' }),

        article({ id: 'calendario-horarios', category: 'utilidades', title: 'Calendário Acadêmico e horários de aula', summary: 'Onde são publicados datas, prazos e o horário individual do estudante.', content: ['O Calendário Acadêmico é publicado semestralmente e reúne atividades, datas e prazos limites para solicitações. O horário individual de aulas é disponibilizado no Portal Acadêmico.', 'As datas e grades exibidas no Manual são de 2024 e não devem ser usadas para orientar períodos posteriores.'], keywords: ['calendário', 'prazo', 'horário', 'aula', 'semestre'], sourcePages: [21], requiresValidation: true, validationReason: 'Calendário e horários são específicos do período letivo.' }),
        article({ id: 'mensalidades-boletos', category: 'utilidades', title: 'Mensalidades e boletos', summary: 'Canal indicado pelo Manual para emissão e pagamento.', content: ['O Manual informa que o boleto de mensalidade é disponibilizado no Portal Acadêmico e descreve condições de pagamento e encargos após o vencimento.', 'Valores, parcelamento, regras financeiras e encargos devem ser confirmados no contrato e nos canais institucionais atuais.'], keywords: ['mensalidade', 'boleto', 'pagamento', 'financeiro', 'vencimento', 'parcela'], sourcePages: [23, 25], requiresValidation: true, validationReason: 'Condições financeiras e encargos são temporais e contratuais.' }),
        article({ id: 'prazos-documentos', category: 'utilidades', title: 'Prazos para documentos', summary: 'Tipos de documentos citados e por que o prazo atual deve ser confirmado.', content: ['O Manual relaciona solicitações como históricos, certificados, diplomas e declarações ao Multiatendimento e publica prazos de confecção.', 'Como se trata de informação operacional datada, a central registra a origem, mas não apresenta esses prazos como automaticamente vigentes.'], keywords: ['prazo', 'documento', 'diploma', 'histórico', 'certificado', 'declaração'], sourcePages: [30], requiresValidation: true, validationReason: 'Os prazos operacionais foram publicados no Manual de 2024.' }),
        article({ id: 'servicos-taxas', category: 'utilidades', title: 'Serviços e taxas institucionais', summary: 'Referência aos serviços educacionais listados no Manual, sem assumir valores atuais.', content: ['O Manual contém uma tabela de serviços identificada como “Tabela de Serviços 2023”, com solicitações gratuitas e cobradas em formatos impresso e digital.', 'A relação é mantida apenas como conteúdo mapeado para revisão institucional. Nenhum valor deve ser apresentado como atual sem validação.'], keywords: ['serviços', 'taxa', 'preço', 'valor', 'segunda via', 'reavaliação'], sourcePages: [49], requiresValidation: true, validationReason: 'A própria tabela é identificada como 2023 e todos os valores exigem validação.' }),
        article({ id: 'contatos-atendimento', category: 'utilidades', title: 'Contatos e horários de atendimento', summary: 'Setores listados no Manual e o cuidado necessário com dados operacionais.', content: ['O Manual reúne telefones e horários de setores como Multiatendimento, coordenações, Financeiro, Biblioteca e Núcleo de Estágios e Carreiras.', 'Esses dados foram mapeados, mas não são exibidos como contatos atuais porque podem ter mudado desde a publicação.'], keywords: ['telefone', 'contato', 'horário', 'atendimento', 'setor', 'whatsapp'], sourcePages: [9, 10, 30, 31, 32, 47, 50], requiresValidation: true, validationReason: 'Telefones, e-mails, links, pessoas e horários são dados temporais.' }),
        article({ id: 'seguro-escolar', category: 'utilidades', title: 'Seguro escolar', summary: 'Registro do serviço descrito no Manual e necessidade de confirmação atual.', content: ['O Manual de 2024 descreve cobertura de assistência e acidentes por uma seguradora e publica canais para acionamento e ressarcimento.', 'Seguradora, cobertura, rede credenciada, vigência e contatos precisam de validação institucional antes de qualquer orientação atual.'], keywords: ['seguro', 'acidente', 'emergência', 'assistência', 'ressarcimento'], sourcePages: [30], requiresValidation: true, validationReason: 'Fornecedor, cobertura, vigência e canais do seguro podem ter mudado.' })
    ];

    const quickAccess = ['portal-academico', 'ra-identidade-estudantil', 'rematricula', 'frequencia-faltas', 'historico-documentos', 'multiatendimento'];

    const relatedContent = {
        'instituicao-salesiana': ['proposta-educacional', 'estrutura-academica', 'pastoral-universitaria'],
        'proposta-educacional': ['estrutura-curricular-projetos', 'modelo-avaliacao', 'instituicao-salesiana'],
        'estrutura-academica': ['coordenacao-curso', 'participacao-estudantil', 'multiatendimento'],
        'participacao-estudantil': ['estrutura-academica', 'ouvidoria', 'proposta-educacional'],
        'ra-identidade-estudantil': ['portal-academico', 'meu-educonnect', 'biblioteca-fisica'],
        'rematricula': ['calendario-horarios', 'portal-academico', 'mensalidades-boletos'],
        'historico-documentos': ['portal-academico', 'multiatendimento', 'prazos-documentos'],
        'trancamento-matricula': ['calendario-horarios', 'multiatendimento', 'rematricula'],
        'mudancas-aproveitamento': ['multiatendimento', 'calendario-horarios', 'coordenacao-curso'],
        'portal-academico': ['meu-educonnect', 'rematricula', 'historico-documentos'],
        'meu-educonnect': ['portal-academico', 'ra-identidade-estudantil', 'email-teams-office'],
        'ava-brightspace': ['unidades-aprendizagem', 'email-teams-office', 'modelo-avaliacao'],
        'unidades-aprendizagem': ['ava-brightspace', 'modelo-avaliacao', 'proposta-educacional'],
        'email-teams-office': ['ava-brightspace', 'portal-academico', 'meu-educonnect'],
        'modelo-avaliacao': ['revisao-notas-faltas', 'unidades-aprendizagem', 'frequencia-faltas'],
        'frequencia-faltas': ['regime-especial-estudos', 'revisao-notas-faltas', 'rematricula'],
        'regime-especial-estudos': ['frequencia-faltas', 'gestacao', 'multiatendimento'],
        'gestacao': ['regime-especial-estudos', 'frequencia-faltas', 'multiatendimento'],
        'revisao-notas-faltas': ['modelo-avaliacao', 'frequencia-faltas', 'calendario-horarios'],
        'biblioteca-fisica': ['biblioteca-virtual', 'ra-identidade-estudantil', 'internet-campus'],
        'biblioteca-virtual': ['biblioteca-fisica', 'ava-brightspace', 'internet-campus'],
        'internet-campus': ['laboratorios-clinicas', 'biblioteca-virtual', 'ra-identidade-estudantil'],
        'laboratorios-clinicas': ['coordenacao-curso', 'internet-campus', 'regime-especial-estudos'],
        'estacionamento': ['internet-campus', 'laboratorios-clinicas', 'contatos-atendimento'],
        'multiatendimento': ['portal-academico', 'historico-documentos', 'coordenacao-curso'],
        'coordenacao-curso': ['multiatendimento', 'estrutura-academica', 'estagio-carreiras'],
        'ouvidoria': ['multiatendimento', 'participacao-estudantil', 'nucleos-apoio'],
        'nucleos-apoio': ['multiatendimento', 'coordenacao-curso', 'pastoral-universitaria'],
        'pastoral-universitaria': ['instituicao-salesiana', 'nucleos-apoio', 'participacao-estudantil'],
        'estrutura-curricular-projetos': ['proposta-educacional', 'tcc', 'estagio-carreiras'],
        'estagio-carreiras': ['estrutura-curricular-projetos', 'tcc', 'egressos'],
        'tcc': ['estrutura-curricular-projetos', 'estagio-carreiras', 'colacao-grau'],
        'enade': ['colacao-grau', 'estrutura-curricular-projetos', 'modelo-avaliacao'],
        'egressos': ['estagio-carreiras', 'colacao-grau', 'estrutura-curricular-projetos'],
        'colacao-grau': ['calendario-horarios', 'tcc', 'enade'],
        'calendario-horarios': ['portal-academico', 'rematricula', 'revisao-notas-faltas'],
        'mensalidades-boletos': ['portal-academico', 'multiatendimento', 'rematricula'],
        'prazos-documentos': ['historico-documentos', 'multiatendimento', 'calendario-horarios'],
        'servicos-taxas': ['multiatendimento', 'mensalidades-boletos', 'prazos-documentos'],
        'contatos-atendimento': ['multiatendimento', 'coordenacao-curso', 'ouvidoria'],
        'seguro-escolar': ['multiatendimento', 'contatos-atendimento', 'nucleos-apoio']
    };

    const procedures = {
        'rematricula': ['Consulte o Edital de Renovação de Matrícula e o Calendário Acadêmico do semestre.', 'Regularize eventuais pendências acadêmicas e financeiras indicadas pela Instituição.', 'Confirme a renovação no Portal Acadêmico e faça a adesão ao contrato educacional.'],
        'historico-documentos': ['Consulte o relatório de histórico no Portal Acadêmico quando precisar apenas conferir os dados.', 'Para o documento oficial, faça a solicitação pelo Portal Acadêmico.', 'Retire o documento no Multiatendimento conforme a orientação do pedido.'],
        'trancamento-matricula': ['Verifique o prazo no Calendário Acadêmico.', 'Solicite o trancamento enquanto estiver regularmente matriculado.', 'Ao final do período de trancamento, solicite a reabertura dentro do prazo institucional.'],
        'mudancas-aproveitamento': ['Faça o requerimento dentro do prazo do Calendário Acadêmico.', 'Para aproveitamento, apresente Histórico Escolar ou Certidão de Estudos e o plano de aprendizagem, ementa ou conteúdo programático.', 'Aguarde a análise institucional conforme os critérios regimentais.'],
        'regime-especial-estudos': ['Apresente o atestado médico.', 'Protocole a solicitação de Regime Especial de Estudos no Multiatendimento.', 'Acompanhe as orientações acadêmicas para o período de afastamento.'],
        'gestacao': ['Protocole o atestado médico no Multiatendimento.', 'Solicite o afastamento previsto para a situação.', 'Após o afastamento, requeira as provas e atividades avaliativas não realizadas.'],
        'revisao-notas-faltas': ['Reúna a justificativa e a comprovação da divergência.', 'Protocole o pedido no Multiatendimento ou no Portal Acadêmico.', 'Respeite o prazo definido no Calendário Acadêmico.'],
        'colacao-grau': ['Confirme se todas as atividades do currículo foram integralizadas.', 'Formalize o requerimento pelo Portal Acadêmico.', 'Observe o prazo definido no Calendário Acadêmico.'],
        'mensalidades-boletos': ['Acesse o Portal Acadêmico.', 'Localize e emita o boleto da mensalidade.', 'Observe a data de vencimento e as condições do contrato educacional.']
    };

    const destinations = {
        'ra-identidade-estudantil': ['Portal Acadêmico', 'Biblioteca', 'Multiatendimento'],
        'rematricula': ['Portal Acadêmico'], 'historico-documentos': ['Portal Acadêmico', 'Multiatendimento'],
        'trancamento-matricula': ['Multiatendimento'], 'mudancas-aproveitamento': ['Multiatendimento'],
        'portal-academico': ['Portal Acadêmico'], 'meu-educonnect': ['Aplicativo Meu EduCONNECT'],
        'ava-brightspace': ['Ambiente Virtual de Aprendizagem'], 'unidades-aprendizagem': ['Ambiente Virtual de Aprendizagem'],
        'email-teams-office': ['Webmail institucional', 'Microsoft Teams'], 'frequencia-faltas': ['Multiatendimento'],
        'regime-especial-estudos': ['Multiatendimento'], 'gestacao': ['Multiatendimento'],
        'revisao-notas-faltas': ['Portal Acadêmico', 'Multiatendimento'], 'biblioteca-fisica': ['Biblioteca'],
        'biblioteca-virtual': ['Ambiente Virtual de Aprendizagem'], 'laboratorios-clinicas': ['Coordenação do curso', 'Laboratório ou clínica'],
        'multiatendimento': ['Multiatendimento'], 'coordenacao-curso': ['Coordenação do curso'], 'ouvidoria': ['Ouvidoria'],
        'nucleos-apoio': ['Núcleo de Educação Inclusiva', 'Núcleo de Apoio Psicopedagógico'],
        'estagio-carreiras': ['Núcleo de Estágios e Carreiras'], 'colacao-grau': ['Portal Acadêmico', 'Multiatendimento'],
        'calendario-horarios': ['Portal Acadêmico', 'Site institucional'], 'mensalidades-boletos': ['Portal Acadêmico'],
        'prazos-documentos': ['Multiatendimento'], 'servicos-taxas': ['Multiatendimento'], 'seguro-escolar': ['Multiatendimento']
    };

    const attention = {
        'rematricula': ['A frequência é registrada a partir da efetivação da rematrícula.', 'A não renovação é caracterizada pelo Manual como abandono do curso e implica desvinculação.'],
        'trancamento-matricula': ['O pedido depende de matrícula regular e do prazo do Calendário Acadêmico.', 'No retorno, o estudante pode ser vinculado ao currículo então existente, a critério da Instituição.'],
        'mudancas-aproveitamento': ['A análise segue edital, Calendário Acadêmico e critérios regimentais.'],
        'frequencia-faltas': ['Trabalho, transporte, cursos, palestras, congressos e seminários não geram automaticamente abono ou compensação.'],
        'regime-especial-estudos': ['O REE não se aplica a Estágio Supervisionado nem a componentes de natureza laboratorial, hospitalar ou clínica.'],
        'revisao-notas-faltas': ['O pedido exige justificativa comprovada e deve ser feito dentro do prazo acadêmico.'],
        'biblioteca-fisica': ['Perda, dano ou extravio exige reposição conforme determinação da Biblioteca e seu Regimento.'],
        'colacao-grau': ['Somente participa quem integralizou todas as atividades de ensino e aprendizagem exigidas no currículo.'],
        'calendario-horarios': ['Datas e horários variam por semestre; consulte sempre a publicação correspondente ao período atual.'],
        'mensalidades-boletos': ['Após o vencimento, o Manual prevê incidência de multas e juros. Consulte as condições do contrato educacional.']
    };

    const temporalFields = {
        'meu-educonnect': ['Disponibilidade e recursos do aplicativo'],
        'email-teams-office': ['Domínio institucional, links e fluxo de acesso'],
        'biblioteca-fisica': ['Horários, quantidade e prazo de empréstimos, valor de multa'],
        'biblioteca-virtual': ['Fornecedores, quantidade de títulos e caminho de acesso'],
        'internet-campus': ['Credenciais e procedimento de acesso à rede'],
        'estacionamento': ['Capacidade e regras de acesso'],
        'coordenacao-curso': ['Nomes, contatos e horários de atendimento'],
        'ouvidoria': ['Telefone, formulário, local e horários'],
        'nucleos-apoio': ['E-mails e canais de atendimento'],
        'estagio-carreiras': ['Canais e forma de agendamento'],
        'enade': ['Ciclo, convocação e regras de participação'],
        'calendario-horarios': ['Datas, prazos e horários do semestre'],
        'mensalidades-boletos': ['Valores, parcelamento e encargos contratuais'],
        'prazos-documentos': ['Prazos de emissão e retirada'],
        'servicos-taxas': ['Valores e gratuidades da Tabela de Serviços 2023'],
        'contatos-atendimento': ['Telefones, e-mails, links e horários'],
        'seguro-escolar': ['Seguradora, cobertura, rede credenciada, vigência e contatos']
    };

    const volatileArticles = new Set(['calendario-horarios', 'prazos-documentos', 'servicos-taxas', 'contatos-atendimento', 'seguro-escolar']);
    const contentRefinements = {
        'frequencia-faltas': ['O Manual diferencia faltas comuns de situações legalmente admitidas. Motivos como trabalho, transporte, cursos, palestras e eventos não geram automaticamente abono ou compensação.', 'O abono de faltas é previsto para obrigações com o serviço militar e deve ser requerido no Multiatendimento.'],
        'estacionamento': ['O UniSales disponibiliza estacionamento no campus.'],
        'calendario-horarios': ['O Calendário Acadêmico é publicado semestralmente e reúne atividades, datas e prazos limites para solicitações.', 'O horário individual de aulas é disponibilizado no Portal Acadêmico.'],
        'seguro-escolar': ['O Manual informa que o UniSales oferece seguro para pronto atendimento emergencial e acidentes pessoais, dentro e fora da Instituição.']
    };
    const removeOldValidationLanguage = (text) => text.split(/(?<=\.)\s+/).filter((sentence) => !/(precisam?|devem?|exigem?|não devem).{0,90}(confirm|valid|presumid)|antes de (ser|uso|orientar)|pode[m]? ter mudado/i.test(sentence)).join(' ');

    const articles = baseArticles.map((item) => {
        const content = (contentRefinements[item.id] || item.content).map(removeOldValidationLanguage).filter(Boolean);
        const sections = [
            { type: 'overview', title: 'Em poucas palavras', content: content[0] },
            ...(content.slice(1).length ? [{ type: 'knowledge', title: 'O que você precisa saber', items: content.slice(1) }] : []),
            ...(item.importantPoints.length ? [{ type: 'knowledge', title: 'Pontos essenciais', items: item.importantPoints }] : []),
            ...(procedures[item.id] ? [{ type: 'steps', title: 'O que fazer', items: procedures[item.id] }] : []),
            ...(destinations[item.id] ? [{ type: 'destination', title: 'Onde resolver', items: destinations[item.id] }] : []),
            ...(attention[item.id] ? [{ type: 'attention', title: 'Atenção', items: attention[item.id] }] : [])
        ];
        const isVolatile = volatileArticles.has(item.id);
        return {
            ...item,
            content,
            sections,
            relatedContent: relatedContent[item.id] || [],
            temporalFields: temporalFields[item.id] || [],
            requiresValidation: isVolatile,
            validationReason: isVolatile ? 'Informações operacionais sujeitas a atualização. Consulte o canal institucional para confirmar os dados atuais.' : ''
        };
    });

    const temporalReview = articles
        .filter((item) => item.requiresValidation)
        .map(({ id, title, sourcePages, validationReason }) => ({ id, title, sourcePages, validationReason }));

    window.UniCheckManualData = Object.freeze({
        version: '2024.2',
        source,
        sourcePolicy: 'Última referência institucional disponibilizada ao UniCheck em 2026; presumida vigente até a publicação de fonte institucional mais nova.',
        categories: Object.freeze(categories),
        articles: Object.freeze(articles),
        quickAccess: Object.freeze(quickAccess),
        temporalReview: Object.freeze(temporalReview)
    });
})();
