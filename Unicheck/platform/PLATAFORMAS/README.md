# Plataformas Gratuitas - UniCheck

## Visao geral

A tela de Plataformas Gratuitas mostra um catalogo de ferramentas gratuitas e com desconto para estudantes.

## Funcionalidades

- Busca por nome, descricao e features.
- Filtros por categoria.
- Favoritos salvos no `localStorage`.
- Modais de detalhes e tutorial.
- Abertura de links externos em nova aba.
- Cards com icones vetoriais padronizados.

## Catálogo

O catalogo atual inclui plataformas como:

- JetBrains Student Pack
- Spotify Student
- Microsoft Azure for Students
- Canva for Education
- GitHub Student Pack
- Notion for Students
- Google Workspace for Education
- Coursera Plus
- Adobe Creative Cloud Student
- Microsoft 365 Education
- Miro Education
- Slack for Education
- Replit
- Visual Studio Code
- Vercel
- Netlify
- Oracle Cloud Always Free
- freeCodeCamp
- edX
- Khan Academy
- Duolingo for Schools
- Grammarly Education
- Microsoft Copilot
- Postman
- Overleaf
- Asana for Education
- FigJam for Education
- Dropbox Education
- Skillshare Student

## Estrutura

```text
PLATAFORMAS/
|-- plataformas-gratuitas.html
|-- plataformas-gratuitas.css
|-- plataformas-gratuitas.js
|-- platform-styles.css
```

## Dados

As informacoes principais ficam centralizadas em `platformState.platforms` dentro de `plataformas-gratuitas.js`.

## Favoritos

Os favoritos sao salvos com a chave:

```javascript
localStorage.getItem('platformFavorites')
```

## Observacao

Os cards desta tela usam um padrao visual unico para manter os icones no mesmo tamanho e evitar desalinhamento entre plataformas.
