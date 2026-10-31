---
inclusion: always
---

# Memória do projeto - Hospetse Mobile

A memória do desenvolvimento fica em `docs/memoria/`. Uma conversa nova não vê as anteriores: estes arquivos são a fonte para retomar o trabalho.

| Arquivo | Para quê |
| --- | --- |
| `docs/memoria/CONTEXTO.md` | Resumo do projeto e último estado conhecido |
| `docs/memoria/PROXIMOS_PASSOS.md` | Pendente, em andamento, bloqueado e concluído |
| `docs/memoria/LOG_DESENVOLVIMENTO.md` | Histórico das atividades concluídas |
| `docs/memoria/DECISOES_TECNICAS.md` | Decisões do mobile (DT-NN) |
| `docs/memoria/INICIAR_CONTEXTO.md` | Roteiro de retomada numa conversa nova |

## Antes de começar uma tarefa

- Leia `CONTEXTO.md` e `PROXIMOS_PASSOS.md`. Procure em `DECISOES_TECNICAS.md` as decisões ligadas à tarefa.
- Se a documentação contradizer o código, o código vale. Investigue e corrija a documentação.

## Ao concluir uma atividade relevante

Atividade relevante: tela ou componente novo, mudança de comportamento, decisão técnica, dependência nova, integração, commit, PR ou merge. Ajustes pequenos e isolados não precisam de registro.

1. Acrescente uma entrada no fim de `LOG_DESENVOLVIMENTO.md`, seguindo o modelo do arquivo.
2. Atualize `CONTEXTO.md` se mudou o estado do projeto (telas, componentes, dependências, último estado).
3. Registre em `DECISOES_TECNICAS.md` as decisões novas ou alteradas. Não apague a decisão antiga: marque como substituída.
4. Atualize `PROXIMOS_PASSOS.md`, movendo os itens entre as seções.
5. Diga à desenvolvedora, em uma ou duas linhas, o que foi atualizado.

## Regras

- Registre só o que aconteceu de fato. Não marque como concluído o que foi só planejado e não invente testes nem resultados. Se um teste não rodou, escreva isso.
- Nunca registre senha, PIN, token, chave, conteúdo de `.env` nem dados pessoais desnecessários.
- Mantenha os arquivos curtos: resuma, aponte para commits, PRs e DTs em vez de repetir.
- A documentação entra no git como `docs:`, seguindo `git-workflow.md`. Commit e push só com autorização.
