# Log de desenvolvimento: Hospetse Mobile

Histórico das atividades **concluídas**, da mais antiga para a mais recente. Acrescente a entrada nova no fim. Decisões ficam no `DECISOES_TECNICAS.md` (cite a DT), e pendências no `PROXIMOS_PASSOS.md`.

Modelo de entrada:

```markdown
## AAAA-MM-DD: <título curto> (#task)
- **Objetivo:**
- **Arquivos:** criados / alterados / removidos
- **O que mudou:**
- **Decisões:** DT-NN
- **Verificação:** comando e resultado real (não registre teste que não rodou)
- **Problemas e soluções:**
- **Ficou pendente:**
- **Commits / PR:**
```

---

## 2026-10-26: Base do app e cadastro integrado ao Auth (#268, PR !18)
Trabalho de outra pessoa do time, registrado aqui só como contexto. Os detalhes estão na descrição do PR !18.
- **O que trouxe:**
  - Telas de login, cadastro, código e recuperar senha.
  - Cadastro integrado ao Auth (`request-pin` e `register`).
  - Tokens no SecureStore, `SignupContext` e reenvio do código com contador de 60 s.
  - Home provisória com skeleton.
  - 19 testes Jest.
- **Pendências declaradas no PR:** remover o atalho temporário da Home quando a #261 for integrada; configurar o ESLint no mobile.

## 2026-10-28: Tela Home, primeira versão (#472)
- **Objetivo:** implementar a Home a partir do print de referência e da task HSP-PBI-010-TSK-01.
- **Arquivos:**
  - Criados: `src/app/home.tsx`, `src/components/SearchBar.tsx`, `FilterChip.tsx`, `PetCard.tsx` e `BottomTabBar.tsx`.
  - Alterados: `src/constants/theme.ts` (só acréscimos), `src/app/index.tsx` e `src/app/codigo.tsx` (navegação até a Home).
- **O que mudou:**
  - Cabeçalho, busca, filtros, listas "próximos de você" e "Mais populares" e barra inferior.
  - Os ícones eram feitos com Views e glifos Unicode, porque não havia biblioteca de ícones instalada.
- **Verificação:** `tsc --noEmit` sem erros.
- **Problemas e soluções:**
  - `npx tsc` tentou baixar um pacote errado chamado `tsc`. Solução: rodar `npm install` e usar `node_modules\.bin\tsc`.
  - Não há ESLint configurado, então o lint não rodou.

## 2026-10-28: Ícones Material Symbols, ajustes de layout e tsconfig (#472)
- **Objetivo:** trocar os ícones pelos do Google Fonts e aproximar o layout da referência.
- **Arquivos:**
  - Criado: `src/components/Icon.tsx`.
  - Alterados: componentes da Home, `theme.ts`, `tsconfig.json` e `package.json`/`package-lock.json` (entrou o `react-native-svg`).
- **O que mudou:**
  - Chips com largura igual.
  - Cards com tamanhos `large` e `small` e largura proporcional à tela.
  - Abas com ícone e nome.
  - Preço com "/diário".
  - `tsconfig.json` com `include` explícito e alias `@/*`.
- **Decisões:** DT-01, DT-04 e DT-08.
- **Verificação:**
  - `tsc --noEmit` sem erros.
  - `npx expo export --platform web` gerou o bundle da rota `home`.
- **Problemas e soluções:** o TypeScript 6 rejeitou o `baseUrl` por estar deprecado. Ele foi removido, e o `paths` continua funcionando.

## 2026-10-28: Branch e padrões de git (ADR-014)
- **Objetivo:** criar a branch no padrão da ADR-014 e guardar as regras para as próximas tasks.
- **Arquivos:** criado `.kiro/steering/git-workflow.md`.
- **O que mudou:**
  - Branch `feature/472-implementar-a-tela-home-no-mobile` criada a partir da `develop`.
  - Primeiro commit, `d41b22f`, com push.
- **Decisões:** DT-09.
- **Problemas e soluções:** o e-mail do git era um valor de exemplo. A desenvolvedora corrigiu e refez o commit antes do push (o commit original `147d97c` foi substituído pelo `d41b22f`).

## 2026-10-29: Sombras, barra inferior e título por filtro (#472)
- **Objetivo:** atender ao feedback de que faltavam sombras, a barra inferior estava fora de proporção e o título da seção não mudava com o filtro.
- **Arquivos:** `home.tsx`, `BottomTabBar.tsx`, `FilterChip.tsx`, `PetCard.tsx`, `SearchBar.tsx` e `theme.ts`.
- **O que mudou:**
  - Sombras com `boxShadow`.
  - Barra inferior com 64 de altura, abas de largura igual, item ativo de 52×48 e ícones de 20px.
  - Sino cinza.
  - Título da seção conforme o filtro.
  - Listas horizontais sem a sombra cortada.
- **Decisões:** DT-02 e DT-05.
- **Verificação:**
  - `tsc --noEmit` sem erros.
  - Print da `/home` no Chrome sem janela: as sombras aparecem. O print saiu cortado à direita, então o sino e a barra inferior inteira **não foram conferidos visualmente**.
- **Commits:** `6bc1499`.

## 2026-10-29: Integração da develop e PR da Home (#472, PR !32)
- **Objetivo:** abrir o PR sem conflitos com a `develop`, que tinha recebido o PR !18.
- **Arquivos com conflito resolvido:** `codigo.tsx` (ficou a versão da `develop`), `home.tsx` (ficou a Home completa, agora lendo o `nome`), `theme.ts`, `tsconfig.json` e `package-lock.json` (gerado de novo).
- **Decisões:** DT-03, DT-06, DT-07 e DT-08 (revisada).
- **Verificação:**
  - Nenhum marcador de conflito sobrou, e o `tsc --noEmit` passou sem erros.
  - `jest`: 19 de 19 testes passando. Na primeira rodada, 2 testes estouraram o limite de 5 s enquanto o cache do Jest era montado.
- **Problemas e soluções:**
  - Um `git merge-tree` indicou que não havia conflito porque o código de saída lido era de outro comando. Ao conferir o conteúdo, os conflitos apareceram.
  - Lição: confira o resultado, não só o código de saída.
