# Como retomar o desenvolvimento numa conversa nova

Uma conversa nova **não vê** as mensagens das anteriores. Estes arquivos são a memória do projeto. Funciona com o Kiro e com qualquer outro assistente.

## Para a desenvolvedora

Abra uma conversa nova e envie uma destas opções:

- No Kiro, digite `/retomar-contexto`. O atalho existe quando a pasta `hospetse-mobile` está aberta como raiz do workspace.
- Ou cole a mensagem abaixo, trocando os campos entre `< >`:

```text
Retome o desenvolvimento do Hospetse Mobile seguindo docs/memoria/INICIAR_CONTEXTO.md.
Próxima tarefa: <task #ID e título, ou "a recomendada em PROXIMOS_PASSOS.md">.
Referências: <print, link do Figma ou card da task, se houver>.
```

## Para o assistente: roteiro de retomada

1. **Leia o contexto:** `docs/memoria/CONTEXTO.md` (stack, estrutura, telas, componentes, padrões e último estado).
2. **Leia as pendências:** `docs/memoria/PROXIMOS_PASSOS.md`. Veja o que está em andamento, o que está bloqueado e a próxima atividade recomendada.
3. **Leia o histórico recente:** as **últimas 3 entradas** de `docs/memoria/LOG_DESENVOLVIMENTO.md`. Leia mais só se a tarefa depender de algo antigo.
4. **Leia as decisões que tocam a tarefa:** em `docs/memoria/DECISOES_TECNICAS.md`, procure pelos assuntos da tarefa (tela, componente, tema, navegação, git). Respeite as decisões **Aceitas** e confira se alguma **Provisória** perdeu a validade.
5. **Leia as regras:** `.kiro/steering/hospetse-architecture.md` (código), `.kiro/steering/git-workflow.md` (git) e `AGENTS.md` (Expo).
6. **Confira o estado real:**
   - Rode `git status`, `git branch --show-current` e `git log --oneline -5`.
   - Se a documentação falar de um PR ou de uma task, confira o estado no Azure DevOps.
   - **O código é a referência principal.** Se a documentação disser outra coisa, investigue o código e corrija a documentação.
7. **Leia os arquivos da tarefa** antes de propor qualquer alteração. Ache as dependências com telas, componentes e tokens do `theme.ts` que já existem.
8. **Responda com um resumo curto:** último estado, branch atual, pendências ligadas à tarefa e o plano. Pergunte o que não estiver claro, como o ID da task, o protótipo ou o escopo.

Ao concluir a tarefa, atualize a memória seguindo `.kiro/steering/memoria-projeto.md`.
