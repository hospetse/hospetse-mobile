# Contexto do projeto: Hospetse Mobile

> Resumo principal para retomar o trabalho. Mantenha curto e fiel ao código.
> Última atualização: 2026-11-04. Descreve a `develop` (`ea2f77a`, com os PRs até o !71), mais a #299 (PR !72, aberto) e a #300 na branch `feature/300-implementar-a-renovacao-de-sessao-e-o-logout-no-mobile`, sem commit.
>
> Os repositórios `hospetse-backend` e `hospetse-auth-service` estão clonados em `HOSPETSE/`, ao lado deste. Use-os para ler as rotas reais (rodar `git pull` antes). Não edite sem pedido.

## Objetivo

App mobile do Hospetse para tutores encontrarem e contratarem cuidadores de pets (Pet-Hotel, Pet-Sitter e Pet-Walker). É um projeto acadêmico (TCC da Escola de TI): o código precisa ser simples de explicar numa banca.

- Repositório: `hospetse-mobile` no Azure DevOps (organização `escola-ti`, projeto `Hospetse`).
- Outros repositórios do projeto: `hospetse-auth-service` (Auth Server), `hospetse-backend` (back-end principal) e `hospetse-frontend` (web).
- Decisões de arquitetura do projeto inteiro (ADR-001 a ADR-014): Wiki do Azure DevOps, em Index > Desenvolvimento > Arquitetura.

## Tecnologias

- Expo SDK 58, React Native 0.88, React 19.3 e TypeScript 6 (`strict`).
- Expo Router 58: cada arquivo em `src/app/` é uma rota.
- Fontes Poppins (`@expo-google-fonts/poppins`), carregadas em `src/app/_layout.tsx`.
- `axios`: cliente HTTP do Auth Server (ADR-013).
- `expo-secure-store`: guarda os tokens (ADR-005).
- `react-native-svg`: ícones (já vem no Expo Go).
- `react-native-safe-area-context`: margens da área segura.
- Testes: Jest 30, `jest-expo` e `@testing-library/react-native`. Comando: `npm test`.
- Typecheck: `npx tsc --noEmit` (o binário local fica em `node_modules\.bin\tsc`).
- ESLint ainda não está configurado no mobile.
- Variáveis de ambiente: `EXPO_PUBLIC_AUTH_URL` e `EXPO_PUBLIC_API_URL`, no `.env.local`, que fica fora do git. O modelo é o `.env.example`, que fica no git e tem o endereço publicado. Como rodar: `README.md`.
- Endereços publicados e regras dos tokens (access token de 15 min, refresh de uma vez só, com fila): Wiki, em Desenvolvimento > Back-end > "APIs publicadas - URLs e contratos". Back-end: `https://backend-production-7298.up.railway.app`.

## Estrutura de pastas

| Caminho | Responsabilidade |
| --- | --- |
| `src/app/` | Telas (rotas do Expo Router). `_layout.tsx` carrega as fontes e envolve o app no `SignupProvider`. |
| `src/components/` | Componentes visuais reutilizáveis. |
| `src/constants/theme.ts` | Cores, fontes, espaçamentos, raios, tipografia e sombras. É a única fonte de valores visuais. |
| `src/constants/terms.ts` | Versão dos Termos de Uso enviada no cadastro. |
| `src/constants/search.ts` | Serviços (com nomes no singular e no plural), portes, comodidades filtráveis e faixa de preço. |
| `src/constants/sampleData.ts` | Tutor e pets de exemplo, compartilhados pela Home, pelos resultados e pelo Perfil (provisório). |
| `src/constants/sampleChat.ts`, `addOns.ts` | Conversa de exemplo do chat e serviços adicionais da reserva (provisórios). |
| `src/context/SignupContext.tsx`, `SessionContext.tsx` | Dados do cadastro e perfil atual, somente em memória. O `SessionContext` tem o `logout()` local (DT-25). |
| `src/services/` | `api.ts` (`authApi`, `backendApi` com token e renovação, `SessionExpiredError`), `auth.ts` (`requestPin`, `register`, `login`, `getErrorStatus`, `isRequestError`), `token-storage.ts` (SecureStore nativo), `token-storage.web.ts` (tokens em memória) e `users.ts` (`GET /api/v1/me`), além de Hosts, pets e reservas. |
| `src/utils/` | Funções sem visual (`formatPhone`, `isStrongPassword`, `requestPinErrorMessage`, `validateSignup`, `validateLogin`, `validateReservation`, `calendar`, `chat`, `money` e `searchParams`, que converte a busca em parâmetros da rota). |
| `__tests__/`, `test-utils/` | Testes Jest e utilitários de teste (erros HTTP falsos, espião do console). |
| `.kiro/steering/` | Regras do Kiro: arquitetura e código (`hospetse-architecture.md`), git (`git-workflow.md`), memória (`memoria-projeto.md`) e retomada (`retomar-contexto.md`, manual). |
| `AGENTS.md` | Regras do Expo e a seção "Project memory", que inclui o `memoria-projeto.md`. É o único arquivo de regras que o Kiro carrega quando o workspace é aberto na pasta `HOSPETSE`. |
| `docs/memoria/` | Esta documentação de memória do desenvolvimento. |

