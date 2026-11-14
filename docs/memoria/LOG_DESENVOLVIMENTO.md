# Log de desenvolvimento: Hospetse Mobile

HistÃ³rico das atividades **concluÃ­das**, da mais antiga para a mais recente. Acrescente a entrada nova no fim. DecisÃµes ficam no `DECISOES_TECNICAS.md` (cite a DT), e pendÃªncias no `PROXIMOS_PASSOS.md`.

Modelo de entrada:

```markdown
## AAAA-MM-DD: <tÃ­tulo curto> (#task)
- **Objetivo:**
- **Arquivos:** criados / alterados / removidos
- **O que mudou:**
- **DecisÃµes:** DT-NN
- **VerificaÃ§Ã£o:** comando e resultado real (nÃ£o registre teste que nÃ£o rodou)
- **Problemas e soluÃ§Ãµes:**
- **Ficou pendente:**
- **Commits / PR:**
```

---

## 2026-10-26: Base do app e cadastro integrado ao Auth (#268, PR !18)
Trabalho de outra pessoa do time, registrado aqui sÃ³ como contexto. Os detalhes estÃ£o na descriÃ§Ã£o do PR !18.
- **O que trouxe:**
  - Telas de login, cadastro, cÃ³digo e recuperar senha.
  - Cadastro integrado ao Auth (`request-pin` e `register`).
  - Tokens no SecureStore, `SignupContext` e reenvio do cÃ³digo com contador de 60 s.
  - Home provisÃ³ria com skeleton.
  - 19 testes Jest.
- **PendÃªncias declaradas no PR:** remover o atalho temporÃ¡rio da Home quando a #261 for integrada; configurar o ESLint no mobile.

## 2026-10-28: Tela Home, primeira versÃ£o (#472)
- **Objetivo:** implementar a Home a partir do print de referÃªncia e da task HSP-PBI-010-TSK-01.
- **Arquivos:**
  - Criados: `src/app/home.tsx`, `src/components/SearchBar.tsx`, `FilterChip.tsx`, `PetCard.tsx` e `BottomTabBar.tsx`.
  - Alterados: `src/constants/theme.ts` (sÃ³ acrÃ©scimos), `src/app/index.tsx` e `src/app/codigo.tsx` (navegaÃ§Ã£o atÃ© a Home).
- **O que mudou:**
  - CabeÃ§alho, busca, filtros, listas "prÃ³ximos de vocÃª" e "Mais populares" e barra inferior.
  - Os Ã­cones eram feitos com Views e glifos Unicode, porque nÃ£o havia biblioteca de Ã­cones instalada.
- **VerificaÃ§Ã£o:** `tsc --noEmit` sem erros.
- **Problemas e soluÃ§Ãµes:**
  - `npx tsc` tentou baixar um pacote errado chamado `tsc`. SoluÃ§Ã£o: rodar `npm install` e usar `node_modules\.bin\tsc`.
  - NÃ£o hÃ¡ ESLint configurado, entÃ£o o lint nÃ£o rodou.

## 2026-10-28: Ãcones Material Symbols, ajustes de layout e tsconfig (#472)
- **Objetivo:** trocar os Ã­cones pelos do Google Fonts e aproximar o layout da referÃªncia.
- **Arquivos:**
  - Criado: `src/components/Icon.tsx`.
  - Alterados: componentes da Home, `theme.ts`, `tsconfig.json` e `package.json`/`package-lock.json` (entrou o `react-native-svg`).
- **O que mudou:**
  - Chips com largura igual.
  - Cards com tamanhos `large` e `small` e largura proporcional Ã  tela.
  - Abas com Ã­cone e nome.
  - PreÃ§o com "/diÃ¡rio".
  - `tsconfig.json` com `include` explÃ­cito e alias `@/*`.
- **DecisÃµes:** DT-01, DT-04 e DT-08.
- **VerificaÃ§Ã£o:**
  - `tsc --noEmit` sem erros.
  - `npx expo export --platform web` gerou o bundle da rota `home`.
- **Problemas e soluÃ§Ãµes:** o TypeScript 6 rejeitou o `baseUrl` por estar deprecado. Ele foi removido, e o `paths` continua funcionando.

## 2026-10-28: Branch e padrÃµes de git (ADR-014)
- **Objetivo:** criar a branch no padrÃ£o da ADR-014 e guardar as regras para as prÃ³ximas tasks.
- **Arquivos:** criado `.kiro/steering/git-workflow.md`.
- **O que mudou:**
  - Branch `feature/472-implementar-a-tela-home-no-mobile` criada a partir da `develop`.
  - Primeiro commit, `d41b22f`, com push.
- **DecisÃµes:** DT-09.
- **Problemas e soluÃ§Ãµes:** o e-mail do git era um valor de exemplo. A desenvolvedora corrigiu e refez o commit antes do push (o commit original `147d97c` foi substituÃ­do pelo `d41b22f`).

## 2026-10-29: Sombras, barra inferior e tÃ­tulo por filtro (#472)
- **Objetivo:** atender ao feedback de que faltavam sombras, a barra inferior estava fora de proporÃ§Ã£o e o tÃ­tulo da seÃ§Ã£o nÃ£o mudava com o filtro.
- **Arquivos:** `home.tsx`, `BottomTabBar.tsx`, `FilterChip.tsx`, `PetCard.tsx`, `SearchBar.tsx` e `theme.ts`.
- **O que mudou:**
  - Sombras com `boxShadow`.
  - Barra inferior com 64 de altura, abas de largura igual, item ativo de 52Ã—48 e Ã­cones de 20px.
  - Sino cinza.
  - TÃ­tulo da seÃ§Ã£o conforme o filtro.
  - Listas horizontais sem a sombra cortada.
- **DecisÃµes:** DT-02 e DT-05.
- **VerificaÃ§Ã£o:**
  - `tsc --noEmit` sem erros.
  - Print da `/home` no Chrome sem janela: as sombras aparecem. O print saiu cortado Ã  direita, entÃ£o o sino e a barra inferior inteira **nÃ£o foram conferidos visualmente**.
- **Commits:** `6bc1499`.

## 2026-10-29: IntegraÃ§Ã£o da develop e PR da Home (#472, PR !32)
- **Objetivo:** abrir o PR sem conflitos com a `develop`, que tinha recebido o PR !18.
- **Arquivos com conflito resolvido:** `codigo.tsx` (ficou a versÃ£o da `develop`), `home.tsx` (ficou a Home completa, agora lendo o `nome`), `theme.ts`, `tsconfig.json` e `package-lock.json` (gerado de novo).
- **DecisÃµes:** DT-03, DT-06, DT-07 e DT-08 (revisada).
- **VerificaÃ§Ã£o:**
  - Nenhum marcador de conflito sobrou, e o `tsc --noEmit` passou sem erros.
  - `jest`: 19 de 19 testes passando. Na primeira rodada, 2 testes estouraram o limite de 5 s enquanto o cache do Jest era montado.
- **Problemas e soluÃ§Ãµes:**
  - Um `git merge-tree` indicou que nÃ£o havia conflito porque o cÃ³digo de saÃ­da lido era de outro comando. Ao conferir o conteÃºdo, os conflitos apareceram.
  - LiÃ§Ã£o: confira o resultado, nÃ£o sÃ³ o cÃ³digo de saÃ­da.
- **Commits / PR:**
  - `53e88e4`: merge da `develop`.
  - `53654bd`: `docs:` com os steerings.
  - Push feito, e o PR !32 foi aberto para a `develop`, com revisor definido e a task #472 vinculada.

## 2026-10-29: MemÃ³ria persistente do projeto (#503)
- **Objetivo:** guardar contexto, decisÃµes e pendÃªncias no repositÃ³rio para retomar o trabalho em conversas novas.
- **Arquivos criados:**
  - `docs/memoria/CONTEXTO.md`, `LOG_DESENVOLVIMENTO.md`, `DECISOES_TECNICAS.md`, `PROXIMOS_PASSOS.md` e `INICIAR_CONTEXTO.md`.
  - Steerings `.kiro/steering/memoria-projeto.md` (sempre incluÃ­do) e `.kiro/steering/retomar-contexto.md` (manual).
