# Benefícios: refinamento visual de produto

Branch: `feat/ux-manual-beneficios`. HEAD inicial: `cccb7f140eba5096ef62b9b556863427a7ddf02d`.

## Estado inicial e escopo

Após `git fetch origin`, feature local e `origin/main` tinham o mesmo HEAD. Worktree limpo; nenhuma feature remota existente. O upstream da feature local era `origin/main`. Não foi necessário rebase, merge, reset, revert ou duplicação de commits. A main local permaneceu em `c4576acaa2f7e8d30a32bcad9765a0db96abfa31`.

Escopo: Benefícios, assets de marca, favicon de todas as 10 páginas HTML do produto e testes de apresentação. O Manual teve somente a referência de favicon atualizada. Nenhuma alteração no catálogo comercial, persistência, Supabase ou migrations.

## Diagnóstico e referência do produto

Foram examinados os estilos do Checklist, cards das fases, progression UI, dashboard, sidebar, componentes e tokens compartilhados. O Checklist combina superfícies neutras, bordas contextuais, pequenas áreas de accent e elevação na interação. Benefícios mantinha uma paleta paralela azul-arroxeada, logos heterogêneos e CTA em caixa. A camada compartilhada também forçava gradiente e sombra no favorito, chips selecionados sólidos e borda neutra no modal por `!important`.

Não houve comparação visual da página renderizada: o Browser retornou `No browser is available`, e a descoberta confirmou lista vazia. A inspeção de código e dos arquivos de imagem não substitui essa etapa.

## Sistema visual implementado

- Superfícies, texto, borda, accent principal, radius e sombras vêm dos mesmos tokens de `ui-polish.css` usados no restante do produto. Aliases locais concentram os papéis de Benefícios.
- Card neutro com radius compartilhado de 22px, detalhe superior de categoria, borda contextual e sombra de elevação. Nenhuma tintura integral por categoria.
- Categorias: entretenimento rosa; desenvolvimento verde-azulado; produtividade azul; design violeta; cloud ciano; educação verde; tecnologia índigo; compras âmbar; mobilidade terracota. Há pares específicos para cada tema.
- Hover e focus-within: deslocamento de 2px, borda contextual, expansão do detalhe de 36 para 60px, glow discreto e seta deslocada em 2px. Transições de 180ms. Active devolve o card à posição inicial.
- CTA “Ver benefício” integrado à linha final, com botão nativo e pseudo-elemento que estende a área clicável ao card. Favorito é botão irmão, acima da área estendida; não existem elementos interativos aninhados.
- Favorito com área de 44px, estado `aria-pressed`, contorno e superfície suaves; removido o gradiente imposto pelo shell. A persistência anterior foi preservada.
- Chips mantêm wrap, área mínima de 44px, selected com accent suave e contorno duplo discreto. Não há scrollbar horizontal introduzida.
- Logo em tile branco de 44px nos dois temas; imagem de até 32px, `object-fit: contain`, sem filtros de cor. O tile fixa `color-scheme: light` para SVGs oficiais que respondem ao tema do sistema. JetBrains tem compensação de padding interno do próprio arquivo, sem recortar nem alterar a marca.

## Hierarquia e detalhes

O topo agora diz “Sua vida universitária”, com descrição orientada à experiência do aluno. Foram preservadas as expressões “Meus favoritos”, “Tipo de benefício” e “Explore os benefícios”: já são claras e descrevem ações reais. A ordem Spotify, YouTube, Microsoft 365, Adobe, Notion e Apple Music continua intacta.

O modal repete logo, categoria e accent do card. Apresenta oferta, descrição, alertas, “Antes de começar”, dois passos em “Como conseguir” e disponibilidade expansível. Oferta, público, elegibilidade, verificação, disponibilidade e instruções de acesso permanecem acessíveis. Os dados originais não foram alterados.

