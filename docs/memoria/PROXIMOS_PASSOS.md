# Próximos passos: Hospetse Mobile

Lista viva. Mova os itens entre as seções conforme o estado real, e apague da seção **Concluído** o que tiver mais de duas tasks (o histórico fica no `LOG_DESENVOLVIMENTO.md`).

> Última atualização: 2026-10-29

## Próxima atividade recomendada
1. Acompanhar a revisão do **PR !32** (Home, #472). Depois do merge, que deve ser *no fast-forward* com a branch apagada, voltar para a `develop` e atualizá-la (`git switch develop` e `git pull`).
2. Decidir a próxima task com a desenvolvedora. Candidatas: os itens que faltam da #472, listados abaixo, ou uma tela nova do Figma.

## Em andamento
- **#472, Tela Home:** o PR !32 aguarda revisão. A task está "Em Andamento" no Azure Boards.
- **#503, Memória persistente:** está na branch `docs/503-criar-a-memoria-persistente-do-desenvolvimento-no-mobile`. Faltam o push e o PR, que tem que ser mergeado depois do PR !32.

## Pendente
Itens da #472 que estão nos critérios de aceite e ainda não foram feitos:
- **Dados reais na Home:** usuário, cidade e listas de hospedagens vindos da API. Depende de existir uma rota no back-end (veja os bloqueios). Hoje os dados estão fixos (DT-05).
- **Estados de carregamento, vazio e erro na Home:** usar o `Skeleton` no carregamento.
- **Testes automatizados da Home e dos componentes**, com Jest e RNTL, no mesmo padrão de `__tests__/`.
- **Navegação:** abas Buscar, Reservas e Perfil, "ver mais", sino e clique nos cards. Hoje só mudam o estado local.
- **Acessibilidade conforme o design:** papéis e rótulos nos chips, cards e campo de busca.

Fora da #472:
- **Login integrado ao Auth:** o Auth já tem `POST /api/v1/auth/login`. Hoje o login do mobile não chama nada (DT-06).
- **Recuperar senha:** a tela não chama nenhuma API.
- **Conclusão do perfil do Tutor:** o back-end tem `PUT /api/v1/me/tutor-profile` (ADR-011). Ainda não há tela.
- **ESLint no mobile:** pendência declarada no PR !18.
- **README do repositório:** ainda é o modelo padrão do Azure DevOps.

## Bloqueado ou dependente
- **Atalho temporário da Home na `codigo.tsx`:** só sai quando a #261 (rota interna do back-end) estiver integrada. Antes de remover, confira o estado da #261 no Azure Boards.
- **Dados da Home:** dependem de definir a rota e o contrato no back-end. Ainda não verificado.

## Problemas conhecidos
- O login aceita qualquer e-mail e senha preenchidos e vai para a Home (provisório).
- Quem entra pelo login vê o nome de exemplo no cabeçalho da Home.
- As fotos dos cards são URLs de exemplo (Unsplash) e não são a imagem da referência.
- O visual da Home ainda não foi conferido num aparelho real nem num print completo. O print sem janela saiu cortado à direita.

## Testes que ainda precisam rodar
- Testar a Home no Expo Go (Android e iOS): sombras, barra inferior e rolagem das listas.
- Criar os testes Jest da Home quando a task for retomada.

## Informações necessárias para continuar
- O protótipo da próxima tela, em print ou Figma, e o ID da task no Azure Boards.
- A confirmação da regra "não criar pastas fora de `src/`" para a pasta `docs/` (DT-10).

## Concluído recentemente
- 2026-10-29: Home com sombras, barra inferior e título por filtro (#472).
- 2026-10-29: `develop` integrada à branch da #472 e PR !32 aberto.
- 2026-10-29: Memória persistente do projeto criada em `docs/memoria/` (#503).
