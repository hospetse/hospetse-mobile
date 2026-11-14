# DecisÃµes tÃ©cnicas: Hospetse Mobile

DecisÃµes que afetam tarefas futuras. As decisÃµes de arquitetura do projeto inteiro ficam nas ADRs da Wiki (ADR-001 a ADR-014). Aqui ficam as decisÃµes do mobile e como as ADRs foram aplicadas nele.

**Como registrar:** crie a prÃ³xima `DT-NN` no fim da seÃ§Ã£o certa. Quando uma decisÃ£o mudar, nÃ£o apague a antiga: marque-a como **SubstituÃ­da por DT-NN** e explique o motivo na nova.

Status possÃ­veis: **Aceita**, **ProvisÃ³ria** (vale atÃ© uma condiÃ§Ã£o conhecida), **SubstituÃ­da**, **A confirmar**.

---

## Interface e estilo

### DT-01: Ãcones Material Symbols desenhados com `react-native-svg`
- **Data:** 2026-10-28 Â· **Task:** #472 Â· **Status:** Aceita
- **DecisÃ£o:** os Ã­cones sÃ£o os SVG oficiais do Google Material Symbols (Outlined, peso 400, 24px), guardados como caminhos SVG em `ICON_PATHS`, no `src/components/Icon.tsx`. Eles sÃ£o desenhados com `react-native-svg`, instalado por `npx expo install`.
- **Motivo:** a referÃªncia visual usa esses Ã­cones. O `react-native-svg` Ã© a biblioteca indicada pela documentaÃ§Ã£o do Expo 58 e jÃ¡ vem no Expo Go.
- **Alternativas descartadas:**
  - `@expo/vector-icons`: nÃ£o estava instalado, e o conjunto MaterialIcons dele Ã© o antigo Material Icons, nÃ£o o Symbols.
  - Glifos Unicode e Views: foi a primeira versÃ£o da Home e nÃ£o ficava igual Ã  referÃªncia.
- **Para adicionar um Ã­cone:** baixe `https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/<nome>/default/24px.svg` (ou `fill1/24px.svg` para a versÃ£o preenchida) e copie o atributo `d` para `ICON_PATHS`. O `viewBox` Ã© sempre `0 -960 960 960`.

### DT-02: Sombras da Home com `boxShadow`
- **Data:** 2026-10-29 Â· **Task:** #472 Â· **Status:** Aceita
- **DecisÃ£o:** os componentes da Home usam `boxShadow`, com strings de `theme.shadow`: `soft` (busca, chips inativos e sino), `card`, `bar` (barra inferior) e `active` (brilho laranja do item ativo).
- **Motivo:** a sombra antiga (`shadow*` laranja com 12% de opacidade) nÃ£o aparecia no fundo pÃªssego. O React Native 0.88 e o react-native-web 0.21 aceitam `boxShadow`, e o resultado Ã© igual no Android, no iOS e na web.
- **Escopo:** as telas de login, cadastro e cÃ³digo e o `Button` continuam com `shadow*` e `theme.shadow.opacity/radius/elevation`, que nÃ£o foram alterados. Migrar essas telas exige uma decisÃ£o nova.

### DT-03: Regras para os valores do `theme.ts`
- **Data:** 2026-10-28, revisada em 2026-10-29 Â· **Status:** Aceita
- **DecisÃ£o:** valores novos sÃ£o **acrescentados** ao `theme.ts`, sem mudar os que outras telas usam.
  - Arredondamento total: `radius.round` (999), vindo do PR !18. O `radius.pill` da Home foi trocado por ele no merge de 2026-10-29.
  - `radius.card` = 16, valor do PR !18 (a Home usava 14).
  - Fundo do selo de avaliaÃ§Ã£o: `colors.badge`. O `colors.overlay` (0,25) ficou como estava no PR !18.
- **Motivo:** evitar dois nomes para o mesmo valor e nÃ£o mudar o visual de telas de outras pessoas.

### DT-04: Medidas da Home proporcionais Ã  tela
- **Data:** 2026-10-28 Â· **Task:** #472 Â· **Status:** Aceita
- **DecisÃ£o:**
  - A largura dos cards vem de `useWindowDimensions`: 68% da tela em "prÃ³ximos de vocÃª" e 36% em "Mais populares".
  - A altura da foto Ã© proporcional Ã  largura: 0,56 no `PetCard` `large` e 0,95 no `small`.
  - As listas horizontais ocupam a largura toda da tela (margem negativa) e tÃªm padding interno para a sombra dos cards nÃ£o ser cortada.
- **Motivo:** ficar prÃ³ximo da referÃªncia em telas de tamanhos diferentes, como pede o steering.

## Dados e navegaÃ§Ã£o

### DT-05: Dados da Home fixos no cÃ³digo
- **Data:** 2026-10-28 Â· **Task:** #472 Â· **Status:** ProvisÃ³ria (atÃ© integrar com a API)
- **DecisÃ£o:**
  - UsuÃ¡rio de exemplo, listas `NEARBY_HOTELS` e `POPULAR_HOTELS` e as fotos (URLs do Unsplash e do pravatar) ficam no prÃ³prio `home.tsx`.
  - Os filtros sÃ£o uma lista `{ label, title }`, e o filtro ativo define o tÃ­tulo da seÃ§Ã£o "prÃ³ximos de vocÃª".
  - Os cards **nÃ£o mudam** com o filtro, porque sÃ³ o tÃ­tulo foi pedido.
- **Ao integrar:** troque as constantes por dados da API e use o `Skeleton` no estado de carregamento.

### DT-06: Fluxos que levam Ã  Home
- **Data:** 2026-10-28, revisada em 2026-10-29 Â· **Status:** Aceita para o cadastro; a parte do login foi **SubstituÃ­da por DT-13**
- **DecisÃ£o:**
  - **Login** (`index.tsx`): com os campos preenchidos, faz `router.replace('/home')` **sem chamar o Auth**. Ã‰ provisÃ³rio, atÃ© a integraÃ§Ã£o do login.
  - **Cadastro:** a navegaÃ§Ã£o depois do `register` Ã© a do PR !18, `router.replace({ pathname: '/home', params: { nome } })`, com o primeiro nome. A Home lÃª o `nome` por `useLocalSearchParams` e, sem ele, usa o nome de exemplo.
  - O `replace` (em vez de `push`) evita que o voltar retorne Ã  tela do cÃ³digo.
- **HistÃ³rico:** na primeira versÃ£o da #472, a tela de cÃ³digo sÃ³ fazia `router.replace('/home')`. No merge com a `develop`, ficou a integraÃ§Ã£o com o Auth do PR !18.

### DT-07: Regras herdadas do cadastro (PR !18)
- **Status:** Aceita Â· **Origem:** PR !18 e ADR-005, ADR-011 e ADR-013
- Os tokens ficam no SecureStore (`token-storage.ts`), nunca em AsyncStorage.
- Os dados do cadastro (inclusive a senha) ficam sÃ³ em memÃ³ria, no `SignupContext`, e sÃ£o limpos ao concluir ou cancelar.
- O cliente do Auth Ã© uma instÃ¢ncia do axios com `baseURL` vinda do `EXPO_PUBLIC_AUTH_URL` e `timeout` de 15 s.
- Uma resposta 409 no `request-pin` ou no `register` limpa o cadastro e leva ao login com `aviso=email-cadastrado`.
- O atalho "Abrir Home (temporÃ¡rio)" na `codigo.tsx` sÃ³ aparece em `__DEV__` e deve sair quando a #261 for integrada.

