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

## Integração com o back-end

### DT-19: Cliente do back-end com renovação do token em fila única
- **Data:** 2026-11-01 · **Task:** #518 · **Status:** Aceita
- **Decisão:** `backendApi` (axios, em `services/api.ts`) com `baseURL` vinda de `EXPO_PUBLIC_API_URL`.
  - Toda chamada leva `Authorization: Bearer <accessToken>`, lido do SecureStore.
  - Um 401 do back-end renova o token pelo `POST /api/v1/auth/refresh`, salva os tokens novos e repete a chamada **uma vez**.
  - **Fila única:** a variável `refreshing` guarda a renovação em andamento, e as outras chamadas esperam por ela. O refresh token vale uma vez só, e usá-lo duas vezes derruba todas as sessões da conta (regra da Wiki do back-end).
  - Refresh recusado (400 ou 401) ou sem refresh token: apaga os tokens e leva ao login com `aviso=sessao-expirada`. Falha de rede no refresh não encerra a sessão.
- **Motivo:** o access token vence em 15 minutos.
- **Limite:** na web não há SecureStore, então não há token. A busca e o detalhe levam ao login. Para testar, use o Expo Go.

### DT-20: Busca e detalhe com dados reais; filtros que a API não aceita ficam sem efeito
- **Data:** 2026-11-01 · **Task:** #518 · **Status:** Aceita (filtros Provisórios)
- **Decisão:** `searchHosts` chama `GET /api/v1/hosts/search` e `getHostPage` chama `GET /api/v1/hosts/{id}`. Saíram os 6 Hosts de exemplo (substitui a DT-17 nesses dois pontos).
  - A cidade vai sem o estado ("Maringá, PR" vira "Maringá"), porque a API compara a cidade inteira.
  - As datas vão como `startDate` e `endDate`, sempre as duas juntas.
  - O preço máximo vai como `maxPrice`.
  - O pet vai como `petId` só se o id for um UUID (os pets de exemplo ficam de fora).
  - O porte vai como `size` só com **um** porte marcado, porque a API aceita um só.
  - `pageSize` é 50, sem paginação na tela por enquanto. O título usa o `total` da API.
  - **Sem efeito por enquanto (decisão da desenvolvedora):** tipo de serviço, comodidades e vários portes continuam na tela, mas não vão para a busca. O back-end vai acrescentar esses filtros depois.
  - Comodidades, requisitos e rotina do detalhe continuam de exemplo (`HostExtras`), porque a API não tem esses campos.
  - Card sem foto (`pictureUrl: null`) mostra um fundo neutro.
- **Erros da busca:** sem rede, 400 (filtro recusado, como data no passado) e outros, todos com "Tentar de novo".
## Detalhe do Host
### DT-21: Rotina em modal que sobe por baixo, com etapas de exemplo
- **Data:** 2026-11-01 · **Task:** #519 · **Status:** Aceita (dados Provisórios)
- **Decisão:** o "Ler mais" da Rotina abre o `RoutineModal` (`Modal` do React Native, `transparent` e `animationType="slide"`). Ele fecha pelo botão "Fechar", pelo toque no fundo escuro e pelo voltar do Android (`onRequestClose`). Antes, o "Ler mais" só mostrava o resto da lista.
  - O detalhe continua mostrando o resumo (`routine`, até 4 itens). O modal usa `routineSteps`, com período (manhã, tarde ou noite), horário, título e descrição.
  - Cada etapa é lida inteira pelo leitor de tela, num só `accessibilityLabel`.
  - `routineSteps` e o texto da garantia são de exemplo, porque a API não tem esses campos. O texto da garantia precisa ser confirmado com a PO.
