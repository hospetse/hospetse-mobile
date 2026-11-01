# Decisões técnicas: Hospetse Mobile

Decisões que afetam tarefas futuras. As decisões de arquitetura do projeto inteiro ficam nas ADRs da Wiki (ADR-001 a ADR-014). Aqui ficam as decisões do mobile e como as ADRs foram aplicadas nele.

**Como registrar:** crie a próxima `DT-NN` no fim da seção certa. Quando uma decisão mudar, não apague a antiga: marque-a como **Substituída por DT-NN** e explique o motivo na nova.

Status possíveis: **Aceita**, **Provisória** (vale até uma condição conhecida), **Substituída**, **A confirmar**.

---

## Interface e estilo

### DT-01: Ícones Material Symbols desenhados com `react-native-svg`
- **Data:** 2026-10-28 · **Task:** #472 · **Status:** Aceita
- **Decisão:** os ícones são os SVG oficiais do Google Material Symbols (Outlined, peso 400, 24px), guardados como caminhos SVG em `ICON_PATHS`, no `src/components/Icon.tsx`. Eles são desenhados com `react-native-svg`, instalado por `npx expo install`.
- **Motivo:** a referência visual usa esses ícones. O `react-native-svg` é a biblioteca indicada pela documentação do Expo 58 e já vem no Expo Go.
- **Alternativas descartadas:**
  - `@expo/vector-icons`: não estava instalado, e o conjunto MaterialIcons dele é o antigo Material Icons, não o Symbols.
  - Glifos Unicode e Views: foi a primeira versão da Home e não ficava igual à referência.
- **Para adicionar um ícone:** baixe `https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/<nome>/default/24px.svg` (ou `fill1/24px.svg` para a versão preenchida) e copie o atributo `d` para `ICON_PATHS`. O `viewBox` é sempre `0 -960 960 960`.

### DT-02: Sombras da Home com `boxShadow`
- **Data:** 2026-10-29 · **Task:** #472 · **Status:** Aceita
- **Decisão:** os componentes da Home usam `boxShadow`, com strings de `theme.shadow`: `soft` (busca, chips inativos e sino), `card`, `bar` (barra inferior) e `active` (brilho laranja do item ativo).
- **Motivo:** a sombra antiga (`shadow*` laranja com 12% de opacidade) não aparecia no fundo pêssego. O React Native 0.88 e o react-native-web 0.21 aceitam `boxShadow`, e o resultado é igual no Android, no iOS e na web.
- **Escopo:** as telas de login, cadastro e código e o `Button` continuam com `shadow*` e `theme.shadow.opacity/radius/elevation`, que não foram alterados. Migrar essas telas exige uma decisão nova.

### DT-03: Regras para os valores do `theme.ts`
- **Data:** 2026-10-28, revisada em 2026-10-29 · **Status:** Aceita
- **Decisão:** valores novos são **acrescentados** ao `theme.ts`, sem mudar os que outras telas usam.
  - Arredondamento total: `radius.round` (999), vindo do PR !18. O `radius.pill` da Home foi trocado por ele no merge de 2026-10-29.
  - `radius.card` = 16, valor do PR !18 (a Home usava 14).
  - Fundo do selo de avaliação: `colors.badge`. O `colors.overlay` (0,25) ficou como estava no PR !18.
- **Motivo:** evitar dois nomes para o mesmo valor e não mudar o visual de telas de outras pessoas.

### DT-04: Medidas da Home proporcionais à tela
- **Data:** 2026-10-28 · **Task:** #472 · **Status:** Aceita
- **Decisão:**
  - A largura dos cards vem de `useWindowDimensions`: 68% da tela em "próximos de você" e 36% em "Mais populares".
  - A altura da foto é proporcional à largura: 0,56 no `PetCard` `large` e 0,95 no `small`.
  - As listas horizontais ocupam a largura toda da tela (margem negativa) e têm padding interno para a sombra dos cards não ser cortada.
