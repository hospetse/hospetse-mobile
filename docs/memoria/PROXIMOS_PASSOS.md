# Próximos passos: Hospetse Mobile

Lista viva. Mova os itens entre as seções conforme o estado real, e apague da seção **Concluído** o que tiver mais de duas tasks (o histórico fica no `LOG_DESENVOLVIMENTO.md`).

> Última atualização: 2026-10-30

## Próxima atividade recomendada
1. **#477:** os commits (`feat:` e `docs:`) estão feitos. Faltam o push e o PR para a `develop`, com revisor e a task vinculada (sempre com autorização).

## Em andamento
- **#477, Busca e filtros:** modal e testes commitados na branch `feature/477-implementar-a-tela-de-busca-e-filtros-no-mobile`. Push e PR pendentes (DT-11 e DT-12).

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
- **Dados reais na Home**, que hoje estão fixos (DT-05).
- **Estados de carregamento, vazio e erro**, usando o `Skeleton`.
- **Testes automatizados** da Home e dos componentes.
- **Navegação** de Reservas, Perfil, "ver mais", sino e cards. A aba Buscar já abre a busca.
- **Acessibilidade** nos chips, cards e campo de busca.

Fora dessas tasks:
- **Login integrado ao Auth:** o Auth já tem `POST /api/v1/auth/login`, mas o login do mobile não chama nada (DT-06).
- **Recuperar senha:** a tela não chama nenhuma API.
- **Conclusão do perfil do Tutor:** o back-end tem `PUT /api/v1/me/tutor-profile` (ADR-011). Ainda não há tela.
- **ESLint no mobile:** pendência declarada no PR !18.
- **README do repositório:** ainda é o modelo padrão do Azure DevOps.

## Bloqueado ou dependente
- **#480, Resultados e detalhe do Host:** depende da #477 e da #479 (endpoint de detalhes, ainda "Aprovado").
  - A busca já existe localmente, então a #480 pode começar depois do merge da #477, com dados de exemplo.
  - Antes, decidir 4 pontos: endereço completo × LGPD, o botão "Tire suas dúvidas" (contato só pelo Assistente de IA), o texto "Reservar agora" × "Solicitar hospedagem" e o layout da lista de resultados.
- **#476, endpoint de busca, e #371, lista de pets:** as duas estavam "Aprovado" em 2026-10-29. A integração da #477 depende delas.
- **Atalho temporário da Home na `codigo.tsx`:** só sai quando a #261 estiver integrada. Confira o estado da #261 antes.

## Problemas conhecidos
- O login aceita qualquer e-mail e senha preenchidos e vai para a Home (provisório).
- Quem entra pelo login vê o nome de exemplo no cabeçalho da Home.
- As fotos dos cards e dos pets são URLs de exemplo (Unsplash).
- No print, o fundo da busca aparece desfocado. No app ele fica só escurecido, porque o desfoque exige `expo-blur`, que não está instalado (DT-11).
- O campo de busca da Home virou só um atalho para o modal: não dá mais para digitar nele (DT-11).
- A busca reabre vazia, então a última busca não aparece na Home até existir a tela de resultados (DT-12).

## Testes que ainda precisam rodar
- Conferir a Home e a busca no Expo Go (Android e iOS).
- Criar os testes Jest da busca, do calendário e da Home.

## Informações necessárias para continuar
- O retorno visual da busca na web.
- As telas 08D, 08E e 08I do Figma (HPET03), se forem usadas no tratamento de Tutor sem pet.
- A confirmação da regra "não criar pastas fora de `src/`" para a pasta `docs/` (DT-10).
- No Azure Boards: tempo trabalhado e mudança para Done da #472 e da #503, conforme a DoD da Task. Esses registros cabem à desenvolvedora.

## Concluído recentemente
- 2026-10-30: PR !32 (Home, #472) e PR !35 (memória, #503) mergeados na `develop`.
- 2026-10-29: Memória persistente do projeto criada em `docs/memoria/` (#503).