## Telas

| Rota | Arquivo | Estado atual |
| --- | --- | --- |
| `/` | `index.tsx` | Login integrado ao Auth. Mostra erros de e-mail e senha juntos, salva tokens, busca `GET /api/v1/me` e só então abre a Home com perfil real. Falha no `/me` mantém a sessão e permite nova tentativa. |
| `/cadastro` | `cadastro.tsx` | Tela única com nome, e-mail, senha, confirmação e termos. Mostra todos os erros de formato juntos, embaixo de cada campo, antes do envio. Chama `request-pin`, guarda os dados (sem a confirmação) no `SignupContext` e vai para `/codigo`. 409 volta ao login com o aviso; 400 aparece no campo de e-mail; os outros erros abrem o `ErrorModal`. |
| `/codigo` | `codigo.tsx` | Integrado ao Auth. Após `register`, salva tokens, busca `GET /api/v1/me` e exibe a confirmação na própria rota antes de abrir a Home. Se `/me` falhar, mantém a sessão e oferece nova tentativa. Reenvio do código a cada 60 s. Em modo dev, tem o atalho temporário "Abrir Home (temporário)" (ligado à #261). |
| `/recuperar-senha` | `recuperar-senha.tsx` | Só valida o formato do e-mail no aparelho; não chama nenhuma API. |
| `/home` | `home.tsx` | Visual completo da task #472, com cards ainda fixos. Depois do cadastro, mostra o nome e o aviso de perfil incompleto a partir do `SessionContext`, carregado do `/me`; os demais fluxos mantêm o fallback de exemplo. O campo de busca e a aba Buscar abrem o `SearchModal`. |
| `/resultados` | `resultados.tsx` | **#480.** Recebe `city`, `checkIn`, `checkOut`, `service` e `petId` pela rota. O título mostra a contagem e o serviço ("1 Pet-Sitter encontrado"). Lista vertical de `PetCard`, com o botão `tune` que abre o `FiltersModal` (com o número de filtros ativos) e o estado vazio com "Ajustar filtros". O campo e a aba Buscar refazem a busca. **#518:** dados reais do `GET /api/v1/hosts/search`, com erro e "Tentar de novo". |
| `/host/[id]` | `host/[id].tsx` | **#480.** Detalhe do Host no formato do `GET /api/v1/hosts/{id}` (#479), com dados reais desde a #518 (comodidades, requisitos e rotina ainda de exemplo): capa, nome, preço por noite, bairro e cidade, nota, comodidades, disponibilidade (datas da busca), descrição com "Ler mais", rotina com "Ler mais" que abre o `RoutineModal` (#519), galeria com "+N", endereço e requisitos. Rodapé com "Tire suas dúvidas", que abre o chat (#520), e "Solicitar reserva", que abre a confirmação (#495). Tem carregamento (`Skeleton`) e "Hospedagem não encontrada". |
| `/chat/[id]` | `chat/[id].tsx` | **#520.** Chat com o Host, aberto pelo detalhe com `checkIn`, `checkOut` e `petId`. Cabeçalho com voltar, foto, nome, status e mais opções (sem ligar). Faixa "Interesse em reservar" com datas, total e pet. Mensagens do Assistente ("Ativa"), do Tutor e do Host ("Atendimento Humano"), separadas por dia, com imagem e sugestões rápidas. Conversa de exemplo; o envio só mostra a mensagem na tela (DT-22). |
| `/reserva/[id]` | `reserva/[id].tsx` | **#495.** "Confirmar Reserva", aberta pelo detalhe com `checkIn`, `checkOut` e `petId`. Host real, período (o calendário abre por cima), pets reais do `GET /api/v1/me/pets`, serviços adicionais de exemplo (não somam) e total das diárias. Envia pelo `POST /api/v1/reservations` com `Idempotency-Key` e mostra o sucesso na mesma rota. Modais "Pet não permitido", "Data indisponível", "Cadastro Incompleto" e "Algo deu errado"; avisos seguem o protótipo da #489 com card central, fundo escurecido e `pet_supplies` (DT-24). |
| `/perfil` | `perfil.tsx` | **#326 (DT-26).** "Meu Perfil" do usuário comum, aberto pela aba Perfil da Home. Cabeçalho com sino e engrenagem, card com nome e e-mail do cadastro (do `/me`) e um ícone no lugar da foto, "Meus Pets", convite "Quero ser Host" (entrada do cadastro de Host, ainda sem ação), menu "Minha conta" (pagamento, endereços, vacinação, notificações e "Completar/Editar perfil"), "Sair da conta" (logout local, DT-25) e a versão do app no rodapé. A aba Home volta à Home e a Buscar abre o `SearchModal`. |

A busca (#477) é um modal por cima da Home ou dos resultados, não uma rota. Os filtros também são um modal (`FiltersModal`), aberto pelos resultados.

Telas que o código já indica e que ainda não existem: Reservas (aba da Home e "Ver minhas reservas"); as telas de destino do menu do Perfil; as etapas do cadastro de Host (#326); cadastro de pet ("Adicionar Pet"); conclusão do perfil do Tutor (ADR-011; a rota `PUT /api/v1/me/tutor-profile` existe no back-end). Para a lista completa, consulte o Figma e a Wiki (Desenvolvimento > Front-end > Fluxo de Telas).

## Componentes reutilizáveis

| Componente | Uso |
| --- | --- |
| `Button` | Botão laranja padrão, com `loading` (desabilita e mostra um indicador) e `icon` opcional depois do texto. |
| `CodeInput` | Caixas de dígitos do código (PIN). |
| `InfoIcon` | Ícone "i" laranja das dicas de formulário. |
| `Skeleton` | Bloco que pulsa durante o carregamento. Usado nos resultados e no detalhe do Host. |
| `Icon` | Ícones Material Symbols Outlined. A lista está em `ICON_PATHS`, no `Icon.tsx`. |
| `UserHeader` | Foto, nome e cidade do Tutor, o sino e, com `onLogout`, o botão "Sair". Usado na Home e nos resultados. |
| `FiltersModal` | Filtros em tela cheia: tipo de serviço, porte, faixa de preço e comodidades, com "Limpar filtros" e "Aplicar Filtros". Exporta `ResultFilters` e `EMPTY_RESULT_FILTERS`. |
| `PriceSlider` | Barra de preço máximo feita só com Views (sem biblioteca), com ações de aumentar e diminuir para o leitor de tela. |
| `AmenityItem` | Comodidade do Host: ícone num círculo e nome. |
| `RoutineModal` | Rotina do Host, que sobe por baixo: etapas por período (manhã, tarde, noite) com horário e descrição, garantia veterinária e "Fechar" (DT-21). |
| `ChatBubble` | Balão de mensagem do chat: Tutor à direita em laranja; Assistente e Host à esquerda, com selo e sugestões rápidas. |
| `BookingInterest` | Faixa "Interesse em reservar" do chat: datas, valor, pet e "Ver detalhes". |
| `ChatInput` | Campo de mensagem com anexo e microfone (sem ação) e envio, desligado com o campo vazio. |
| `OutlineButton` | Botão secundário com borda laranja e ícone opcional. |
| `SearchModal` | Busca com 4 seções (Onde?, Para quando?, Qual serviço?, Para quem?). Exporta `SearchFilters`, `EMPTY_FILTERS`, `ServiceType` e `PetSummary`. |
| `FilterSection` | Seção que abre e fecha (título, seta opcional e conteúdo). |
| `Calendar` | Um mês com setas, dias passados desabilitados e seleção de check-in e check-out. |
| `PetOption` | Foto redonda e nome do pet, com estado escolhido. Sem foto, mostra a patinha. |
| `DateRangeModal` | Calendário por cima da tela para trocar o período, com "Confirmar datas". |
| `AddOnItem` | Serviço adicional da reserva: caixa de marcar, nome, descrição e preço por dia. |
| `ReservationSuccess` | Sucesso da solicitação: resumo do Host, datas, pet, diárias e total, "Ver minhas reservas" e "Voltar para Início". |
| `SearchBar` | Campo de busca com lupa. |
| `FilterChip` | Chip de categoria, ativo ou inativo. |
| `PetCard` | Card de hospedagem (foto, avaliação, nome, cidade e preço), nos tamanhos `large` e `small`. |
| `BottomTabBar` | Barra inferior com as abas Home, Buscar, Reservas e Perfil (exporta o tipo `TabKey`). |
| `FieldError` | Texto de erro embaixo de um campo. Sem mensagem, não mostra nada. |
| `ErrorModal` | Aviso de erro com fundo escurecido e blur, card central, ícone Material Symbols `pet_supplies`, título, texto e botão. |
| `StatusPill` | Selo arredondado com texto curto, cores por parâmetro e ícone opcional ("Pendente"). |
| `ProfileMenuItem` | Linha do menu "Minha conta": ícone colorido, título, subtítulo, selo opcional e seta. |
| `HostInviteCard` | Card "Seja um Host" do Perfil, com o botão "Quero ser Host" (#326). |

## Padrões obrigatórios

- Seguir os steerings `hospetse-architecture.md` e `git-workflow.md`.
- Nunca usar hexadecimal nem medida fixa de borda direto no componente: os valores vêm de `theme.ts`.
- Estilos em `StyleSheet.create()` no fim do arquivo. Componentes funcionais com props desestruturadas.
- Estado local com `useState`. Context só quando o dado precisa passar entre rotas.
- Parâmetros de rota servem só para valores leves (id, primeiro nome).
- Sombras: as telas antigas usam `shadow*` (laranja). A Home usa `boxShadow` com `theme.shadow.soft`, `card`, `bar` e `active`.
- Ícone novo: adicione o caminho SVG oficial do Material Symbols em `ICON_PATHS`, no `Icon.tsx` (veja a DT-01).
- Expo: use `npx expo install` para dependências e, antes de usar uma API, confira a documentação da versão 58 (veja o `AGENTS.md`).

## Integrações

- Auth Server (`EXPO_PUBLIC_AUTH_URL`): `POST /api/v1/auth/request-pin`, `POST /api/v1/auth/register`, `POST /api/v1/auth/login` e `POST /api/v1/auth/refresh`. Não há rota de logout (#297 removida): o logout é local (DT-25).
- Validade dos tokens: access token de 15 minutos; refresh token de 30 dias, de uso único e rotativo.
- Contratos atuais: `https://auth-service-production-36e0.up.railway.app/docs` e `https://backend-production-7298.up.railway.app/docs` (o arquivo é o `/docs/openapi.yaml`).
- Tokens: SecureStore (Keychain ou Keystore), nunca AsyncStorage (ADR-005).
- Back-end principal (`EXPO_PUBLIC_API_URL`), pelo `backendApi` com token e renovação em fila (DT-19):
  - `GET /api/v1/hosts/search` (#476), usado nos resultados;
  - `GET /api/v1/hosts/{id}` (#479), usado no detalhe, no chat e na reserva. Manda só bairro e cidade.
  - `GET /api/v1/me/pets` (#369), usado na reserva. Os pets não têm foto.
  - `POST /api/v1/reservations` (#494), com o header `Idempotency-Key` (DT-23).
  - Os filtros de serviço, comodidades e vários portes ainda não existem na API e ficam sem efeito (DT-20).
- O CORS para `localhost:8081` está liberado no Auth e no back-end. Na Web, os tokens ficam só na memória e somem no reload (DT-24).

## Restrições

- Não registrar senha, PIN, token nem dados pessoais em log, código ou nesta documentação.
- O `SignupContext` guarda os dados só em memória: eles somem ao concluir, cancelar ou fechar o app.
- Commit, push, PR e merge só com autorização da desenvolvedora.
- Bibliotecas com código nativo fora do Expo Go exigem development build: evite.

## Último estado conhecido (2026-11-02)

- Na `develop` (`fdcf8e8`): PRs até o !69. A branch `feature/267-...` ainda existe no servidor, e só o Murilo pode apagá-la.
- Branch atual: `feature/269-iniciar-a-sessao-apos-o-cadastro-e-exibir-a-confirmacao`, ainda sem commit ou push.
- Verificações em 2026-11-02: `expo-doctor` 20/20, `tsc --noEmit` sem erros, Jest 126 de 126 e `npx expo export --platform web` concluído.
- A #269 ainda precisa de validação manual no navegador e no Expo Go com cadastro e PIN reais.
