# UniCheck

Aplicação web estática do UniCheck, com landing page pública, autenticação e plataforma interna integradas ao Supabase.

## Estrutura

```text
.
├── .github/workflows/          # validações de integridade
├── docs/
│   ├── architecture/           # arquitetura atual
│   ├── audits/                 # auditorias e registros de consolidação
│   └── development/            # notas técnicas e documentação histórica
├── scripts/                    # automações do repositório
├── tests/                      # testes Node.js
├── Unicheck/                   # diretório publicado pelo Netlify
│   ├── index.html              # entrada e redirecionamento
│   ├── landing/                # páginas públicas
│   ├── platform/               # dashboard e páginas autenticadas
│   ├── js/                     # módulos compartilhados da aplicação
│   └── supabase/               # migrations, seeds e diagnósticos versionados
└── netlify.toml
```

## Desenvolvimento local

Sirva a raiz do repositório por HTTP e abra `/Unicheck/`:

```bash
npx http-server . -p 8080
```

O deploy do Netlify publica diretamente o diretório `Unicheck/`.

## Validação

```bash
node --test tests/*.test.cjs
node scripts/check-local-references.mjs
```

Os arquivos SQL são versionados para reprodução e auditoria. Não execute migrations destrutivas sem seguir [a documentação do Supabase](Unicheck/supabase/README.md).

Veja também [a visão de arquitetura](docs/architecture/application.md).
