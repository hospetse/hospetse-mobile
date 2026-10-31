# Contexto do projeto: Hospetse Mobile

> Resumo principal para retomar o trabalho. Mantenha curto e fiel ao código.
> Última atualização: 2026-10-30. Descreve o código da branch `feature/267-implementar-telas-de-email-dados-e-senha-do-cadastro`, com a `develop` (PRs !32 e !35) já integrada.

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
- Variável de ambiente: `EXPO_PUBLIC_AUTH_URL`, no arquivo `.env.local`, que fica fora do git.

## Estrutura de pastas

| Caminho | Responsabilidade |
| --- | --- |
| `src/app/` | Telas (rotas do Expo Router). `_layout.tsx` carrega as fontes e envolve o app no `SignupProvider`. |
| `src/components/` | Componentes visuais reutilizáveis. |
| `src/constants/theme.ts` | Cores, fontes, espaçamentos, raios, tipografia e sombras. É a única fonte de valores visuais. |
| `src/constants/terms.ts` | Versão dos Termos de Uso enviada no cadastro. |
| `src/context/SignupContext.tsx` | Dados do cadastro em memória, entre `/cadastro` e `/codigo`. |
| `src/services/` | `api.ts` (instância do axios do Auth), `auth.ts` (`requestPin`, `register`, `login`, `getErrorStatus`) e `token-storage.ts` (SecureStore). |
| `src/utils/` | Funções sem visual (`formatPhone`, `isStrongPassword`, `requestPinErrorMessage`, `validateSignup`, `validateLogin`). |
| `__tests__/`, `test-utils/` | Testes Jest e utilitários de teste (erros HTTP falsos, espião do console). |
| `.kiro/steering/` | Regras do Kiro: arquitetura e código (`hospetse-architecture.md`), git (`git-workflow.md`), memória (`memoria-projeto.md`) e retomada (`retomar-contexto.md`, manual). |
| `AGENTS.md` | Regras do Expo e a seção "Project memory", que inclui o `memoria-projeto.md`. É o único arquivo de regras que o Kiro carrega quando o workspace é aberto na pasta `HOSPETSE`. |
| `docs/memoria/` | Esta documentação de memória do desenvolvimento. |

## Telas

| Rota | Arquivo | Estado atual |
| --- | --- | --- |
| `/` | `index.tsx` | Login integrado ao Auth (`POST /api/v1/auth/login`). Mostra os erros de e-mail e senha juntos, salva os tokens no SecureStore e vai para `/home`. 401 abre o modal "Login ou senha incorretos"; 403 avisa que o cadastro não foi concluído. Mostra um aviso quando chega com `aviso=email-cadastrado`. |
| `/cadastro` | `cadastro.tsx` | Tela única com nome, e-mail, senha, confirmação e termos. Mostra todos os erros de formato juntos, embaixo de cada campo, antes do envio. Chama `request-pin`, guarda os dados (sem a confirmação) no `SignupContext` e vai para `/codigo`. 409 volta ao login com o aviso; 400 aparece no campo de e-mail; os outros erros abrem o `ErrorModal`. |
| `/codigo` | `codigo.tsx` | Integrado ao Auth. Chama `register`, salva os tokens e vai para `/home` com o parâmetro `nome`. Reenvio do código a cada 60 s. Em modo dev, tem o atalho temporário "Abrir Home (temporário)" (ligado à #261). |
| `/recuperar-senha` | `recuperar-senha.tsx` | Só valida o formato do e-mail no aparelho; não chama nenhuma API. |
| `/home` | `home.tsx` | Visual completo da task #472, com dados fixos no código. Os filtros mudam o título da seção. O cabeçalho mostra o `nome` vindo do cadastro ou o nome de exemplo. As abas e o "ver mais" ainda não navegam. |

Telas que o código já indica e que ainda não existem: Buscar, Reservas e Perfil (abas da Home); conclusão do perfil do Tutor (ADR-011; a rota `PUT /api/v1/me/tutor-profile` existe no back-end). Para a lista completa, consulte o Figma e a Wiki (Desenvolvimento > Front-end > Fluxo de Telas).

## Componentes reutilizáveis

| Componente | Uso |
| --- | --- |
| `Button` | Botão laranja padrão, com `loading` (desabilita e mostra um indicador). |
| `CodeInput` | Caixas de dígitos do código (PIN). |
| `InfoIcon` | Ícone "i" laranja das dicas de formulário. |
| `Skeleton` | Bloco que pulsa durante o carregamento. Hoje nenhuma tela usa. |
| `Icon` | Ícones Material Symbols Outlined (`home`, `search`, `calendar_month`, `person`, `notifications`, `location_on`, `star`). |
| `SearchBar` | Campo de busca com lupa. |
| `FilterChip` | Chip de categoria, ativo ou inativo. |
| `PetCard` | Card de hospedagem (foto, avaliação, nome, cidade e preço), nos tamanhos `large` e `small`. |
| `BottomTabBar` | Barra inferior com as abas Home, Buscar, Reservas e Perfil (exporta o tipo `TabKey`). |
| `FieldError` | Texto de erro embaixo de um campo. Sem mensagem, não mostra nada. |
| `ErrorModal` | Aviso de erro do servidor ou da conexão, no estilo do design: ícone `pets` (`assets/pets.png`), título, texto e botão. |

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

- Auth Server (`EXPO_PUBLIC_AUTH_URL`): `POST /api/v1/auth/request-pin`, `POST /api/v1/auth/register` e `POST /api/v1/auth/login`.
- Contratos atuais: `https://auth-service-production-36e0.up.railway.app/docs` e `https://backend-production-7298.up.railway.app/docs` (o arquivo é o `/docs/openapi.yaml`).
- Tokens: SecureStore (Keychain ou Keystore), nunca AsyncStorage (ADR-005).
- O mobile ainda não chama o back-end principal.

## Restrições

- Não registrar senha, PIN, token nem dados pessoais em log, código ou nesta documentação.
- O `SignupContext` guarda os dados só em memória: eles somem ao concluir, cancelar ou fechar o app.
- Commit, push, PR e merge só com autorização da desenvolvedora.
- Bibliotecas com código nativo fora do Expo Go exigem development build: evite.

## Último estado conhecido (2026-10-30)

- PRs !32 (Home, #472) e !35 (memória, #503) mergeados na `develop`.
- Branch `feature/267-implementar-telas-de-email-dados-e-senha-do-cadastro`, com a `develop` integrada. Só o commit da validação do cadastro (`7b0e4b7`) foi enviado ao Azure; o login e o merge ainda são locais.
- Verificações em 2026-10-30: `tsc --noEmit` sem erros, 46 de 46 testes Jest passando e `expo export` para Android e web sem erros.
