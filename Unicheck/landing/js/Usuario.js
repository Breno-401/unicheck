document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById("toggleSidebar");
    const sidebar = document.getElementById("sidebar");
    const toggleIcon = toggleBtn.querySelector('i');
    
    // Seleciona ITENS DO MENU LATERAL
    const carouselItems = document.querySelectorAll(".carousel-item");
    // Seleciona TODAS AS SEÇÕES DE CONTEÚDO
    const contentSections = document.querySelectorAll(".content-section");
    // ⚡️ NOVO: Seleciona TODOS OS CARDS QUE TÊM data-target (como o do TOTVS)
    const cardTargetItems = document.querySelectorAll(".fase-card[data-target]"); 
    
    // === FUNÇÃO CENTRALIZADA DE TROCA DE CONTEÚDO ===
    const switchContent = (targetId) => {
        // 1. Oculta TODAS as seções de conteúdo
        contentSections.forEach(section => {
            section.classList.remove("active");
        });

        // 2. Mostra APENAS a seção alvo
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.add("active");
        }
    };

    // ====== TOGGLE SIDEBAR (MANTIDO) ======
    const toggleSidebar = () => {
        sidebar.classList.toggle("collapsed");
        if (sidebar.classList.contains("collapsed")) {
            toggleIcon.classList.remove("fa-chevron-left");
            toggleIcon.classList.add("fa-chevron-right");
        } else {
            toggleIcon.classList.remove("fa-chevron-right");
            toggleIcon.classList.add("fa-chevron-left");
        }
    };
    toggleBtn.addEventListener("click", toggleSidebar);

    // ====== TROCA DE SEÇÕES DA SIDEBAR ======
    carouselItems.forEach(item => {
        item.addEventListener("click", () => {
            const targetId = item.getAttribute("data-target");

            // 1. Remove 'active' de todos os itens do carrossel
            carouselItems.forEach(i => i.classList.remove("active"));
            // 2. Adiciona 'active' ao item clicado
            item.classList.add("active");

            // 3. Executa a troca de conteúdo
            switchContent(targetId);
        });
    });
    
    // ⚡️ NOVO: TROCA DE SEÇÕES PELO CLIQUE NOS CARDS ⚡️
    cardTargetItems.forEach(card => {
        card.addEventListener("click", (e) => {
            // Evita que o clique seja disparado múltiplas vezes
            e.stopPropagation(); 
            
            const targetId = card.getAttribute("data-target");
            
            // Troca o conteúdo principal
            switchContent(targetId);
        });
    });

    // Removidas as funções renderInicio(), renderChecklistAcademico() e o CSS injetado.
    // O conteúdo agora é editado diretamente no HTML.
});