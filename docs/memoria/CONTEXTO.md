# Contexto do projeto: Hospetse Mobile

> Resumo principal para retomar o trabalho. Mantenha curto e fiel ao cÃ³digo.
> Ãšltima atualizaÃ§Ã£o: 2026-11-11. Descreve a implementaÃ§Ã£o da #371 na branch `feature/371-implementar-a-lista-e-o-cadastro-de-pets`, baseada na `develop` (`b6eb43b`).
>
> Os repositÃ³rios `hospetse-backend` e `hospetse-auth-service` estÃ£o clonados em `HOSPETSE/`, ao lado deste. Use-os para ler as rotas reais (rodar `git pull` antes). NÃ£o edite sem pedido.

## Objetivo

App mobile do Hospetse para tutores encontrarem e contratarem cuidadores de pets (Pet-Hotel, Pet-Sitter e Pet-Walker). Ã‰ um projeto acadÃªmico (TCC da Escola de TI): o cÃ³digo precisa ser simples de explicar numa banca.

- RepositÃ³rio: `hospetse-mobile` no Azure DevOps (organizaÃ§Ã£o `escola-ti`, projeto `Hospetse`).
- Outros repositÃ³rios do projeto: `hospetse-auth-service` (Auth Server), `hospetse-backend` (back-end principal) e `hospetse-frontend` (web).
- DecisÃµes de arquitetura do projeto inteiro (ADR-001 a ADR-014): Wiki do Azure DevOps, em Index > Desenvolvimento > Arquitetura.

## Tecnologias

- Expo SDK 58, React Native 0.88, React 19.3 e TypeScript 6 (`strict`).
- Expo Router 58: cada arquivo em `src/app/` Ã© uma rota.
- Fontes Poppins (`@expo-google-fonts/poppins`), carregadas em `src/app/_layout.tsx`.
- `axios`: cliente HTTP do Auth Server (ADR-013).
- `expo-secure-store`: guarda os tokens (ADR-005).
- `react-native-svg`: Ã­cones (jÃ¡ vem no Expo Go).
- `react-native-safe-area-context`: margens da Ã¡rea segura.
- Testes: Jest 30, `jest-expo` e `@testing-library/react-native`. Comando: `npm test`.
- Typecheck: `npx tsc --noEmit` (o binÃ¡rio local fica em `node_modules\.bin\tsc`).
- ESLint ainda nÃ£o estÃ¡ configurado no mobile.
- VariÃ¡veis de ambiente: `EXPO_PUBLIC_AUTH_URL` e `EXPO_PUBLIC_API_URL`, no `.env.local`, que fica fora do git. O modelo Ã© o `.env.example`, que fica no git e tem o endereÃ§o publicado. Como rodar: `README.md`.
- EndereÃ§os publicados e regras dos tokens (access token de 15 min, refresh de uma vez sÃ³, com fila): Wiki, em Desenvolvimento > Back-end > "APIs publicadas - URLs e contratos". Back-end: `https://backend-production-7298.up.railway.app`.

## Estrutura de pastas