- **Arquivo alterado:** `AGENTS.md` (seÃ§Ã£o nova "Project memory" no fim; o conteÃºdo do Expo nÃ£o mudou).
- **DecisÃµes:** DT-10.
- **Achado:** com o workspace aberto em `HOSPETSE`, o Kiro carregou sÃ³ o `hospetse-mobile/AGENTS.md`. Os steerings de `hospetse-mobile/.kiro/steering/` nÃ£o apareceram nas regras desta conversa.
- **Pesquisa feita:**
  - Recursos nativos do Kiro, pela documentaÃ§Ã£o em kiro.dev: steering, AGENTS.md, Memory, hooks, specs e MCP.
  - RepositÃ³rio `akitaonrails/ai-memory`: licenÃ§a MIT, versÃ£o 3.2.10 de 2026-10-29, servidor em Rust com MCP e hooks, suporte ao Kiro CLI. NÃ£o foi instalado.
- **VerificaÃ§Ã£o:** os arquivos foram conferidos contra o cÃ³digo atual. NÃ£o houve alteraÃ§Ã£o de cÃ³digo nem de configuraÃ§Ã£o do app.
- **Commit:** o time aprovou versionar a memÃ³ria.
  - O primeiro commit foi feito na branch da #472 (`2f42cb3`, nunca enviado) e desfeito com `git reset --soft`, para o PR !32 ficar sÃ³ com a Home.
  - Foi refeito na branch `docs/503-criar-a-memoria-persistente-do-desenvolvimento-no-mobile`, criada a partir da `develop`.
- **Ficou pendente:**
  - Push e PR da #503. Esse PR tem que ser mergeado **depois** do PR !32, porque a memÃ³ria descreve a Home e os steerings dele.
  - ConfirmaÃ§Ã£o da regra de pastas fora de `src/` (DT-10).

