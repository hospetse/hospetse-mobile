# Contexto do projeto: Hospetse Mobile

> Resumo principal para retomar o trabalho. Mantenha curto e fiel ao código.
> Última atualização: 2026-10-29. Descreve o código da branch `feature/472-implementar-a-tela-home-no-mobile` (commit `53654bd`, PR !32). A memória está na branch `docs/503-criar-a-memoria-persistente-do-desenvolvimento-no-mobile`.

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
| `src/services/` | `api.ts` (instância do axios do Auth), `auth.ts` (`requestPin`, `register`, `getErrorStatus`) e `token-storage.ts` (SecureStore). |
| `src/utils/` | Funções sem visual (`formatPhone`, `isStrongPassword`, `requestPinErrorMessage`). |
| `__tests__/`, `test-utils/` | Testes Jest e utilitários de teste (erros HTTP falsos, espião do console). |
| `.kiro/steering/` | Regras do Kiro: arquitetura e código (`hospetse-architecture.md`), git (`git-workflow.md`), memória (`memoria-projeto.md`) e retomada (`retomar-contexto.md`, manual). |
| `AGENTS.md` | Regras do Expo e a seção "Project memory", que inclui o `memoria-projeto.md`. É o único arquivo de regras que o Kiro carrega quando o workspace é aberto na pasta `HOSPETSE`. |
| `docs/memoria/` | Esta documentação de memória do desenvolvimento. |

## Telas

| Rota | Arquivo | Estado atual |
| --- | --- | --- |
| `/` | `index.tsx` | Login **sem integração**: só confere se os campos estão preenchidos e vai para `/home`. Mostra um aviso quando chega com `aviso=email-cadastrado`. |
| `/cadastro` | `cadastro.tsx` | Integrado ao Auth. Chama `request-pin`, guarda os dados no `SignupContext` e vai para `/codigo`. Se a resposta for 409, volta ao login com o aviso. |
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

- Auth Server (`EXPO_PUBLIC_AUTH_URL`): `POST /api/v1/auth/request-pin` e `POST /api/v1/auth/register`. O login do Auth existe no serviço, mas o mobile ainda não usa.
- Tokens: SecureStore (Keychain ou Keystore), nunca AsyncStorage (ADR-005).
- O mobile ainda não chama o back-end principal.

## Restrições

- Não registrar senha, PIN, token nem dados pessoais em log, código ou nesta documentação.
- O `SignupContext` guarda os dados só em memória: eles somem ao concluir, cancelar ou fechar o app.
- Commit, push, PR e merge só com autorização da desenvolvedora.
- Bibliotecas com código nativo fora do Expo Go exigem development build: evite.

## Último estado conhecido (2026-10-29)

- Branch `feature/472-implementar-a-tela-home-no-mobile`, com a `develop` já integrada.
- PR !32 aberto para a `develop`, sem conflitos, aguardando o revisor. A task #472 está "Em Andamento".
- Verificações em 2026-10-29: `tsc --noEmit` sem erros e 19 de 19 testes Jest passando.
- Memória do projeto aprovada pelo time (task #503), na branch `docs/503-...`, que saiu da `develop`. Ela descreve a Home e os steerings do PR !32, então o PR da #503 tem que ser **mergeado depois do PR !32**.
