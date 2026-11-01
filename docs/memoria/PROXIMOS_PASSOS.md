# Próximos passos: Hospetse Mobile

Lista viva. Mova os itens entre as seções conforme o estado real, e apague da seção **Concluído** o que tiver mais de duas tasks (o histórico fica no `LOG_DESENVOLVIMENTO.md`).

> Última atualização: 2026-10-31

## Próxima atividade recomendada
1. **#267:** acompanhar a revisão do PR para a `develop`. Depois do merge (*no fast-forward*, com a branch apagada), voltar para a `develop` e atualizá-la.
2. Testar o cadastro completo até a Home com um PIN real (veja os bloqueios).

## Em andamento
- **#267, Validação do cadastro e login:** código pronto e verificado, com a `develop` (PR !47) integrada. PR aberto, aguardando a revisão (DT-13 e DT-14).

## Pendente
Itens da #477 que estão no card e ainda não foram feitos:
- **Integração com a API:** enviar os filtros e mostrar os resultados. Depende da #476.
- **Pets reais do Tutor** no "Para quem?". Depende da #371. Hoje são dois pets de exemplo fixos na Home.
- **Tutor sem pet:** aviso da tela 08I e campos de porte e raça. Faltam as telas 08I e o "Para quem?" sem pet no Figma. Hoje aparece só um texto.
- **Faixa de preço:** está no card e não aparece nos prints.
- **Estados de carregamento e erro.**
- **Testes que ainda faltam:** a integração com a Home (abrir pela busca e pela aba Buscar). O `calendar.ts` e o modal já têm testes.
- **"Filtros mantidos ao voltar dos resultados":** fica para a #480, usando o `lastSearch` da Home (DT-12).

Itens da #472 (Home) que continuam pendentes e precisam ser combinados com a PO:
- **Dados reais na Home**, que hoje estão fixos (DT-05). O back-end tem `GET /api/v1/me` (nome e status do perfil); as listas ainda não têm rota.
- **Estados de carregamento, vazio e erro**, usando o `Skeleton`.
- **Testes automatizados** da Home e dos componentes.
- **Navegação** de Reservas, Perfil, "ver mais", sino e cards. A aba Buscar já abre a busca.
- **Acessibilidade** nos chips, cards e campo de busca.

Fora dessas tasks:
- **Recuperar senha:** a tela não chama nenhuma API, e o Auth ainda não tem rota para isso.
- **Conclusão do perfil do Tutor:** o back-end tem `PUT /api/v1/me/tutor-profile` (ADR-011). Ainda não há tela.
- **Textos de erro do cadastro e do login:** só o "Login ou senha incorretos" veio do design. Confirmar os outros com quem fez o Figma.
- **ESLint no mobile:** pendência declarada no PR !18.
- **README do repositório:** ainda é o modelo padrão do Azure DevOps.

## Bloqueado ou dependente
- **Teste do cadastro com PIN real:** o Auth de produção usa o `ConsoleEmailSender`, então o PIN só aparece no log do servidor no Railway. Depende de alguém com acesso ao log ou do envio real de e-mail no Auth.
- **#480, Resultados e detalhe do Host:** depende da #479 (endpoint de detalhes, ainda "Aprovado").
  - A busca já está na `develop`, então a #480 pode começar com dados de exemplo.
  - Antes, decidir 4 pontos: endereço completo × LGPD, o botão "Tire suas dúvidas" (contato só pelo Assistente de IA), o texto "Reservar agora" × "Solicitar hospedagem" e o layout da lista de resultados.
- **#476, endpoint de busca, e #371, lista de pets:** as duas estavam "Aprovado" em 2026-10-29. A integração da #477 depende delas.
- **Atalho temporário da Home na `codigo.tsx`:** só sai quando a #261 (rota interna do back-end) estiver integrada. Antes de remover, confira o estado da #261 no Azure Boards.

## Problemas conhecidos
- O steering `hospetse-architecture.md` (seção 6) diz que tokens podem ir para o AsyncStorage. Isso contradiz a ADR-005 e a DT-07. Corrigir em outra task.
- Na web, o SecureStore não funciona: o login e o cadastro certos falham ao salvar os tokens (DT-13).
- Quem entra pelo login vê o nome de exemplo no cabeçalho da Home (falta usar o `GET /api/v1/me`).
- As fotos dos cards e dos pets são URLs de exemplo (Unsplash).
- No print, o fundo da busca aparece desfocado. No app ele fica só escurecido, porque o desfoque exige `expo-blur`, que não está instalado (DT-11).
- O campo de busca da Home virou só um atalho para o modal: não dá mais para digitar nele (DT-11).
- A busca reabre vazia, então a última busca não aparece na Home até existir a tela de resultados (DT-12).

## Testes que ainda precisam rodar
- Testar no Expo Go (Android e iOS): cadastro, login, foco no primeiro campo com erro, modal de erro, a Home e a busca.
- Criar os testes Jest da Home.

## Informações necessárias para continuar
- O retorno visual da busca na web.
- As telas 08D, 08E e 08I do Figma (HPET03), se forem usadas no tratamento de Tutor sem pet.
- A confirmação da regra "não criar pastas fora de `src/`" para a pasta `docs/` (DT-10).
- No Azure Boards: tempo trabalhado e mudança para Done da #472, da #503 e da #477, conforme a DoD da Task. Esses registros cabem à desenvolvedora.

## Concluído recentemente
- 2026-10-31: `develop` com o PR !47 integrada à branch da #267, com as decisões da #267 renumeradas para DT-13 e DT-14.
- 2026-10-30: PR !47 (busca e filtros, #477) mergeado na `develop`.
- 2026-10-30: Validação do cadastro com todos os erros de uma vez e login integrado ao Auth (#267).
