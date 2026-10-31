# Próximos passos: Hospetse Mobile

Lista viva. Mova os itens entre as seções conforme o estado real, e apague da seção **Concluído** o que tiver mais de duas tasks (o histórico fica no `LOG_DESENVOLVIMENTO.md`).

> Última atualização: 2026-10-30

## Próxima atividade recomendada
1. **#267:** fazer o push do login e do merge da `develop`, abrir o PR para a `develop` e pedir a revisão a outra pessoa do time. Depois do merge (*no fast-forward*, com a branch apagada), voltar para a `develop` e atualizá-la.
2. Testar o cadastro completo até a Home com um PIN real (veja os bloqueios).

## Em andamento
- **#267, Validação do cadastro e login:** código pronto e verificado. Só o commit `7b0e4b7` está no Azure; `c4f8cb7` (login) e `c4c0a72` (merge) são locais.

## Pendente
Itens da #472 que estão nos critérios de aceite e ainda não foram feitos:
- **Dados reais na Home:** usuário, cidade e listas de hospedagens vindos da API. O back-end tem `GET /api/v1/me` (nome e status do perfil); as listas ainda não têm rota. Hoje os dados estão fixos (DT-05).
- **Estados de carregamento, vazio e erro na Home:** usar o `Skeleton` no carregamento.
- **Testes automatizados da Home e dos componentes**, com Jest e RNTL, no mesmo padrão de `__tests__/`.
- **Navegação:** abas Buscar, Reservas e Perfil, "ver mais", sino e clique nos cards. Hoje só mudam o estado local.
- **Acessibilidade conforme o design:** papéis e rótulos nos chips, cards e campo de busca.

Fora da #472:
- **Recuperar senha:** a tela não chama nenhuma API, e o Auth ainda não tem rota para isso.
- **Conclusão do perfil do Tutor:** o back-end tem `PUT /api/v1/me/tutor-profile` (ADR-011). Ainda não há tela.
- **Textos de erro do cadastro e do login:** só o "Login ou senha incorretos" veio do design. Confirmar os outros com quem fez o Figma.
- **ESLint no mobile:** pendência declarada no PR !18.
- **README do repositório:** ainda é o modelo padrão do Azure DevOps.

## Bloqueado ou dependente
- **Teste do cadastro com PIN real:** o Auth de produção usa o `ConsoleEmailSender`, então o PIN só aparece no log do servidor no Railway. Depende de alguém com acesso ao log ou do envio real de e-mail no Auth.
- **Atalho temporário da Home na `codigo.tsx`:** só sai quando a #261 (rota interna do back-end) estiver integrada. Antes de remover, confira o estado da #261 no Azure Boards.

## Problemas conhecidos
- O steering `hospetse-architecture.md` (seção 6) diz que tokens podem ir para o AsyncStorage. Isso contradiz a ADR-005 e a DT-07. Avisar a autora do PR !32 para corrigir.
- Na web, o SecureStore não funciona: o login e o cadastro certos falham ao salvar os tokens (DT-11).
- Quem entra pelo login vê o nome de exemplo no cabeçalho da Home (falta usar o `GET /api/v1/me`).
- As fotos dos cards são URLs de exemplo (Unsplash) e não são a imagem da referência.

## Testes que ainda precisam rodar
- Testar no Expo Go (Android e iOS): cadastro, login, foco no primeiro campo com erro, modal de erro e a Home.
- Criar os testes Jest da Home.

## Informações necessárias para continuar
- O protótipo da próxima tela, em print ou Figma, e o ID da task no Azure Boards.
- A confirmação da regra "não criar pastas fora de `src/`" para a pasta `docs/` (DT-10).

## Concluído recentemente
- 2026-10-30: Validação do cadastro com todos os erros de uma vez e login integrado ao Auth (#267, ainda sem PR).
- 2026-10-30: `develop` (PRs !32 e !35) integrada à branch da #267.
- 2026-10-29: PRs !32 (Home, #472) e !35 (memória, #503) mergeados na `develop`.
