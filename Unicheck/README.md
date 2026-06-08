# UniCheck - Plataforma Integrada

Sistema completo integrado do UniCheck com Landing Page e Plataforma Interna.

## 📁 Estrutura do Projeto

```
UniCheck-Integrado/
│
├── index.html                    # Página de entrada (redireciona para landing)
│
├── landing/                      # PARTE EXTERNA (Landing Page)
│   ├── index.html               # Página inicial externa
│   ├── login_cadastro.html      # Página de login e cadastro
│   ├── CSS_login/               # Estilos da página de login
│   ├── css/                     # Estilos da landing page
│   ├── img/                     # Imagens da landing page
│   └── js/                      # Scripts da landing page
│       ├── login.js             # Lógica de autenticação
│       ├── script.js            # Scripts gerais
│       └── Usuario.js           # Gerenciamento de usuário
│
└── platform/                     # PARTE INTERNA (Plataforma)
    ├── index-interno.html       # Dashboard principal da plataforma
    ├── dev/demo-pergunte-ao-breno.html
    ├── script-interno.js        # Scripts da plataforma interna
    ├── logo-interno.png         # Logo da plataforma
    ├── CHECKLIST ACADEMICO/     # Módulo de checklists acadêmicos
    ├── CONFIGURACOES PERFIL/    # Configurações de perfil
    ├── css-interno/             # Estilos da plataforma interna
    └── img-interno/             # Imagens da plataforma interna
```

## Fluxo de Navegação

### Entrada na Plataforma

```
index.html → landing/index.html → landing/login_cadastro.html → platform/index-interno.html
```

**Passos:**
1. Acesse `index.html` (redireciona automaticamente para landing)
2. Na landing page, clique em "Login" ou "Entrar"
3. Preencha os dados de login
4. Clique em "Entrar" → Você será redirecionado para a plataforma interna

### Saída da Plataforma

```
platform/index-interno.html → Navbar → Botão "Sair" → landing/index.html
```

**Passos:**
1. Na plataforma interna, localize o botão "Sair" no rodapé da navbar (sidebar)
2. Clique no botão "Sair"
3. Confirme a ação no diálogo que aparece
4. Você será redirecionado de volta para a landing page

## Como Usar

### Opção 1: Abrir diretamente no navegador

1. Abra o arquivo `index.html` no navegador
2. O sistema redirecionará automaticamente para a landing page

### Opção 2: Usar um servidor local

```bash
# Com Python 3
python -m http.server 8000

# Com Node.js (http-server)
npx http-server -p 8000

# Com PHP
php -S localhost:8000
```

Depois acesse: `http://localhost:8000`

## Sistema de Autenticação

### Login
- **Arquivo:** `landing/login_cadastro.html`
- **Script:** `landing/js/login.js`
- **Função:** `fazerLogin()`
- **Fluxo:** Valida credenciais → Mostra toast de sucesso → Redireciona para plataforma

### Logout
- **Localização:** Botão "Sair" no rodapé da navbar
- **Script:** `platform/script-interno.js`
- **Função:** `handleLogout()`
- **Fluxo:** Confirma ação → Limpa sessão (opcional) → Redireciona para landing

## Personalização

### Cores da Landing Page
- Principal: `#00d9f5` (Azul ciano)
- Background: Gradiente escuro (`#0f2027`, `#203a43`, `#2c5364`)

### Cores da Plataforma Interna
- Definidas em `platform/css-interno/variaveis.css`
- Suporta tema claro e escuro

## Observações Importantes

1. **Paths Relativos:** Todos os paths foram ajustados para funcionar com a estrutura de pastas
2. **Confirmação de Logout:** Há um diálogo de confirmação ao clicar em "Sair"
3. **Autenticação Real:** O login usa Supabase Auth com validação de RA
4. **LocalStorage:** O sistema usa localStorage para salvar tema, perfil cacheado e progresso auxiliar por usuário

## Suporte

Para dúvidas ou sugestões sobre o projeto, consulte a documentação interna ou entre em contato com a equipe de desenvolvimento.

---

**Desenvolvido por: Equipe UniCheck  
**Versão:** 1.0 - Integração Completa  
**Data:** 2025

