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

## 2026-10-30: Validação do cadastro e login integrado ao Auth (#267)
- **Objetivo:** TSK-09 (validar o cadastro no app, com todos os erros de uma vez) e trocar o login provisório pelo login do Auth.
- **Arquivos criados:** `src/utils/validateSignup.ts`, `src/utils/validateLogin.ts`, `src/components/FieldError.tsx`, `src/components/ErrorModal.tsx`, `assets/pets.png`, `__tests__/validateSignup-test.ts` e `__tests__/login-test.tsx`.
- **Arquivos alterados:** `src/app/cadastro.tsx`, `src/app/index.tsx`, `src/services/auth.ts` (`login`), `src/utils/requestPinErrorMessage.ts` (títulos do modal), `src/constants/theme.ts` (só acréscimos), `__tests__/cadastro-test.tsx` e `__tests__/auth-service-test.ts`.
- **Decisões:** DT-11 e DT-12 (DT-06 parcialmente substituída).
- **Verificação:**
  - `tsc --noEmit` sem erros e 46 de 46 testes Jest passando. Na primeira rodada, o primeiro teste de 3 arquivos estourou o limite de 5 s enquanto o cache era montado.
  - `expo export` para Android e web sem erros.
  - Contra o Auth de produção: login sem conta respondeu 401 e e-mail inválido respondeu 400, como o app espera; `request-pin` respondeu 201.
  - **Não rodou:** o cadastro completo até a Home, porque o Auth de produção usa o `ConsoleEmailSender` e o PIN só aparece no log do servidor. Também não houve teste num aparelho.
- **Problemas e soluções:**
  - O tipo do `ref` do `TextInput` no React Native 0.88 é `TextInputInstance`, e não `TextInput`.
  - Conflitos ao integrar a `develop` (PRs !32 e !35): no `index.tsx` ficou o login integrado; no `theme.ts` ficaram os tokens das duas branches, sem mudar valores.
- **Ficou pendente:** push do login e do merge, PR para a `develop` com revisor que não seja o autor e teste do cadastro com um PIN real.
- **Explicações para a banca:** os trechos que fogem do básico estão explicados em `docs/memoria/EXPLICACOES_CADASTRO_LOGIN.md`.
- **Commits:** `7b0e4b7` (validação do cadastro, enviado), `c4f8cb7` (login) e `c4c0a72` (merge da `develop`), ainda locais.