- **Motivo:** ficar próximo da referência em telas de tamanhos diferentes, como pede o steering.

## Dados e navegação

### DT-05: Dados da Home fixos no código
- **Data:** 2026-10-28 · **Task:** #472 · **Status:** Provisória (até integrar com a API)
- **Decisão:**
  - Usuário de exemplo, listas `NEARBY_HOTELS` e `POPULAR_HOTELS` e as fotos (URLs do Unsplash e do pravatar) ficam no próprio `home.tsx`.
  - Os filtros são uma lista `{ label, title }`, e o filtro ativo define o título da seção "próximos de você".
  - Os cards **não mudam** com o filtro, porque só o título foi pedido.
- **Ao integrar:** troque as constantes por dados da API e use o `Skeleton` no estado de carregamento.

### DT-06: Fluxos que levam à Home
- **Data:** 2026-10-28, revisada em 2026-10-29 · **Status:** Aceita para o cadastro; a parte do login foi **Substituída por DT-13**
- **Decisão:**
  - **Login** (`index.tsx`): com os campos preenchidos, faz `router.replace('/home')` **sem chamar o Auth**. É provisório, até a integração do login.
  - **Cadastro:** a navegação depois do `register` é a do PR !18, `router.replace({ pathname: '/home', params: { nome } })`, com o primeiro nome. A Home lê o `nome` por `useLocalSearchParams` e, sem ele, usa o nome de exemplo.
  - O `replace` (em vez de `push`) evita que o voltar retorne à tela do código.
- **Histórico:** na primeira versão da #472, a tela de código só fazia `router.replace('/home')`. No merge com a `develop`, ficou a integração com o Auth do PR !18.

### DT-07: Regras herdadas do cadastro (PR !18)
- **Status:** Aceita · **Origem:** PR !18 e ADR-005, ADR-011 e ADR-013
- Os tokens ficam no SecureStore (`token-storage.ts`), nunca em AsyncStorage.
- Os dados do cadastro (inclusive a senha) ficam só em memória, no `SignupContext`, e são limpos ao concluir ou cancelar.
- O cliente do Auth é uma instância do axios com `baseURL` vinda do `EXPO_PUBLIC_AUTH_URL` e `timeout` de 15 s.
- Uma resposta 409 no `request-pin` ou no `register` limpa o cadastro e leva ao login com `aviso=email-cadastrado`.
- O atalho "Abrir Home (temporário)" na `codigo.tsx` só aparece em `__DEV__` e deve sair quando a #261 for integrada.

### DT-13: Login integrado ao Auth
- **Data:** 2026-10-30 · **Task:** #267 · **Status:** Aceita · **Substitui:** a parte do login da DT-06
- **Decisão:** o `index.tsx` chama `login()` (`POST /api/v1/auth/login`), salva os tokens com `saveTokens` e faz `router.replace('/home')`.
  - 401: modal "Login ou senha incorretos", com o texto do design.
  - 403 (cadastro não concluído): modal com o botão "Concluir cadastro", que leva a `/cadastro`.
  - 400: erro no campo de e-mail. Sem resposta: modal "Sem conexão".
- **Motivo:** o login provisório deixava entrar na Home com qualquer senha.
- **Limite conhecido:** o SecureStore não funciona na web, então o login certo só funciona no Android e no iOS.

