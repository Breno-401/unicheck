# Avatar compartilhado: diagnóstico e verificação — 10/09/2026

## Causa raiz

`auth.js` reconstruía `userProfile` a partir dos metadados do Auth em `saveProfile`, chamado tanto pela restauração (`requireAuth`) quanto por `onAuthStateChange`. O upload atual, entretanto, grava a URL em `users_profile.foto_url` e limpa `photo_url`/`foto_url` dos metadados. Assim, um evento de sessão podia substituir a foto válida por `null` no cache. A documentação do [Auth](https://supabase.com/docs/reference/javascript/auth-onauthstatechange) registra que SIGNED_IN pode ocorrer novamente ao recuperar foco; não deve ser interpretado como um novo login a cada evento.

Dois renderizadores (`profile-ui.js` e `profile-sync.js`) escreviam sobre os mesmos avatares. O primeiro sincronizava em `focus` e limpava a interface quando não obtinha a sessão; o segundo buscava o perfil e podia terminar depois. Não havia proteção contra uma leitura antiga sobrescrever uma edição mais recente, nem validação do carregamento de imagem. O cache era regravado no início da navegação, explicando tanto a demora aparente quanto o desaparecimento ao retornar.

Essa causa foi reproduzida com eventos controlados nos testes. A ocorrência intermitente na conta real do usuário não foi observada nesta sessão e não é alegada como teste de produção.

## Fonte de verdade e cache

- Canônica: `users_profile.foto_url`. `avatarImage` continua apenas como alias de compatibilidade derivado da mesma URL, nunca como segunda fonte do shell.
- O fluxo existente faz upload para `avatars/<user-id>/avatar.webp`, com `upsert` e `cacheControl: 3600`, e usa `getPublicUrl`. Não há signed URL nem renovação de expiração no caminho implementado.
- O sufixo `?v=` já existente muda somente ao salvar uma nova imagem, para invalidar a versão anterior do mesmo objeto. Não foi introduzido cache-buster por página ou foco.
- `userProfile` é o único cache de dados do perfil, validado por ID de usuário. O pequeno marcador `unicheck:avatar-ready` em sessionStorage registra somente qual URL já carregou na sessão; não contém uma foto nem substitui `foto_url`.
- O controlador usa `Image` e o cache HTTP nativo. Mantém a foto anterior enquanto a substituta carrega, publica a nova somente no `load` e ignora callbacks obsoletos. O erro definitivo sem imagem anterior revela as iniciais. Uma remoção explícita invalida a imagem e o marcador.
- A restauração de sessão não injeta foto de metadata. Perfil ainda não consultado é `profilePending`, diferente de um perfil confirmado sem avatar. Storage bloqueado não descarta uma resposta válida.
- A foto salva é pintada em todos os pontos do shell e em Configurações pelo mesmo controlador, inclusive a mesma estrutura da sidebar em modo expandido ou rail. A aparência e o comportamento da sidebar não foram redesenhados. Restaurar o fundo CSS no fallback evita apagar seu gradiente original.

## Concorrência e eventos

O serviço mantém revisão local e invalida leituras antigas ao iniciar uma edição, ao publicar um perfil novo, ao mudar de conta ou ao receber storage de outra aba. Leituras durante edição aguardam a atualização em curso. Um resultado atrasado não repovoa cache após logout nem sobrescreve a edição mais nova. Não há cache por componente.

`profile-ui.js` é apenas compatibilidade; `profile-sync.js` concentra renderização e listeners com guarda de inicialização. `focus` e `visibilitychange` não limpam nem recarregam perfil. `pageshow` sincroniza a apresentação pelo cache após verificar identidade; não busca toda a linha remotamente. Reações a mudança de usuário são adiadas para fora do callback do Auth. Sign-out explícito limpa os dados de apresentação.

Configurações continua com preview local não salvo, como estado de formulário. URLs Blob são revogadas somente no preview/otimização; nunca são persistidas no shell. Eventos de perfil salvo atualizam a foto da página quando não há edição de foto pendente. Resultados nulos de restauração/edição não apagam o formulário como se fossem um perfil válido.

## Testes

`node --test tests/*.test.cjs` inclui os 97 casos anteriores, com duas expectativas do Manual atualizadas para sua nova apresentação, além de 20 cenários de ciclo de vida do avatar e quatro de conteúdo enriquecido.

Os testes de avatar usam VM e DOM simulado: foto existente; ausência confirmada; atraso; restauração; erro; URL inválida; imagem anterior preservada; callbacks fora de ordem; navegação com cache compartilhado; foco; visibilidade; pageshow; rail/expandida; remoção; logout; troca de conta; repetição de eventos do Auth; leitura antiga após edição; falha remota; storage bloqueado; leitura durante atualização; atualização em outra aba. Alguns cenários são combinados em um mesmo caso.

`node tests/manual-avatar.browser.cjs` usa Edge headless e fixtures explícitas de Auth/perfil. Dependência opcional de teste: `npm install --prefix private-context/browser playwright`. Verifica layout real em 1920, 1600, 1440, 1366×768, 1280, 1024, 768 e 390, light/dark; todas as orientações expandidas em 390; eventos nativos de Image; atraso controlado; slots do shell; rail; navegação para Benefícios; troca de aba e pageshow. Capturas e resultados ficam apenas em `private-context/browser-qa/`.

Limites: o teste não valida latência do Storage implantado, RLS real, credenciais do usuário ou atualização de perfil contra produção. Nenhuma alteração de Supabase, migration, PR ou deploy foi realizada.