- **Commits / PR:**
  - `53e88e4`: merge da `develop`.
  - `53654bd`: `docs:` com os steerings.
  - Push feito, e o PR !32 foi aberto para a `develop`, com revisor definido e a task #472 vinculada.

## 2026-10-29: Memória persistente do projeto (#503)
- **Objetivo:** guardar contexto, decisões e pendências no repositório para retomar o trabalho em conversas novas.
- **Arquivos criados:**
  - `docs/memoria/CONTEXTO.md`, `LOG_DESENVOLVIMENTO.md`, `DECISOES_TECNICAS.md`, `PROXIMOS_PASSOS.md` e `INICIAR_CONTEXTO.md`.
  - Steerings `.kiro/steering/memoria-projeto.md` (sempre incluído) e `.kiro/steering/retomar-contexto.md` (manual).
- **Arquivo alterado:** `AGENTS.md` (seção nova "Project memory" no fim; o conteúdo do Expo não mudou).
- **Decisões:** DT-10.
- **Achado:** com o workspace aberto em `HOSPETSE`, o Kiro carregou só o `hospetse-mobile/AGENTS.md`. Os steerings de `hospetse-mobile/.kiro/steering/` não apareceram nas regras desta conversa.
- **Pesquisa feita:**
  - Recursos nativos do Kiro, pela documentação em kiro.dev: steering, AGENTS.md, Memory, hooks, specs e MCP.
  - Repositório `akitaonrails/ai-memory`: licença MIT, versão 3.2.10 de 2026-10-29, servidor em Rust com MCP e hooks, suporte ao Kiro CLI. Não foi instalado.
- **Verificação:** os arquivos foram conferidos contra o código atual. Não houve alteração de código nem de configuração do app.
- **Commit:** o time aprovou versionar a memória.
  - O primeiro commit foi feito na branch da #472 (`2f42cb3`, nunca enviado) e desfeito com `git reset --soft`, para o PR !32 ficar só com a Home.
  - Foi refeito na branch `docs/503-criar-a-memoria-persistente-do-desenvolvimento-no-mobile`, criada a partir da `develop`.
- **Ficou pendente:**
  - Push e PR da #503. Esse PR tem que ser mergeado **depois** do PR !32, porque a memória descreve a Home e os steerings dele.
  - Confirmação da regra de pastas fora de `src/` (DT-10).