### DT-14: Validação local dos formulários
- **Data:** 2026-10-30 · **Task:** #267 · **Status:** Aceita
- **Decisão:**
  - O cadastro é uma tela única (nome, e-mail, senha, confirmação e termos), e não três telas separadas.
  - `validateSignup` e `validateLogin` (em `src/utils/`) devolvem um erro por campo. A tela mostra todos juntos, com o `FieldError` embaixo de cada campo, e leva o foco ao primeiro campo com erro.
  - Os limites espelham o Auth (nome e e-mail até 255 caracteres, formato do e-mail). A política da senha é a do app (`isStrongPassword`), porque o Auth ainda não tem uma (#252).
  - A confirmação da senha fica só na tela e não vai para o `SignupContext` nem para a API.
  - Erros do servidor e da conexão aparecem no `ErrorModal`; erros de formato, nunca em modal.
- **Motivo:** critérios de aceite da TSK-09 (#267) e decisão da desenvolvedora pela tela única.

## Configuração

### DT-08: `tsconfig.json`
- **Data:** 2026-10-28, revisada em 2026-10-29 · **Status:** Aceita
- **Decisão:** estende `expo/tsconfig.base` com `strict`, `types: ["jest"]` (vindo do PR !18), `include` explícito (`**/*.ts`, `**/*.tsx`) e alias `@/*` para `./src/*`.
- **Motivo:** no TypeScript 6, `baseUrl` está deprecado e é desnecessário com `moduleResolution: bundler`, por isso o alias funciona sem ele.
- **Observação:** o alias ainda não é usado. Todos os imports são relativos.

## Processo

### DT-09: Git e Pull Requests (ADR-014)
- **Data:** 2026-10-28 · **Status:** Aceita · **Regras completas:** `.kiro/steering/git-workflow.md`
- **Branch:** `feature/<id>-<titulo-em-kebab-case>`, criada a partir da `develop`.
- **Commit:** `<tipo>: <descrição> (#id, AB#id)`, sem coautor.
- **PR:** destino `develop`, revisor que não seja o autor e task vinculada.
  - O título é o do commit principal, **sem** `(#id, AB#id)`, como nos PRs do back-end.
  - A descrição segue o modelo do time: abre com a task e o PBI e tem as seções "O que muda", "Como testar" e "Pendências", acrescentando outras quando for preciso.
- **Conflitos com a `develop`:** traga a `develop` para a branch com `git merge --no-ff`, resolva e faça um commit `chore:`.
- **Lock:** quando o `package-lock.json` tiver conflito, use o lock da `develop` e rode `npm install` para gerar de novo.

### DT-10: Memória persistente do projeto
- **Data:** 2026-10-29 · **Task:** #503 · **Status:** Aceita (versionar no repositório foi aprovado pelo time)
- **Decisão:** a memória do projeto são arquivos Markdown versionados em `docs/memoria/`.
  - O steering `memoria-projeto.md` (sempre incluído) manda ler o `CONTEXTO.md` e o `PROXIMOS_PASSOS.md` antes de cada tarefa e define quando atualizar os registros. Ele não embute o conteúdo dos arquivos, para não gastar contexto em toda mensagem.
  - O `AGENTS.md` ganhou uma seção curta que inclui esse steering (`#[[file:...]]`). Motivo: com o workspace aberto em `HOSPETSE`, só o `hospetse-mobile/AGENTS.md` entrou como regra, e os steerings de `hospetse-mobile/.kiro/steering/` não foram carregados.
  - O steering `retomar-contexto.md` (manual) vira o atalho `/retomar-contexto` quando `hospetse-mobile` é a raiz do workspace.
- **Motivo:** arquivos no repositório viajam com o git, a equipe também consegue ler e funcionam com qualquer ferramenta.
  - A **Memória nativa do Kiro** é opcional e complementar: fica desligada por padrão, guarda tudo localmente para um só usuário e não é compartilhada com o time.
- **Alternativa avaliada:** o **ai-memory** (akitaonrails/ai-memory) **não foi instalado**. Ele exige um servidor local, grava os prompts e as chamadas de ferramenta e tem suporte documentado para o Kiro **CLI**, não para o Kiro IDE.
- **A confirmar:** o steering `hospetse-architecture.md` diz "Não crie pastas fora do diretório `src/`", e `docs/` está fora. Ficou entendido que a regra vale para código. Falta a desenvolvedora confirmar e, se for o caso, ajustar o texto do steering.

## Busca e filtros

### DT-11: A busca é um modal por cima da Home
- **Data:** 2026-10-30 · **Task:** #477 · **Status:** Aceita
- **Decisão:** a busca é o componente `SearchModal` (um `Modal` do React Native, transparente), aberto pela Home, e não uma rota.
  - O campo de busca da Home e a aba Buscar abrem o modal. A aba ativa continua sendo a Home, como no print.
  - O campo da Home virou só um atalho: um `TouchableOpacity` em volta do `SearchBar`, com `pointerEvents: 'none'`. Ele mostra sempre o texto de exemplo (veja a DT-12).
  - Tocar fora do cartão ou no botão voltar do Android fecha o modal.
  - O fundo fica escurecido (`colors.backdrop`) em vez de desfocado como no print. O desfoque exigiria `expo-blur`, e nenhuma dependência é instalada sem autorização.
- **Motivo:** nos prints, a busca aparece por cima da Home, com a barra inferior visível.
- **Alternativa descartada:** uma rota `/buscar` com `presentation: 'transparentModal'`. Daria mais trabalho para manter os filtros entre a Home e a busca.

### DT-12: Regras de estado e de interação da busca
- **Data:** 2026-10-30 · **Task:** #477 · **Status:** Aceita, com dados Provisórios
- **Estado:**
  - Os filtros (`SearchFilters`: cidade, check-in, check-out, serviço e pet) ficam no formulário do modal, em `useState`, e só são enviados ao tocar em "Buscar". Fechar sem buscar descarta tudo.
  - **A cada abertura, a busca começa vazia** (`EMPTY_FILTERS`). O formulário só é montado com o modal aberto.
  - ~~A Home guarda a última busca feita em `lastSearch`, para a tela de resultados (#480).~~ **Revisado em 2026-11-01 (DT-15):** a Home não guarda mais a busca. "Buscar" leva a `/resultados` com os filtros nos parâmetros da rota. O campo de busca da Home não mostra a cidade.
- **Revisão de 2026-10-30:** na primeira versão, o modal reabria com os últimos filtros e o campo da Home mostrava a cidade. A desenvolvedora pediu que a busca reabrisse vazia.
  - O card da #477 pede "filtros mantidos ao voltar dos resultados". Esse caso vai ser tratado na #480: ao voltar dos resultados, abrir a busca com o `lastSearch`.
- **Seções:**
  - Só uma fica aberta por vez, e a primeira a abrir é "Onde?".
  - A seta laranja aparece só nas seções abaixo da aberta, como no protótipo.
  - Escolher uma opção não abre a próxima seção, porque os prints mostram a escolha com a seção ainda aberta.
- **Calendário:**
  - Mostra o mês real, com dias passados desabilitados e setas para trocar de mês. O print começa outubro num domingo, mas o calendário real foi mantido.
  - O primeiro toque marca o check-in e o segundo, depois dele, o check-out. Tocar antes do check-in, ou com o período completo, recomeça a escolha (`selectRangeDay` em `utils/calendar.ts`).
- **Serviço:** um por vez, com os nomes do print: "Pet Hotel", "Pet Walker" e "Pet Sitter". Os chips da Home usam hífen e não estão ligados à busca.
- **Pet:** opcional, e tocar de novo desmarca. Sem pets, a seção mostra um texto, até existirem a tela 08I e os campos de porte e raça.
- **Provisório:** as sugestões de cidade estão fixas no `SearchModal` e os pets de exemplo estão em `PETS`, na Home. Vão ser trocados pela API (#476) e pela lista de pets (#371).

## Resultados e detalhe do Host

### DT-15: A busca vai para os resultados pelos parâmetros da rota
- **Data:** 2026-11-01 · **Task:** #480 · **Status:** Aceita
- **Decisão:** "Buscar", no `SearchModal`, faz `router.push('/resultados')` com `city`, `checkIn` e `checkOut` (`2026-12-18`), `service` e `petId`, sem os campos vazios (`utils/searchParams.ts`). São só valores leves, como pede o steering (seção 6).
  - Nos resultados, o campo e a aba Buscar abrem o modal de novo, e a nova busca troca os parâmetros da mesma tela (`router.setParams`).
  - O título segue o serviço da busca: "1 Pet-Sitter encontrado", "2 Pet-Hotéis encontrados". Sem serviço ou com vários, "N resultados encontrados".
  - Abrir um resultado leva a `/host/[id]` com as datas da busca, para a seção "Disponibilidade".
- **Motivo:** na conferência, "Buscar" só fechava o modal, e o título não mudava com o serviço escolhido.

### DT-16: Filtros dos resultados em tela cheia, feitos na #480
- **Data:** 2026-11-01 · **Task:** #480 (o item "faixa de preço" é da #477) · **Status:** Aceita, com dados Provisórios
- **Decisão:** `FiltersModal` em tela cheia, aberto pelo botão `tune` dos resultados ou por "Ajustar filtros" no estado vazio.
  - Tipo de serviço (um ou mais), porte (um ou mais), preço máximo e comodidades.
  - "Aplicar Filtros" troca a lista. Fechar sem aplicar descarta as mudanças. "Limpar filtros" desmarca tudo, inclusive o serviço que veio da busca.
  - Os filtros valem enquanto a tela de resultados estiver aberta. Uma busca nova recomeça os filtros a partir do serviço dela.
  - **Regras** (`matchesSearch`, em `services/hosts.ts`):
    - Serviço: o Host oferece **algum** dos escolhidos.
    - Porte: o Host aceita **todos** os escolhidos, porque o Tutor pode levar pets de portes diferentes.
    - Preço: o preço do Host é até o máximo escolhido. R$ 400+ significa sem limite.
    - Comodidades: o Host tem **todas** as escolhidas.
    - Cidade: compara sem acento e sem o estado ("Maringá, PR" acha "Maringá").
- **Barra de preço:** `PriceSlider` feita com Views e o sistema de toque do React Native, sem instalar biblioteca. Para o leitor de tela, é `adjustable`, com as ações de aumentar e diminuir.
- **A confirmar:** as regras de porte e de comodidades precisam bater com a rota da #476, quando ela existir.

### DT-17: Dados de exemplo no formato da API, separados do que a API não tem
- **Data:** 2026-11-01 · **Task:** #480 · **Status:** Provisória (até a #476 e a integração da #479)
- **Decisão:** `services/hosts.ts` tem 6 Hosts de exemplo (Maringá, Londrina e Sarandi), com `searchHosts` e `getHostPage`, que são assíncronas como uma chamada real.
  - O detalhe usa o tipo `HostDetails`, igual ao `GET /api/v1/hosts/{id}`.
  - Comodidades, requisitos e rotina ficam em `HostExtras`, porque **a API não tem esses campos**. Precisam ser pedidos ao back-end.
  - O endereço mostra só bairro e cidade, porque a API não manda rua, número nem CEP (LGPD).
  - Os cards da Home abrem o primeiro Host de exemplo.
- **Conflito conhecido:** o critério da #480 pede "sem resultado fictício". Os dados de exemplo valem só até a #476.
- **Para integrar:** trocar o corpo de `searchHosts` e `getHostPage` pelas chamadas ao back-end, com o token do usuário. Não é preciso mudar as telas.

### DT-18: Falha ao salvar os tokens não é falta de conexão
- **Data:** 2026-11-01 · **Task:** #480 (correção no login e no cadastro, da #267) · **Status:** Aceita
- **Decisão:** `isRequestError` (em `services/auth.ts`) separa erro da chamada HTTP de erro de outra etapa, como o SecureStore.
  - No login: "Não foi possível entrar" em vez de "Sem conexão".
  - Na tela do código: a conta já foi criada, então limpa o cadastro e vai ao login com `aviso=conta-criada`.
- **Motivo:** na web, o SecureStore falha, e o app dizia "Sem conexão" mesmo com o servidor respondendo.
- **Limite:** na web, o login continua mostrando "Sem conexão" de verdade, porque o navegador bloqueia a resposta do Auth (CORS). O time de back-end vai tratar isso.
