# Padrões de Git - Hospetse

Fonte: ADR-014 "Estratégia de branches e nomenclatura", na Wiki do projeto (Index > Desenvolvimento > Arquitetura). Se a ADR mudar, este arquivo deve ser atualizado.

## 1. Branches permanentes

| Branch | Papel |
| --- | --- |
| `main` | Produção. Só recebe código por Pull Request vindo da `develop`, com pelo menos 1 revisor que não seja o autor. Push direto bloqueado. |
| `develop` | Desenvolvimento e branch padrão. Toda branch de trabalho nasce dela e volta para ela por Pull Request. |

- Nunca faça commit nem push direto na `main` ou na `develop`.

## 2. Branches de trabalho

Formato: `<tipo>/<id-do-work-item>-<titulo-da-task-em-kebab-case>`

| Tipo | Quando usar | Commit correspondente |
| --- | --- | --- |
| `feature/` | Nova funcionalidade | `feat:` |
| `fix/` | Correção de defeito | `fix:` |
| `docs/` | Documentação e artefatos | `docs:` |
| `chore/` | Configuração, dependências, build | `chore:` |
| `test/` | Somente testes | `test:` |

Regras do nome:

- O número é o ID do work item no Azure DevOps e vem logo depois do tipo.
- A descrição é o título da task em minúsculas, sem acentos (`ç` → `c`, `ã` → `a`, `é` → `e`), com palavras separadas por hífen.
- Sem espaços, sem `#` e sem letras maiúsculas.
- Se o título da task tiver um código antes do nome (ex.: `HSP-PBI-010-TSK-01:`), use só o nome da task.

Exemplos:

- Task #268 "Integrar o cadastro ao Auth Server" → `feature/268-integrar-o-cadastro-ao-auth-server`
- Task #472 "HSP-PBI-010-TSK-01: Implementar a Tela Home no Mobile" → `feature/472-implementar-a-tela-home-no-mobile`

Como criar:

```powershell
git switch develop
git pull
git switch -c feature/<id>-<titulo-da-task>
```

## 3. Commits

Formato: `<tipo>: <descrição> (#<id>, AB#<id>)`

- O tipo do commit corresponde ao prefixo da branch (tabela acima).
- A descrição é curta, em português, no presente (ex.: "implementa", "adiciona", "corrige").
- `#<id>` e `AB#<id>` ligam o commit à task no Azure Boards. Use o mesmo ID da branch.
- Faça commit e push a cada dia trabalhado.

Exemplos:

- `feat: implementa a tela home no mobile (#472, AB#472)`
- `chore: adiciona cliente HTTP do Auth Server, secure store e dependências de teste (#268, AB#268)`

## 4. Merge

- Sempre por Pull Request da branch de trabalho para a `develop`.
- Merge sem fast-forward: opção *Merge (no fast-forward)* no Azure DevOps (equivale a `--no-ff`).
- Apague a branch de trabalho depois do merge.
- Releases: Pull Request da `develop` para a `main`, com revisor que não seja o autor.

## 5. Como o agente deve agir

- Antes de mexer no código de uma task, confira a branch atual com `git branch --show-current`. Se estiver na `main` ou na `develop`, crie a branch de trabalho no padrão acima antes de editar.
- Se o ID ou o título da task não estiverem claros, pergunte antes de criar a branch.
- Em `git add`, adicione os arquivos pelo nome. Não inclua arquivos que você não alterou sem perguntar.
- Peça confirmação antes de fazer push, abrir Pull Request ou fazer merge.
- Nunca use `push --force`, `reset --hard` ou apague branches remotas sem pedido explícito.
- Não altere o `git config`.