| Caminho | Responsabilidade |
| --- | --- |
| `src/app/` | Telas (rotas do Expo Router). `_layout.tsx` carrega as fontes e envolve o app no `SignupProvider`. |
| `src/components/` | Componentes visuais reutilizÃ¡veis. |
| `src/constants/theme.ts` | Cores, fontes, espaÃ§amentos, raios, tipografia e sombras. Ã‰ a Ãºnica fonte de valores visuais. |
| `src/constants/terms.ts` | VersÃ£o dos Termos de Uso enviada no cadastro. |
| `src/constants/search.ts` | ServiÃ§os (com nomes no singular e no plural), portes, comodidades filtrÃ¡veis e faixa de preÃ§o. |
| `src/constants/sampleData.ts` | Tutor e pets de exemplo, compartilhados pela Home, pelos resultados e pelo Perfil (provisÃ³rio). |
| `src/constants/sampleChat.ts`, `addOns.ts` | Conversa de exemplo do chat e serviÃ§os adicionais da reserva (provisÃ³rios). |
| `src/constants/hostRegistration.ts` | OpÃ§Ãµes e limites do cadastro de Host: estruturas, experiÃªncia, faixas de peso dos portes, cÃ´modos, tamanho da apresentaÃ§Ã£o (80 a 500), espÃ©cies, documentos e limites de arquivo (5 MB por foto, 10 MB por documento). |
| `src/context/SignupContext.tsx`, `SessionContext.tsx` | Dados do cadastro e perfil atual, somente em memÃ³ria. O `SessionContext` tem o `logout()` local (DT-25). O `HostRegistrationContext` guarda o cadastro de Host entre as etapas e Ã© apagado ao sair da conta (DT-30). |
| `src/services/` | `api.ts` (`authApi`, `backendApi` com token e renovaÃ§Ã£o, `SessionExpiredError`), `auth.ts` (`requestPin`, `register`, `login`, `getErrorStatus`, `isRequestError`), `token-storage.ts` (SecureStore nativo), `token-storage.web.ts` (tokens em memÃ³ria) e `users.ts` (`GET /api/v1/me`), `hostReservations.ts` (fila de solicitaÃ§Ãµes do Host), alÃ©m de Hosts, pets e reservas do Tutor, `photo-picker.ts` (galeria, atÃ© 5 MB), `document-picker.ts` (PDF, JPEG ou PNG, atÃ© 10 MB), `host-registration.ts` (cliente do cadastro de Host da #325: rascunho, fotos, documentos, submissÃ£o e traduÃ§Ã£o dos erros), `host-submission.ts` (fila de envio com nova tentativa) e `zip-code.ts` (busca de CEP no ViaCEP). |
| `src/utils/` | FunÃ§Ãµes sem visual (`formatPhone`, `isStrongPassword`, `requestPinErrorMessage`, `validateSignup`, `validateLogin`, `validateReservation`, `calendar`, `chat`, `money`, `formatZipCode`, `cpfCnpj`, `validateHostRegistration`, `hostServerErrors`, `hostRegistrationMapping` e `searchParams`, que converte a busca em parÃ¢metros da rota). |
| `src/constants/sampleData.ts` | UsuÃ¡rio de exemplo e fallback de pets somente para a prÃ©via de desenvolvimento do chat. |
| `src/constants/sampleChat.ts`, `addOns.ts` | Conversa de exemplo do chat e serviÃ§os adicionais da reserva (provisÃ³rios). |
| `src/context/SignupContext.tsx`, `SessionContext.tsx`, `PetsContext.tsx` | Dados do cadastro, perfil atual e lista de pets do Tutor, somente em memÃ³ria. O `SessionContext` tem o `logout()` local (DT-25), e o `PetsContext` carrega e atualiza pets pela API (DT-29). |
| `src/services/` | `api.ts` (`authApi`, `backendApi` com token e renovaÃ§Ã£o, `SessionExpiredError`), `auth.ts` (`requestPin`, `register`, `login`, `getErrorStatus`, `isRequestError`), `token-storage.ts` (SecureStore nativo), `token-storage.web.ts` (tokens em memÃ³ria), `users.ts` (`GET /api/v1/me`), `pets.ts` (`GET` e `POST /api/v1/me/pets`), `hostReservations.ts` (fila de solicitaÃ§Ãµes do Host) e os serviÃ§os de Hosts e reservas do Tutor. |
| `src/utils/` | FunÃ§Ãµes sem visual (`formatPhone`, `isStrongPassword`, `requestPinErrorMessage`, `validateSignup`, `validateLogin`, `validateReservation`, `calendar`, `chat`, `money` e `searchParams`, que converte a busca em parÃ¢metros da rota). |
| `__tests__/`, `test-utils/` | Testes Jest e utilitÃ¡rios de teste (erros HTTP falsos, espiÃ£o do console). |
| `.kiro/steering/` | Regras do Kiro: arquitetura e cÃ³digo (`hospetse-architecture.md`), git (`git-workflow.md`), memÃ³ria (`memoria-projeto.md`) e retomada (`retomar-contexto.md`, manual). |
| `AGENTS.md` | Regras do Expo e a seÃ§Ã£o "Project memory", que inclui o `memoria-projeto.md`. Ã‰ o Ãºnico arquivo de regras que o Kiro carrega quando o workspace Ã© aberto na pasta `HOSPETSE`. |
| `docs/memoria/` | Esta documentaÃ§Ã£o de memÃ³ria do desenvolvimento. |

## Telas

| Rota | Arquivo | Estado atual |
| --- | --- | --- |
| `/` | `index.tsx` | Login integrado ao Auth. Mostra erros de e-mail e senha juntos, salva tokens, busca `GET /api/v1/me` e sÃ³ entÃ£o abre a Home com perfil real. Falha no `/me` mantÃ©m a sessÃ£o e permite nova tentativa. |
| `/cadastro` | `cadastro.tsx` | Tela Ãºnica com nome, e-mail, senha, confirmaÃ§Ã£o e termos. Mostra todos os erros de formato juntos, embaixo de cada campo, antes do envio. Chama `request-pin`, guarda os dados (sem a confirmaÃ§Ã£o) no `SignupContext` e vai para `/codigo`. 409 volta ao login com o aviso; 400 aparece no campo de e-mail; os outros erros abrem o `ErrorModal`. |
| `/codigo` | `codigo.tsx` | Integrado ao Auth. ApÃ³s `register`, salva tokens, busca `GET /api/v1/me` e exibe a confirmaÃ§Ã£o na prÃ³pria rota antes de abrir a Home. Se `/me` falhar, mantÃ©m a sessÃ£o e oferece nova tentativa. Reenvio do cÃ³digo a cada 60 s. Em modo dev, tem o atalho temporÃ¡rio "Abrir Home (temporÃ¡rio)" (ligado Ã  #261). |
| `/recuperar-senha` | `recuperar-senha.tsx` | SÃ³ valida o formato do e-mail no aparelho; nÃ£o chama nenhuma API. |
| `/home` | `home.tsx` | Visual completo da task #472, com cards ainda fixos. Depois do cadastro, mostra o nome e o aviso de perfil incompleto a partir do `SessionContext`, carregado do `/me`; os demais fluxos mantÃªm o fallback de exemplo. O campo de busca e a aba Buscar abrem o `SearchModal`. |
| `/resultados` | `resultados.tsx` | **#480.** Recebe `city`, `checkIn`, `checkOut`, `service` e `petId` pela rota. O tÃ­tulo mostra a contagem e o serviÃ§o ("1 Pet-Sitter encontrado"). Lista vertical de `PetCard`, com o botÃ£o `tune` que abre o `FiltersModal` (com o nÃºmero de filtros ativos) e o estado vazio com "Ajustar filtros". O campo e a aba Buscar refazem a busca. **#518:** dados reais do `GET /api/v1/hosts/search`, com erro e "Tentar de novo". |
| `/host/[id]` | `host/[id].tsx` | **#480.** Detalhe do Host no formato do `GET /api/v1/hosts/{id}` (#479), com dados reais desde a #518 (comodidades, requisitos e rotina ainda de exemplo): capa, nome, preÃ§o por noite, bairro e cidade, nota, comodidades, disponibilidade (datas da busca), descriÃ§Ã£o com "Ler mais", rotina com "Ler mais" que abre o `RoutineModal` (#519), galeria com "+N", endereÃ§o e requisitos. RodapÃ© com "Tire suas dÃºvidas", que abre o chat (#520), e "Solicitar reserva", que abre a confirmaÃ§Ã£o (#495). Tem carregamento (`Skeleton`) e "Hospedagem nÃ£o encontrada". |
| `/chat/[id]` | `chat/[id].tsx` | **#520.** Chat com o Host, aberto pelo detalhe com `checkIn`, `checkOut` e `petId`. CabeÃ§alho com voltar, foto, nome, status e mais opÃ§Ãµes (sem ligar). Faixa "Interesse em reservar" com datas, total e pet. Mensagens do Assistente ("Ativa"), do Tutor e do Host ("Atendimento Humano"), separadas por dia, com imagem e sugestÃµes rÃ¡pidas. Conversa de exemplo; o envio sÃ³ mostra a mensagem na tela (DT-22). |
| `/reserva/[id]` | `reserva/[id].tsx` | **#495.** "Confirmar Reserva", aberta pelo detalhe com `checkIn`, `checkOut` e `petId`. Host real, perÃ­odo (o calendÃ¡rio abre por cima), pets reais do `GET /api/v1/me/pets`, serviÃ§os adicionais de exemplo (nÃ£o somam) e total das diÃ¡rias. Envia pelo `POST /api/v1/reservations` com `Idempotency-Key` e mostra o sucesso na mesma rota. Modais "Pet nÃ£o permitido", "Data indisponÃ­vel", "Cadastro Incompleto" e "Algo deu errado"; avisos seguem o protÃ³tipo da #489 com card central, fundo escurecido e `pet_supplies` (DT-24). |
| `/reservas` | `reservas.tsx` | **#486.** Lista as solicitaÃ§Ãµes pendentes recebidas pelo Host via `GET /api/v1/me/host/reservations`, com total, cards de Tutor/pet/perÃ­odo/valor, estado vazio, erro, retry e atualizaÃ§Ã£o por gesto. Tocar no card abre `/reserva-host/[id]` para a decisÃ£o (#492). |
| `/reserva-host/[id]` | `reserva-host/[id].tsx` | **#492.** Detalhe da solicitaÃ§Ã£o para o Host, com confirmaÃ§Ã£o de aceite, recusa com motivo obrigatÃ³rio, dados mÃ©dicos/comportamentais do pet e mensagens de conflito. |
| `/perfil` | `perfil.tsx` | **#326 (DT-29). Esqueleto: nÃ£o Ã© a tela final.** "Meu Perfil" do usuÃ¡rio comum, aberto pela aba Perfil da Home. CabeÃ§alho com sino e engrenagem, card com nome e e-mail do cadastro (do `/me`) e um Ã­cone no lugar da foto, "Meus Pets", convite "Quero ser Host" (abre o cadastro de Host e retoma o rascunho: busca `GET /api/v1/me/host` e abre a etapa onde o usuÃ¡rio parou), menu "Minha conta" (pagamento, endereÃ§os, vacinaÃ§Ã£o, notificaÃ§Ãµes e "Completar/Editar perfil"), "Sair da conta" (logout local, DT-25) e a versÃ£o do app no rodapÃ©. A aba Home volta Ã  Home, a Buscar abre o `SearchModal` e a Reservas abre `/reservas`. |
| `/cadastro-host` | `cadastro-host/index.tsx` | **#326 (DT-30). Etapa 1, "Torne-se AnfitriÃ£o".** Estrutura do espaÃ§o (Casa, Apartamento, Casa com quintal), "HÃ¡ outros pets", espÃ©cies e portes aceitos (vÃ¡rios), capacidade, experiÃªncia com pets, dois interruptores (idosos ou sob medicaÃ§Ã£o; castrados) e a apresentaÃ§Ã£o do cuidador (80 a 500 caracteres, com contador). Mostra todos os erros juntos. BotÃ£o "AvanÃ§ar para fotos e EndereÃ§o": salva o rascunho (`PUT /api/v1/me/host`) e mostra o erro do servidor no campo (DT-31). Dados no `HostRegistrationContext`. |
| `/cadastro-host/fotos` | `cadastro-host/fotos.tsx` | **#326 (DT-30). Etapa 2.** Foto principal (capa) e fotos de Sala, Copa e Quintal, escolhidas na galeria (atÃ© 5 MB cada), e "LocalizaÃ§Ã£o do EspaÃ§o": CEP com mÃ¡scara e botÃ£o "Buscar" (ViaCEP), rua, nÃºmero, complemento (opcional), bairro e cidade/UF. TambÃ©m "IdentificaÃ§Ã£o e Documentos": CPF ou CNPJ (com mÃ¡scara e dÃ­gitos verificadores) e os documentos de identidade, comprovante de endereÃ§o e, para CNPJ, cartÃ£o CNPJ (PDF, JPEG ou PNG, atÃ© 10 MB). "Enviar para anÃ¡lise" salva o rascunho, sobe fotos e documentos um a um (com progresso e "Tentar de novo", sem repetir o que jÃ¡ subiu) e submete (`POST /api/v1/me/host/submit`). Erro do servidor aparece no campo; os da etapa 1 voltam para ela (DT-31). |
| `/anfitriao` | `anfitriao.tsx` | **#326 (DT-32). Esqueleto com dados de exemplo.** "Painel do AnfitriÃ£o", a tela de quem teve o cadastro de Host aprovado: boas-vindas ("VocÃª agora Ã© um AnfitriÃ£o!"), ganhos do mÃªs e saldo (exemplo) e 7 acessos do mÃ³dulo Host (solicitaÃ§Ãµes, hospedagem ativa, agenda, preÃ§os, financeiro e repasse, Assistente de IA, perfil do AnfitriÃ£o). SÃ³ "SolicitaÃ§Ãµes de reserva" tem tela: abre `/reservas` (#486); os outros 6 ainda nÃ£o fazem nada. "Voltar ao modo Tutor" leva Ã  Home. Abre pelo botÃ£o "Abrir painel do AnfitriÃ£o" da tela de anÃ¡lise quando o cadastro estÃ¡ aprovado; em desenvolvimento tambÃ©m por um link de prÃ©via. |
| `/cadastro-host/analise` | `cadastro-host/analise.tsx` | **#326 (DT-30). Tela final.** a situaÃ§Ã£o do cadastro: "Cadastro enviado para anÃ¡lise" (pendente de validaÃ§Ã£o), "Cadastro aprovado" ou "Cadastro nÃ£o aprovado", com o selo e, se pendente, o que acontece depois (perfil fora das buscas e sem reservas atÃ© a aprovaÃ§Ã£o; aviso se for rejeitado). "Voltar ao Perfil" e "Ir para o InÃ­cio" limpam o cadastro em memÃ³ria; o voltar do Android e o gesto de voltar do iOS nÃ£o reabrem as etapas. |

A busca (#477) Ã© um modal por cima da Home ou dos resultados, nÃ£o uma rota. Os filtros tambÃ©m sÃ£o um modal (`FiltersModal`), aberto pelos resultados.

Telas que o cÃ³digo jÃ¡ indica e que ainda nÃ£o existem: Reservas (aba da Home e "Ver minhas reservas"); as telas de destino do menu do Perfil; cadastro de pet ("Adicionar Pet"); conclusÃ£o do perfil do Tutor (ADR-011; a rota `PUT /api/v1/me/tutor-profile` existe no back-end). Para a lista completa, consulte o Figma e a Wiki (Desenvolvimento > Front-end > Fluxo de Telas).
| `/agenda-host` | `agenda-host.tsx` | **#483.** Agenda mensal do Host com dias livres, bloqueados e ocupados, capacidade, legenda, bloqueio por perÃ­odo e desbloqueio de dia, usando as rotas da #482 (DT-29). |
| `/pets` | `pets.tsx` | **#371.** Lista os pets ativos do Tutor, com carregamento, estado vazio, erro com nova tentativa e acesso ao cadastro. |
| `/minhas-contratacoes` | `minhas-contratacoes.tsx` | **#534.** Lista provisÃ³ria de contrataÃ§Ãµes do Tutor, com status, Host, pet, perÃ­odo, valor, estados de carregamento/vazio/erro e aÃ§Ãµes preparadas para pagamento, acompanhamento e chat. A fonte ainda Ã© simulada atÃ© o backend publicar o contrato. |

A busca (#477) Ã© um modal por cima da Home ou dos resultados, nÃ£o uma rota. Os filtros tambÃ©m sÃ£o um modal (`FiltersModal`), aberto pelos resultados.

Telas que o cÃ³digo jÃ¡ indica e que ainda nÃ£o existem: Reservas e Perfil (abas da Home e "Ver minhas reservas") e conclusÃ£o do perfil do Tutor (ADR-011; a rota `PUT /api/v1/me/tutor-profile` existe no back-end). Para a lista completa, consulte o Figma e a Wiki (Desenvolvimento > Front-end > Fluxo de Telas).

## Componentes reutilizÃ¡veis

| Componente | Uso |
| --- | --- |
| `Button` | BotÃ£o laranja padrÃ£o, com `loading` (desabilita e mostra um indicador) e `icon` opcional depois do texto. |
| `CodeInput` | Caixas de dÃ­gitos do cÃ³digo (PIN). |
| `InfoIcon` | Ãcone "i" laranja das dicas de formulÃ¡rio. |
| `Skeleton` | Bloco que pulsa durante o carregamento. Usado nos resultados e no detalhe do Host. |
| `Icon` | Ãcones Material Symbols Outlined. A lista estÃ¡ em `ICON_PATHS`, no `Icon.tsx`. |
| `UserHeader` | Foto, nome e cidade do Tutor, o sino e, com `onLogout`, o botÃ£o "Sair". Usado na Home e nos resultados. |
| `FiltersModal` | Filtros em tela cheia: tipo de serviÃ§o, porte, faixa de preÃ§o e comodidades, com "Limpar filtros" e "Aplicar Filtros". Exporta `ResultFilters` e `EMPTY_RESULT_FILTERS`. |
| `PriceSlider` | Barra de preÃ§o mÃ¡ximo feita sÃ³ com Views (sem biblioteca), com aÃ§Ãµes de aumentar e diminuir para o leitor de tela. |
| `AmenityItem` | Comodidade do Host: Ã­cone num cÃ­rculo e nome. |
| `RoutineModal` | Rotina do Host, que sobe por baixo: etapas por perÃ­odo (manhÃ£, tarde, noite) com horÃ¡rio e descriÃ§Ã£o, garantia veterinÃ¡ria e "Fechar" (DT-21). |
| `ChatBubble` | BalÃ£o de mensagem do chat: Tutor Ã  direita em laranja; Assistente e Host Ã  esquerda, com selo e sugestÃµes rÃ¡pidas. |
| `BookingInterest` | Faixa "Interesse em reservar" do chat: datas, valor, pet e "Ver detalhes". |
| `ChatInput` | Campo de mensagem com anexo e microfone (sem aÃ§Ã£o) e envio, desligado com o campo vazio. |
| `OutlineButton` | BotÃ£o secundÃ¡rio com borda laranja e Ã­cone opcional. |
| `SearchModal` | Busca com 4 seÃ§Ãµes (Onde?, Para quando?, Qual serviÃ§o?, Para quem?). Exporta `SearchFilters`, `EMPTY_FILTERS`, `ServiceType` e `PetSummary`. |
| `FilterSection` | SeÃ§Ã£o que abre e fecha (tÃ­tulo, seta opcional e conteÃºdo). |
| `Calendar` | Um mÃªs com setas, dias passados desabilitados e seleÃ§Ã£o de check-in e check-out. |
| `PetOption` | Foto redonda e nome do pet, com estado escolhido. Sem foto, mostra a patinha. |
| `DateRangeModal` | CalendÃ¡rio por cima da tela para trocar o perÃ­odo, com "Confirmar datas". |
| `AddOnItem` | ServiÃ§o adicional da reserva: caixa de marcar, nome, descriÃ§Ã£o e preÃ§o por dia. |
| `ReservationSuccess` | Sucesso da solicitaÃ§Ã£o: resumo do Host, datas, pet, diÃ¡rias e total, "Ver minhas reservas" e "Voltar para InÃ­cio". |
| `HostRequestCard` | Card da fila do Host: status, Tutor, pet, perÃ­odo, valor e observaÃ§Ãµes. |
| `SearchBar` | Campo de busca com lupa. |
| `FilterChip` | Chip de categoria, ativo ou inativo. |
| `PetCard` | Card de hospedagem (foto, avaliaÃ§Ã£o, nome, cidade e preÃ§o), nos tamanhos `large` e `small`. |
| `BottomTabBar` | Barra inferior com as abas Home, Buscar, Reservas e Perfil (exporta o tipo `TabKey`). |
| `FieldError` | Texto de erro embaixo de um campo. Sem mensagem, nÃ£o mostra nada. |
| `ErrorModal` | Aviso de erro com fundo escurecido e blur, card central, Ã­cone Material Symbols `pet_supplies`, tÃ­tulo, texto e botÃ£o. |
| `StatusPill` | Selo arredondado com texto curto, cores por parÃ¢metro e Ã­cone opcional ("Pendente"). |
| `ProfileMenuItem` | Linha do menu "Minha conta": Ã­cone colorido, tÃ­tulo, subtÃ­tulo, selo opcional e seta. |
| `HostInviteCard` | Card "Seja um Host" do Perfil, com o botÃ£o "Quero ser Host" (#326). |
| `HostFormHeader` | Topo das etapas do cadastro de Host: seta de voltar, "Torne-se AnfitriÃ£o" e a explicaÃ§Ã£o. |
| `HostTermsNote` | Aviso "Ao prosseguir, vocÃª confirma que leu e concorda com as Diretrizes da Comunidade e os Termos de Hospedagem Segura". |
| `OptionCard` | OpÃ§Ã£o em cartÃ£o, laranja quando escolhida. `role` `radio` (uma escolha) ou `checkbox` (vÃ¡rias). Usada em estrutura, portes e experiÃªncia. |
| `SwitchRow` | Pergunta com explicaÃ§Ã£o curta e interruptor de sim ou nÃ£o. |
| `FormField` | Campo de texto com nome em cima, erro embaixo, dica ao lado do nome ("(Opcional)") e modo `readOnly` (cinza, para o que o CEP preenche). |
| `PhotoTile` | Quadrado de um cÃ´modo: "+" quando vazio; com foto, mostra a imagem, o nome e a lixeira. |
| `DocumentRow` | Linha de um documento do cadastro de Host: nome, arquivo escolhido ou "JÃ¡ enviado", erro e botÃ£o Enviar/Trocar. |
| `UploadProgressModal` | Janela do envio do cadastro: uma linha por fase e arquivo, com barra de progresso; na falha mostra o motivo e "Tentar de novo". |

## PadrÃµes obrigatÃ³rios

- Seguir os steerings `hospetse-architecture.md` e `git-workflow.md`.
- Nunca usar hexadecimal nem medida fixa de borda direto no componente: os valores vÃªm de `theme.ts`.
- Estilos em `StyleSheet.create()` no fim do arquivo. Componentes funcionais com props desestruturadas.
- Estado local com `useState`. Context sÃ³ quando o dado precisa passar entre rotas.
- ParÃ¢metros de rota servem sÃ³ para valores leves (id, primeiro nome).
- Sombras: as telas antigas usam `shadow*` (laranja). A Home usa `boxShadow` com `theme.shadow.soft`, `card`, `bar` e `active`.
- Ãcone novo: adicione o caminho SVG oficial do Material Symbols em `ICON_PATHS`, no `Icon.tsx` (veja a DT-01).
- Expo: use `npx expo install` para dependÃªncias e, antes de usar uma API, confira a documentaÃ§Ã£o da versÃ£o 58 (veja o `AGENTS.md`).

## IntegraÃ§Ãµes

- Auth Server (`EXPO_PUBLIC_AUTH_URL`): `POST /api/v1/auth/request-pin`, `POST /api/v1/auth/register`, `POST /api/v1/auth/login` e `POST /api/v1/auth/refresh`. NÃ£o hÃ¡ rota de logout (#297 removida): o logout Ã© local (DT-25).
- Validade dos tokens: access token de 15 minutos; refresh token de 30 dias, de uso Ãºnico e rotativo.
- Contratos atuais: `https://auth-service-production-36e0.up.railway.app/docs` e `https://backend-production-7298.up.railway.app/docs` (o arquivo Ã© o `/docs/openapi.yaml`).
- Tokens: SecureStore (Keychain ou Keystore), nunca AsyncStorage (ADR-005).
- Back-end principal (`EXPO_PUBLIC_API_URL`), pelo `backendApi` com token e renovaÃ§Ã£o em fila (DT-19):
  - `GET /api/v1/hosts/search` (#476), usado nos resultados;
  - `GET /api/v1/hosts/{id}` (#479), usado no detalhe, no chat e na reserva. Manda sÃ³ bairro e cidade.
  - `GET /api/v1/me/pets` (#369), usado na lista, na busca, no chat e na reserva. Os pets nÃ£o tÃªm foto.
  - `POST /api/v1/me/pets` (#369), usado no cadastro da rota `/pets/cadastro`.
  - `GET /api/v1/me/reservations` (futuro HSP-PBI-046-TSK-01), ainda nÃ£o disponÃ­vel; `/minhas-contratacoes` usa dados simulados.
  - `POST /api/v1/reservations` (#494), com o header `Idempotency-Key` (DT-23).
  - `GET /api/v1/me/host/reservations` (#485), usado pela lista de solicitaÃ§Ãµes do Host (#486).
  - `POST /api/v1/me/host/reservations/:id/accept` e `/reject` (#491), usados na decisÃ£o do Host (#492).
  - `GET /api/v1/me/host/agenda`, `POST /api/v1/me/host/agenda/blocks` e `DELETE /api/v1/me/host/agenda/blocks/{id}` (#482), usados na agenda (#483).
  - Os filtros de serviÃ§o, comodidades e vÃ¡rios portes ainda nÃ£o existem na API e ficam sem efeito (DT-20).
- Cadastro de Host (#325, DT-31): `GET` e `PUT /api/v1/me/host`, `POST /api/v1/me/host/photos` e `POST /api/v1/me/host/documents` (multipart, um arquivo por requisiÃ§Ã£o) e `POST /api/v1/me/host/submit`. Publicado no back-end do Railway; sÃ³ a situaÃ§Ã£o (`draft`, `pending`, `approved`, `rejected`) volta para o app.
- CEP: o cadastro de Host consulta o ViaCEP (`https://viacep.com.br/ws/{cep}/json/`), serviÃ§o pÃºblico de terceiros. SÃ³ os 8 dÃ­gitos do CEP saem do aparelho (DT-30).
- O CORS para `localhost:8081` estÃ¡ liberado no Auth e no back-end. Na Web, os tokens ficam sÃ³ na memÃ³ria e somem no reload (DT-24).

## RestriÃ§Ãµes

- NÃ£o registrar senha, PIN, token nem dados pessoais em log, cÃ³digo ou nesta documentaÃ§Ã£o.
- O `SignupContext` guarda os dados sÃ³ em memÃ³ria: eles somem ao concluir, cancelar ou fechar o app.
- Commit, push, PR e merge sÃ³ com autorizaÃ§Ã£o da desenvolvedora.
- Bibliotecas com cÃ³digo nativo fora do Expo Go exigem development build: evite.

## Ãšltimo estado conhecido (2026-11-11)

- Branch atual: `feature/371-implementar-a-lista-e-o-cadastro-de-pets`, criada a partir da `develop` (`b6eb43b`). O PR 86 foi revisado e sua tela de Perfil estÃ¡ incorporada localmente sem commit; a base remota `develop` estÃ¡ mais avanÃ§ada e ainda precisa ser atualizada antes do commit.
- A #371 implementa `/pets` e `/pets/cadastro`, `PetsContext`, cliente de criaÃ§Ã£o/listagem, integraÃ§Ã£o da busca e atualizaÃ§Ã£o do botÃ£o "Adicionar Pet" na reserva.
- VerificaÃ§Ãµes da implementaÃ§Ã£o: `npx tsc --noEmit` passou; `npx expo export --platform web` passou; a suÃ­te Jest passou com `--testTimeout=15000` apÃ³s corrigir a compatibilidade do chat com a prÃ©via de desenvolvimento.
- Falta validar o fluxo com login real e perfil de Tutor concluÃ­do no Expo Go. EdiÃ§Ã£o, remoÃ§Ã£o e foto de pet dependem de endpoints que o back-end ainda nÃ£o possui.
