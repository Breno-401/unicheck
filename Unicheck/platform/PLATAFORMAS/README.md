# Plataformas Gratuitas - UniCheck

## 📋 Visão Geral

A tela de **Plataformas Gratuitas** é uma nova funcionalidade do UniCheck que permite aos estudantes descobrirem e acessarem ferramentas gratuitas ou com desconto exclusivo para educação.

## 🚀 Funcionalidades Principais

### 🎯 Sistema de Filtros
- **Busca por texto**: Campo de busca em tempo real para encontrar plataformas por nome, descrição ou recursos
- **Filtros por categoria**: 
  - Produtividade
  - Design
  - Desenvolvimento
  - Educação
  - Cloud
  - Música

### ❤️ Sistema de Favoritos
- Botão de favorito em cada card
- Persistência dos favoritos no localStorage
- Feedback visual ao adicionar/remover favoritos

### 🔗 Acesso às Plataformas
- Botões de acesso direto às plataformas
- Links que abrem em nova aba
- Estatísticas de uso (preparado para analytics)

### 📚 Sistema de Tutoriais
- Modal com informações detalhadas sobre cada plataforma
- Passos para ativar benefícios estudantis
- Dicas importantes para cada serviço
- Links para documentação oficial

### 💰 Informações de Preços
- Preço original riscado
- Preço com desconto estudantil
- Badges indicando tipo de benefício (100% Gratuito, 50% Desconto, etc.)
- Lista de recursos inclusos

## 🛠️ Estrutura de Arquivos

```
PLATAFORMAS/
├── plataformas-gratuitas.html    # Página principal
├── plataformas-gratuitas.css     # Estilos específicos da página
├── plataformas-gratuitas.js      # Lógica JavaScript
└── platform-styles.css          # Estilos complementares (toasts, modais)
```

## 🎨 Design e UX

### 🎭 Visual
- **Design Glassmorphism**: Cards com efeito de vidro fosco
- **Gradientes**: Uso de gradientes para criar visual moderno
- **Animações**: Animações de entrada suaves para os cards
- **Responsividade**: Layout adaptativo para diferentes tamanhos de tela

### 🎯 Interações
- **Hover Effects**: Efeitos de hover nos cards com elevação
- **Loading States**: Estados de loading preparados
- **Toast Notifications**: Feedback visual para ações do usuário
- **Modal System**: Sistema de modais para informações detalhadas

## 📱 Plataformas Incluídas

### 🆓 Completamente Gratuitas
1. **JetBrains Student Pack** - IDEs profissionais gratuitas
2. **Spotify Student** - 50% de desconto em assinatura premium
3. **Microsoft Azure for Students** - $100 em créditos gratuitos
4. **Canva for Education** - Recursos premium gratuitos
5. **GitHub Student Pack** - Mais de 100 ferramentas gratuitas
6. **Notion for Students** - Workspace completo gratuito
7. **Google Workspace for Education** - Ferramentas do Google gratuitas

### 💸 Com Desconto
8. **Coursera Plus** - 65% de desconto em acesso ilimitado
9. **Adobe Creative Cloud Student** - 60% de desconto na suite criativa

## ⚙️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: 
  - Flexbox e Grid Layout
  - CSS Variables
  - Backdrop Filter
  - Transitions e Animations
- **JavaScript (Vanilla)**:
  - ES6+ Features
  - LocalStorage para persistência
  - Event Delegation
  - Intersection Observer para animações
- **Lucide Icons**: Ícones modernos e consistentes

## 🔧 Configuração e Uso

### Navegação
A tela é acessível através da navegação lateral:
- Ícone: Monitor (📺)
- Texto: "Plataformas Gratuitas"
- Link: `../PLATAFORMAS/plataformas-gratuitas.html`

### Dados das Plataformas
As informações das plataformas estão centralizadas no objeto `platformState.platforms` no arquivo JavaScript:

```javascript
const platformState = {
    platforms: [
        {
            id: 'jetbrains',
            name: 'JetBrains Student Pack',
            category: 'development',
            type: 'free',
            url: 'https://www.jetbrains.com/community/education/',
            // ... mais propriedades
        }
        // ... outras plataformas
    ]
}
```

### Persistência de Favoritos
Os favoritos são salvos no localStorage:
```javascript
localStorage.getItem('platformFavorites')
```

## 🎯 Funcionalidades Técnicas

### Sistema de Filtros
- Busca em tempo real com debounce
- Filtros por categoria com lógica AND/OR
- Mensagem de "nenhum resultado" quando aplicável

### Performance
- Lazy loading de imagens preparadas
- Animações otimizadas com CSS transforms
- Debounce em busca para evitar renderizações excessivas

### Acessibilidade
- Focus management em modais
- Keyboard navigation (ESC para fechar modais)
- ARIA labels preparados
- High contrast support

## 🔄 Integração com Sistema Existente

### Navegação
Atualizada para incluir link funcional ao checklist acadêmico:
```html
<li class="nav-item">
    <a href="../PLATAFORMAS/plataformas-gratuitas.html" class="nav-link">
        <i data-lucide="monitor"></i>
        <span>Plataformas Gratuitas</span>
    </a>
</li>
```

### Sincronização de Perfil
Sistema integrado de sincronização de perfil:
- Avatar e nome atualizados automaticamente
- Persistência entre páginas
- Dropdown de usuário funcional

## 📈 Métricas e Analytics

O sistema está preparado para integração com Google Analytics:
```javascript
if (typeof gtag !== 'undefined') {
    gtag('event', 'click', {
        event_category: 'platform',
        event_label: platform.name
    });
}
```

## 🔮 Funcionalidades Futuras Sugeridas

1. **Sistema de Avaliações**: Avaliações e reviews dos usuários
2. **Comparação de Plataformas**: Funcionalidade para comparar side-by-side
3. **Notificações**: Alertas quando plataformas oferecem novos descontos
4. **Wishlist**: Lista de desejos para plataformas caras
5. **Integração Institucional**: Links diretos com departamentos acadêmicos
6. **Multi-idioma**: Suporte para inglês e espanhol

## 🐛 Solução de Problemas

### Imagens não carregam
- Verificar se os arquivos estão em `/img-interno/`
- Validar nomes dos arquivos correspondentes no JavaScript

### Favoritos não persistem
- Verificar se localStorage está habilitado
- Limpar cache do navegador se necessário

### Modais não funcionam
- Verificar se o JavaScript está carregando após o DOM
- Validar se não há erros no console do navegador

## 📞 Suporte

Para dúvidas ou problemas técnicos:
1. Verificar o console do navegador para erros
2. Validar se todos os arquivos CSS/JS estão carregando
3. Testar em diferentes navegadores
4. Verificar se a estrutura de pastas está correta

---

**Desenvolvido por MiniMax Agent**  
**Versão**: 1.0  
**Data**: Novembro 2025