### DT-13: Login integrado ao Auth
- **Data:** 2026-10-30 Â· **Task:** #267 Â· **Status:** Aceita Â· **Substitui:** a parte do login da DT-06
- **DecisÃ£o:** o `index.tsx` chama `login()` (`POST /api/v1/auth/login`), salva os tokens com `saveTokens` e faz `router.replace('/home')`.
  - 401: modal "Login ou senha incorretos", com o texto do design.
  - 403 (cadastro nÃ£o concluÃ­do): modal com o botÃ£o "Concluir cadastro", que leva a `/cadastro`.
  - 400: erro no campo de e-mail. Sem resposta: modal "Sem conexÃ£o".
- **Motivo:** o login provisÃ³rio deixava entrar na Home com qualquer senha.
- **Limite conhecido:** o SecureStore nÃ£o funciona na web, entÃ£o o login certo sÃ³ funciona no Android e no iOS.

### DT-14: ValidaÃ§Ã£o local dos formulÃ¡rios
- **Data:** 2026-10-30 Â· **Task:** #267 Â· **Status:** Aceita
- **DecisÃ£o:**
  - O cadastro Ã© uma tela Ãºnica (nome, e-mail, senha, confirmaÃ§Ã£o e termos), e nÃ£o trÃªs telas separadas.
  - `validateSignup` e `validateLogin` (em `src/utils/`) devolvem um erro por campo. A tela mostra todos juntos, com o `FieldError` embaixo de cada campo, e leva o foco ao primeiro campo com erro.
  - Os limites espelham o Auth (nome e e-mail atÃ© 255 caracteres, formato do e-mail). A polÃ­tica da senha Ã© a do app (`isStrongPassword`), porque o Auth ainda nÃ£o tem uma (#252).
  - A confirmaÃ§Ã£o da senha fica sÃ³ na tela e nÃ£o vai para o `SignupContext` nem para a API.
  - Erros do servidor e da conexÃ£o aparecem no `ErrorModal`; erros de formato, nunca em modal.
- **Motivo:** critÃ©rios de aceite da TSK-09 (#267) e decisÃ£o da desenvolvedora pela tela Ãºnica.

## ConfiguraÃ§Ã£o

### DT-08: `tsconfig.json`
- **Data:** 2026-10-28, revisada em 2026-10-29 Â· **Status:** Aceita
- **DecisÃ£o:** estende `expo/tsconfig.base` com `strict`, `types: ["jest"]` (vindo do PR !18), `include` explÃ­cito (`**/*.ts`, `**/*.tsx`) e alias `@/*` para `./src/*`.
- **Motivo:** no TypeScript 6, `baseUrl` estÃ¡ deprecado e Ã© desnecessÃ¡rio com `moduleResolution: bundler`, por isso o alias funciona sem ele.
- **ObservaÃ§Ã£o:** o alias ainda nÃ£o Ã© usado. Todos os imports sÃ£o relativos.

## Processo

### DT-09: Git e Pull Requests (ADR-014)
- **Data:** 2026-10-28 Â· **Status:** Aceita Â· **Regras completas:** `.kiro/steering/git-workflow.md`
- **Branch:** `feature/<id>-<titulo-em-kebab-case>`, criada a partir da `develop`.
- **Commit:** `<tipo>: <descriÃ§Ã£o> (#id, AB#id)`, sem coautor.
- **PR:** destino `develop`, revisor que nÃ£o seja o autor e task vinculada.
  - O tÃ­tulo Ã© o do commit principal, **sem** `(#id, AB#id)`, como nos PRs do back-end.
  - A descriÃ§Ã£o segue o modelo do time: abre com a task e o PBI e tem as seÃ§Ãµes "O que muda", "Como testar" e "PendÃªncias", acrescentando outras quando for preciso.
- **Conflitos com a `develop`:** traga a `develop` para a branch com `git merge --no-ff`, resolva e faÃ§a um commit `chore:`.
- **Lock:** quando o `package-lock.json` tiver conflito, use o lock da `develop` e rode `npm install` para gerar de novo.

### DT-10: MemÃ³ria persistente do projeto
- **Data:** 2026-10-29 Â· **Task:** #503 Â· **Status:** Aceita (versionar no repositÃ³rio foi aprovado pelo time)
- **DecisÃ£o:** a memÃ³ria do projeto sÃ£o arquivos Markdown versionados em `docs/memoria/`.
  - O steering `memoria-projeto.md` (sempre incluÃ­do) manda ler o `CONTEXTO.md` e o `PROXIMOS_PASSOS.md` antes de cada tarefa e define quando atualizar os registros. Ele nÃ£o embute o conteÃºdo dos arquivos, para nÃ£o gastar contexto em toda mensagem.
  - O `AGENTS.md` ganhou uma seÃ§Ã£o curta que inclui esse steering (`#[[file:...]]`). Motivo: com o workspace aberto em `HOSPETSE`, sÃ³ o `hospetse-mobile/AGENTS.md` entrou como regra, e os steerings de `hospetse-mobile/.kiro/steering/` nÃ£o foram carregados.
  - O steering `retomar-contexto.md` (manual) vira o atalho `/retomar-contexto` quando `hospetse-mobile` Ã© a raiz do workspace.
- **Motivo:** arquivos no repositÃ³rio viajam com o git, a equipe tambÃ©m consegue ler e funcionam com qualquer ferramenta.
  - A **MemÃ³ria nativa do Kiro** Ã© opcional e complementar: fica desligada por padrÃ£o, guarda tudo localmente para um sÃ³ usuÃ¡rio e nÃ£o Ã© compartilhada com o time.
- **Alternativa avaliada:** o **ai-memory** (akitaonrails/ai-memory) **nÃ£o foi instalado**. Ele exige um servidor local, grava os prompts e as chamadas de ferramenta e tem suporte documentado para o Kiro **CLI**, nÃ£o para o Kiro IDE.
- **A confirmar:** o steering `hospetse-architecture.md` diz "NÃ£o crie pastas fora do diretÃ³rio `src/`", e `docs/` estÃ¡ fora. Ficou entendido que a regra vale para cÃ³digo. Falta a desenvolvedora confirmar e, se for o caso, ajustar o texto do steering.

## Busca e filtros

### DT-11: A busca Ã© um modal por cima da Home
- **Data:** 2026-10-30 Â· **Task:** #477 Â· **Status:** Aceita
- **DecisÃ£o:** a busca Ã© o componente `SearchModal` (um `Modal` do React Native, transparente), aberto pela Home, e nÃ£o uma rota.
  - O campo de busca da Home e a aba Buscar abrem o modal. A aba ativa continua sendo a Home, como no print.
  - O campo da Home virou sÃ³ um atalho: um `TouchableOpacity` em volta do `SearchBar`, com `pointerEvents: 'none'`. Ele mostra sempre o texto de exemplo (veja a DT-12).
  - Tocar fora do cartÃ£o ou no botÃ£o voltar do Android fecha o modal.
  - O fundo fica escurecido (`colors.backdrop`) em vez de desfocado como no print. O desfoque exigiria `expo-blur`, e nenhuma dependÃªncia Ã© instalada sem autorizaÃ§Ã£o.
- **Motivo:** nos prints, a busca aparece por cima da Home, com a barra inferior visÃ­vel.
- **Alternativa descartada:** uma rota `/buscar` com `presentation: 'transparentModal'`. Daria mais trabalho para manter os filtros entre a Home e a busca.

### DT-12: Regras de estado e de interaÃ§Ã£o da busca
- **Data:** 2026-10-30 Â· **Task:** #477 Â· **Status:** Aceita, com dados ProvisÃ³rios
- **Estado:**
  - Os filtros (`SearchFilters`: cidade, check-in, check-out, serviÃ§o e pet) ficam no formulÃ¡rio do modal, em `useState`, e sÃ³ sÃ£o enviados ao tocar em "Buscar". Fechar sem buscar descarta tudo.
  - **A cada abertura, a busca comeÃ§a vazia** (`EMPTY_FILTERS`). O formulÃ¡rio sÃ³ Ã© montado com o modal aberto.
  - ~~A Home guarda a Ãºltima busca feita em `lastSearch`, para a tela de resultados (#480).~~ **Revisado em 2026-11-01 (DT-15):** a Home nÃ£o guarda mais a busca. "Buscar" leva a `/resultados` com os filtros nos parÃ¢metros da rota. O campo de busca da Home nÃ£o mostra a cidade.
- **RevisÃ£o de 2026-10-30:** na primeira versÃ£o, o modal reabria com os Ãºltimos filtros e o campo da Home mostrava a cidade. A desenvolvedora pediu que a busca reabrisse vazia.
  - O card da #477 pede "filtros mantidos ao voltar dos resultados". Esse caso vai ser tratado na #480: ao voltar dos resultados, abrir a busca com o `lastSearch`.
- **SeÃ§Ãµes:**
  - SÃ³ uma fica aberta por vez, e a primeira a abrir Ã© "Onde?".
  - A seta laranja aparece sÃ³ nas seÃ§Ãµes abaixo da aberta, como no protÃ³tipo.
  - Escolher uma opÃ§Ã£o nÃ£o abre a prÃ³xima seÃ§Ã£o, porque os prints mostram a escolha com a seÃ§Ã£o ainda aberta.
- **CalendÃ¡rio:**
  - Mostra o mÃªs real, com dias passados desabilitados e setas para trocar de mÃªs. O print comeÃ§a outubro num domingo, mas o calendÃ¡rio real foi mantido.
  - O primeiro toque marca o check-in e o segundo, depois dele, o check-out. Tocar antes do check-in, ou com o perÃ­odo completo, recomeÃ§a a escolha (`selectRangeDay` em `utils/calendar.ts`).
- **ServiÃ§o:** um por vez, com os nomes do print: "Pet Hotel", "Pet Walker" e "Pet Sitter". Os chips da Home usam hÃ­fen e nÃ£o estÃ£o ligados Ã  busca.
- **Pet:** opcional, e tocar de novo desmarca. Sem pets, a seÃ§Ã£o mostra um texto, atÃ© existirem a tela 08I e os campos de porte e raÃ§a.
- **ProvisÃ³rio:** as sugestÃµes de cidade estÃ£o fixas no `SearchModal` e os pets de exemplo estÃ£o em `PETS`, na Home. VÃ£o ser trocados pela API (#476) e pela lista de pets (#371).

## Resultados e detalhe do Host

### DT-15: A busca vai para os resultados pelos parÃ¢metros da rota
- **Data:** 2026-11-01 Â· **Task:** #480 Â· **Status:** Aceita
- **DecisÃ£o:** "Buscar", no `SearchModal`, faz `router.push('/resultados')` com `city`, `checkIn` e `checkOut` (`2026-12-18`), `service` e `petId`, sem os campos vazios (`utils/searchParams.ts`). SÃ£o sÃ³ valores leves, como pede o steering (seÃ§Ã£o 6).
  - Nos resultados, o campo e a aba Buscar abrem o modal de novo, e a nova busca troca os parÃ¢metros da mesma tela (`router.setParams`).
  - O tÃ­tulo segue o serviÃ§o da busca: "1 Pet-Sitter encontrado", "2 Pet-HotÃ©is encontrados". Sem serviÃ§o ou com vÃ¡rios, "N resultados encontrados".
  - Abrir um resultado leva a `/host/[id]` com as datas da busca, para a seÃ§Ã£o "Disponibilidade".
- **Motivo:** na conferÃªncia, "Buscar" sÃ³ fechava o modal, e o tÃ­tulo nÃ£o mudava com o serviÃ§o escolhido.

### DT-16: Filtros dos resultados em tela cheia, feitos na #480
- **Data:** 2026-11-01 Â· **Task:** #480 (o item "faixa de preÃ§o" Ã© da #477) Â· **Status:** Aceita, com dados ProvisÃ³rios
- **DecisÃ£o:** `FiltersModal` em tela cheia, aberto pelo botÃ£o `tune` dos resultados ou por "Ajustar filtros" no estado vazio.
  - Tipo de serviÃ§o (um ou mais), porte (um ou mais), preÃ§o mÃ¡ximo e comodidades.
  - "Aplicar Filtros" troca a lista. Fechar sem aplicar descarta as mudanÃ§as. "Limpar filtros" desmarca tudo, inclusive o serviÃ§o que veio da busca.
  - Os filtros valem enquanto a tela de resultados estiver aberta. Uma busca nova recomeÃ§a os filtros a partir do serviÃ§o dela.
  - **Regras** (`matchesSearch`, em `services/hosts.ts`):
    - ServiÃ§o: o Host oferece **algum** dos escolhidos.
    - Porte: o Host aceita **todos** os escolhidos, porque o Tutor pode levar pets de portes diferentes.
    - PreÃ§o: o preÃ§o do Host Ã© atÃ© o mÃ¡ximo escolhido. R$ 400+ significa sem limite.
    - Comodidades: o Host tem **todas** as escolhidas.
    - Cidade: compara sem acento e sem o estado ("MaringÃ¡, PR" acha "MaringÃ¡").
- **Barra de preÃ§o:** `PriceSlider` feita com Views e o sistema de toque do React Native, sem instalar biblioteca. Para o leitor de tela, Ã© `adjustable`, com as aÃ§Ãµes de aumentar e diminuir.
- **A confirmar:** as regras de porte e de comodidades precisam bater com a rota da #476, quando ela existir.

### DT-17: Dados de exemplo no formato da API, separados do que a API nÃ£o tem
- **Data:** 2026-11-01 Â· **Task:** #480 Â· **Status:** ProvisÃ³ria (atÃ© a #476 e a integraÃ§Ã£o da #479)
- **DecisÃ£o:** `services/hosts.ts` tem 6 Hosts de exemplo (MaringÃ¡, Londrina e Sarandi), com `searchHosts` e `getHostPage`, que sÃ£o assÃ­ncronas como uma chamada real.
  - O detalhe usa o tipo `HostDetails`, igual ao `GET /api/v1/hosts/{id}`.
  - Comodidades, requisitos e rotina ficam em `HostExtras`, porque **a API nÃ£o tem esses campos**. Precisam ser pedidos ao back-end.
  - O endereÃ§o mostra sÃ³ bairro e cidade, porque a API nÃ£o manda rua, nÃºmero nem CEP (LGPD).
  - Os cards da Home abrem o primeiro Host de exemplo.
- **Conflito conhecido:** o critÃ©rio da #480 pede "sem resultado fictÃ­cio". Os dados de exemplo valem sÃ³ atÃ© a #476.
- **Para integrar:** trocar o corpo de `searchHosts` e `getHostPage` pelas chamadas ao back-end, com o token do usuÃ¡rio. NÃ£o Ã© preciso mudar as telas.

### DT-18: Falha ao salvar os tokens nÃ£o Ã© falta de conexÃ£o
- **Data:** 2026-11-01 Â· **Task:** #480 (correÃ§Ã£o no login e no cadastro, da #267) Â· **Status:** Aceita
- **DecisÃ£o:** `isRequestError` (em `services/auth.ts`) separa erro da chamada HTTP de erro de outra etapa, como o SecureStore.
  - No login: "NÃ£o foi possÃ­vel entrar" em vez de "Sem conexÃ£o".
  - Na tela do cÃ³digo: a conta jÃ¡ foi criada, entÃ£o limpa o cadastro e vai ao login com `aviso=conta-criada`.
- **Motivo:** na web, o SecureStore falha, e o app dizia "Sem conexÃ£o" mesmo com o servidor respondendo.
- **Limite:** na web, o login continua mostrando "Sem conexÃ£o" de verdade, porque o navegador bloqueia a resposta do Auth (CORS). O time de back-end vai tratar isso.

## IntegraÃ§Ã£o com o back-end

### DT-19: Cliente do back-end com renovaÃ§Ã£o do token em fila Ãºnica
- **Data:** 2026-11-01 Â· **Task:** #518 Â· **Status:** Aceita
- **DecisÃ£o:** `backendApi` (axios, em `services/api.ts`) com `baseURL` vinda de `EXPO_PUBLIC_API_URL`.
  - Toda chamada leva `Authorization: Bearer <accessToken>`, lido do SecureStore.
  - Um 401 do back-end renova o token pelo `POST /api/v1/auth/refresh`, salva os tokens novos e repete a chamada **uma vez**.
  - **Fila Ãºnica:** a variÃ¡vel `refreshing` guarda a renovaÃ§Ã£o em andamento, e as outras chamadas esperam por ela. O refresh token vale uma vez sÃ³, e usÃ¡-lo duas vezes derruba todas as sessÃµes da conta (regra da Wiki do back-end).
  - Refresh recusado (400 ou 401) ou sem refresh token: apaga os tokens e leva ao login com `aviso=sessao-expirada`. Falha de rede no refresh nÃ£o encerra a sessÃ£o.
- **Motivo:** o access token vence em 15 minutos.
- **Limite:** na web nÃ£o hÃ¡ SecureStore, entÃ£o nÃ£o hÃ¡ token. A busca e o detalhe levam ao login. Para testar, use o Expo Go.

### DT-20: Busca e detalhe com dados reais; filtros que a API nÃ£o aceita ficam sem efeito
- **Data:** 2026-11-01 Â· **Task:** #518 Â· **Status:** Aceita (filtros ProvisÃ³rios)
- **DecisÃ£o:** `searchHosts` chama `GET /api/v1/hosts/search` e `getHostPage` chama `GET /api/v1/hosts/{id}`. SaÃ­ram os 6 Hosts de exemplo (substitui a DT-17 nesses dois pontos).
  - A cidade vai sem o estado ("MaringÃ¡, PR" vira "MaringÃ¡"), porque a API compara a cidade inteira.
  - As datas vÃ£o como `startDate` e `endDate`, sempre as duas juntas.
  - O preÃ§o mÃ¡ximo vai como `maxPrice`.
  - O pet vai como `petId` sÃ³ se o id for um UUID (os pets de exemplo ficam de fora).
  - O porte vai como `size` sÃ³ com **um** porte marcado, porque a API aceita um sÃ³.
  - `pageSize` Ã© 50, sem paginaÃ§Ã£o na tela por enquanto. O tÃ­tulo usa o `total` da API.
  - **Sem efeito por enquanto (decisÃ£o da desenvolvedora):** tipo de serviÃ§o, comodidades e vÃ¡rios portes continuam na tela, mas nÃ£o vÃ£o para a busca. O back-end vai acrescentar esses filtros depois.
  - Comodidades, requisitos e rotina do detalhe continuam de exemplo (`HostExtras`), porque a API nÃ£o tem esses campos.
  - Card sem foto (`pictureUrl: null`) mostra um fundo neutro.
- **Erros da busca:** sem rede, 400 (filtro recusado, como data no passado) e outros, todos com "Tentar de novo".
## Detalhe do Host
### DT-21: Rotina em modal que sobe por baixo, com etapas de exemplo
- **Data:** 2026-11-01 Â· **Task:** #519 Â· **Status:** Aceita (dados ProvisÃ³rios)
- **DecisÃ£o:** o "Ler mais" da Rotina abre o `RoutineModal` (`Modal` do React Native, `transparent` e `animationType="slide"`). Ele fecha pelo botÃ£o "Fechar", pelo toque no fundo escuro e pelo voltar do Android (`onRequestClose`). Antes, o "Ler mais" sÃ³ mostrava o resto da lista.
  - O detalhe continua mostrando o resumo (`routine`, atÃ© 4 itens). O modal usa `routineSteps`, com perÃ­odo (manhÃ£, tarde ou noite), horÃ¡rio, tÃ­tulo e descriÃ§Ã£o.
  - Cada etapa Ã© lida inteira pelo leitor de tela, num sÃ³ `accessibilityLabel`.
  - `routineSteps` e o texto da garantia sÃ£o de exemplo, porque a API nÃ£o tem esses campos. O texto da garantia precisa ser confirmado com a PO.
- **Motivo:** seguir o protÃ³tipo e a task, sem biblioteca de bottom sheet (o `Modal` jÃ¡ vem no React Native e funciona no Expo Go).
## Chat
### DT-22: Chat com o Host como rota, com conversa de exemplo e sem contato direto
- **Data:** 2026-11-01 Â· **Task:** #520 Â· **Status:** Aceita (dados ProvisÃ³rios)
- **DecisÃ£o:** o chat Ã© a rota `/chat/[id]`, com o id do Host, aberta pelo "Tire suas dÃºvidas" do detalhe.
  - Recebe o mesmo contexto da busca que o detalhe: `checkIn`, `checkOut` e `petId`. Para isso, os resultados passaram a mandar o `petId` ao detalhe.
  - Busca o Host pelo `getHostPage` (nome, foto e preÃ§o), seguindo a regra de passar sÃ³ o id pela rota.
  - A faixa "Interesse em reservar" mostra as datas, o total (diÃ¡ria mais barata vezes as noites) e o pet. Sem datas, mostra o preÃ§o da diÃ¡ria. "Ver detalhes" volta ao detalhe.
  - A conversa comeÃ§a com `SAMPLE_CHAT` (`constants/sampleChat.ts`). Enviar uma mensagem ou tocar numa sugestÃ£o sÃ³ acrescenta a mensagem do Tutor no fim da tela, sem resposta.
  - O status "Online" do Host Ã© de exemplo. "Mais opÃ§Ãµes", anexo e microfone ainda nÃ£o tÃªm aÃ§Ã£o.
  - **Sem botÃ£o de ligar** e sem telefone ou e-mail do Host (decisÃ£o de 25/10/2026, confirmada pela desenvolvedora em 2026-11-01).
  - Teclado: a primeira versÃ£o usava o `KeyboardAvoidingView`, mas no iPhone da desenvolvedora o teclado continuou cobrindo as mensagens. **SubstituÃ­da** por um cÃ¡lculo na prÃ³pria tela:
    - A parte coberta pelo teclado (altura da tela, medida no `onLayout`, menos o `screenY` do topo do teclado) vira `paddingBottom` da tela. Se a tela jÃ¡ encolher sozinha, a conta dÃ¡ 0 e a margem nÃ£o dobra.
    - iOS: eventos `keyboardWillShow` e `keyboardWillHide`, com a animaÃ§Ã£o do teclado (`Keyboard.scheduleLayoutAnimation`).
    - Android: eventos `keyboardDidShow` e `keyboardDidHide`. No Expo Go em tela cheia (edge-to-edge), a tela **nÃ£o** encolhe sozinha, e o teclado cobria o campo e as mensagens.
    - A lista rola atÃ© o fim quando muda de tamanho (`onLayout`) e quando chega mensagem nova. Com o teclado aberto, o campo perde a margem da Ã¡rea segura. Arrastar a conversa para baixo fecha o teclado (`keyboardDismissMode="interactive"`).
- **Motivo:** as rotas de conversa (#209, #219 e #220) ainda nÃ£o existem.
## SolicitaÃ§Ã£o de hospedagem
### DT-23: ConfirmaÃ§Ã£o, sucesso e erros da reserva numa rota sÃ³
- **Data:** 2026-11-01 Â· **Task:** #495 Â· **Status:** Aceita (partes ProvisÃ³rias)
- **DecisÃ£o:** a rota `/reserva/[id]` (id do Host, com `checkIn`, `checkOut` e `petId` da busca) mostra a confirmaÃ§Ã£o e, depois do envio, a tela de sucesso no lugar dela. Assim a resposta da API nÃ£o precisa ir por parÃ¢metro de rota.
  - Dados reais: Host pelo `GET /api/v1/hosts/{id}`, pets pelo `GET /api/v1/me/pets` (#369) e envio pelo `POST /api/v1/reservations` (#494) com o serviÃ§o mais barato do Host.
  - **Toque duplo:** um `ref` trava o envio na hora e o botÃ£o fica em carregamento. A `Idempotency-Key` fica guardada enquanto o pet e as datas nÃ£o mudam: nova tentativa repete a mesma chave e o back-end devolve a mesma solicitaÃ§Ã£o. Trocar o pet ou as datas gera chave nova.
  - **Erros do back-end:** `PERIOD_UNAVAILABLE` e `NO_CAPACITY` abrem "Data indisponÃ­vel"; `PROFILE_INCOMPLETE` abre "Cadastro Incompleto"; `PET_ALREADY_BOOKED` e `VALIDATION_ERROR` de `petId`, `startDate` ou `endDate` aparecem embaixo do campo; o resto, e a falta de rede, abre "Algo deu errado". A validaÃ§Ã£o local (`validateReservation`) repete as regras do back-end antes do envio.
  - **ProvisÃ³rio (decisÃµes da desenvolvedora):** os serviÃ§os adicionais ficam na tela, mas nÃ£o somam no total nem vÃ£o na solicitaÃ§Ã£o, porque a API nÃ£o tem esse campo. "Adicionar Pet" e "Ver minhas reservas" estÃ£o sem aÃ§Ã£o (o cadastro de pet e a tela de Reservas nÃ£o existem). "Completar Cadastro" sÃ³ fecha o aviso (a conclusÃ£o do perfil nÃ£o existe). Os horÃ¡rios "A partir das 14:00" e "AtÃ© Ã s 12:00" sÃ£o de exemplo.
  - Os pets da API nÃ£o tÃªm foto: o `PetOption` passou a aceitar `imageUri: null` e mostra a patinha.
  - "Voltar para InÃ­cio" usa `router.dismissTo('/home')`.

## SessÃ£o e perfil

### DT-24: Tokens em memÃ³ria no Web e perfil carregado apÃ³s cadastro
- **Data:** 2026-11-02 Â· **Task:** #269 Â· **Status:** Aceita
- **DecisÃ£o:** Android e iOS continuam usando `expo-secure-store` para os tokens. Na Web, `token-storage.web.ts` mantÃ©m access token e refresh token apenas em memÃ³ria, sem `localStorage`, `sessionStorage` ou IndexedDB; atualizar a pÃ¡gina encerra a sessÃ£o. ApÃ³s o `register`, a tela do PIN consulta `GET /api/v1/me`, guarda o retorno em `SessionContext` e sÃ³ entÃ£o apresenta a confirmaÃ§Ã£o antes de levar Ã  Home.
- **Motivo:** permite visualizar e testar o fluxo no navegador sem persistir segredo em armazenamento acessÃ­vel por JavaScript. O perfil e permissÃµes vÃªm do back-end, nÃ£o do JWT.
- **Limite:** a sessÃ£o Web nÃ£o sobrevive ao reload. PersistÃªncia Web exige uma decisÃ£o futura para refresh via cookie HttpOnly e proteÃ§Ã£o CSRF.

### DT-25: Logout sÃ³ local, sem rota no Auth
- **Data:** 2026-11-04 Â· **Task:** #300 Â· **Status:** Aceita
- **DecisÃ£o:** `logout()` no `SessionContext` apaga os tokens (SecureStore no Android e iOS, memÃ³ria na Web) e limpa o usuÃ¡rio em memÃ³ria. A Home e os resultados mostram "Sair" no `UserHeader`, que leva ao login com `router.replace('/')`. O `logout()` nunca lanÃ§a erro: se o armazenamento falhar, o usuÃ¡rio em memÃ³ria Ã© limpo mesmo assim.
- **SessÃ£o expirada:** continua no `api.ts` (DT-19). Quando o login recebe `aviso=sessao-expirada`, limpa o usuÃ¡rio em memÃ³ria.
- **Motivo:** a #297 (logout com revogaÃ§Ã£o do refresh token no Auth) foi removida em 2026-10-29, e o Auth nÃ£o tem rota de logout. Registrado em comentÃ¡rio na #300.
- **Risco aceito:** depois do logout, o refresh token continua vÃ¡lido no servidor atÃ© expirar (30 dias).
## Avisos da solicitaÃ§Ã£o
### DT-24: Avisos de pet nÃ£o permitido e data indisponÃ­vel seguindo o protÃ³tipo
- **Data:** 2026-11-01 Â· **Task:** #489 Â· **Status:** Em validaÃ§Ã£o visual
- **DecisÃ£o:** o `ErrorModal` usa o mesmo padrÃ£o visual dos avisos do protÃ³tipo: fundo escurecido com blur, card branco centralizado com largura limitada, sombra, Ã­cone Material Symbols `pet_supplies`, tÃ­tulo, mensagem e botÃ£o laranja.
  - O Ã­cone substitui a imagem `assets/pets.png` nesse componente. O path oficial veio do Material Symbols Outlined.
  - `VALIDATION_ERROR` com `petId` abre "Pet nÃ£o permitido" em modal, com "Infelizmente o Host nÃ£o aceita esse tipo de pet.". `PERIOD_UNAVAILABLE` e `NO_CAPACITY` continuam abrindo "Data indisponÃ­vel".
  - `PET_ALREADY_BOOKED` continua como erro abaixo dos pets, porque significa conflito do pet no perÃ­odo, nÃ£o incompatibilidade com o Host.
- **DependÃªncia:** `expo-blur` instalado na versÃ£o compatÃ­vel com o Expo SDK 58. DocumentaÃ§Ã£o consultada: [Expo BlurView](https://docs.expo.dev/versions/v58.0.0/sdk/blur-view/).
## Fluxo do prestador
### DT-26: Lista de solicitaÃ§Ãµes pendentes do Host adaptada da lista do Tutor
- **Data:** 2026-11-02 Â· **Task:** #486 Â· **Status:** Em validaÃ§Ã£o
- **DecisÃ£o:** a aba "Reservas" abre a rota `/reservas`, que consulta `GET /api/v1/me/host/reservations` com `status=requested`, `page=1` e `pageSize=20`.
  - A tela usa o visual da lista de reservas do Tutor, adaptado ao Host: tÃ­tulo "SolicitaÃ§Ãµes pendentes", total aguardando resposta e cards com status, Tutor, pet, perÃ­odo, valor e observaÃ§Ãµes.
  - O card mostra porte/raÃ§a quando existirem, sem exibir telefone, e-mail ou outros dados do Tutor que a API nÃ£o fornece.
  - HÃ¡ carregamento, estado vazio, erro com retry e atualizaÃ§Ã£o por gesto de puxar a lista.
  - Aceitar e recusar ficam fora da #486. A task apenas permite tocar no card para a futura tela de detalhe/decisÃ£o do PBI #042.
  - UsuÃ¡rios que nÃ£o sÃ£o Host recebem uma mensagem de acesso nÃ£o habilitado quando a API responde 403.
- **Motivo:** iniciar o fluxo do prestador pela fila de solicitaÃ§Ãµes, cuja rota e dependÃªncia #485 jÃ¡ estÃ£o prontas, sem presumir as aÃ§Ãµes transacionais da #491.
### DT-27: Ãrea segura e data da solicitaÃ§Ã£o no fuso local
- **Data:** 2026-11-02 Â· **Task:** #486 Â· **Status:** Em validaÃ§Ã£o
- **DecisÃ£o:** a tela `/reservas` usa `SafeAreaView` do `react-native-safe-area-context`, compatÃ­vel com iOS e Android. O timestamp `createdAt`, enviado em UTC, passa por `new Date()` antes de virar texto, para o dia seguir o fuso local do aparelho. NÃ£o se deve cortar os primeiros 10 caracteres do timestamp.
## DecisÃ£o do Host
### DT-28: Aceite e recusa de solicitaÃ§Ã£o em detalhe prÃ³prio
- **Data:** 2026-11-02 Â· **Task:** #492 Â· **Status:** Em validaÃ§Ã£o
- **DecisÃ£o:** tocar um card da fila `/reservas` abre `/reserva-host/[id]`. A nova tela busca a solicitaÃ§Ã£o na pÃ¡gina pendente do Host, usando apenas o id leve na rota; nÃ£o foi inventado um GET individual que o back-end ainda nÃ£o possui.
  - O Host confirma o aceite ou a recusa em modal prÃ³prio. A recusa exige motivo aparado, entre 1 e 500 caracteres.
  - Aceite: `POST /api/v1/me/host/reservations/:id/accept`. Recusa: `POST /api/v1/me/host/reservations/:id/reject` com `{ reason }`.
  - Em sucesso, a tela volta para `/reservas`, que consulta a fila novamente. Conflitos e indisponibilidade sÃ£o exibidos com mensagem compreensÃ­vel.
  - Os dados mÃ©dicos e comportamentais do pet aparecem no detalhe quando a API os retornar.
- **Motivo:** completar o fluxo iniciado pela #486, sem misturar as aÃ§Ãµes transacionais com a lista nem criar uma rota de detalhe inexistente no back-end.
## Perfil
### DT-29: Perfil como rota prÃ³pria, com dados parciais e entrada do cadastro de Host
- **Data:** 2026-11-07 Â· **Task:** #326 Â· **Status:** Aceita (esqueleto)
- **DecisÃ£o:** `/perfil` Ã© uma rota do Stack, aberta por `router.push` na aba Perfil da Home. No Perfil, a aba Home usa `router.dismissTo('/home')`, a aba Buscar abre o `SearchModal` por cima e a aba Reservas abre `/reservas` (as solicitaÃ§Ãµes do Host, #486). O Perfil mostra "Sair da conta" com o logout local da DT-25.
  - **Esqueleto:** a tela Ã© sÃ³ a estrutura do Perfil, nÃ£o a versÃ£o final. O objetivo Ã© dar ao usuÃ¡rio comum a entrada "Quero ser Host". Os textos do menu sÃ£o de exemplo e quase todos os botÃµes nÃ£o tÃªm aÃ§Ã£o. A tela final virÃ¡ em outra task.
  - **Dados:** o Perfil mostra sÃ³ o que o cadastro coleta (nome e e-mail, do `/me`) e nunca dados inventados: sem sessÃ£o, aparece "UsuÃ¡rio" e nenhum e-mail. O cadastro nÃ£o tem foto, entÃ£o o avatar Ã© um Ã­cone. Telefone, cidade, selo de verificaÃ§Ã£o, pets de exemplo e a troca de foto nÃ£o entram; a troca de foto fica na futura tela de editar perfil. Os textos do menu sÃ£o de exemplo.
  - **Perfil do usuÃ¡rio comum:** a tela nÃ£o Ã© especÃ­fica de Tutor nem de Host, e o tÃ­tulo Ã© "Meu Perfil". "Minhas Reservas" saiu do menu (jÃ¡ existe a aba Reservas). O Ãºltimo item do menu depende do `profile.status` do `/me`: `incomplete` mostra "Completar perfil" com o selo "Pendente"; `complete` mostra "Editar perfil". Ainda sem aÃ§Ã£o, atÃ© existir a tela de ediÃ§Ã£o.
  - **Entrada do cadastro de Host:** o `HostInviteCard` fica entre "Meus Pets" e "Minha conta". O botÃ£o "Quero ser Host" ainda nÃ£o tem aÃ§Ã£o: a primeira etapa do cadastro (#326) vai ser ligada ali. O card aparece para todo usuÃ¡rio, porque o `/me` ainda nÃ£o informa se ele jÃ¡ Ã© Host.
  - **Tema:** cores e tamanhos novos entraram no `theme.ts`, sem hexadecimal nos componentes. O cinza `textMuted` (`#6B6B6B`) tem contraste AA no branco; o `placeholder` nÃ£o tem.
  - **Barra de abas:** o protÃ³tipo tem 5 abas (com "Mensagens"). O app mantÃ©m as 4 abas atuais, porque nÃ£o hÃ¡ tela de mensagens.
  - **VersÃ£o do app:** o rodapÃ© lÃª a versÃ£o do `app.json` por `expo-constants`, em vez do texto fixo do protÃ³tipo.
- **Limite:** "Meus Pets" e "Quero ser Host" aparecem para todo usuÃ¡rio, porque o `/me` ainda nÃ£o informa papÃ©is. "Meus Pets" nÃ£o mostra os pets reais.
### DT-30: Cadastro de Host em trÃªs rotas, com estado em memÃ³ria e sem chamar o back-end
- **Data:** 2026-11-07 Â· **Task:** #326 Â· **Status:** Aceita, exceto o "sem chamar o back-end" e as lacunas, substituÃ­dos pela DT-31
- **DecisÃ£o:** o cadastro tem trÃªs rotas: `/cadastro-host` (espaÃ§o), `/cadastro-host/fotos` (fotos e localizaÃ§Ã£o) e `/cadastro-host/analise` (tela final). Os dados passam entre elas pelo `HostRegistrationContext`, sÃ³ em memÃ³ria, apagado ao concluir, ao sair da conta e ao fechar o app.
  - **Tela final:** "Cadastro enviado para anÃ¡lise", com o selo "Pendente de validaÃ§Ã£o". O texto segue US-HPET10-01 (perfil "pendente de validaÃ§Ã£o", sem reservas antes da aprovaÃ§Ã£o) e US-HPET20B (aparece nas buscas sÃ³ depois de aprovado; rejeiÃ§Ã£o avisa com o motivo). O botÃ£o "Enviar para anÃ¡lise" da etapa 2 substitui o "AvanÃ§ar para fotos e EndereÃ§o" repetido do protÃ³tipo. A tela bloqueia o gesto e o botÃ£o voltar do Android, para nÃ£o reabrir as etapas.
  - **Esqueleto de integraÃ§Ã£o:** o envio ainda nÃ£o chama o back-end, porque as rotas da #325 nÃ£o estÃ£o publicadas (sÃ³ na branch `feature/325-...`). Os pontos de ligaÃ§Ã£o estÃ£o marcados com `shortcut:` em `fotos.tsx` e `ESQUELETO` nos arquivos das telas.
  - **CEP:** a busca usa o ViaCEP, serviÃ§o pÃºblico de terceiros (`axios` prÃ³prio, sem o token do Hospetse). SÃ³ os 8 dÃ­gitos saem do aparelho, e a resposta Ã© validada antes de usar. Bairro e cidade/UF vÃªm do CEP e ficam bloqueados; o bairro libera quando o CEP nÃ£o o traz. Mudar o CEP depois da busca exige buscar de novo.
  - **Fotos:** `expo-image-picker` (mÃ³dulo do Expo Go, sem permissÃ£o para a galeria do sistema). Limite de 5 MB por foto, igual ao back-end. O tipo do arquivo fica para o back-end, que confere pelo conteÃºdo.
  - **Mapa:** o protÃ³tipo mostra um mapa. Foi trocado por um bloco com o aviso "Apenas bairro e raio aproximado (500m) aparecem na busca", porque um mapa nativo exigiria development build.
- **Lacunas a resolver com a PO e o Lucas (#325):**
  - Faltam no protÃ³tipo: CPF ou CNPJ, capacidade, espÃ©cies aceitas (cÃ£o e gato) e os documentos `identity`, `proof_of_address` e `cnpj_card`. Sem eles, `POST /me/host/submit` devolve 400.
  - Sem campo no contrato (que rejeita campo desconhecido): estrutura do espaÃ§o, outros pets, experiÃªncia, idosos/medicaÃ§Ã£o e castrados.
  - `name` Ã© obrigatÃ³rio no back-end; a tela nÃ£o pergunta (sugestÃ£o: usar o nome do cadastro).
  - O texto do interruptor "Aceita animais castrados?" ("Requer mais atenÃ§Ã£o com marcaÃ§Ã£o de territÃ³rio") parece descrever animais nÃ£o castrados. Copiado como estÃ¡ no protÃ³tipo.
### DT-31: IntegraÃ§Ã£o do cadastro de Host com a #325, com retomada, progresso e nova tentativa
- **Data:** 2026-11-08 Â· **Task:** #326 Â· **Status:** Em validaÃ§Ã£o (sÃ³ com a API mockada)
- **DecisÃ£o:** o cadastro usa as rotas da #325 pelo `backendApi`: `GET` e `PUT /api/v1/me/host`, `POST .../photos`, `POST .../documents` e `POST .../submit`. Substitui o "sem chamar o back-end" e as lacunas da DT-30.
  - **Rascunho retomÃ¡vel:** a etapa 1 salva ao avanÃ§ar. O Perfil lÃª o cadastro e abre a etapa onde o Host parou: etapa 2 se a 1 estiver completa (com a 1 por baixo, para o voltar), tela de anÃ¡lise se jÃ¡ foi enviado. O CPF ou CNPJ volta mascarado (`***4725`): em branco, o do servidor Ã© mantido.
  - **Envio em fila:** `submitHostRegistration` salva o rascunho completo, sobe um arquivo por requisiÃ§Ã£o (capa primeiro, porque o back-end usa a primeira foto como principal) e submete. Para na primeira falha e informa a fase e o arquivo. Nova tentativa salva o rascunho de novo (idempotente) e pula os arquivos jÃ¡ enviados, guardados no contexto como "campo|arquivo" -> id. Trocar o arquivo do campo envia de novo.
  - **Erros do servidor** (`toHostError`): `VALIDATION_ERROR` por campo vai para o campo da tela, e os da etapa 1 voltam para ela; `HOST_ALREADY_SUBMITTED` leva Ã  anÃ¡lise; `STORAGE_UNAVAILABLE`, `HOST_DRAFT_CONFLICT` e falta de rede permitem tentar de novo; `FILE_LIMIT_REACHED` e arquivo recusado nÃ£o (Ã© preciso trocar o arquivo).
  - **Campos que o protÃ³tipo nÃ£o tinha** e o back-end exige para submeter: espÃ©cies, capacidade, CPF ou CNPJ e documentos. Foram acrescentados como seÃ§Ãµes nas duas telas, sem design no Figma, e precisam de revisÃ£o da UX/PO. Usei o nome da conta como `name`.
  - **Documentos:** `expo-document-picker` (PDF, JPEG ou PNG, atÃ© 10 MB). Foto e documento seguem o limite do back-end, que confere o tipo pelo conteÃºdo.
  - **Multipart:** `FormData` com o campo `type` (documentos) antes do `file`, `Content-Type: multipart/form-data` sem boundary (o React Native completa) e timeout de 60 s por arquivo.
- **NÃ£o persiste no back-end:** estrutura do espaÃ§o, outros pets, experiÃªncia, idosos/medicaÃ§Ã£o e castrados. Ficam no app, nÃ£o sÃ£o enviados e se perdem ao retomar. DecisÃ£o pendente com a PO e o Lucas.
- **Limites:** sem rota para remover foto ou documento jÃ¡ enviado; fotos do servidor aparecem numa lista Ã  parte ao retomar. NÃ£o foi testado contra o back-end real nem em aparelho.
### DT-32: Painel do AnfitriÃ£o como esqueleto, aberto sÃ³ com o cadastro aprovado
- **Data:** 2026-11-08 Â· **Task:** #326 Â· **Status:** Em validaÃ§Ã£o visual
- **DecisÃ£o:** a interface do AnfitriÃ£o Ã© a rota `/anfitriao`. Os documentos de produto nÃ£o trazem telas do Host (o inventÃ¡rio lista a jornada J08 como "nova", sem frames no Figma); a estrutura vem dos casos de uso do mÃ³dulo Host: solicitaÃ§Ãµes (HPET12, 12a), hospedagem ativa (12b, 12c, 12d), agenda (11), preÃ§os (11a), financeiro e repasse (12e, 12f), Assistente de IA e conversas escaladas (06b, 06c) e perfil (10a, 10b).
  - **Quando abre:** o botÃ£o "Abrir painel do AnfitriÃ£o" aparece na tela de anÃ¡lise sÃ³ com `validationStatus = approved`. Em `__DEV__` hÃ¡ tambÃ©m um link de prÃ©via, porque a aprovaÃ§Ã£o Ã© do Administrador e o back-end ainda nÃ£o tem a rota de aprovaÃ§Ã£o (tasks #315 e #406, no Web).
  - **Modo:** o mesmo usuÃ¡rio pode ser Tutor e Host (o schema permite). O painel tem "Voltar ao modo Tutor".
  - **Esqueleto:** ganhos, saldo e hospedagens ativas sÃ£o de exemplo (`SAMPLE_HOST_PANEL`). SÃ³ "SolicitaÃ§Ãµes de reserva" tem tela: abre `/reservas`, a lista real feita na #486 (e a decisÃ£o da #492). Os outros 6 acessos ainda nÃ£o fazem nada. Rotas do back-end que jÃ¡ existem para ligar depois: `GET/POST/DELETE /me/host/agenda`.
- **Limite:** o Perfil ainda mostra "Quero ser Host" para quem jÃ¡ Ã© Host aprovado (o `/me` nÃ£o informa o papel); o botÃ£o leva Ã  tela de anÃ¡lise, que entÃ£o mostra o botÃ£o do painel.

### DT-33: Campos visuais e bloqueio de troca de arquivos no cadastro de Host (revisÃ£o do PR 81)
- **Data:** 2026-11-14 Â· **Task:** #326 Â· **Status:** ProvisÃ³ria (atÃ© o back-end suportar os campos e a substituiÃ§Ã£o de arquivos â€” opÃ§Ã£o A, que depende da PO e das tasks de back-end)
- **Contexto:** a revisÃ£o do PR 81 apontou que a tela coletava campos que o back-end nÃ£o recebe e oferecia "Trocar" para arquivos que o back-end nÃ£o substitui. O back-end nÃ£o foi alterado (o parecer confirma que o Auth Service nÃ£o precisa de mudanÃ§a para este fluxo).
- **DecisÃ£o (campos visuais):** estrutura do espaÃ§o, "hÃ¡ outros pets", experiÃªncia e os dois interruptores (idosos/medicaÃ§Ã£o e castrados) continuam na etapa 1 como controles interativos, mas em **estado local** (`useState`) da tela `cadastro-host/index.tsx`, nÃ£o no `HostRegistrationContext` nem no rascunho. Assim nÃ£o vÃ£o para o `PUT /api/v1/me/host` e nÃ£o reaparecem com valor ao retomar â€” evita a impressÃ£o falsa de que foram salvos. As constantes `SPACE_STRUCTURES` e `EXPERIENCES` seguem em `constants/hostRegistration.ts`.
- **DecisÃ£o (troca de arquivos):** o que jÃ¡ estÃ¡ no servidor nÃ£o pode ser trocado por aqui, porque o back-end sÃ³ adiciona (nÃ£o remove nem substitui). `DocumentRow` troca o botÃ£o "Trocar" por uma tag "Enviado" e um aviso quando o documento jÃ¡ foi enviado e nÃ£o hÃ¡ arquivo novo na sessÃ£o; a capa fica bloqueada quando `serverPhotos` nÃ£o estÃ¡ vazio (a primeira foto do servidor continua sendo a capa). Arquivos escolhidos sÃ³ na sessÃ£o atual continuam trocÃ¡veis/removÃ­veis.
- **Alternativa descartada (por ora):** opÃ§Ã£o A dos dois casos â€” persistir os campos no contrato e implementar remoÃ§Ã£o/substituiÃ§Ã£o de arquivos no back-end. Fica para quando a PO e as tasks de back-end definirem.
## Agenda do Host
### DT-29: Agenda mensal do Host com bloqueio e desbloqueio
- **Data:** 2026-11-02 Â· **Task:** #483 Â· **Status:** Em validaÃ§Ã£o
- **DecisÃ£o:** a aba Reservas mantÃ©m a fila de solicitaÃ§Ãµes e ganha a entrada "Gerenciar disponibilidade", que abre `/agenda-host`.
  - A tela consulta `GET /api/v1/me/host/agenda` para o mÃªs visÃ­vel e mostra os estados `free`, `blocked` e `occupied`, alÃ©m da capacidade do Host e uma legenda.
  - Dia livre inicia a seleÃ§Ã£o de intervalo; ao completar o perÃ­odo, a tela pede um motivo opcional e chama `POST /api/v1/me/host/agenda/blocks`.
  - Dia bloqueado abre confirmaÃ§Ã£o e chama `DELETE /api/v1/me/host/agenda/blocks/{id}`. Dia ocupado nÃ£o pode ser bloqueado e mostra aviso.
  - O calendÃ¡rio foi criado especificamente para a agenda porque o `Calendar` existente seleciona datas da busca e nÃ£o possui estados de agenda.
- **Motivo:** seguir o contrato da #482 sem biblioteca externa, mantendo a estÃ©tica da fila do Host e deixando as aÃ§Ãµes de aceitar/recusar separadas.
### DT-31: Pets reais compartilhados pelo contexto do Tutor
- **Data:** 2026-11-11 Â· **Task:** #371 Â· **Status:** Aceita
- **DecisÃ£o:** a lista de pets do Tutor fica em `PetsContext`, carregado pelo `GET /api/v1/me/pets` apÃ³s a sessÃ£o existir. A Home, os resultados, o chat e a reserva consomem os pets reais; a rota `/pets` lista os pets e `/pets/cadastro` cria um pet pelo `POST /api/v1/me/pets`.
- **Limites:** fotos de pets ainda nÃ£o existem no contrato do backend.

### DT-32: Perfil estÃ¡tico integrado Ã  lista de pets
- **Data:** 2026-11-14 Â· **PR:** #86 Â· **Status:** ProvisÃ³ria
- **DecisÃ£o:** a rota `/perfil` usa o `PetsContext`. O card â€œMeus Petsâ€ abre `/pets`, o estado vazio da busca abre `/pets/cadastro`, e o Perfil passa pets reais ao `SearchModal` em vez de pets de exemplo.
- **Limites:** os menus de conta e a rota de reservas do Tutor continuam fora do escopo disponÃ­vel.

### DT-33: Gerenciamento de pets no card e exclusÃ£o lÃ³gica
- **Data:** 2026-11-14 Â· **Task:** #371 Â· **Status:** Aceita
- **DecisÃ£o:** os cards da lista exibem aÃ§Ãµes de editar e excluir. Editar reutiliza `/pets/cadastro?id=<petId>` e excluir pede confirmaÃ§Ã£o no app. O backend atualiza pets ativos com `PUT /api/v1/me/pets/:id` e desativa pets com `DELETE /api/v1/me/pets/:id`.
- **Motivo:** manter o histÃ³rico das reservas; a exclusÃ£o remove o pet apenas da lista de ativos.

### DT-34: ContrataÃ§Ãµes do Tutor com contrato simulado
- **Data:** 2026-11-14 Â· **Task:** #534 Â· **Status:** ProvisÃ³ria
- **DecisÃ£o:** a rota `/minhas-contratacoes` comeÃ§a com dados simulados no formato previsto para a futura API. A tela jÃ¡ define estados de carregamento, vazio, erro, status e aÃ§Ãµes por contrataÃ§Ã£o.
- **Limite:** pagamento, acompanhamento, chat a partir da contrataÃ§Ã£o e a listagem real dependem das tasks de backend HSP-PBI-046-TSK-01 e relacionadas.