Removido o bloco “Fonte oficial”, inclusive o hostname cru. A ação externa continua “Ver oferta oficial”, com `target="_blank"`, `rel="noopener noreferrer"` e nome acessível indicando nova aba. Datas, status e metadados de curadoria continuam nos dados e fora da apresentação. Procedência dos assets fica em arquivo técnico, nunca no modal.

O corpo tem scrollbar discreta, rolagem interna e overscroll contido; cabeçalho e footer ficam fora da área rolável. Entrada em 180ms; saída usa transição discreta de display nos navegadores compatíveis, com fechamento imediato como fallback. `prefers-reduced-motion` elimina animações e transições locais. Escape, fundo inerte e devolução do foco foram preservados; o focus trap inclui o novo summary.

## Favicon global

Asset de origem: `Unicheck/platform/assets/images/logo.png`, símbolo isolado da sidebar, PNG transparente de 566 × 440. O antigo `logomernor.png` continha símbolo e wordmark.

Todas as 10 páginas agora apontam para `Unicheck/assets/brand/favicon.svg`. O SVG incorpora o PNG original sem modificar seus pixels e define uma janela quadrada central de 440 × 440 (`viewBox="63 0 440 440"`). A janela retira somente margem lateral transparente e mantém proporção e respiro. Não há palavra UniCheck na imagem, nova marca, filtro ou deformação. O título acessível do SVG é UniCheck.

Foi inspecionada uma prévia geométrica em 16px e 32px sobre fundos claro e escuro, renderizada com System.Drawing a partir da mesma janela da imagem. Essa prévia confirma o enquadramento do símbolo, mas não valida carregamento do SVG na aba real. O arquivo tem aproximadamente 200 KiB por incorporar o raster original; uma futura exportação oficial otimizada pode reduzir esse custo. Validação nas abas permanece pendente.

## Auditoria dos 34 itens

“Oficial” abaixo significa arquivo obtido diretamente do site da marca ou CDN referenciado por ele. Não significa que arquivos antigos sem registro foram retroativamente certificados. Ícones monocromáticos publicados pelas próprias marcas foram preservados; não se aplicou grayscale, recoloração ou inversão. Spotify reutiliza o PNG local colorido, comparado com as diretrizes oficiais. As URLs exatas dos downloads estão em `beneficios-brand-assets.js`.

Todos usam a mesma moldura e preservam proporção. PNGs e ICOs foram inspecionados em uma prancha; SVGs foram inspecionados no código. A revisão dos 34 tiles dentro da página, em ambos os temas, está pendente.

