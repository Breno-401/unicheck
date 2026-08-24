(function () {
    "use strict";

    const verifiedAt = "2026-08-24";
    const packUrl = "https://education.github.com/pack/";

    const categories = [
        { id: "development", label: "Desenvolvimento", icon: "code-2" },
        { id: "productivity-studies", label: "Produtividade", icon: "list-checks" },
        { id: "design-creativity", label: "Design", icon: "palette" },
        { id: "cloud-data", label: "Nuvem e dados", icon: "cloud" },
        { id: "education", label: "Cursos", icon: "graduation-cap" },
        { id: "technology", label: "Tecnologia", icon: "laptop" }
    ];

    function packBenefit(overrides) {
        return {
            benefitType: "free_student",
            status: "verified",
            targetAudience: "Estudantes com vinculo academico verificado pelo GitHub Education.",
            verification: "Solicite ou renove o GitHub Student Developer Pack e conclua a verificacao academica.",
            availability: "Disponibilidade global, sujeita aos criterios e termos do fornecedor.",
            eligibility: "Conta GitHub elegivel e status de estudante aprovado.",
            sourceChannel: "github_student_pack",
            accessMethod: "Acesse o Student Developer Pack e ative a oferta do parceiro.",
            officialUrl: packUrl,
            lastVerified: verifiedAt,
            volatileFields: ["duracao", "condicoes"],
            tags: [],
            ...overrides
        };
    }

    const benefits = [
        packBenefit({
            id: "github-pro-student",
            name: "GitHub Pro",
            category: "development",
            secondaryCategories: ["productivity-studies"],
            benefitLabel: "Gratis enquanto estudante",
            description: "Recursos GitHub Pro para projetos, portfolio e colaboracao durante a elegibilidade academica.",
            logo: "../img-interno/github_logo.png",
            fallbackLabel: "GH",
            tags: ["Git", "Portfolio", "Colaboracao"]
        }),
        packBenefit({
            id: "jetbrains-student",
            name: "JetBrains",
            category: "development",
            benefitLabel: "Assinatura estudantil gratis",
            description: "IDEs profissionais para desenvolvimento, com renovacao periodica do status academico.",
            logo: "../img-interno/jetbrains-logo.png",
            fallbackLabel: "JB",
            tags: ["IDE", "Programacao", "Software"]
        }),
        packBenefit({
            id: "appwrite-education",
            name: "Appwrite Education",
            category: "cloud-data",
            secondaryCategories: ["development"],
            benefitLabel: "Plano Education",
            description: "Infraestrutura de backend para projetos de estudo enquanto a elegibilidade no Pack estiver ativa.",
            fallbackLabel: "AW",
            tags: ["Backend", "Cloud", "APIs"]
        }),
        packBenefit({
            id: "datacamp-student",
            name: "DataCamp",
            category: "education",
            secondaryCategories: ["cloud-data"],
            benefitLabel: "3 meses de acesso",
            description: "Cursos praticos de dados, programacao e analytics disponibilizados pelo Student Pack.",
            fallbackLabel: "DC",
            tags: ["Dados", "Cursos", "Python"]
        }),
        packBenefit({
            id: "frontend-masters-student",
            name: "Frontend Masters",
            category: "education",
            secondaryCategories: ["development"],
            benefitLabel: "6 meses de acesso",
            description: "Biblioteca de cursos e workshops de desenvolvimento web para estudantes verificados.",
            fallbackLabel: "FM",
            tags: ["JavaScript", "Web", "Cursos"]
        }),
        packBenefit({
            id: "bootstrap-studio-student",
            name: "Bootstrap Studio",
            category: "design-creativity",
            secondaryCategories: ["development"],
            benefitLabel: "Licenca estudantil gratis",
            description: "Ferramenta visual para criar interfaces responsivas durante o vinculo estudantil.",
            fallbackLabel: "BS",
            tags: ["Design", "Bootstrap", "Frontend"]
        }),
        packBenefit({
            id: "onepassword-student",
            name: "1Password",
            category: "productivity-studies",
            secondaryCategories: ["technology"],
            benefitLabel: "1 ano gratis",
            description: "Gerenciador de senhas com ferramentas voltadas ao fluxo de desenvolvimento.",
            fallbackLabel: "1P",
            tags: ["Seguranca", "Senhas", "Produtividade"]
        }),
        packBenefit({
            id: "browserstack-student",
            name: "BrowserStack",
            category: "development",
            secondaryCategories: ["technology"],
            benefitLabel: "Automate Mobile por 1 ano",
            description: "Testes automatizados em dispositivos e navegadores reais para projetos estudantis.",
            fallbackLabel: "BT",
            tags: ["Testes", "Mobile", "Web"]
        }),
        packBenefit({
            id: "deepnote-student",
            name: "Deepnote",
            category: "cloud-data",
            secondaryCategories: ["education"],
            benefitLabel: "Team gratis enquanto estudante",
            description: "Notebooks colaborativos de dados com recursos de equipe para estudantes elegiveis.",
            fallbackLabel: "DN",
            tags: ["Notebook", "Dados", "Colaboracao"]
        }),
        packBenefit({
            id: "pomodone-student",
            name: "PomoDone",
            category: "productivity-studies",
            benefitLabel: "Plano Lite por 2 anos",
            description: "Organizacao de sessoes de foco com a tecnica Pomodoro.",
            fallbackLabel: "PD",
            tags: ["Foco", "Pomodoro", "Rotina"]
        })
    ];

    window.UniCheckBenefitsData = { categories, benefits };
})();