- **Motivo:** seguir o protótipo e a task, sem biblioteca de bottom sheet (o `Modal` já vem no React Native e funciona no Expo Go).
## Chat
### DT-22: Chat com o Host como rota, com conversa de exemplo e sem contato direto
- **Data:** 2026-11-01 · **Task:** #520 · **Status:** Aceita (dados Provisórios)
- **Decisão:** o chat é a rota `/chat/[id]`, com o id do Host, aberta pelo "Tire suas dúvidas" do detalhe.
  - Recebe o mesmo contexto da busca que o detalhe: `checkIn`, `checkOut` e `petId`. Para isso, os resultados passaram a mandar o `petId` ao detalhe.
  - Busca o Host pelo `getHostPage` (nome, foto e preço), seguindo a regra de passar só o id pela rota.
  - A faixa "Interesse em reservar" mostra as datas, o total (diária mais barata vezes as noites) e o pet. Sem datas, mostra o preço da diária. "Ver detalhes" volta ao detalhe.
  - A conversa começa com `SAMPLE_CHAT` (`constants/sampleChat.ts`). Enviar uma mensagem ou tocar numa sugestão só acrescenta a mensagem do Tutor no fim da tela, sem resposta.
  - O status "Online" do Host é de exemplo. "Mais opções", anexo e microfone ainda não têm ação.
  - **Sem botão de ligar** e sem telefone ou e-mail do Host (decisão de 25/10/2026, confirmada pela desenvolvedora em 2026-11-01).
  - Teclado: a primeira versão usava o `KeyboardAvoidingView`, mas no iPhone da desenvolvedora o teclado continuou cobrindo as mensagens. **Substituída** por um cálculo na própria tela:
    - A parte coberta pelo teclado (altura da tela, medida no `onLayout`, menos o `screenY` do topo do teclado) vira `paddingBottom` da tela. Se a tela já encolher sozinha, a conta dá 0 e a margem não dobra.
    - iOS: eventos `keyboardWillShow` e `keyboardWillHide`, com a animação do teclado (`Keyboard.scheduleLayoutAnimation`).
    - Android: eventos `keyboardDidShow` e `keyboardDidHide`. No Expo Go em tela cheia (edge-to-edge), a tela **não** encolhe sozinha, e o teclado cobria o campo e as mensagens.
    - A lista rola até o fim quando muda de tamanho (`onLayout`) e quando chega mensagem nova. Com o teclado aberto, o campo perde a margem da área segura. Arrastar a conversa para baixo fecha o teclado (`keyboardDismissMode="interactive"`).