## 2026-10-30: Merges da Home e da memÃ³ria (PR !32 e PR !35)
- **O que aconteceu:**
  - O PR !32 (#472) foi mergeado na `develop` (`a3ca8f0`).
  - O PR !35 (#503) foi mergeado depois dele (`70de57c`), na ordem combinada.
- **Ficou pendente:**
  - Na #472, os critÃ©rios de aceite que ainda nÃ£o foram feitos (veja o `PROXIMOS_PASSOS.md`).
  - Mudar o status das tasks no Azure Boards e registrar o tempo trabalhado. Isso cabe Ã  desenvolvedora.

## 2026-10-30: Busca e filtros, modal (#477)
- **Objetivo:** implementar o modal de busca a partir dos 6 prints: Onde?, Para quando? (vazio e com perÃ­odo), Qual serviÃ§o? (vazio e com escolha) e Para quem?.
- **Arquivos:**
  - Criados: `src/components/SearchModal.tsx`, `FilterSection.tsx`, `Calendar.tsx` e `PetOption.tsx`, e `src/utils/calendar.ts`.
  - Alterados: `src/app/home.tsx`, `src/components/Icon.tsx` (3 Ã­cones novos) e `src/constants/theme.ts` (sÃ³ acrÃ©scimos).
- **O que mudou:**
  - O modal abre pela busca ou pela aba Buscar, e sÃ³ uma seÃ§Ã£o fica aberta por vez.
  - **Onde?:** sugestÃµes de cidade fixas.
  - **Para quando?:** calendÃ¡rio com check-in e check-out.
  - **Qual serviÃ§o?:** um serviÃ§o por vez.
  - **Para quem?:** pets de exemplo, e dÃ¡ para desmarcar o pet escolhido.
  - **Buscar:** guarda os filtros na Home.
- **DecisÃµes:** DT-11 e DT-12.
- **VerificaÃ§Ã£o:**
  - `tsc --noEmit` sem erros e 19 de 19 testes Jest passando.
  - `expo export --platform web` gerou o bundle da rota `home`.
  - **NÃ£o verificado:** o visual. O servidor web foi iniciado para a desenvolvedora conferir. NÃ£o houve teste em aparelho e nÃ£o foram criados testes novos.
- **Problemas e soluÃ§Ãµes:** a primeira rodada de typecheck e testes foi interrompida (`^C`). Rodando os dois separados, passaram.
- **Ficou pendente:** veja a #477 em `PROXIMOS_PASSOS.md`. O commit aguarda o retorno visual e a autorizaÃ§Ã£o.

## 2026-10-30: Busca reabre vazia e testes da busca (#477)
- **Objetivo:** atender ao retorno visual (a cidade escolhida continuava preenchida ao reabrir o modal) e criar os testes que o card pede.
- **Arquivos:**
  - Alterados: `SearchModal.tsx` (saiu a prop `initialFilters` e o formulÃ¡rio comeÃ§a de `EMPTY_FILTERS`) e `home.tsx` (agora guarda `lastSearch`, e o campo nÃ£o mostra mais a cidade).
  - Criados: `__tests__/calendar-test.ts` (7 testes) e `__tests__/search-modal-test.tsx` (9 testes).
- **DecisÃµes:** DT-12, revisada.
- **VerificaÃ§Ã£o:** `tsc --noEmit` sem erros e `jest` com 35 de 35 testes passando, em duas rodadas completas.
- **Problemas e soluÃ§Ãµes:**
  - O teste do fluxo completo (9 toques) estourou os 5 s padrÃ£o do Jest, e a falha deixou um toque pendente que derrubou o teste seguinte (`Pressability: Invalid signal`).
  - SoluÃ§Ã£o: limite de 20 s sÃ³ nesse teste.
  - Os testes do calendÃ¡rio usam o mÃªs seguinte, para nÃ£o depender da data de hoje.
- **Commits:** um `feat:` com o cÃ³digo e os testes e um `docs:` com a memÃ³ria, autorizados pela desenvolvedora.
- **Ficou pendente:** push e PR. A correÃ§Ã£o de "reabrir vazia" foi coberta por teste, mas nÃ£o foi conferida de novo na web.

## 2026-10-30: ValidaÃ§Ã£o do cadastro e login integrado ao Auth (#267)
- **Objetivo:** TSK-09 (validar o cadastro no app, com todos os erros de uma vez) e trocar o login provisÃ³rio pelo login do Auth.
- **Arquivos criados:** `src/utils/validateSignup.ts`, `src/utils/validateLogin.ts`, `src/components/FieldError.tsx`, `src/components/ErrorModal.tsx`, `assets/pets.png`, `__tests__/validateSignup-test.ts` e `__tests__/login-test.tsx`.
- **Arquivos alterados:** `src/app/cadastro.tsx`, `src/app/index.tsx`, `src/services/auth.ts` (`login`), `src/utils/requestPinErrorMessage.ts` (tÃ­tulos do modal), `src/constants/theme.ts` (sÃ³ acrÃ©scimos), `__tests__/cadastro-test.tsx` e `__tests__/auth-service-test.ts`.
- **DecisÃµes:** DT-13 e DT-14 (DT-06 parcialmente substituÃ­da). Criadas como DT-11 e DT-12 e renumeradas no merge do PR !47, que usou esses nÃºmeros antes.
- **VerificaÃ§Ã£o:**
  - `tsc --noEmit` sem erros e 46 de 46 testes Jest passando. Na primeira rodada, o primeiro teste de 3 arquivos estourou o limite de 5 s enquanto o cache era montado.
  - `expo export` para Android e web sem erros.
  - Contra o Auth de produÃ§Ã£o: login sem conta respondeu 401 e e-mail invÃ¡lido respondeu 400, como o app espera; `request-pin` respondeu 201.
  - **NÃ£o rodou:** o cadastro completo atÃ© a Home, porque o Auth de produÃ§Ã£o usa o `ConsoleEmailSender` e o PIN sÃ³ aparece no log do servidor. TambÃ©m nÃ£o houve teste num aparelho.
- **Problemas e soluÃ§Ãµes:**
  - O tipo do `ref` do `TextInput` no React Native 0.88 Ã© `TextInputInstance`, e nÃ£o `TextInput`.
  - Conflitos ao integrar a `develop` (PRs !32 e !35): no `index.tsx` ficou o login integrado; no `theme.ts` ficaram os tokens das duas branches, sem mudar valores.
  - Segunda integraÃ§Ã£o da `develop` (PR !47, busca): conflitos sÃ³ na memÃ³ria (`CONTEXTO`, `LOG` e `PROXIMOS_PASSOS`), com o texto das duas tasks mantido. O `theme.ts` juntou sem conflito. Depois do merge: `tsc --noEmit` sem erros, 62 de 62 testes e `expo export` sem erros.
- **Ficou pendente:** revisÃ£o do PR da #267 por outra pessoa, teste do cadastro com um PIN real e teste num aparelho.
- **ExplicaÃ§Ãµes para a banca:** os trechos que fogem do bÃ¡sico estÃ£o explicados em `docs/memoria/EXPLICACOES_CADASTRO_LOGIN.md`.
- **Commits:** `7b0e4b7` (validaÃ§Ã£o do cadastro), `c4f8cb7` (login), `c4c0a72` (merge da `develop` com !32 e !35), `9a50f96` (memÃ³ria e explicaÃ§Ãµes) e o merge da `develop` com o !47. PR da #267 aberto para a `develop`.

## 2026-11-01: Merges do cadastro e do login (PR !52)
- **O que aconteceu:** depois da revisÃ£o, o PR !52 (#267, Murilo) foi mergeado na `develop` (`79b7a95`), sem fast-forward. Antes, ele trouxe a `develop` com o PR !47 e renumerou as decisÃµes dele para DT-13 e DT-14.
- **VerificaÃ§Ã£o:** na `develop` jÃ¡ mergeada, `tsc --noEmit` sem erros e 62 de 62 testes passando.
- **Problemas e soluÃ§Ãµes:**
  - O voto e a conclusÃ£o automÃ¡tica pelo MCP do Azure DevOps falharam ("Unexpected end of JSON input"). A desenvolvedora aprovou e concluiu pela pÃ¡gina do PR.
  - NÃ£o deu para marcar "apagar a branch", porque isso exige a permissÃ£o de force push, que sÃ³ o autor tem.
- **Ficou pendente:** o Murilo apagar a branch `feature/267-...` no servidor.

## 2026-11-01: Detalhe do Host, resultados e filtros (#480)
- **Objetivo:** fazer os 4 prints da #480: lista de resultados, filtros e detalhe do Host (em duas partes). A tela de filtros Ã© da #477, mas foi feita aqui por decisÃ£o da desenvolvedora.
- **Arquivos criados:**
  - Telas: `src/app/host/[id].tsx` e `src/app/resultados.tsx`.
  - Componentes: `FiltersModal.tsx`, `PriceSlider.tsx`, `UserHeader.tsx`, `AmenityItem.tsx` e `OutlineButton.tsx`.
  - Dados e funÃ§Ãµes: `src/services/hosts.ts`, `src/constants/search.ts`, `src/constants/sampleData.ts` e `src/utils/searchParams.ts`.
  - Testes: `__tests__/host-details-test.tsx` e `__tests__/results-test.tsx`.
- **Arquivos alterados:**
  - `home.tsx`: usa o `UserHeader`, os cards abrem o detalhe e "Buscar" vai aos resultados.
  - `SearchModal.tsx`: o `ServiceType` passou para `constants/search.ts`.
  - `Icon.tsx`: 14 Ã­cones novos.
  - `theme.ts` (sÃ³ acrÃ©scimos) e `utils/calendar.ts` (`toIsoDate` e `fromIsoDate`).
- **DecisÃµes:** DT-15, DT-16 e DT-17. DT-12 revisada.
- **Contrato conferido:** o `GET /api/v1/hosts/{id}` no OpenAPI do `hospetse-backend` (#479 em Done). A rota de busca (#476) estava Em Andamento.
- **VerificaÃ§Ã£o:**
  - `tsc --noEmit` sem erros e 86 de 86 testes passando (15 novos).
  - Numa rodada, testes antigos do login e do cadastro estouraram o limite de 5 s enquanto o cache era montado. Na rodada seguinte, todos passaram.
  - As rotas `/resultados` e `/host/[id]` respondem no servidor web.
- **NÃ£o verificado:** a conferÃªncia visual dos resultados e dos filtros pela desenvolvedora e o teste num aparelho.
- **Problemas e soluÃ§Ãµes:**
  - Na primeira conferÃªncia, "Buscar" sÃ³ fechava o modal, e o tÃ­tulo nÃ£o seguia o serviÃ§o. A soluÃ§Ã£o foi a tela de resultados (DT-15).
  - Durante as ediÃ§Ãµes, o servidor mostrou erros de atualizaÃ§Ã£o na Home (`USER is not defined`) por causa de estados intermediÃ¡rios do arquivo. O cÃ³digo final nÃ£o usa mais esses nomes: basta recarregar a pÃ¡gina.
- **Ficou pendente:** veja a #480 em `PROXIMOS_PASSOS.md`.

## 2026-11-01: Mensagem "Sem conexÃ£o" no login e no cadastro (#480)
- **Objetivo:** a desenvolvedora viu "Sem conexÃ£o" ao entrar na web.
- **Causa:**
  - Faltava o `.env.local`. Ele foi criado na mÃ¡quina dela e fica fora do git.
  - O Auth nÃ£o manda `Access-Control-Allow-Origin` para `localhost:8081`, entÃ£o o navegador bloqueia a resposta.
  - O SecureStore nÃ£o funciona na web.
- **O que mudou:** `isRequestError` e mensagens corretas para a falha ao salvar os tokens (DT-18).
- **VerificaÃ§Ã£o:** 3 testes novos, e o login sem conta respondeu 401 no Auth de produÃ§Ã£o, chamado daqui.
- **Commit:** `177c961` (`fix:`), na branch da #480, conforme a opÃ§Ã£o (a) escolhida pela desenvolvedora.
- **Ficou pendente:** o CORS no Auth, com o time de back-end.

## 2026-11-01: Commits da #480 e parte mobile do bug #516
- **Contexto:**
  - A desenvolvedora aprovou o visual dos resultados, dos filtros e do detalhe.
  - O bug #516 ("Erro de conexÃ£o ao acessar a tela login") passou a ser dela, e a parte do mobile foi feita na branch da #480.
- **Arquivos do bug:** `.env.example` (novo, com `EXPO_PUBLIC_AUTH_URL`; o endereÃ§o nÃ£o Ã© segredo) e `README.md` (reescrito: como rodar, limites na web, variÃ¡veis, testes e como contribuir).
- **Conferido:**
  - O endereÃ§o do Auth no `.env.example` Ã© o mesmo da pÃ¡gina da Wiki "APIs publicadas - URLs e contratos".
  - O PR !55 do `hospetse-auth-service` (Lucas, CORS pela variÃ¡vel `CORS_ORIGINS`) estava aberto. Testado daqui, o Auth de produÃ§Ã£o ainda nÃ£o mandava `Access-Control-Allow-Origin`.
  - A #476 foi mergeada no back-end (PR !53).
- **Commits:**
  - `3365963`: `feat:` da #480.
  - `6dd91c6`: `fix:` do #516.
  - `docs:` da memÃ³ria.
  - O `177c961` (`fix:`, mensagem "Sem conexÃ£o") cita a #480, mas faz parte do #516. Isso Ã© explicado no PR.
- **Ficou pendente:** push e PR, testar o CORS depois do deploy do PR !55 e a task da ADR-005 para os tokens na web.

## 2026-11-01: Merge da #480 e repositÃ³rios do back-end ao lado
- PR !57 (#480 e parte mobile do #516) mergeado na `develop` (`2c48eca`) pela desenvolvedora, aprovado pelo Raul. Pelo MCP, o merge falhou de novo ("Unexpected end of JSON input").
- `hospetse-backend` e `hospetse-auth-service` clonados em `HOSPETSE/`, ao lado do mobile, para ler as rotas reais. Rodar `git pull` antes de consultar. NÃ£o editar sem pedido.
- CORS publicado nos dois serviÃ§os para `http://localhost:8081` (PRs !55 e !56), conferido daqui.

## 2026-11-01: IntegraÃ§Ã£o da busca e do detalhe com o back-end (#518)
- **Objetivo:** trocar os dados de exemplo pelas rotas reais da #476 e da #479.
- **Arquivos:**
  - `services/api.ts`: `backendApi`, `refreshAccessToken` e `SessionExpiredError`.
  - `services/token-storage.ts`: `getAccessToken` e `getRefreshToken`.
  - `services/hosts.ts`: busca e detalhe pela API e `toSearchQuery`.
  - `app/resultados.tsx`: erro com "Tentar de novo", total da API e campos da resposta.
  - `components/PetCard.tsx`: aceita card sem foto.
  - `app/index.tsx`: aviso `sessao-expirada`.
  - `.env.example` e `README.md`: `EXPO_PUBLIC_API_URL`.
  - Testes: `__tests__/api-client-test.ts` (novo) e os testes de resultados e detalhe reescritos com o back-end simulado.
- **DecisÃµes:** DT-19 e DT-20 (DT-17 substituÃ­da na busca e no detalhe).
- **Contrato lido no cÃ³digo do `hospetse-backend`:** `host-search-policy.js`, `host-search.controller.js` e `host-details.controller.js`. No `hospetse-auth-service`: `refresh-token.service.js`.
- **VerificaÃ§Ã£o:**
  - `tsc --noEmit` sem erros e 95 de 95 testes passando.
  - As rotas publicadas respondem 401 sem token.
  - A desenvolvedora testou no Expo Go, com login real: busca, resultados, filtros, detalhe e o erro sem rede. Deu tudo certo.
  - Antes do commit, o back-end recebeu a agenda do Host (#482, PR !62). As rotas de busca e de detalhe e a lista `OCCUPYING` nÃ£o mudaram, entÃ£o nÃ£o houve ajuste.
- **Problemas e soluÃ§Ãµes:**
  - Na repetiÃ§Ã£o depois do refresh, o interceptor lia de novo o token antigo do SecureStore. SoluÃ§Ã£o: ele pula a leitura nas chamadas repetidas.
  - A tela de resultados buscava duas vezes ao abrir, por causa do efeito que recomeÃ§ava os filtros. SoluÃ§Ã£o: guardar o Ãºltimo serviÃ§o.
- **Commits:** `feat:` e `docs:` da #518.
- **Ficou pendente:**
  - Push e PR.
  - Os cards de exemplo da Home abrem um id que nÃ£o existe na API ("Hospedagem nÃ£o encontrada").
## 2026-11-01: Modal de rotina do Host (#519)
- **Objetivo:** mostrar a rotina diÃ¡ria e a garantia veterinÃ¡ria a partir do "Ler mais" da Rotina no detalhe do Host.
- **Branch:** `feature/519-implementar-o-modal-de-rotina-do-host-no-mobile`, a partir da `develop` (`69facdd`).
- **Arquivos:**
  - `components/RoutineModal.tsx` (novo): sobe por baixo, com "Rotina Personalizada", a quantidade de etapas, cada etapa com perÃ­odo, horÃ¡rio e descriÃ§Ã£o, o bloco "Garantia VeterinÃ¡ria Hospetse" com o selo "Protegido" e o botÃ£o "Fechar".
  - `components/Icon.tsx`: Ã­cones `wb_sunny`, `wb_twilight`, `bedtime` e `verified_user`.
  - `services/hosts.ts`: tipo `RoutineStep` e o campo `routineSteps` em `HostExtras`, com 3 etapas de exemplo.
  - `app/host/[id].tsx` (cÃ³digo existente): o "Ler mais" da Rotina abre o modal, em vez de mostrar o resto da lista. Saiu o estado `showFullRoutine`.
  - `__tests__/host-details-test.tsx`: 2 testes (abrir e fechar o modal).
- **DecisÃ£o:** DT-21.
- **VerificaÃ§Ã£o:** `tsc --noEmit` sem erros e 97 de 97 testes passando. A desenvolvedora testou no Expo Go e aprovou.
- **Commits:** `feat:` e `docs:` da #519.
- **PR:** !66.
- **Ficou pendente:** testar no Android, confirmar com a PO o texto da garantia e pedir os campos de rotina ao back-end.
## 2026-11-01: Tela de chat com o Host (#520)
- **Objetivo:** o Tutor abre, pelo detalhe do Host, uma conversa com o Assistente de IA e com o Host antes da reserva.
- **Branch:** `feature/520-implementar-a-tela-de-chat-com-o-host-no-mobile`, a partir da `develop` (`69facdd`). A #519 estÃ¡ em outra branch.
- **Arquivos:**
  - `app/chat/[id].tsx` (novo): cabeÃ§alho com voltar, foto, nome, status e mais opÃ§Ãµes; faixa "Interesse em reservar"; mensagens separadas por dia; campo de mensagem.
  - `components/ChatBubble.tsx`, `BookingInterest.tsx` e `ChatInput.tsx` (novos).
  - `constants/sampleChat.ts` e `utils/chat.ts` (novos): conversa de exemplo, `formatTime`, `countNights` e `formatPrice`.
  - `components/Icon.tsx`: Ã­cones `attach_file`, `mic`, `send`, `more_vert` e `smart_toy`.
  - `constants/theme.ts`: `chatImageHeight`, `chatImageWidth` e `chatInput` (sÃ³ acrÃ©scimos).
  - CÃ³digo existente: `app/host/[id].tsx` (o "Tire suas dÃºvidas" abre o chat e a tela lÃª o `petId`) e `app/resultados.tsx` (manda o `petId` ao detalhe).
  - Testes: `__tests__/chat-test.tsx` (novo, 9 testes) e 1 teste novo em `host-details-test.tsx`.
- **DecisÃ£o:** DT-22. O botÃ£o de ligar saiu, por decisÃ£o da desenvolvedora.
- **VerificaÃ§Ã£o:** `tsc --noEmit` sem erros e 105 de 105 testes passando.
- **Problemas e soluÃ§Ãµes:** no iPhone, o teclado cobria as mensagens. Rolar a lista atÃ© o fim nÃ£o bastou. SoluÃ§Ã£o: tirei o `KeyboardAvoidingView` e passei a usar a altura do teclado como margem embaixo da tela (DT-22).
  - No Android, o teclado cobria o campo e as mensagens, porque a tela nÃ£o encolhe no modo edge-to-edge. SoluÃ§Ã£o: a mesma margem, agora calculada pela parte da tela que o teclado cobre, nos dois sistemas. A desenvolvedora testou de novo no aparelho e confirmou que o chat funcionou.
  - "O modal de rotina nÃ£o abre no Android": o teste foi feito na branch da #520, que saiu da `develop` e nÃ£o tem o modal (a #519 estÃ¡ em outra branch). NÃ£o Ã© defeito do Android. Ainda nÃ£o testado no Android.
- **Web:** a busca mostra "Algo deu errado", porque nÃ£o hÃ¡ SecureStore no navegador (limite jÃ¡ conhecido, DT-19). A tela tambÃ©m nÃ£o leva ao login com "sessÃ£o expirada", provavelmente porque o `clearTokens` falha na web (o SecureStore nÃ£o existe no navegador). Isso nÃ£o foi testado. Fica para a task de tokens na web (ADR-005).
- **Commits:** `feat:` e `docs:` da #520.
- **Ficou pendente:** testar o modal de rotina no Android depois do merge da #519, as rotas de conversa no back-end e tirar o "ligar" da descriÃ§Ã£o da task #520.
## 2026-11-01: Merge da #519 e da #520
- PRs !66 (modal de rotina) e !67 (chat) aprovados pelo Lucas Neo e mergeados pela desenvolvedora na `develop` (`4a806dd`). Antes, a branch da #519 foi trazida para a da #520, com o conflito de `docs/memoria/` e do teste do detalhe resolvido. Branches apagadas.
## 2026-11-01: SolicitaÃ§Ã£o de hospedagem (#495)
- **Objetivo:** tela "Confirmar Reserva", aberta pelo "Solicitar reserva" do detalhe, com o sucesso e os modais de erro do protÃ³tipo.
- **Branch:** `feature/495-implementar-a-tela-de-solicitacao-de-hospedagem-no-mobile`, a partir da `develop` (`4a806dd`).
- **Arquivos novos:** `app/reserva/[id].tsx`; `components/ReservationSuccess.tsx`, `DateRangeModal.tsx` e `AddOnItem.tsx`; `services/reservations.ts` e `services/pets.ts`; `constants/addOns.ts`; `utils/validateReservation.ts` e `utils/money.ts`; `__tests__/reservation-test.tsx` (17 testes).
- **CÃ³digo existente:** `app/host/[id].tsx` ("Solicitar reserva" abre a confirmaÃ§Ã£o; o contexto da busca virou `searchContext`, usado tambÃ©m pelo chat); `components/PetOption.tsx` (aceita pet sem foto); `constants/theme.ts` (`successCircle`, `footerHeight` e `icon.huge`, sÃ³ acrÃ©scimos); `test-utils/http.ts` (`apiError`); 1 teste novo em `host-details-test.tsx`.
- **Contrato lido no `hospetse-backend`:** `create-reservation.controller.js`, `create-reservation.service.js`, `availability.js`, `profile-policy.js` e `pet.controller.js`.
- **DecisÃ£o:** DT-23.
- **VerificaÃ§Ã£o:** `tsc --noEmit` sem erros e 125 de 125 testes passando. A desenvolvedora testou no Expo Go (iPhone) com um Tutor com pets reais (Rex, Mia e Thor): a confirmaÃ§Ã£o e o sucesso funcionaram.
- **Commits:** `feat:` e `docs:` da #495.
- **Ficou pendente:** push e PR; tela de Reservas do Tutor (PBI #199, sem task e sem rota no back-end); cadastro de pet; conclusÃ£o do perfil; serviÃ§os adicionais e horÃ¡rios na API.

## 2026-11-02: SessÃ£o e confirmaÃ§Ã£o apÃ³s cadastro (#269)
- **Objetivo:** iniciar a sessÃ£o depois do `register`, carregar o perfil pelo `/me` e mostrar a confirmaÃ§Ã£o antes da Home.
- **Arquivos:** criados `src/context/SessionContext.tsx`, `src/services/users.ts` e `src/services/token-storage.web.ts`; alterados `src/app/_layout.tsx`, `src/app/codigo.tsx`, `src/app/home.tsx`, `src/services/token-storage.ts`, `__tests__/codigo-test.tsx`, `package.json` e `package-lock.json`.
- **O que mudou:** tokens continuam no SecureStore no Android/iOS; na Web ficam apenas em memÃ³ria. A tela do cÃ³digo consulta `/me` apÃ³s salvar tokens, mostra sucesso e permite repetir a consulta sem encerrar a sessÃ£o. A Home usa o perfil carregado e informa quando a contrataÃ§Ã£o exige completar o perfil.
- **DecisÃµes:** DT-24.
- **VerificaÃ§Ã£o:** `expo-doctor` 20/20, `npx tsc --noEmit`, Jest 126 de 126 e `npx expo export --platform web` concluÃ­dos.
- **Ficou pendente:** validaÃ§Ã£o manual contra Auth Server e Back-end no navegador e Expo Go.
- **Commits / PR:** nenhum.

- **CorreÃ§Ã£o posterior:** resultados passou a ler o nome do `SessionContext`, como a Home; avatar e cidade continuam de exemplo porque `/me` nÃ£o fornece esses campos. O nome de exemplo sÃ³ aparece quando nÃ£o hÃ¡ sessÃ£o carregada.
- **CorreÃ§Ã£o de runtime:** a leitura do nome na Home agora tolera estado ausente, e `getCurrentUser` rejeita resposta de `/me` sem `user.name`, perfil ou permissÃµes antes de gravÃ¡-la no contexto. Assim, o fluxo mostra o erro recuperÃ¡vel do perfil em vez de quebrar a Home.

## 2026-11-02: Testes automatizados do fluxo de cadastro (#270)
- **Objetivo:** completar os cenÃ¡rios simulados de cadastro que ainda nÃ£o estavam explÃ­citos nos testes.
- **Arquivos:** `__tests__/cadastro-test.tsx` e `__tests__/codigo-test.tsx`.
- **O que mudou:** cobre `503` no pedido do PIN, `404` de PIN expirado no cadastro e `503` ao reenviar o PIN, preservando o cÃ³digo digitado.
- **VerificaÃ§Ã£o:** `npx tsc --noEmit` sem erros e Jest com 133 testes passando.
- **DependÃªncia:** PR !70 da #269 mergeado antes do rebase da branch de testes sobre a `develop`.
- **Commits / PR:** commits `test:` e `docs:`; PR pendente.

## 2026-11-04: CorreÃ§Ã£o do teste de envio pendente do cadastro
- **Problema:** `cadastro-test.tsx` simulava uma request que nunca resolvia e aguardava `userEvent.press()`, mantendo o Jest preso no teste de toque duplo.
- **CorreÃ§Ã£o:** o teste usa `fireEvent.press()` para iniciar o envio, uma Promise controlÃ¡vel e resolve a request depois das asserÃ§Ãµes de loading e toque duplicado.
- **VerificaÃ§Ã£o:** teste isolado passou; suÃ­te completa passou com 12 suÃ­tes e 133 testes.
- **Arquivos:** `__tests__/cadastro-test.tsx`.

## 2026-11-04: Feedback visual das regras de senha no cadastro
- **Objetivo:** mostrar em tempo real quais requisitos da senha foram cumpridos e permitir visualizar a senha durante o cadastro.
- **O que mudou:** `getPasswordRules` passou a devolver um objeto com quatro booleanos; `isStrongPassword` reutiliza esse objeto; `cadastro.tsx` mostra cada regra com estado visual e adiciona alternÃ¢ncia mostrar/ocultar nos campos de senha e confirmaÃ§Ã£o.
- **Testes:** adicionada cobertura do objeto de regras em `validateSignup-test.ts`.
- **VerificaÃ§Ã£o:** `npx tsc --noEmit` sem erros e Jest com 134 testes passando.
- **Arquivos:** `src/utils/isStrongPassword.ts`, `src/app/cadastro.tsx` e `__tests__/validateSignup-test.ts`.

## 2026-11-04: Logout local e sessÃ£o do Mobile (#300)
- **Branch:** `feature/300-implementar-a-renovacao-de-sessao-e-o-logout-no-mobile`, criada sobre a branch da #299.
- **O que mudou:** `SessionContext` ganhou `logout`, que limpa o armazenamento da plataforma e o usuÃ¡rio em memÃ³ria e nunca lanÃ§a erro; Home e resultados exibem a aÃ§Ã£o `Sair`; sessÃ£o expirada limpa o contexto ao voltar para o login.
- **Refresh:** manteve o interceptor existente, com access token de 15 minutos, refresh rotativo de 30 dias, fila Ãºnica e logout local quando o Auth recusa o refresh.
- **DecisÃ£o:** DT-25. A #297 (logout no Auth) estÃ¡ como Removed; comentÃ¡rio registrado na #300.
- **Testes:** `session-context-test.tsx` (logout limpa tokens e usuÃ¡rio, inclusive com falha no armazenamento); `login-test.tsx` (sessÃ£o expirada limpa o usuÃ¡rio); `results-test.tsx` e `home-test.tsx` (novo; "Sair" volta ao login sÃ³ depois que o logout termina). API cobre refresh, falha, concorrÃªncia e redirecionamento.
- **Expo Go:** a desenvolvedora fez login e "Sair". RenovaÃ§Ã£o conferida nos logs do Railway: login Ã s 02:41 UTC; Ã s 03:12 a busca recebeu 401, o app chamou `POST /api/v1/auth/refresh` (200) uma vez e repetiu a busca (200), sem pedir senha.
- **Visto fora do escopo:** `GET /api/v1/me/pets` respondeu 403 no detalhe do Host (token aceito, acesso negado). NÃ£o investigado.
- **Commit:** ainda nÃ£o criado.
## 2026-11-01: Ajuste visual dos avisos de reserva (#489)
- **Objetivo:** aproximar os avisos de "Pet nÃ£o permitido" e "Data indisponÃ­vel" dos anexos da task #489.
- **Branch:** `feature/489-exibir-avisos-de-pet-nao-permitido-e-data-indisponivel-no-mobile`, a partir da `develop` (`4acac08`).
- **Arquivos:**
  - `components/ErrorModal.tsx`: fundo com BlurView e camada escura, card central com largura limitada e sombra, e Ã­cone vetorial `pet_supplies`.
  - `components/Icon.tsx`: path oficial de `pet_supplies`.
  - `services/reservations.ts`: `VALIDATION_ERROR` de `petId` vira o aviso modal "Pet nÃ£o permitido".
  - `app/reserva/[id].tsx`: texto e estado do novo aviso.
  - `package.json` e `package-lock.json`: `expo-blur` compatÃ­vel com o SDK 58.
  - `__tests__/reservation-test.tsx`: atualiza o cenÃ¡rio de pet nÃ£o permitido para verificar o modal.
- **DecisÃ£o:** DT-24.
- **VerificaÃ§Ã£o:** `tsc --noEmit` sem erros, 17 de 17 testes da reserva passando e a suÃ­te completa serÃ¡ conferida antes do commit.
- **Ficou pendente:** testar visualmente no Expo Go (iPhone e Android), conferir a web e commit/PR autorizados separadamente.
## 2026-11-02: Lista de solicitaÃ§Ãµes pendentes do Host (#486)
- **Objetivo:** iniciar o fluxo do prestador com a fila de solicitaÃ§Ãµes recebidas.
- **Branch:** `feature/486-implementar-a-lista-de-solicitacoes-pendentes-no-mobile`, a partir da `develop` (`26ebfa3`).
- **Arquivos:**
  - `app/reservas.tsx` (novo): consulta a API, total, cards, carregamento, vazio, erro com retry, pull-to-refresh e aba Reservas ativa.
  - `components/HostRequestCard.tsx` (novo): card adaptado da referÃªncia do Tutor para mostrar status, Tutor, pet, perÃ­odo, total e observaÃ§Ãµes.
  - `services/hostReservations.ts` (novo): tipo separado `HostPendingReservation` e `listPendingHostReservations`.
  - `app/home.tsx` e `app/resultados.tsx`: a aba Reservas agora abre `/reservas`.
  - `__tests__/host-reservations-test.tsx` (novo, 5 testes).
- **Contrato usado:** `GET /api/v1/me/host/reservations?status=requested&page=1&pageSize=20`, dependÃªncia #485.
- **DecisÃ£o:** DT-26. Aceitar/recusar nÃ£o entrou nesta task.
- **VerificaÃ§Ã£o:** `tsc --noEmit` sem erros e 145 de 145 testes passando. Ainda nÃ£o testado no Expo Go com uma conta Host.
- **Ficou pendente:** teste manual, commit e PR; detalhe e decisÃµes do PBI #042 em task posterior.
## 2026-11-02: CorreÃ§Ãµes apontadas no PR !77 da #486
- **CorreÃ§Ãµes:** `reservas.tsx` passou a usar `SafeAreaView` do `react-native-safe-area-context`; `HostRequestCard` passou a converter `createdAt` com `new Date()` antes de formatar o dia no fuso local do aparelho.
- **Testes:** acrescentado teste de timestamp local. `tsc --noEmit` sem erros e 146 de 146 testes passando.
## 2026-11-02: Aceitar e recusar solicitaÃ§Ãµes do Host (#492)
- **Objetivo:** permitir que o Host aceite ou recuse uma solicitaÃ§Ã£o pendente pela tela adaptada da referÃªncia do histÃ³rico do Tutor.
- **Branch:** `feature/492-implementar-as-acoes-de-aceitar-e-recusar-no-mobile`, a partir da `develop` apÃ³s o merge do PR !77 (`986ed52`).
- **Arquivos:**
  - `app/reserva-host/[id].tsx` (novo): detalhe da solicitaÃ§Ã£o, confirmaÃ§Ã£o de aceite, recusa com motivo obrigatÃ³rio, cuidados mÃ©dicos e comportamento do pet.
  - `services/hostReservations.ts`: tipos de decisÃ£o, POST de aceite/recusa e mensagens dos conflitos.
  - `app/reservas.tsx`: cards agora abrem o detalhe.
  - `__tests__/host-reservation-decision-test.tsx` (novo, 4 testes).
- **Contrato:** `POST /api/v1/me/host/reservations/:id/accept` e `POST /api/v1/me/host/reservations/:id/reject` (#491).
- **DecisÃ£o:** DT-28.
- **VerificaÃ§Ã£o:** `tsc --noEmit` sem erros e 150 de 150 testes passando. Ainda nÃ£o testado no Expo Go com uma conta Host.
- **Ficou pendente:** teste manual, commit e PR.
## 2026-11-07: Tela de Perfil e entrada do cadastro de Host (#326)
- **Branch:** `feature/326-implementar-o-cadastro-do-host-no-app`, a partir da `develop` (`26ebfa3`).
- **Escopo:** a tela de Perfil Ã© sÃ³ um esqueleto, nÃ£o a versÃ£o final. Serve para dar ao usuÃ¡rio comum a entrada "Quero ser Host". SÃ³ nome e e-mail sÃ£o dados reais.
- **O que mudou:** nova rota `/perfil`, baseada no protÃ³tipo, para o usuÃ¡rio comum (nÃ£o Ã© especÃ­fica de Tutor nem de Host): cabeÃ§alho "Meu Perfil", card com nome e e-mail do cadastro, "Meus Pets", convite "Quero ser Host", menu "Minha conta" (com "Completar perfil" ou "Editar perfil" no fim), "Sair da conta" e rodapÃ© com a versÃ£o do app. A aba Perfil da Home passou a abrir a rota. Componentes novos: `StatusPill`, `ProfileMenuItem` e `HostInviteCard`. O `Button` ganhou o parÃ¢metro opcional `icon`. Oito Ã­cones oficiais novos no `Icon.tsx` e tokens novos no `theme.ts` (`textMuted`, pares cor/fundo azul, verde, roxo e amarelo, e os tamanhos do avatar e do Ã­cone do menu).
- **Dados:** o Perfil mostra sÃ³ o que o cadastro coleta: nome e e-mail, do `GET /api/v1/me`. Sem sessÃ£o, mostra "UsuÃ¡rio" e nenhum e-mail. O cadastro nÃ£o tem foto, entÃ£o o avatar Ã© um Ã­cone. Telefone, cidade, selo de verificaÃ§Ã£o, pets de exemplo e a troca de foto foram removidos. Os textos do menu ainda sÃ£o de exemplo.
- **Ajustes pedidos apÃ³s a primeira versÃ£o:** saÃ­ram "Minhas Reservas" (jÃ¡ hÃ¡ a aba) e "Garantia"; no lugar entrou "Completar perfil" (perfil `incomplete`, com selo "Pendente") ou "Editar perfil" (perfil `complete`).
- **Sem aÃ§Ã£o ainda:** "Quero ser Host", "Acessar Meus Pets", linhas do menu (inclusive "Completar/Editar perfil"), sino e engrenagem.
- **DecisÃ£o:** DT-29.
- **VerificaÃ§Ã£o:** `tsc --noEmit` sem erros; Jest 140 de 140; `expo export --platform web` gerou o bundle `perfil`. Um teste temporÃ¡rio confirmou os cenÃ¡rios do Perfil (completo, incompleto, sem sessÃ£o, logout e aba Home) e foi removido. A desenvolvedora aprovou a tela visualmente; nÃ£o foi testada no Expo Go.
- **Testes:** nÃ£o foram criados testes Jest do Perfil.
- **Arquivos:** `app/perfil.tsx`, `app/home.tsx`, `components/StatusPill.tsx`, `components/ProfileMenuItem.tsx`, `components/HostInviteCard.tsx`, `components/Button.tsx`, `components/Icon.tsx` e `constants/theme.ts`.
- **Commits:** um `feat:`, um `docs:` e outro `docs:` que marca a tela como esqueleto. Enviados ao Azure DevOps, na branch que a desenvolvedora criou, com a autorizaÃ§Ã£o dela.
## 2026-11-07: Telas do cadastro de Host (#326)
- **Branch:** `feature/326-implementar-o-cadastro-do-host-no-app`. Sem commit desta parte.
- **O que mudou:** trÃªs rotas novas em `src/app/cadastro-host/`: etapa 1 "Torne-se AnfitriÃ£o" (espaÃ§o, portes, experiÃªncia, interruptores e apresentaÃ§Ã£o), etapa 2 (fotos e localizaÃ§Ã£o) e a tela final "Cadastro enviado para anÃ¡lise". "Quero ser Host", no Perfil, abre a etapa 1. O estado das etapas fica no `HostRegistrationContext`, apagado ao sair da conta.
- **BotÃ£o da etapa 2:** o protÃ³tipo repetia "AvanÃ§ar para fotos e EndereÃ§o". Como nÃ£o hÃ¡ tela depois dela, virou "Enviar para anÃ¡lise".
- **Tela final:** segue os documentos do produto. O HPET10 (US-HPET10-01) diz que o perfil nasce "pendente de validaÃ§Ã£o" e nÃ£o recebe reservas antes da aprovaÃ§Ã£o do Administrador (HPET20b). O inventÃ¡rio de telas trata o cadastro de Host como jornada nova ("documentos, fotos e pendente de validaÃ§Ã£o"), sem frames no Figma.
- **LÃ³gica nova:** mÃ¡scara e busca de CEP no ViaCEP (`zip-code.ts`), seleÃ§Ã£o de foto na galeria (`photo-picker.ts`, limite de 5 MB) e validaÃ§Ãµes que espelham o back-end (`validateHostRegistration.ts`). Componentes: `OptionCard`, `SwitchRow`, `FormField`, `PhotoTile`, `HostFormHeader`, `HostTermsNote`. Cinco Ã­cones oficiais novos. DependÃªncia nova: `expo-image-picker ~58.0.10`.
- **NÃ£o fazia ainda (resolvido na entrada seguinte, DT-31):** nenhuma chamada ao back-end, porque as rotas da #325 estavam sÃ³ na branch do back-end.
- **Lacunas entre o protÃ³tipo e o back-end (#325):** para submeter, o back-end exige CPF ou CNPJ, capacidade, espÃ©cies aceitas e os documentos `identity` e `proof_of_address` (mais `cnpj_card` para CNPJ). Essas telas nÃ£o existem no protÃ³tipo. Em sentido contrÃ¡rio, o protÃ³tipo tem estrutura do espaÃ§o, outros pets, experiÃªncia, idosos/medicaÃ§Ã£o e castrados, que o contrato nÃ£o aceita (rejeita campo desconhecido). Ver DT-30.
- **VerificaÃ§Ã£o:** `tsc --noEmit` sem erros; Jest 140 de 140; build web ok; servidor de desenvolvimento compilou sem erro. Dois testes temporÃ¡rios (10 cenÃ¡rios das telas e 8 dos serviÃ§os e validaÃ§Ãµes) passaram e foram removidos. NÃ£o testado no Expo Go (galeria de fotos e busca de CEP em aparelho real).
- **Testes:** nÃ£o foram criados testes Jest do cadastro de Host.
- **Arquivos:** `app/cadastro-host/*`, `app/_layout.tsx`, `app/perfil.tsx`, `context/HostRegistrationContext.tsx`, `constants/hostRegistration.ts`, `constants/theme.ts`, `services/photo-picker.ts`, `services/zip-code.ts`, `utils/formatZipCode.ts`, `utils/validateHostRegistration.ts`, seis componentes novos, `components/Icon.tsx`, `package.json` e `package-lock.json`.
## 2026-11-08: IntegraÃ§Ã£o do cadastro de Host com o back-end (#326)
- **Branch:** `feature/326-implementar-o-cadastro-do-host-no-app`. Sem commit desta parte.
- **Contexto:** a #325 do back-end foi mergeada na `develop` (PR 75) e as rotas jÃ¡ estÃ£o no contrato publicado do Railway. A #326 passou para a Sprint 8.
- **O que mudou:**
  - Rascunho: a etapa 1 salva em `PUT /api/v1/me/host` ao avanÃ§ar; o Perfil busca `GET /api/v1/me/host` e retoma na etapa onde o usuÃ¡rio parou (etapa 2 se a 1 estiver completa, tela de anÃ¡lise se jÃ¡ foi enviado).
  - Envio: "Enviar para anÃ¡lise" salva o rascunho completo, sobe fotos e documentos um por requisiÃ§Ã£o (com progresso) e submete. Em falha, a janela de envio mostra o motivo e "Tentar de novo", que nÃ£o repete o que jÃ¡ subiu. Arquivo recusado pelo servidor mostra o motivo, sem repetir.
  - Erros do servidor: o `VALIDATION_ERROR` por campo aparece no campo certo; os da etapa 1 voltam para ela; `HOST_ALREADY_SUBMITTED` leva Ã  tela de anÃ¡lise.
  - Campos que o back-end exige e o protÃ³tipo nÃ£o tinha: espÃ©cies (cÃ£es e gatos), capacidade, CPF ou CNPJ (com dÃ­gitos verificadores) e documentos (identidade, comprovante de endereÃ§o e, para CNPJ, cartÃ£o CNPJ). Entraram como seÃ§Ãµes nas duas telas, sem design no Figma. O nome do Host Ã© o da conta.
  - Tela de anÃ¡lise mostra pendente, aprovado ou nÃ£o aprovado.
  - DependÃªncia nova: `expo-document-picker ~58.0.4`. Componentes novos: `DocumentRow` e `UploadProgressModal`. `HostInviteCard` ganhou `loading`.
- **Testes novos (3 arquivos, 56 testes):** `host-registration-service-test.ts` (validaÃ§Ãµes, CPF/CNPJ, erros, cliente e fila de envio), `host-registration-test.tsx` (navegaÃ§Ã£o entre etapas, erros do servidor, falha e nova tentativa de upload, retomada e entrada pelo Perfil) e `host-pickers-test.ts` (CEP, foto e documento).
- **VerificaÃ§Ã£o:** `tsc --noEmit` sem erros; Jest 196 de 196; build web ok. **NÃ£o rodei contra o back-end real**, para nÃ£o criar rascunho de Host na conta; sÃ³ com a API mockada. NÃ£o testado no Expo Go (galeria, seletor de arquivos, envio multipart e progresso em aparelho).
- **LimitaÃ§Ãµes:** estrutura do espaÃ§o, outros pets, experiÃªncia, idosos/medicaÃ§Ã£o e castrados nÃ£o tÃªm campo no back-end: nÃ£o sÃ£o enviados nem voltam ao retomar. Foto e documento jÃ¡ enviados nÃ£o podem ser removidos (sem rota). Ao retomar, as fotos do servidor aparecem numa lista Ã  parte, nÃ£o nos espaÃ§os de Sala, Copa e Quintal.
## 2026-11-08: Painel do AnfitriÃ£o (prÃ©via) e teste do cadastro de Host (#326)
- **Branch:** `feature/326-implementar-o-cadastro-do-host-no-app`. Sem commit desta parte.
- **Teste real:** com um e-mail do Gmail o PIN chegou e a conta foi criada. A desenvolvedora fez o cadastro de Host em produÃ§Ã£o, enviou fotos e documentos (o progresso apareceu) e o app respondeu "enviado". O perfil fica `pending`: sÃ³ vira AnfitriÃ£o quando o Administrador aprova (HPET20b), e o back-end ainda nÃ£o tem a rota de aprovaÃ§Ã£o (ela Ã© das tasks #315 e #406, no painel Web).
- **O que mudou:** nova rota `/anfitriao` (Painel do AnfitriÃ£o, esqueleto com dados de exemplo) e `SAMPLE_HOST_PANEL` em `sampleData.ts`. A tela de anÃ¡lise ganhou o botÃ£o "Abrir painel do AnfitriÃ£o" quando o cadastro estÃ¡ aprovado e, sÃ³ em `__DEV__`, o link "Ver prÃ©via do painel do AnfitriÃ£o". Cinco Ã­cones oficiais novos.
- **Base:** casos de uso do mÃ³dulo Host (HPET10a, 10b, 11, 11a, 12, 12a, 12b, 12c, 12d, 12e, 12f, 06b, 06c) e a jornada "J08 â€” OperaÃ§Ã£o Mobile do Host" do inventÃ¡rio de telas, que lista as telas como "novas", sem frames no Figma.
- **DecisÃ£o:** DT-32.
- **VerificaÃ§Ã£o:** `tsc --noEmit` sem erros; Jest 199 de 199 com um teste temporÃ¡rio do painel (removido). Painel nÃ£o testado no Expo Go. Sem testes permanentes do painel.
## 2026-11-08: ValidaÃ§Ã£o do card #326 e integraÃ§Ã£o com a develop (PR)
- **Branch:** `feature/326-implementar-o-cadastro-do-host-no-app`, com a `develop` (`b6eb43b`) mesclada.
- **Card:** o cadastro retoma de onde parou (`GET /me/host`), os erros do servidor aparecem no campo e na etapa certos, a tela de anÃ¡lise aparece depois do envio, o envio mostra progresso e deixa tentar de novo, e hÃ¡ testes de navegaÃ§Ã£o entre etapas e de falha de upload (`host-registration-test.tsx`). Faltam o teste em Android e iOS e a revisÃ£o de design das seÃ§Ãµes que o protÃ³tipo nÃ£o tinha.
- **IntegraÃ§Ã£o com os colegas:** a `develop` trouxe a lista de solicitaÃ§Ãµes do Host (#486) e a decisÃ£o (#492), com `/reservas`, `/reserva-host/[id]` e DT-26 a DT-28. Conflitos resolvidos em `home.tsx` (aba Reservas deles e aba Perfil minha) e nos quatro arquivos de memÃ³ria. Minhas decisÃµes foram renumeradas para DT-29 a DT-32. O Painel do AnfitriÃ£o agora abre a lista real `/reservas`, e a aba Perfil abre `/perfil` tambÃ©m em `/reservas` e `/resultados`.
- **DependÃªncias:** `expo-image-picker` e `expo-document-picker` entraram num commit sÃ³ com `package.json` e `package-lock.json`. A renomeaÃ§Ã£o local `poc-hospetse` para `hospetse` (`app.json` e `package.json`) **nÃ£o** foi enviada, porque muda `slug` e `scheme` do app; fica a cargo da desenvolvedora.
- **Ajustes de revisÃ£o:** Ã¡reas de toque de 44 pt ou mais (remover foto, remover documento, "HÃ¡ outros pets" e botÃ£o de documento); CPF, endereÃ§o, fotos e documentos saem da memÃ³ria assim que o envio dÃ¡ certo.
- **VerificaÃ§Ã£o:** `tsc --noEmit` sem erros; Jest 206 de 206 (inclui os testes dos colegas); build web ok com as rotas `anfitriao`, `analise`, `fotos`, `reservas` e `perfil`. O `expo-doctor` nÃ£o concluiu (travou nas checagens de rede). A desenvolvedora testou o fluxo na web com uma conta real.

## 2026-11-14: CorreÃ§Ãµes da revisÃ£o do PR 81 do cadastro de Host (#326)
- **Objetivo:** tratar os quatro bloqueios do parecer que reprovou o PR 81, sem alterar o back-end (o Auth Service e o back-end principal nÃ£o precisam de mudanÃ§a para este fluxo).
- **Arquivos alterados:** `src/services/host-registration.ts`, `src/app/cadastro-host/index.tsx`, `src/app/cadastro-host/fotos.tsx`, `src/components/DocumentRow.tsx`, `src/constants/hostRegistration.ts`, `src/context/HostRegistrationContext.tsx`, `package.json` e `package-lock.json`.
- **O que mudou:**
  - **Bloqueio 1 (upload multipart):** removido o cabeÃ§alho `Content-Type: multipart/form-data` manual de `uploadHostPhoto` e `uploadHostDocument`. Sem ele, o axios/FormData geram o `Content-Type` com o `boundary` que o multer do back-end precisa. Antes o header manual sobrescrevia o boundary e podia causar 400 no Android e iOS.
  - **Bloqueio 2 (campos descartados):** estrutura, outros pets, experiÃªncia e os dois interruptores (idosos/medicaÃ§Ã£o e castrados) viraram campos **sÃ³ visuais**, com estado local (`useState`) na etapa 1, fora do `HostRegistrationContext` e do rascunho. Continuam na tela e interativos, mas nÃ£o vÃ£o para o back-end nem reaparecem com valor ao retomar (nÃ£o prometem persistÃªncia). DT-33.
  - **Bloqueio 3 (trocar arquivo enviado):** o que jÃ¡ estÃ¡ no servidor nÃ£o pode mais ser trocado. `DocumentRow` mostra a tag "Enviado" e o aviso "Enviado para anÃ¡lise. NÃ£o Ã© possÃ­vel alterar por aqui." no lugar de "Trocar"; a capa fica bloqueada quando jÃ¡ hÃ¡ fotos no servidor, com aviso prÃ³prio. Arquivos escolhidos sÃ³ nesta sessÃ£o continuam trocÃ¡veis/removÃ­veis. DT-33.
  - **Bloqueio 4 (expo-doctor):** `npx expo install --fix` alinhou 11 pacotes ao SDK 58 (expo, expo-blur, expo-constants, expo-document-picker, expo-font, expo-linking, expo-router, expo-secure-store, expo-status-bar, react-native-safe-area-context e jest-expo).
- **DecisÃµes:** DT-33.
- **VerificaÃ§Ã£o:** `expo install --check` diz "up to date"; `expo-doctor` 20/20 (antes 19/20); `tsc --noEmit` sem erros; Jest 206 de 206; `expo export --platform web` ok (o `dist` gerado foi apagado). **NÃ£o testado no Expo Go** (Android/iOS reais): o upload multipart em aparelho continua pendente de validaÃ§Ã£o manual.
- **Ficou pendente:** confirmar com a PO/back-end o destino definitivo dos cinco campos visuais e a remoÃ§Ã£o/substituiÃ§Ã£o de arquivos (bloqueios 2 e 3 pela opÃ§Ã£o A, que exige o back-end); teste em Expo Go real.
- **Commits / PR:** commits `fix:` e `chore:` no branch `feature/326-implementar-o-cadastro-do-host-no-app`, atualizando o PR 81.
## 2026-11-02: Agenda do Host (#483)
- **Objetivo:** permitir que o Host veja dias livres, bloqueados e ocupados e bloqueie/libere perÃ­odos.
- **Branch:** `feature/483-implementar-a-tela-de-agenda-do-host-no-mobile`, a partir da `develop` apÃ³s o PR !78 (`b6eb43b`).
- **Arquivos:** `app/agenda-host.tsx`, `components/HostAgendaCalendar.tsx`, `services/hostAgenda.ts`, `app/reservas.tsx` e `__tests__/host-agenda-test.tsx`.
- **Contrato:** `GET /api/v1/me/host/agenda`, `POST /api/v1/me/host/agenda/blocks` e `DELETE /api/v1/me/host/agenda/blocks/{id}` (#482).
- **DecisÃ£o:** DT-29.
- **VerificaÃ§Ã£o:** `tsc --noEmit` sem erros e 154 de 154 testes passando. Ainda nÃ£o testado no Expo Go.
- **Ficou pendente:** teste manual, commit e PR.

## 2026-11-11: Lista e cadastro de pets (#371)
- **Objetivo:** implementar a lista e o cadastro de pets do Tutor e ligar o fluxo aos pontos existentes de busca, chat e reserva.
- **Arquivos:** criados `src/app/pets.tsx`, `src/app/pets/cadastro.tsx`, `src/components/TutorPetCard.tsx`, `src/constants/pets.ts`, `src/context/PetsContext.tsx` e `src/utils/validatePet.ts`; alterados o cliente de pets, layout, Home, resultados, chat, reserva, SearchModal e dados de exemplo.
- **O que mudou:** a lista usa `GET /api/v1/me/pets`; o cadastro valida e envia todos os campos suportados por `POST /api/v1/me/pets`; o novo pet entra no contexto imediatamente; a busca deixa de usar pets fictÃ­cios; o botÃ£o "Adicionar Pet" da reserva abre o cadastro; estados vazio, carregamento e erro seguem o padrÃ£o das telas existentes.
- **DecisÃµes:** DT-31.
- **VerificaÃ§Ã£o:** `npx tsc --noEmit` passou; `npx expo export --platform web` passou; `npm test -- --runInBand --testTimeout=15000` passou com 16 suÃ­tes e 150 testes.
- **Problemas e soluÃ§Ãµes:** os testes de Home e reserva renderizam telas sem o provider do Expo Router; `usePets` mantÃ©m um valor vazio compatÃ­vel fora do provider, enquanto o app real usa `PetsProvider` no layout. O chat preserva pets de exemplo somente em `__DEV__` para links/testes antigos.
- **Ficou pendente:** validaÃ§Ã£o manual no Expo Go com usuÃ¡rio autenticado e perfil de Tutor concluÃ­do; ediÃ§Ã£o, remoÃ§Ã£o e foto de pet dependem de rotas/modelo no backend.
- **Commits / PR:** ainda nÃ£o commitado nem enviado.

## 2026-11-14: IntegraÃ§Ã£o da tela de Perfil do PR 86
- **Objetivo:** revisar o PR 86 e atualizar a implementaÃ§Ã£o local da #371 para que o Perfil use a lista e o cadastro reais de pets.
- **Arquivos:** adicionados `src/app/perfil.tsx`, `src/components/ProfileMenuItem.tsx` e `src/components/StatusPill.tsx`; alterados `Button`, `Icon`, `theme`, Home, resultados e reservas para suportar a nova rota e navegaÃ§Ã£o.
- **O que mudou:** o Perfil foi incorporado sem a entrada de cadastro de Host; â€œMeus Petsâ€ abre `/pets`; o Perfil, Home e resultados usam `PetsContext` no `SearchModal`; as abas Home, resultados e solicitaÃ§Ãµes conseguem abrir `/perfil`.
- **DecisÃµes:** DT-32.
- **VerificaÃ§Ã£o:** `npx tsc --noEmit` passou; `npm test -- --runInBand --testTimeout=15000` passou com 16 suÃ­tes e 150 testes; `npx expo export --platform web` passou apÃ³s a integraÃ§Ã£o.
- **Ficou pendente:** validar visualmente no Expo Go e decidir a rota de reservas do Tutor.
- **Commits / PR:** nenhuma alteraÃ§Ã£o foi commitada ou enviada.

## 2026-11-14: Minhas contrataÃ§Ãµes no Mobile (#534)
- **Objetivo:** criar a porta de entrada das contrataÃ§Ãµes do Tutor com dados simulados enquanto a API ainda nÃ£o estÃ¡ disponÃ­vel.
- **Arquivos:** criados `src/app/minhas-contratacoes.tsx`, `src/components/TutorReservationCard.tsx` e `src/services/tutorReservations.ts`; alterado `src/app/home.tsx` para o atalho da tela.
- **O que mudou:** estados de carregamento, vazio e erro; cards com Host, pet, perÃ­odo, valor e status; aÃ§Ãµes visuais de pagamento/acompanhamento; atalho para buscar hospedagem no vazio; contrato provisÃ³rio separado do componente visual.
- **DecisÃµes:** DT-34.
- **VerificaÃ§Ã£o:** `npx tsc --noEmit` passou e o teste da Home passou. A integraÃ§Ã£o real nÃ£o foi validada porque a API do backend ainda nÃ£o existe.
- **Ficou pendente:** testes especÃ­ficos da nova tela, integraÃ§Ã£o com a API HSP-PBI-046-TSK-01, pagamento, acompanhamento e chat pela contrataÃ§Ã£o.
- **Commits / PR:** ainda nÃ£o commitado nem enviado.