| Plataforma | Asset anterior | Diagnostico | Asset atual | Procedencia |
| --- | --- | --- | --- | --- |
| GitHub Student Developer Pack | `github.svg` | SVG monocromatico sem procedencia registrada | `github-official.png` | [Site oficial](https://github.com/) |
| GitHub Copilot Student | `github-copilot.svg` | SVG monocromatico sem procedencia registrada | `github-copilot.svg` | Mantido; pendente |
| JetBrains Student Pack | `jetbrains.svg` | SVG monocromatico sem procedencia registrada | `jetbrains-official.png` | [Site oficial](https://www.jetbrains.com/) |
| Notion Education Plus | `notion.svg` | SVG monocromatico sem procedencia registrada | `notion-official.png` | [Site oficial](https://www.notion.com/) |
| Figma for Education | `figma.svg` | SVG monocromatico sem procedencia registrada | `figma-official.png` | [Site oficial](https://www.figma.com/) |
| Miro Education | `miro.svg` | SVG monocromatico sem procedencia registrada | `miro-official.png` | [Site oficial](https://miro.com/) |
| Azure for Students | `azure-logo.png` | Wordmark largo; simbolo pequeno | `azure-logo.png` | Mantido; pendente |
| AWS Educate | `aws_logo_9.png` | Branco sobre tile branco | `aws-official.png` | [Site oficial](https://aws.amazon.com/) |
| Autodesk Education | `autodesk.svg` | SVG monocromatico sem procedencia registrada | `autodesk-official.svg` | [Site oficial](https://www.autodesk.com/) |
| Microsoft 365 Education | `MicrosoftT.png` | Logo do Teams: produto incorreto | `microsoft365-official.ico` | [Site oficial](https://www.microsoft.com/) |
| MongoDB for Students | `mongodb.svg` | SVG monocromatico sem procedencia registrada | `mongodb-official.ico` | [Site oficial](https://www.mongodb.com/) |
| Adobe Creative Cloud para estudantes | `adobe_logo.png` | Wordmark e quadriculado incorporado | `adobe-official.svg` | [Site oficial](https://www.adobe.com/) |
| Spotify Premium Universitário | `spotify.svg` | SVG preto; PNG colorido local disponivel | `spotify-logo.png` | [PNG local; diretrizes Spotify](https://developer.spotify.com/documentation/design) |
| Apple Music Universitário | `apple-music.svg` | SVG monocromatico sem procedencia registrada | `apple-music-official.png` | [Site oficial](https://music.apple.com/) |
| YouTube Premium Student | `youtube.svg` | SVG monocromatico sem procedencia registrada | `youtube-premium-official.png` | [Site oficial](https://www.youtube.com/) |
| Samsung Estudantes | `samsung.svg` | SVG monocromatico sem procedencia registrada | `samsung-students-official.png` | [Site oficial](https://www.samsung.com/br/) |
| Apple Store para Educação | `apple.svg` | SVG monocromatico sem procedencia registrada | `apple.svg` | Mantido; pendente |
| 1Password para estudantes | `1password.svg` | SVG monocromatico sem procedencia registrada | `1password-student-official.svg` | [Site oficial](https://1password.com/) |
| Frontend Masters Student | `FM` | Inicial ou pictograma | `FM` | Mantido; pendente |
| Meia-entrada estudantil | `ticket-percent` | Inicial ou pictograma | `ticket-percent` | Mantido; pendente |
| Cartão Transcol Escolar | `bus-front` | Inicial ou pictograma | `bus-front` | Mantido; pendente |
| ID Jovem | `badge-id-card` | Inicial ou pictograma | `badge-id-card` | Mantido; pendente |
| UNiDAYS Brasil | `U` | Inicial ou pictograma | `unidays-brasil-official.png` | [Site oficial](https://www.myunidays.com/) |
| ISIC · Carteira Mundial do Estudante | `ISIC` | Inicial ou pictograma | `isic-official.png` | [Site oficial](https://www.isic.org/) |
| Lenovo Estudantes | `lenovo.svg` | SVG monocromatico sem procedencia registrada | `lenovo-students-official.gif` | [Site oficial](https://www.lenovo.com/br/pt/) |
| Dell para Estudantes | `dell.svg` | SVG monocromatico sem procedencia registrada | `dell.svg` | Mantido; pendente |
| Microsoft Store Educação | `MicrosoftT.png` | Logo do Teams: produto incorreto | `microsoft365-official.ico` | [Site oficial](https://www.microsoft.com/) |
| Tableau for Students | `T` | Inicial ou pictograma | `tableau-students-official.svg` | [Site oficial](https://www.tableau.com/) |
| Unity Student | `unity.svg` | SVG monocromatico sem procedencia registrada | `unity-student-official.ico` | [Site oficial](https://unity.com/) |
| GitKraken Student | `gitkraken.svg` | SVG monocromatico sem procedencia registrada | `gitkraken.svg` | Mantido; pendente |
| DataCamp via GitHub Student Pack | `datacamp.svg` | SVG monocromatico sem procedencia registrada | `datacamp.svg` | Mantido; pendente |
| Heroku via GitHub Student Pack | `H` | Inicial ou pictograma | `heroku-student-official.png` | [Site oficial](https://www.heroku.com/) |
| Ableton Education | `A` | Inicial ou pictograma | `ableton-education-official.png` | [Site oficial](https://www.ableton.com/) |
| MATLAB and Simulink Student Suite | `M` | Inicial ou pictograma | `matlab-student-official.ico` | [Site oficial](https://www.mathworks.com/) |

### Pendências de iconografia

- GitHub Copilot, Apple Educação, Dell, GitKraken e DataCamp: SVGs antigos monocromáticos sem registro confiável de origem. Mantidos sem recoloração. GitKraken e DataCamp responderam 403 à consulta; não foram usados espelhos de terceiros.
- Azure: PNG azul com wordmark, pequeno no tile; buscar símbolo oficial atual com procedência rastreável.
- Frontend Masters: mantido “FM”; o asset encontrado no site não pôde ser baixado com sucesso. Não foi criado logo substituto.
- Meia-entrada: pictograma de direito genérico, não uma plataforma ou marca única. Transcol e ID Jovem: pictogramas existentes; falta validar símbolos oficiais dos programas.
- Tableau: substituído o “T” por wordmark oficial completo; procedência resolvida, mas a legibilidade óptica em 44px ainda precisa de símbolo oficial apropriado ou revisão visual. Samsung usa o favicon publicado pelo próprio site, cuja associação visual deve ser avaliada na página.

## Validação e limites

- 77/77 testes: os 72 existentes e cinco novos casos comportamentais. Catálogo integral preservado por hash; favoritos, busca, filtros, paginação, ordem, detalhes e links cobertos em VM sem rede.
- Novos casos: continuidade card/modal e conteúdo essencial, ações independentes e retorno de foco, summary no focus trap, URL inválida e assinatura/segurança básica dos arquivos de logo.
- `node --check` nos scripts de Benefícios, `node scripts/check-local-references.mjs` e `git diff --check`.
- Contraste numérico de texto de categoria contra superfície: mínimo de 4,93:1 no claro e 7,42:1 no escuro. Não é uma auditoria WCAG completa nem medição de estilos computados.
- Grid preservado com `auto-fill`, mínimo de `min(100%, 19rem)` e container queries em 700px/420px. Sem largura ou altura fixa de card. Isso é verificação de código, não prova de ausência de overflow.

| Viewport | Temas e sidebar | Página real |
| --- | --- | --- |
| 1920 × 1080 | Claro/escuro, expandida/compactada | Pendente |
| 1600 × 900 | Claro/escuro, expandida/compactada | Pendente |
| 1440 × 900 | Claro/escuro, expandida/compactada | Pendente |
| 1366 × 768 | Claro/escuro, **expandida prioritária** | Pendente |
| 1280 × 800 | Claro/escuro, expandida/compactada | Pendente |
| 1024 × 768 | Claro/escuro, menu aberto/fechado | Pendente |
| 768 × 1024 | Claro/escuro, menu aberto/fechado | Pendente |
| 390 × 844 | Claro/escuro, menu aberto/fechado | Pendente |

Revisar no navegador: largura do documento, títulos longos, todos os tiles, CTA estendido versus favorito, Tab/Shift+Tab, Escape, retorno de foco, detalhes expansíveis, footer em altura reduzida, zoom de 200%, reduced motion e favicon real. Não foram exercitados favoritos remotos nem contas reais.

## Autoauditoria

A integração por tokens, accents, contraste, CTA e modal está implementada. Foram removidos pastel próprio, gradiente de favorito e bloco editorial. A auditoria também encontrou e corrigiu Teams usado para Microsoft, fundo quadriculado em Adobe, AWS branco sem contraste e ícones de marca substituídos por iniciais.

Não é possível afirmar que a página está tão refinada quanto o Checklist, que não há scrollbar acidental ou que todos os logos estão ópticamente adequados sem a revisão no navegador. O estado desta rodada é **AINDA NÃO PRONTO** para aprovação visual concluída. O push autorizado da feature serve à continuidade dessa revisão; não representa autorização de PR, merge ou deploy.

Os hashes dos commits e o estado remoto após publicação constam no relatório de entrega da execução. Nenhuma alteração em main, PR, deploy manual ou Supabase faz parte desta rodada.