- **Motivo:** as rotas de conversa (#209, #219 e #220) ainda não existem.
## Solicitação de hospedagem
### DT-23: Confirmação, sucesso e erros da reserva numa rota só
- **Data:** 2026-11-01 · **Task:** #495 · **Status:** Aceita (partes Provisórias)
- **Decisão:** a rota `/reserva/[id]` (id do Host, com `checkIn`, `checkOut` e `petId` da busca) mostra a confirmação e, depois do envio, a tela de sucesso no lugar dela. Assim a resposta da API não precisa ir por parâmetro de rota.
  - Dados reais: Host pelo `GET /api/v1/hosts/{id}`, pets pelo `GET /api/v1/me/pets` (#369) e envio pelo `POST /api/v1/reservations` (#494) com o serviço mais barato do Host.
  - **Toque duplo:** um `ref` trava o envio na hora e o botão fica em carregamento. A `Idempotency-Key` fica guardada enquanto o pet e as datas não mudam: nova tentativa repete a mesma chave e o back-end devolve a mesma solicitação. Trocar o pet ou as datas gera chave nova.
  - **Erros do back-end:** `PERIOD_UNAVAILABLE` e `NO_CAPACITY` abrem "Data indisponível"; `PROFILE_INCOMPLETE` abre "Cadastro Incompleto"; `PET_ALREADY_BOOKED` e `VALIDATION_ERROR` de `petId`, `startDate` ou `endDate` aparecem embaixo do campo; o resto, e a falta de rede, abre "Algo deu errado". A validação local (`validateReservation`) repete as regras do back-end antes do envio.
  - **Provisório (decisões da desenvolvedora):** os serviços adicionais ficam na tela, mas não somam no total nem vão na solicitação, porque a API não tem esse campo. "Adicionar Pet" e "Ver minhas reservas" estão sem ação (o cadastro de pet e a tela de Reservas não existem). "Completar Cadastro" só fecha o aviso (a conclusão do perfil não existe). Os horários "A partir das 14:00" e "Até às 12:00" são de exemplo.
  - Os pets da API não têm foto: o `PetOption` passou a aceitar `imageUri: null` e mostra a patinha.
  - "Voltar para Início" usa `router.dismissTo('/home')`.

## Sessão e perfil

### DT-24: Tokens em memória no Web e perfil carregado após cadastro
- **Data:** 2026-11-02 · **Task:** #269 · **Status:** Aceita
- **Decisão:** Android e iOS continuam usando `expo-secure-store` para os tokens. Na Web, `token-storage.web.ts` mantém access token e refresh token apenas em memória, sem `localStorage`, `sessionStorage` ou IndexedDB; atualizar a página encerra a sessão. Após o `register`, a tela do PIN consulta `GET /api/v1/me`, guarda o retorno em `SessionContext` e só então apresenta a confirmação antes de levar à Home.
- **Motivo:** permite visualizar e testar o fluxo no navegador sem persistir segredo em armazenamento acessível por JavaScript. O perfil e permissões vêm do back-end, não do JWT.
- **Limite:** a sessão Web não sobrevive ao reload. Persistência Web exige uma decisão futura para refresh via cookie HttpOnly e proteção CSRF.

### DT-25: Logout só local, sem rota no Auth
- **Data:** 2026-11-04 · **Task:** #300 · **Status:** Aceita
- **Decisão:** `logout()` no `SessionContext` apaga os tokens (SecureStore no Android e iOS, memória na Web) e limpa o usuário em memória. A Home e os resultados mostram "Sair" no `UserHeader`, que leva ao login com `router.replace('/')`. O `logout()` nunca lança erro: se o armazenamento falhar, o usuário em memória é limpo mesmo assim.
- **Sessão expirada:** continua no `api.ts` (DT-19). Quando o login recebe `aviso=sessao-expirada`, limpa o usuário em memória.
- **Motivo:** a #297 (logout com revogação do refresh token no Auth) foi removida em 2026-10-29, e o Auth não tem rota de logout. Registrado em comentário na #300.
- **Risco aceito:** depois do logout, o refresh token continua válido no servidor até expirar (30 dias).
## Avisos da solicitação
### DT-24: Avisos de pet não permitido e data indisponível seguindo o protótipo
- **Data:** 2026-11-01 · **Task:** #489 · **Status:** Em validação visual
- **Decisão:** o `ErrorModal` usa o mesmo padrão visual dos avisos do protótipo: fundo escurecido com blur, card branco centralizado com largura limitada, sombra, ícone Material Symbols `pet_supplies`, título, mensagem e botão laranja.
  - O ícone substitui a imagem `assets/pets.png` nesse componente. O path oficial veio do Material Symbols Outlined.
  - `VALIDATION_ERROR` com `petId` abre "Pet não permitido" em modal, com "Infelizmente o Host não aceita esse tipo de pet.". `PERIOD_UNAVAILABLE` e `NO_CAPACITY` continuam abrindo "Data indisponível".
  - `PET_ALREADY_BOOKED` continua como erro abaixo dos pets, porque significa conflito do pet no período, não incompatibilidade com o Host.
- **Dependência:** `expo-blur` instalado na versão compatível com o Expo SDK 58. Documentação consultada: [Expo BlurView](https://docs.expo.dev/versions/v58.0.0/sdk/blur-view/).
## Fluxo do prestador
### DT-26: Lista de solicitações pendentes do Host adaptada da lista do Tutor
- **Data:** 2026-11-02 · **Task:** #486 · **Status:** Em validação
- **Decisão:** a aba "Reservas" abre a rota `/reservas`, que consulta `GET /api/v1/me/host/reservations` com `status=requested`, `page=1` e `pageSize=20`.
  - A tela usa o visual da lista de reservas do Tutor, adaptado ao Host: título "Solicitações pendentes", total aguardando resposta e cards com status, Tutor, pet, período, valor e observações.
  - O card mostra porte/raça quando existirem, sem exibir telefone, e-mail ou outros dados do Tutor que a API não fornece.
  - Há carregamento, estado vazio, erro com retry e atualização por gesto de puxar a lista.
  - Aceitar e recusar ficam fora da #486. A task apenas permite tocar no card para a futura tela de detalhe/decisão do PBI #042.
  - Usuários que não são Host recebem uma mensagem de acesso não habilitado quando a API responde 403.
- **Motivo:** iniciar o fluxo do prestador pela fila de solicitações, cuja rota e dependência #485 já estão prontas, sem presumir as ações transacionais da #491.
### DT-27: Área segura e data da solicitação no fuso local
- **Data:** 2026-11-02 · **Task:** #486 · **Status:** Em validação
- **Decisão:** a tela `/reservas` usa `SafeAreaView` do `react-native-safe-area-context`, compatível com iOS e Android. O timestamp `createdAt`, enviado em UTC, passa por `new Date()` antes de virar texto, para o dia seguir o fuso local do aparelho. Não se deve cortar os primeiros 10 caracteres do timestamp.
## Decisão do Host
### DT-28: Aceite e recusa de solicitação em detalhe próprio
- **Data:** 2026-11-02 · **Task:** #492 · **Status:** Em validação
- **Decisão:** tocar um card da fila `/reservas` abre `/reserva-host/[id]`. A nova tela busca a solicitação na página pendente do Host, usando apenas o id leve na rota; não foi inventado um GET individual que o back-end ainda não possui.
  - O Host confirma o aceite ou a recusa em modal próprio. A recusa exige motivo aparado, entre 1 e 500 caracteres.
  - Aceite: `POST /api/v1/me/host/reservations/:id/accept`. Recusa: `POST /api/v1/me/host/reservations/:id/reject` com `{ reason }`.
  - Em sucesso, a tela volta para `/reservas`, que consulta a fila novamente. Conflitos e indisponibilidade são exibidos com mensagem compreensível.
  - Os dados médicos e comportamentais do pet aparecem no detalhe quando a API os retornar.
- **Motivo:** completar o fluxo iniciado pela #486, sem misturar as ações transacionais com a lista nem criar uma rota de detalhe inexistente no back-end.
## Perfil
### DT-29: Perfil como rota própria, com dados parciais e entrada do cadastro de Host
- **Data:** 2026-11-07 · **Task:** #326 · **Status:** Aceita (esqueleto)
- **Decisão:** `/perfil` é uma rota do Stack, aberta por `router.push` na aba Perfil da Home. No Perfil, a aba Home usa `router.dismissTo('/home')`, a aba Buscar abre o `SearchModal` por cima e a aba Reservas abre `/reservas` (as solicitações do Host, #486). O Perfil mostra "Sair da conta" com o logout local da DT-25.
  - **Esqueleto:** a tela é só a estrutura do Perfil, não a versão final. O objetivo é dar ao usuário comum a entrada "Quero ser Host". Os textos do menu são de exemplo e quase todos os botões não têm ação. A tela final virá em outra task.
  - **Dados:** o Perfil mostra só o que o cadastro coleta (nome e e-mail, do `/me`) e nunca dados inventados: sem sessão, aparece "Usuário" e nenhum e-mail. O cadastro não tem foto, então o avatar é um ícone. Telefone, cidade, selo de verificação, pets de exemplo e a troca de foto não entram; a troca de foto fica na futura tela de editar perfil. Os textos do menu são de exemplo.
  - **Perfil do usuário comum:** a tela não é específica de Tutor nem de Host, e o título é "Meu Perfil". "Minhas Reservas" saiu do menu (já existe a aba Reservas). O último item do menu depende do `profile.status` do `/me`: `incomplete` mostra "Completar perfil" com o selo "Pendente"; `complete` mostra "Editar perfil". Ainda sem ação, até existir a tela de edição.
  - **Entrada do cadastro de Host:** o `HostInviteCard` fica entre "Meus Pets" e "Minha conta". O botão "Quero ser Host" ainda não tem ação: a primeira etapa do cadastro (#326) vai ser ligada ali. O card aparece para todo usuário, porque o `/me` ainda não informa se ele já é Host.
  - **Tema:** cores e tamanhos novos entraram no `theme.ts`, sem hexadecimal nos componentes. O cinza `textMuted` (`#6B6B6B`) tem contraste AA no branco; o `placeholder` não tem.
  - **Barra de abas:** o protótipo tem 5 abas (com "Mensagens"). O app mantém as 4 abas atuais, porque não há tela de mensagens.
  - **Versão do app:** o rodapé lê a versão do `app.json` por `expo-constants`, em vez do texto fixo do protótipo.
- **Limite:** "Meus Pets" e "Quero ser Host" aparecem para todo usuário, porque o `/me` ainda não informa papéis. "Meus Pets" não mostra os pets reais.
### DT-30: Cadastro de Host em três rotas, com estado em memória e sem chamar o back-end
- **Data:** 2026-11-07 · **Task:** #326 · **Status:** Aceita, exceto o "sem chamar o back-end" e as lacunas, substituídos pela DT-31
- **Decisão:** o cadastro tem três rotas: `/cadastro-host` (espaço), `/cadastro-host/fotos` (fotos e localização) e `/cadastro-host/analise` (tela final). Os dados passam entre elas pelo `HostRegistrationContext`, só em memória, apagado ao concluir, ao sair da conta e ao fechar o app.
  - **Tela final:** "Cadastro enviado para análise", com o selo "Pendente de validação". O texto segue US-HPET10-01 (perfil "pendente de validação", sem reservas antes da aprovação) e US-HPET20B (aparece nas buscas só depois de aprovado; rejeição avisa com o motivo). O botão "Enviar para análise" da etapa 2 substitui o "Avançar para fotos e Endereço" repetido do protótipo. A tela bloqueia o gesto e o botão voltar do Android, para não reabrir as etapas.
  - **Esqueleto de integração:** o envio ainda não chama o back-end, porque as rotas da #325 não estão publicadas (só na branch `feature/325-...`). Os pontos de ligação estão marcados com `shortcut:` em `fotos.tsx` e `ESQUELETO` nos arquivos das telas.
  - **CEP:** a busca usa o ViaCEP, serviço público de terceiros (`axios` próprio, sem o token do Hospetse). Só os 8 dígitos saem do aparelho, e a resposta é validada antes de usar. Bairro e cidade/UF vêm do CEP e ficam bloqueados; o bairro libera quando o CEP não o traz. Mudar o CEP depois da busca exige buscar de novo.
  - **Fotos:** `expo-image-picker` (módulo do Expo Go, sem permissão para a galeria do sistema). Limite de 5 MB por foto, igual ao back-end. O tipo do arquivo fica para o back-end, que confere pelo conteúdo.
  - **Mapa:** o protótipo mostra um mapa. Foi trocado por um bloco com o aviso "Apenas bairro e raio aproximado (500m) aparecem na busca", porque um mapa nativo exigiria development build.
- **Lacunas a resolver com a PO e o Lucas (#325):**
  - Faltam no protótipo: CPF ou CNPJ, capacidade, espécies aceitas (cão e gato) e os documentos `identity`, `proof_of_address` e `cnpj_card`. Sem eles, `POST /me/host/submit` devolve 400.
  - Sem campo no contrato (que rejeita campo desconhecido): estrutura do espaço, outros pets, experiência, idosos/medicação e castrados.
  - `name` é obrigatório no back-end; a tela não pergunta (sugestão: usar o nome do cadastro).
  - O texto do interruptor "Aceita animais castrados?" ("Requer mais atenção com marcação de território") parece descrever animais não castrados. Copiado como está no protótipo.
### DT-31: Integração do cadastro de Host com a #325, com retomada, progresso e nova tentativa
- **Data:** 2026-11-08 · **Task:** #326 · **Status:** Em validação (só com a API mockada)
- **Decisão:** o cadastro usa as rotas da #325 pelo `backendApi`: `GET` e `PUT /api/v1/me/host`, `POST .../photos`, `POST .../documents` e `POST .../submit`. Substitui o "sem chamar o back-end" e as lacunas da DT-30.
  - **Rascunho retomável:** a etapa 1 salva ao avançar. O Perfil lê o cadastro e abre a etapa onde o Host parou: etapa 2 se a 1 estiver completa (com a 1 por baixo, para o voltar), tela de análise se já foi enviado. O CPF ou CNPJ volta mascarado (`***4725`): em branco, o do servidor é mantido.
  - **Envio em fila:** `submitHostRegistration` salva o rascunho completo, sobe um arquivo por requisição (capa primeiro, porque o back-end usa a primeira foto como principal) e submete. Para na primeira falha e informa a fase e o arquivo. Nova tentativa salva o rascunho de novo (idempotente) e pula os arquivos já enviados, guardados no contexto como "campo|arquivo" -> id. Trocar o arquivo do campo envia de novo.
  - **Erros do servidor** (`toHostError`): `VALIDATION_ERROR` por campo vai para o campo da tela, e os da etapa 1 voltam para ela; `HOST_ALREADY_SUBMITTED` leva à análise; `STORAGE_UNAVAILABLE`, `HOST_DRAFT_CONFLICT` e falta de rede permitem tentar de novo; `FILE_LIMIT_REACHED` e arquivo recusado não (é preciso trocar o arquivo).
  - **Campos que o protótipo não tinha** e o back-end exige para submeter: espécies, capacidade, CPF ou CNPJ e documentos. Foram acrescentados como seções nas duas telas, sem design no Figma, e precisam de revisão da UX/PO. Usei o nome da conta como `name`.
  - **Documentos:** `expo-document-picker` (PDF, JPEG ou PNG, até 10 MB). Foto e documento seguem o limite do back-end, que confere o tipo pelo conteúdo.
  - **Multipart:** `FormData` com o campo `type` (documentos) antes do `file`, `Content-Type: multipart/form-data` sem boundary (o React Native completa) e timeout de 60 s por arquivo.
- **Não persiste no back-end:** estrutura do espaço, outros pets, experiência, idosos/medicação e castrados. Ficam no app, não são enviados e se perdem ao retomar. Decisão pendente com a PO e o Lucas.
- **Limites:** sem rota para remover foto ou documento já enviado; fotos do servidor aparecem numa lista à parte ao retomar. Não foi testado contra o back-end real nem em aparelho.
### DT-32: Painel do Anfitrião como esqueleto, aberto só com o cadastro aprovado
- **Data:** 2026-11-08 · **Task:** #326 · **Status:** Em validação visual
- **Decisão:** a interface do Anfitrião é a rota `/anfitriao`. Os documentos de produto não trazem telas do Host (o inventário lista a jornada J08 como "nova", sem frames no Figma); a estrutura vem dos casos de uso do módulo Host: solicitações (HPET12, 12a), hospedagem ativa (12b, 12c, 12d), agenda (11), preços (11a), financeiro e repasse (12e, 12f), Assistente de IA e conversas escaladas (06b, 06c) e perfil (10a, 10b).
  - **Quando abre:** o botão "Abrir painel do Anfitrião" aparece na tela de análise só com `validationStatus = approved`. Em `__DEV__` há também um link de prévia, porque a aprovação é do Administrador e o back-end ainda não tem a rota de aprovação (tasks #315 e #406, no Web).
  - **Modo:** o mesmo usuário pode ser Tutor e Host (o schema permite). O painel tem "Voltar ao modo Tutor".
  - **Esqueleto:** ganhos, saldo e hospedagens ativas são de exemplo (`SAMPLE_HOST_PANEL`). Só "Solicitações de reserva" tem tela: abre `/reservas`, a lista real feita na #486 (e a decisão da #492). Os outros 6 acessos ainda não fazem nada. Rotas do back-end que já existem para ligar depois: `GET/POST/DELETE /me/host/agenda`.
- **Limite:** o Perfil ainda mostra "Quero ser Host" para quem já é Host aprovado (o `/me` não informa o papel); o botão leva à tela de análise, que então mostra o botão do painel.