## 2026-10-30: Merges da Home e da memória (PR !32 e PR !35)
- **O que aconteceu:**
  - O PR !32 (#472) foi mergeado na `develop` (`a3ca8f0`).
  - O PR !35 (#503) foi mergeado depois dele (`70de57c`), na ordem combinada.
- **Ficou pendente:**
  - Na #472, os critérios de aceite que ainda não foram feitos (veja o `PROXIMOS_PASSOS.md`).
  - Mudar o status das tasks no Azure Boards e registrar o tempo trabalhado. Isso cabe à desenvolvedora.

## 2026-10-30: Busca e filtros, modal (#477)
- **Objetivo:** implementar o modal de busca a partir dos 6 prints: Onde?, Para quando? (vazio e com período), Qual serviço? (vazio e com escolha) e Para quem?.
- **Arquivos:**
  - Criados: `src/components/SearchModal.tsx`, `FilterSection.tsx`, `Calendar.tsx` e `PetOption.tsx`, e `src/utils/calendar.ts`.
  - Alterados: `src/app/home.tsx`, `src/components/Icon.tsx` (3 ícones novos) e `src/constants/theme.ts` (só acréscimos).
- **O que mudou:**
  - O modal abre pela busca ou pela aba Buscar, e só uma seção fica aberta por vez.
  - **Onde?:** sugestões de cidade fixas.
  - **Para quando?:** calendário com check-in e check-out.
  - **Qual serviço?:** um serviço por vez.
  - **Para quem?:** pets de exemplo, e dá para desmarcar o pet escolhido.
  - **Buscar:** guarda os filtros na Home.
- **Decisões:** DT-11 e DT-12.
- **Verificação:**
  - `tsc --noEmit` sem erros e 19 de 19 testes Jest passando.
  - `expo export --platform web` gerou o bundle da rota `home`.
  - **Não verificado:** o visual. O servidor web foi iniciado para a desenvolvedora conferir. Não houve teste em aparelho e não foram criados testes novos.
- **Problemas e soluções:** a primeira rodada de typecheck e testes foi interrompida (`^C`). Rodando os dois separados, passaram.
- **Ficou pendente:** veja a #477 em `PROXIMOS_PASSOS.md`. O commit aguarda o retorno visual e a autorização.

## 2026-10-30: Busca reabre vazia e testes da busca (#477)
- **Objetivo:** atender ao retorno visual (a cidade escolhida continuava preenchida ao reabrir o modal) e criar os testes que o card pede.
- **Arquivos:**
  - Alterados: `SearchModal.tsx` (saiu a prop `initialFilters` e o formulário começa de `EMPTY_FILTERS`) e `home.tsx` (agora guarda `lastSearch`, e o campo não mostra mais a cidade).
  - Criados: `__tests__/calendar-test.ts` (7 testes) e `__tests__/search-modal-test.tsx` (9 testes).
- **Decisões:** DT-12, revisada.
- **Verificação:** `tsc --noEmit` sem erros e `jest` com 35 de 35 testes passando, em duas rodadas completas.
- **Problemas e soluções:**
  - O teste do fluxo completo (9 toques) estourou os 5 s padrão do Jest, e a falha deixou um toque pendente que derrubou o teste seguinte (`Pressability: Invalid signal`).
  - Solução: limite de 20 s só nesse teste.
  - Os testes do calendário usam o mês seguinte, para não depender da data de hoje.
- **Commits:** um `feat:` com o código e os testes e um `docs:` com a memória, autorizados pela desenvolvedora.
- **Ficou pendente:** push e PR. A correção de "reabrir vazia" foi coberta por teste, mas não foi conferida de novo na web.

## 2026-10-30: Validação do cadastro e login integrado ao Auth (#267)
- **Objetivo:** TSK-09 (validar o cadastro no app, com todos os erros de uma vez) e trocar o login provisório pelo login do Auth.
- **Arquivos criados:** `src/utils/validateSignup.ts`, `src/utils/validateLogin.ts`, `src/components/FieldError.tsx`, `src/components/ErrorModal.tsx`, `assets/pets.png`, `__tests__/validateSignup-test.ts` e `__tests__/login-test.tsx`.
- **Arquivos alterados:** `src/app/cadastro.tsx`, `src/app/index.tsx`, `src/services/auth.ts` (`login`), `src/utils/requestPinErrorMessage.ts` (títulos do modal), `src/constants/theme.ts` (só acréscimos), `__tests__/cadastro-test.tsx` e `__tests__/auth-service-test.ts`.
- **Decisões:** DT-13 e DT-14 (DT-06 parcialmente substituída). Criadas como DT-11 e DT-12 e renumeradas no merge do PR !47, que usou esses números antes.
- **Verificação:**
  - `tsc --noEmit` sem erros e 46 de 46 testes Jest passando. Na primeira rodada, o primeiro teste de 3 arquivos estourou o limite de 5 s enquanto o cache era montado.
  - `expo export` para Android e web sem erros.
  - Contra o Auth de produção: login sem conta respondeu 401 e e-mail inválido respondeu 400, como o app espera; `request-pin` respondeu 201.
  - **Não rodou:** o cadastro completo até a Home, porque o Auth de produção usa o `ConsoleEmailSender` e o PIN só aparece no log do servidor. Também não houve teste num aparelho.
- **Problemas e soluções:**
  - O tipo do `ref` do `TextInput` no React Native 0.88 é `TextInputInstance`, e não `TextInput`.
  - Conflitos ao integrar a `develop` (PRs !32 e !35): no `index.tsx` ficou o login integrado; no `theme.ts` ficaram os tokens das duas branches, sem mudar valores.
  - Segunda integração da `develop` (PR !47, busca): conflitos só na memória (`CONTEXTO`, `LOG` e `PROXIMOS_PASSOS`), com o texto das duas tasks mantido. O `theme.ts` juntou sem conflito. Depois do merge: `tsc --noEmit` sem erros, 62 de 62 testes e `expo export` sem erros.
- **Ficou pendente:** revisão do PR da #267 por outra pessoa, teste do cadastro com um PIN real e teste num aparelho.
- **Explicações para a banca:** os trechos que fogem do básico estão explicados em `docs/memoria/EXPLICACOES_CADASTRO_LOGIN.md`.
- **Commits:** `7b0e4b7` (validação do cadastro), `c4f8cb7` (login), `c4c0a72` (merge da `develop` com !32 e !35), `9a50f96` (memória e explicações) e o merge da `develop` com o !47. PR da #267 aberto para a `develop`.

## 2026-11-01: Merges do cadastro e do login (PR !52)
- **O que aconteceu:** depois da revisão, o PR !52 (#267, Murilo) foi mergeado na `develop` (`79b7a95`), sem fast-forward. Antes, ele trouxe a `develop` com o PR !47 e renumerou as decisões dele para DT-13 e DT-14.
- **Verificação:** na `develop` já mergeada, `tsc --noEmit` sem erros e 62 de 62 testes passando.
- **Problemas e soluções:**
  - O voto e a conclusão automática pelo MCP do Azure DevOps falharam ("Unexpected end of JSON input"). A desenvolvedora aprovou e concluiu pela página do PR.
  - Não deu para marcar "apagar a branch", porque isso exige a permissão de force push, que só o autor tem.
- **Ficou pendente:** o Murilo apagar a branch `feature/267-...` no servidor.

## 2026-11-01: Detalhe do Host, resultados e filtros (#480)
- **Objetivo:** fazer os 4 prints da #480: lista de resultados, filtros e detalhe do Host (em duas partes). A tela de filtros é da #477, mas foi feita aqui por decisão da desenvolvedora.
- **Arquivos criados:**
  - Telas: `src/app/host/[id].tsx` e `src/app/resultados.tsx`.
  - Componentes: `FiltersModal.tsx`, `PriceSlider.tsx`, `UserHeader.tsx`, `AmenityItem.tsx` e `OutlineButton.tsx`.
  - Dados e funções: `src/services/hosts.ts`, `src/constants/search.ts`, `src/constants/sampleData.ts` e `src/utils/searchParams.ts`.
  - Testes: `__tests__/host-details-test.tsx` e `__tests__/results-test.tsx`.
- **Arquivos alterados:**
  - `home.tsx`: usa o `UserHeader`, os cards abrem o detalhe e "Buscar" vai aos resultados.
  - `SearchModal.tsx`: o `ServiceType` passou para `constants/search.ts`.
  - `Icon.tsx`: 14 ícones novos.
  - `theme.ts` (só acréscimos) e `utils/calendar.ts` (`toIsoDate` e `fromIsoDate`).
- **Decisões:** DT-15, DT-16 e DT-17. DT-12 revisada.
- **Contrato conferido:** o `GET /api/v1/hosts/{id}` no OpenAPI do `hospetse-backend` (#479 em Done). A rota de busca (#476) estava Em Andamento.
- **Verificação:**
  - `tsc --noEmit` sem erros e 86 de 86 testes passando (15 novos).
  - Numa rodada, testes antigos do login e do cadastro estouraram o limite de 5 s enquanto o cache era montado. Na rodada seguinte, todos passaram.
  - As rotas `/resultados` e `/host/[id]` respondem no servidor web.
- **Não verificado:** a conferência visual dos resultados e dos filtros pela desenvolvedora e o teste num aparelho.
- **Problemas e soluções:**
  - Na primeira conferência, "Buscar" só fechava o modal, e o título não seguia o serviço. A solução foi a tela de resultados (DT-15).
  - Durante as edições, o servidor mostrou erros de atualização na Home (`USER is not defined`) por causa de estados intermediários do arquivo. O código final não usa mais esses nomes: basta recarregar a página.
- **Ficou pendente:** veja a #480 em `PROXIMOS_PASSOS.md`.

## 2026-11-01: Mensagem "Sem conexão" no login e no cadastro (#480)
- **Objetivo:** a desenvolvedora viu "Sem conexão" ao entrar na web.
- **Causa:**
  - Faltava o `.env.local`. Ele foi criado na máquina dela e fica fora do git.
  - O Auth não manda `Access-Control-Allow-Origin` para `localhost:8081`, então o navegador bloqueia a resposta.
  - O SecureStore não funciona na web.
- **O que mudou:** `isRequestError` e mensagens corretas para a falha ao salvar os tokens (DT-18).
- **Verificação:** 3 testes novos, e o login sem conta respondeu 401 no Auth de produção, chamado daqui.
- **Commit:** `177c961` (`fix:`), na branch da #480, conforme a opção (a) escolhida pela desenvolvedora.
- **Ficou pendente:** o CORS no Auth, com o time de back-end.

## 2026-11-01: Commits da #480 e parte mobile do bug #516
- **Contexto:**
  - A desenvolvedora aprovou o visual dos resultados, dos filtros e do detalhe.
  - O bug #516 ("Erro de conexão ao acessar a tela login") passou a ser dela, e a parte do mobile foi feita na branch da #480.
- **Arquivos do bug:** `.env.example` (novo, com `EXPO_PUBLIC_AUTH_URL`; o endereço não é segredo) e `README.md` (reescrito: como rodar, limites na web, variáveis, testes e como contribuir).
- **Conferido:**
  - O endereço do Auth no `.env.example` é o mesmo da página da Wiki "APIs publicadas - URLs e contratos".
  - O PR !55 do `hospetse-auth-service` (Lucas, CORS pela variável `CORS_ORIGINS`) estava aberto. Testado daqui, o Auth de produção ainda não mandava `Access-Control-Allow-Origin`.
  - A #476 foi mergeada no back-end (PR !53).
- **Commits:**
  - `3365963`: `feat:` da #480.
  - `6dd91c6`: `fix:` do #516.
  - `docs:` da memória.
  - O `177c961` (`fix:`, mensagem "Sem conexão") cita a #480, mas faz parte do #516. Isso é explicado no PR.
- **Ficou pendente:** push e PR, testar o CORS depois do deploy do PR !55 e a task da ADR-005 para os tokens na web.

## 2026-11-01: Merge da #480 e repositórios do back-end ao lado
- PR !57 (#480 e parte mobile do #516) mergeado na `develop` (`2c48eca`) pela desenvolvedora, aprovado pelo Raul. Pelo MCP, o merge falhou de novo ("Unexpected end of JSON input").
- `hospetse-backend` e `hospetse-auth-service` clonados em `HOSPETSE/`, ao lado do mobile, para ler as rotas reais. Rodar `git pull` antes de consultar. Não editar sem pedido.
- CORS publicado nos dois serviços para `http://localhost:8081` (PRs !55 e !56), conferido daqui.

## 2026-11-01: Integração da busca e do detalhe com o back-end (#518)
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
- **Decisões:** DT-19 e DT-20 (DT-17 substituída na busca e no detalhe).
- **Contrato lido no código do `hospetse-backend`:** `host-search-policy.js`, `host-search.controller.js` e `host-details.controller.js`. No `hospetse-auth-service`: `refresh-token.service.js`.
- **Verificação:**
  - `tsc --noEmit` sem erros e 95 de 95 testes passando.
  - As rotas publicadas respondem 401 sem token.
  - A desenvolvedora testou no Expo Go, com login real: busca, resultados, filtros, detalhe e o erro sem rede. Deu tudo certo.
  - Antes do commit, o back-end recebeu a agenda do Host (#482, PR !62). As rotas de busca e de detalhe e a lista `OCCUPYING` não mudaram, então não houve ajuste.
- **Problemas e soluções:**
  - Na repetição depois do refresh, o interceptor lia de novo o token antigo do SecureStore. Solução: ele pula a leitura nas chamadas repetidas.
  - A tela de resultados buscava duas vezes ao abrir, por causa do efeito que recomeçava os filtros. Solução: guardar o último serviço.
- **Commits:** `feat:` e `docs:` da #518.
- **Ficou pendente:**
  - Push e PR.
  - Os cards de exemplo da Home abrem um id que não existe na API ("Hospedagem não encontrada").
## 2026-11-01: Modal de rotina do Host (#519)
- **Objetivo:** mostrar a rotina diária e a garantia veterinária a partir do "Ler mais" da Rotina no detalhe do Host.
- **Branch:** `feature/519-implementar-o-modal-de-rotina-do-host-no-mobile`, a partir da `develop` (`69facdd`).
- **Arquivos:**
  - `components/RoutineModal.tsx` (novo): sobe por baixo, com "Rotina Personalizada", a quantidade de etapas, cada etapa com período, horário e descrição, o bloco "Garantia Veterinária Hospetse" com o selo "Protegido" e o botão "Fechar".
  - `components/Icon.tsx`: ícones `wb_sunny`, `wb_twilight`, `bedtime` e `verified_user`.
  - `services/hosts.ts`: tipo `RoutineStep` e o campo `routineSteps` em `HostExtras`, com 3 etapas de exemplo.
  - `app/host/[id].tsx` (código existente): o "Ler mais" da Rotina abre o modal, em vez de mostrar o resto da lista. Saiu o estado `showFullRoutine`.
  - `__tests__/host-details-test.tsx`: 2 testes (abrir e fechar o modal).
- **Decisão:** DT-21.
- **Verificação:** `tsc --noEmit` sem erros e 97 de 97 testes passando. A desenvolvedora testou no Expo Go e aprovou.
- **Commits:** `feat:` e `docs:` da #519.
- **PR:** !66.
- **Ficou pendente:** testar no Android, confirmar com a PO o texto da garantia e pedir os campos de rotina ao back-end.
## 2026-11-01: Tela de chat com o Host (#520)
- **Objetivo:** o Tutor abre, pelo detalhe do Host, uma conversa com o Assistente de IA e com o Host antes da reserva.
- **Branch:** `feature/520-implementar-a-tela-de-chat-com-o-host-no-mobile`, a partir da `develop` (`69facdd`). A #519 está em outra branch.
- **Arquivos:**
  - `app/chat/[id].tsx` (novo): cabeçalho com voltar, foto, nome, status e mais opções; faixa "Interesse em reservar"; mensagens separadas por dia; campo de mensagem.
  - `components/ChatBubble.tsx`, `BookingInterest.tsx` e `ChatInput.tsx` (novos).
  - `constants/sampleChat.ts` e `utils/chat.ts` (novos): conversa de exemplo, `formatTime`, `countNights` e `formatPrice`.
  - `components/Icon.tsx`: ícones `attach_file`, `mic`, `send`, `more_vert` e `smart_toy`.
  - `constants/theme.ts`: `chatImageHeight`, `chatImageWidth` e `chatInput` (só acréscimos).
  - Código existente: `app/host/[id].tsx` (o "Tire suas dúvidas" abre o chat e a tela lê o `petId`) e `app/resultados.tsx` (manda o `petId` ao detalhe).
  - Testes: `__tests__/chat-test.tsx` (novo, 9 testes) e 1 teste novo em `host-details-test.tsx`.
- **Decisão:** DT-22. O botão de ligar saiu, por decisão da desenvolvedora.
- **Verificação:** `tsc --noEmit` sem erros e 105 de 105 testes passando.
- **Problemas e soluções:** no iPhone, o teclado cobria as mensagens. Rolar a lista até o fim não bastou. Solução: tirei o `KeyboardAvoidingView` e passei a usar a altura do teclado como margem embaixo da tela (DT-22).
  - No Android, o teclado cobria o campo e as mensagens, porque a tela não encolhe no modo edge-to-edge. Solução: a mesma margem, agora calculada pela parte da tela que o teclado cobre, nos dois sistemas. A desenvolvedora testou de novo no aparelho e confirmou que o chat funcionou.
  - "O modal de rotina não abre no Android": o teste foi feito na branch da #520, que saiu da `develop` e não tem o modal (a #519 está em outra branch). Não é defeito do Android. Ainda não testado no Android.
- **Web:** a busca mostra "Algo deu errado", porque não há SecureStore no navegador (limite já conhecido, DT-19). A tela também não leva ao login com "sessão expirada", provavelmente porque o `clearTokens` falha na web (o SecureStore não existe no navegador). Isso não foi testado. Fica para a task de tokens na web (ADR-005).
- **Commits:** `feat:` e `docs:` da #520.
- **Ficou pendente:** testar o modal de rotina no Android depois do merge da #519, as rotas de conversa no back-end e tirar o "ligar" da descrição da task #520.
## 2026-11-01: Merge da #519 e da #520
- PRs !66 (modal de rotina) e !67 (chat) aprovados pelo Lucas Neo e mergeados pela desenvolvedora na `develop` (`4a806dd`). Antes, a branch da #519 foi trazida para a da #520, com o conflito de `docs/memoria/` e do teste do detalhe resolvido. Branches apagadas.
## 2026-11-01: Solicitação de hospedagem (#495)
- **Objetivo:** tela "Confirmar Reserva", aberta pelo "Solicitar reserva" do detalhe, com o sucesso e os modais de erro do protótipo.
- **Branch:** `feature/495-implementar-a-tela-de-solicitacao-de-hospedagem-no-mobile`, a partir da `develop` (`4a806dd`).
- **Arquivos novos:** `app/reserva/[id].tsx`; `components/ReservationSuccess.tsx`, `DateRangeModal.tsx` e `AddOnItem.tsx`; `services/reservations.ts` e `services/pets.ts`; `constants/addOns.ts`; `utils/validateReservation.ts` e `utils/money.ts`; `__tests__/reservation-test.tsx` (17 testes).
- **Código existente:** `app/host/[id].tsx` ("Solicitar reserva" abre a confirmação; o contexto da busca virou `searchContext`, usado também pelo chat); `components/PetOption.tsx` (aceita pet sem foto); `constants/theme.ts` (`successCircle`, `footerHeight` e `icon.huge`, só acréscimos); `test-utils/http.ts` (`apiError`); 1 teste novo em `host-details-test.tsx`.
- **Contrato lido no `hospetse-backend`:** `create-reservation.controller.js`, `create-reservation.service.js`, `availability.js`, `profile-policy.js` e `pet.controller.js`.
- **Decisão:** DT-23.
- **Verificação:** `tsc --noEmit` sem erros e 125 de 125 testes passando. A desenvolvedora testou no Expo Go (iPhone) com um Tutor com pets reais (Rex, Mia e Thor): a confirmação e o sucesso funcionaram.
- **Commits:** `feat:` e `docs:` da #495.
- **Ficou pendente:** push e PR; tela de Reservas do Tutor (PBI #199, sem task e sem rota no back-end); cadastro de pet; conclusão do perfil; serviços adicionais e horários na API.

## 2026-11-02: Sessão e confirmação após cadastro (#269)
- **Objetivo:** iniciar a sessão depois do `register`, carregar o perfil pelo `/me` e mostrar a confirmação antes da Home.
- **Arquivos:** criados `src/context/SessionContext.tsx`, `src/services/users.ts` e `src/services/token-storage.web.ts`; alterados `src/app/_layout.tsx`, `src/app/codigo.tsx`, `src/app/home.tsx`, `src/services/token-storage.ts`, `__tests__/codigo-test.tsx`, `package.json` e `package-lock.json`.
- **O que mudou:** tokens continuam no SecureStore no Android/iOS; na Web ficam apenas em memória. A tela do código consulta `/me` após salvar tokens, mostra sucesso e permite repetir a consulta sem encerrar a sessão. A Home usa o perfil carregado e informa quando a contratação exige completar o perfil.
- **Decisões:** DT-24.
- **Verificação:** `expo-doctor` 20/20, `npx tsc --noEmit`, Jest 126 de 126 e `npx expo export --platform web` concluídos.
- **Ficou pendente:** validação manual contra Auth Server e Back-end no navegador e Expo Go.
- **Commits / PR:** nenhum.

- **Correção posterior:** resultados passou a ler o nome do `SessionContext`, como a Home; avatar e cidade continuam de exemplo porque `/me` não fornece esses campos. O nome de exemplo só aparece quando não há sessão carregada.
- **Correção de runtime:** a leitura do nome na Home agora tolera estado ausente, e `getCurrentUser` rejeita resposta de `/me` sem `user.name`, perfil ou permissões antes de gravá-la no contexto. Assim, o fluxo mostra o erro recuperável do perfil em vez de quebrar a Home.

## 2026-11-02: Testes automatizados do fluxo de cadastro (#270)
- **Objetivo:** completar os cenários simulados de cadastro que ainda não estavam explícitos nos testes.
- **Arquivos:** `__tests__/cadastro-test.tsx` e `__tests__/codigo-test.tsx`.
- **O que mudou:** cobre `503` no pedido do PIN, `404` de PIN expirado no cadastro e `503` ao reenviar o PIN, preservando o código digitado.
- **Verificação:** `npx tsc --noEmit` sem erros e Jest com 133 testes passando.
- **Dependência:** PR !70 da #269 mergeado antes do rebase da branch de testes sobre a `develop`.
- **Commits / PR:** commits `test:` e `docs:`; PR pendente.

## 2026-11-04: Correção do teste de envio pendente do cadastro
- **Problema:** `cadastro-test.tsx` simulava uma request que nunca resolvia e aguardava `userEvent.press()`, mantendo o Jest preso no teste de toque duplo.
- **Correção:** o teste usa `fireEvent.press()` para iniciar o envio, uma Promise controlável e resolve a request depois das asserções de loading e toque duplicado.
- **Verificação:** teste isolado passou; suíte completa passou com 12 suítes e 133 testes.
- **Arquivos:** `__tests__/cadastro-test.tsx`.

## 2026-11-04: Feedback visual das regras de senha no cadastro
- **Objetivo:** mostrar em tempo real quais requisitos da senha foram cumpridos e permitir visualizar a senha durante o cadastro.
- **O que mudou:** `getPasswordRules` passou a devolver um objeto com quatro booleanos; `isStrongPassword` reutiliza esse objeto; `cadastro.tsx` mostra cada regra com estado visual e adiciona alternância mostrar/ocultar nos campos de senha e confirmação.
- **Testes:** adicionada cobertura do objeto de regras em `validateSignup-test.ts`.
- **Verificação:** `npx tsc --noEmit` sem erros e Jest com 134 testes passando.
- **Arquivos:** `src/utils/isStrongPassword.ts`, `src/app/cadastro.tsx` e `__tests__/validateSignup-test.ts`.

## 2026-11-04: Logout local e sessão do Mobile (#300)
- **Branch:** `feature/300-implementar-a-renovacao-de-sessao-e-o-logout-no-mobile`, criada sobre a branch da #299.
- **O que mudou:** `SessionContext` ganhou `logout`, que limpa o armazenamento da plataforma e o usuário em memória e nunca lança erro; Home e resultados exibem a ação `Sair`; sessão expirada limpa o contexto ao voltar para o login.
- **Refresh:** manteve o interceptor existente, com access token de 15 minutos, refresh rotativo de 30 dias, fila única e logout local quando o Auth recusa o refresh.
- **Decisão:** DT-25. A #297 (logout no Auth) está como Removed; comentário registrado na #300.
- **Testes:** `session-context-test.tsx` (logout limpa tokens e usuário, inclusive com falha no armazenamento); `login-test.tsx` (sessão expirada limpa o usuário); `results-test.tsx` e `home-test.tsx` (novo; "Sair" volta ao login só depois que o logout termina). API cobre refresh, falha, concorrência e redirecionamento.
- **Expo Go:** a desenvolvedora fez login e "Sair". Renovação conferida nos logs do Railway: login às 02:41 UTC; às 03:12 a busca recebeu 401, o app chamou `POST /api/v1/auth/refresh` (200) uma vez e repetiu a busca (200), sem pedir senha.
- **Visto fora do escopo:** `GET /api/v1/me/pets` respondeu 403 no detalhe do Host (token aceito, acesso negado). Não investigado.
- **Commit:** ainda não criado.
## 2026-11-01: Ajuste visual dos avisos de reserva (#489)
- **Objetivo:** aproximar os avisos de "Pet não permitido" e "Data indisponível" dos anexos da task #489.
- **Branch:** `feature/489-exibir-avisos-de-pet-nao-permitido-e-data-indisponivel-no-mobile`, a partir da `develop` (`4acac08`).
- **Arquivos:**
  - `components/ErrorModal.tsx`: fundo com BlurView e camada escura, card central com largura limitada e sombra, e ícone vetorial `pet_supplies`.
  - `components/Icon.tsx`: path oficial de `pet_supplies`.
  - `services/reservations.ts`: `VALIDATION_ERROR` de `petId` vira o aviso modal "Pet não permitido".
  - `app/reserva/[id].tsx`: texto e estado do novo aviso.
  - `package.json` e `package-lock.json`: `expo-blur` compatível com o SDK 58.
  - `__tests__/reservation-test.tsx`: atualiza o cenário de pet não permitido para verificar o modal.
- **Decisão:** DT-24.
- **Verificação:** `tsc --noEmit` sem erros, 17 de 17 testes da reserva passando e a suíte completa será conferida antes do commit.
- **Ficou pendente:** testar visualmente no Expo Go (iPhone e Android), conferir a web e commit/PR autorizados separadamente.
## 2026-11-02: Lista de solicitações pendentes do Host (#486)
- **Objetivo:** iniciar o fluxo do prestador com a fila de solicitações recebidas.
- **Branch:** `feature/486-implementar-a-lista-de-solicitacoes-pendentes-no-mobile`, a partir da `develop` (`26ebfa3`).
- **Arquivos:**
  - `app/reservas.tsx` (novo): consulta a API, total, cards, carregamento, vazio, erro com retry, pull-to-refresh e aba Reservas ativa.
  - `components/HostRequestCard.tsx` (novo): card adaptado da referência do Tutor para mostrar status, Tutor, pet, período, total e observações.
  - `services/hostReservations.ts` (novo): tipo separado `HostPendingReservation` e `listPendingHostReservations`.
  - `app/home.tsx` e `app/resultados.tsx`: a aba Reservas agora abre `/reservas`.
  - `__tests__/host-reservations-test.tsx` (novo, 5 testes).
- **Contrato usado:** `GET /api/v1/me/host/reservations?status=requested&page=1&pageSize=20`, dependência #485.
- **Decisão:** DT-26. Aceitar/recusar não entrou nesta task.
- **Verificação:** `tsc --noEmit` sem erros e 145 de 145 testes passando. Ainda não testado no Expo Go com uma conta Host.
- **Ficou pendente:** teste manual, commit e PR; detalhe e decisões do PBI #042 em task posterior.
## 2026-11-02: Correções apontadas no PR !77 da #486
- **Correções:** `reservas.tsx` passou a usar `SafeAreaView` do `react-native-safe-area-context`; `HostRequestCard` passou a converter `createdAt` com `new Date()` antes de formatar o dia no fuso local do aparelho.
- **Testes:** acrescentado teste de timestamp local. `tsc --noEmit` sem erros e 146 de 146 testes passando.
## 2026-11-02: Aceitar e recusar solicitações do Host (#492)
- **Objetivo:** permitir que o Host aceite ou recuse uma solicitação pendente pela tela adaptada da referência do histórico do Tutor.
- **Branch:** `feature/492-implementar-as-acoes-de-aceitar-e-recusar-no-mobile`, a partir da `develop` após o merge do PR !77 (`986ed52`).
- **Arquivos:**
  - `app/reserva-host/[id].tsx` (novo): detalhe da solicitação, confirmação de aceite, recusa com motivo obrigatório, cuidados médicos e comportamento do pet.
  - `services/hostReservations.ts`: tipos de decisão, POST de aceite/recusa e mensagens dos conflitos.
  - `app/reservas.tsx`: cards agora abrem o detalhe.
  - `__tests__/host-reservation-decision-test.tsx` (novo, 4 testes).
- **Contrato:** `POST /api/v1/me/host/reservations/:id/accept` e `POST /api/v1/me/host/reservations/:id/reject` (#491).
- **Decisão:** DT-28.
- **Verificação:** `tsc --noEmit` sem erros e 150 de 150 testes passando. Ainda não testado no Expo Go com uma conta Host.
- **Ficou pendente:** teste manual, commit e PR.
## 2026-11-07: Tela de Perfil e entrada do cadastro de Host (#326)
- **Branch:** `feature/326-implementar-o-cadastro-do-host-no-app`, a partir da `develop` (`26ebfa3`).
- **Escopo:** a tela de Perfil é só um esqueleto, não a versão final. Serve para dar ao usuário comum a entrada "Quero ser Host". Só nome e e-mail são dados reais.
- **O que mudou:** nova rota `/perfil`, baseada no protótipo, para o usuário comum (não é específica de Tutor nem de Host): cabeçalho "Meu Perfil", card com nome e e-mail do cadastro, "Meus Pets", convite "Quero ser Host", menu "Minha conta" (com "Completar perfil" ou "Editar perfil" no fim), "Sair da conta" e rodapé com a versão do app. A aba Perfil da Home passou a abrir a rota. Componentes novos: `StatusPill`, `ProfileMenuItem` e `HostInviteCard`. O `Button` ganhou o parâmetro opcional `icon`. Oito ícones oficiais novos no `Icon.tsx` e tokens novos no `theme.ts` (`textMuted`, pares cor/fundo azul, verde, roxo e amarelo, e os tamanhos do avatar e do ícone do menu).
- **Dados:** o Perfil mostra só o que o cadastro coleta: nome e e-mail, do `GET /api/v1/me`. Sem sessão, mostra "Usuário" e nenhum e-mail. O cadastro não tem foto, então o avatar é um ícone. Telefone, cidade, selo de verificação, pets de exemplo e a troca de foto foram removidos. Os textos do menu ainda são de exemplo.
- **Ajustes pedidos após a primeira versão:** saíram "Minhas Reservas" (já há a aba) e "Garantia"; no lugar entrou "Completar perfil" (perfil `incomplete`, com selo "Pendente") ou "Editar perfil" (perfil `complete`).
- **Sem ação ainda:** "Quero ser Host", "Acessar Meus Pets", linhas do menu (inclusive "Completar/Editar perfil"), sino e engrenagem.
- **Decisão:** DT-29.
- **Verificação:** `tsc --noEmit` sem erros; Jest 140 de 140; `expo export --platform web` gerou o bundle `perfil`. Um teste temporário confirmou os cenários do Perfil (completo, incompleto, sem sessão, logout e aba Home) e foi removido. A desenvolvedora aprovou a tela visualmente; não foi testada no Expo Go.
- **Testes:** não foram criados testes Jest do Perfil.
- **Arquivos:** `app/perfil.tsx`, `app/home.tsx`, `components/StatusPill.tsx`, `components/ProfileMenuItem.tsx`, `components/HostInviteCard.tsx`, `components/Button.tsx`, `components/Icon.tsx` e `constants/theme.ts`.
- **Commits:** um `feat:`, um `docs:` e outro `docs:` que marca a tela como esqueleto. Enviados ao Azure DevOps, na branch que a desenvolvedora criou, com a autorização dela.
## 2026-11-07: Telas do cadastro de Host (#326)
- **Branch:** `feature/326-implementar-o-cadastro-do-host-no-app`. Sem commit desta parte.
- **O que mudou:** três rotas novas em `src/app/cadastro-host/`: etapa 1 "Torne-se Anfitrião" (espaço, portes, experiência, interruptores e apresentação), etapa 2 (fotos e localização) e a tela final "Cadastro enviado para análise". "Quero ser Host", no Perfil, abre a etapa 1. O estado das etapas fica no `HostRegistrationContext`, apagado ao sair da conta.
- **Botão da etapa 2:** o protótipo repetia "Avançar para fotos e Endereço". Como não há tela depois dela, virou "Enviar para análise".
- **Tela final:** segue os documentos do produto. O HPET10 (US-HPET10-01) diz que o perfil nasce "pendente de validação" e não recebe reservas antes da aprovação do Administrador (HPET20b). O inventário de telas trata o cadastro de Host como jornada nova ("documentos, fotos e pendente de validação"), sem frames no Figma.
- **Lógica nova:** máscara e busca de CEP no ViaCEP (`zip-code.ts`), seleção de foto na galeria (`photo-picker.ts`, limite de 5 MB) e validações que espelham o back-end (`validateHostRegistration.ts`). Componentes: `OptionCard`, `SwitchRow`, `FormField`, `PhotoTile`, `HostFormHeader`, `HostTermsNote`. Cinco ícones oficiais novos. Dependência nova: `expo-image-picker ~58.0.10`.
- **Não fazia ainda (resolvido na entrada seguinte, DT-31):** nenhuma chamada ao back-end, porque as rotas da #325 estavam só na branch do back-end.
- **Lacunas entre o protótipo e o back-end (#325):** para submeter, o back-end exige CPF ou CNPJ, capacidade, espécies aceitas e os documentos `identity` e `proof_of_address` (mais `cnpj_card` para CNPJ). Essas telas não existem no protótipo. Em sentido contrário, o protótipo tem estrutura do espaço, outros pets, experiência, idosos/medicação e castrados, que o contrato não aceita (rejeita campo desconhecido). Ver DT-30.
- **Verificação:** `tsc --noEmit` sem erros; Jest 140 de 140; build web ok; servidor de desenvolvimento compilou sem erro. Dois testes temporários (10 cenários das telas e 8 dos serviços e validações) passaram e foram removidos. Não testado no Expo Go (galeria de fotos e busca de CEP em aparelho real).
- **Testes:** não foram criados testes Jest do cadastro de Host.
- **Arquivos:** `app/cadastro-host/*`, `app/_layout.tsx`, `app/perfil.tsx`, `context/HostRegistrationContext.tsx`, `constants/hostRegistration.ts`, `constants/theme.ts`, `services/photo-picker.ts`, `services/zip-code.ts`, `utils/formatZipCode.ts`, `utils/validateHostRegistration.ts`, seis componentes novos, `components/Icon.tsx`, `package.json` e `package-lock.json`.
## 2026-11-08: Integração do cadastro de Host com o back-end (#326)
- **Branch:** `feature/326-implementar-o-cadastro-do-host-no-app`. Sem commit desta parte.
- **Contexto:** a #325 do back-end foi mergeada na `develop` (PR 75) e as rotas já estão no contrato publicado do Railway. A #326 passou para a Sprint 8.
- **O que mudou:**
  - Rascunho: a etapa 1 salva em `PUT /api/v1/me/host` ao avançar; o Perfil busca `GET /api/v1/me/host` e retoma na etapa onde o usuário parou (etapa 2 se a 1 estiver completa, tela de análise se já foi enviado).
  - Envio: "Enviar para análise" salva o rascunho completo, sobe fotos e documentos um por requisição (com progresso) e submete. Em falha, a janela de envio mostra o motivo e "Tentar de novo", que não repete o que já subiu. Arquivo recusado pelo servidor mostra o motivo, sem repetir.
  - Erros do servidor: o `VALIDATION_ERROR` por campo aparece no campo certo; os da etapa 1 voltam para ela; `HOST_ALREADY_SUBMITTED` leva à tela de análise.
  - Campos que o back-end exige e o protótipo não tinha: espécies (cães e gatos), capacidade, CPF ou CNPJ (com dígitos verificadores) e documentos (identidade, comprovante de endereço e, para CNPJ, cartão CNPJ). Entraram como seções nas duas telas, sem design no Figma. O nome do Host é o da conta.
  - Tela de análise mostra pendente, aprovado ou não aprovado.
  - Dependência nova: `expo-document-picker ~58.0.4`. Componentes novos: `DocumentRow` e `UploadProgressModal`. `HostInviteCard` ganhou `loading`.
- **Testes novos (3 arquivos, 56 testes):** `host-registration-service-test.ts` (validações, CPF/CNPJ, erros, cliente e fila de envio), `host-registration-test.tsx` (navegação entre etapas, erros do servidor, falha e nova tentativa de upload, retomada e entrada pelo Perfil) e `host-pickers-test.ts` (CEP, foto e documento).
- **Verificação:** `tsc --noEmit` sem erros; Jest 196 de 196; build web ok. **Não rodei contra o back-end real**, para não criar rascunho de Host na conta; só com a API mockada. Não testado no Expo Go (galeria, seletor de arquivos, envio multipart e progresso em aparelho).
- **Limitações:** estrutura do espaço, outros pets, experiência, idosos/medicação e castrados não têm campo no back-end: não são enviados nem voltam ao retomar. Foto e documento já enviados não podem ser removidos (sem rota). Ao retomar, as fotos do servidor aparecem numa lista à parte, não nos espaços de Sala, Copa e Quintal.
## 2026-11-08: Painel do Anfitrião (prévia) e teste do cadastro de Host (#326)
- **Branch:** `feature/326-implementar-o-cadastro-do-host-no-app`. Sem commit desta parte.
- **Teste real:** com um e-mail do Gmail o PIN chegou e a conta foi criada. A desenvolvedora fez o cadastro de Host em produção, enviou fotos e documentos (o progresso apareceu) e o app respondeu "enviado". O perfil fica `pending`: só vira Anfitrião quando o Administrador aprova (HPET20b), e o back-end ainda não tem a rota de aprovação (ela é das tasks #315 e #406, no painel Web).
- **O que mudou:** nova rota `/anfitriao` (Painel do Anfitrião, esqueleto com dados de exemplo) e `SAMPLE_HOST_PANEL` em `sampleData.ts`. A tela de análise ganhou o botão "Abrir painel do Anfitrião" quando o cadastro está aprovado e, só em `__DEV__`, o link "Ver prévia do painel do Anfitrião". Cinco ícones oficiais novos.
- **Base:** casos de uso do módulo Host (HPET10a, 10b, 11, 11a, 12, 12a, 12b, 12c, 12d, 12e, 12f, 06b, 06c) e a jornada "J08 — Operação Mobile do Host" do inventário de telas, que lista as telas como "novas", sem frames no Figma.
- **Decisão:** DT-32.
- **Verificação:** `tsc --noEmit` sem erros; Jest 199 de 199 com um teste temporário do painel (removido). Painel não testado no Expo Go. Sem testes permanentes do painel.
