# PrÃ³ximos passos: Hospetse Mobile

Lista viva. Mova os itens entre as seÃ§Ãµes conforme o estado real, e apague da seÃ§Ã£o **ConcluÃ­do** o que tiver mais de duas tasks (o histÃ³rico fica no `LOG_DESENVOLVIMENTO.md`).

> Ãšltima atualizaÃ§Ã£o: 2026-11-08

## PrÃ³xima atividade recomendada
0. **#326:** testar o cadastro de Host no Expo Go (Android e iOS) e com o back-end real; acompanhar a revisÃ£o do PR (DT-31).
1. **#492:** teste no Expo Go com uma conta Host, commit e PR.
2. **#300:** commit e PR (validada no Expo Go: "Sair" e renovaÃ§Ã£o apÃ³s 15 minutos).
3. **#299:** revisÃ£o e merge do PR !72.
4. **#495:** push e PR para a `develop` (aprovada no iPhone e commitada).

## Em andamento
- **#326, Cadastro do Host no app:** branch `feature/326-implementar-o-cadastro-do-host-no-app`. Perfil com "Quero ser Host" (DT-29); cadastro em duas etapas com rascunho retomÃ¡vel, envio de fotos e documentos com progresso e nova tentativa, erros do servidor na etapa certa e tela de anÃ¡lise, integrados Ã  #325 (DT-30 e DT-31); Painel do AnfitriÃ£o como esqueleto (DT-32). Testado pela desenvolvedora na web; pronto para PR na `develop`. Falta testar no Expo Go (Android e iOS). Depende do design das seÃ§Ãµes que o protÃ³tipo nÃ£o tinha e das tasks #315 e #406 (aprovaÃ§Ã£o no painel Web).
- **#492, Aceitar e recusar solicitaÃ§Ãµes do Host:** implementada na branch `feature/492-implementar-as-acoes-de-aceitar-e-recusar-no-mobile` (DT-28). Falta teste manual, commit e PR.
- **#299, Login e feedback da senha:** PR !72 aberto para a `develop`, aguardando revisÃ£o. Branch `feature/299-implementar-a-tela-de-login-e-a-integracao`.
- **#300, RenovaÃ§Ã£o de sessÃ£o e logout:** logout local (DT-25) na branch `feature/300-implementar-a-renovacao-de-sessao-e-o-logout-no-mobile`, criada sobre a da #299. Sem commit. Validada no Expo Go.
- **#270, Testes do fluxo de cadastro:** testes complementares na branch `test/270-criar-testes-automatizados-do-fluxo-de-cadastro`, rebaseada na `develop` apÃ³s o merge do PR !70. Falta push, PR e revisÃ£o.
- **#269, SessÃ£o apÃ³s cadastro:** PR !70 mergeado na `develop` (`a575eb8`).
- **#495, SolicitaÃ§Ã£o de hospedagem:** commitada na branch `feature/495-implementar-a-tela-de-solicitacao-de-hospedagem-no-mobile` (DT-23) e aprovada no Expo Go (iPhone). Faltam push e PR.
> Ãšltima atualizaÃ§Ã£o: 2026-11-14

## PrÃ³xima atividade recomendada
1. **#534:** validar a tela de Minhas contrataÃ§Ãµes no Expo Go com dados simulados e depois preparar o contrato com o backend.

## Em andamento
- **#534:** tela de Minhas contrataÃ§Ãµes implementada com dados simulados na branch `feature/534-implementar-a-tela-minhas-contratacoes-no-mobile`. Falta teste visual, commit e PR.

## Pendente
- **Tela de Reservas do Tutor** ("Ver minhas reservas"): PBI #199 (HSP-PBI-046), sem task. O back-end ainda nÃ£o tem a lista de reservas do Tutor.
- **ConclusÃ£o do perfil** (HSP-PBI-002): "Completar Cadastro" sÃ³ fecha o aviso.
- **ServiÃ§os adicionais e horÃ¡rios de entrada e saÃ­da** na API (DT-23).
- **Texto da "Garantia VeterinÃ¡ria Hospetse"** no modal de rotina: Ã© de exemplo, confirmar com a PO.
- **Modal de rotina no Android:** ainda nÃ£o testado.
- **Rotas de conversa** (#209, #219 e #220): o chat usa a conversa de exemplo, e o envio sÃ³ mostra a mensagem na tela. Anexo, microfone e "Mais opÃ§Ãµes" estÃ£o sem aÃ§Ã£o.
- **DescriÃ§Ã£o da task #520:** ainda cita o botÃ£o de ligar, que saiu.
- **Filtros sem efeito**, atÃ© o back-end acrescentar: tipo de serviÃ§o, comodidades e vÃ¡rios portes (DT-20).
- **Campos que a API nÃ£o tem:** comodidades, requisitos e rotina do detalhe (`HostExtras`).
- **PaginaÃ§Ã£o** dos resultados: hoje vÃªm atÃ© 50.
- **Home com dados reais:** o nome e o aviso do perfil vÃªm do `/me` apÃ³s login ou cadastro. Os cards de exemplo ainda abrem um id que nÃ£o existe na API ("Hospedagem nÃ£o encontrada") e precisam de uma rota de destaques.
- **BotÃµes sem aÃ§Ã£o:** "Ver todos" e a galeria completa.
- **Perfil (#326), sÃ³ um esqueleto:** sem aÃ§Ã£o "Quero ser Host", "Acessar Meus Pets", as cinco linhas do menu (inclusive "Completar/Editar perfil", que precisa de uma tela de ediÃ§Ã£o com troca de foto), sino e engrenagem. Os textos do menu sÃ£o de exemplo e "Meus Pets" nÃ£o mostra os pets reais. A aba Perfil sÃ³ abre a partir da Home (os resultados ainda nÃ£o a ligam). Esconder o convite de Host e "Meus Pets" por papel depende de o `/me` informar isso.
- **Testes Jest do Perfil:** sÃ³ a entrada "Quero ser Host" estÃ¡ coberta; o resto do Perfil nÃ£o tem teste.
- **Painel do AnfitriÃ£o (#326, DT-32):** Ã© um esqueleto com dados de exemplo e sem telas nos 7 acessos. Cada um vira tela nas tasks do Host (jornada J08). Ligar primeiro as rotas que jÃ¡ existem: solicitaÃ§Ãµes (`GET /me/host/reservations`, aceitar e recusar) e agenda. A aprovaÃ§Ã£o do cadastro depende das tasks #315 e #406 (painel Web). O Perfil deveria trocar "Quero ser Host" por "Painel do AnfitriÃ£o" quando o `/me` informar o papel.
- **Cadastro de Host (#326), design:** espÃ©cies, capacidade, CPF ou CNPJ e documentos foram acrescentados Ã s duas telas porque o back-end os exige, mas nÃ£o tÃªm design no Figma. Pedir revisÃ£o da UX e da PO.
- **Cadastro de Host (#326), dados sem campo no back-end:** estrutura do espaÃ§o, outros pets, experiÃªncia, idosos/medicaÃ§Ã£o e castrados agora sÃ£o campos sÃ³ visuais (estado local, nÃ£o vÃ£o ao back-end nem persistem â€” DT-33, revisÃ£o do PR 81). Decidir com a PO e o Lucas se o contrato ganha esses campos (opÃ§Ã£o A); atÃ© lÃ¡ seguem visuais.
- **Cadastro de Host (#326), limites:** o back-end nÃ£o tem rota para remover foto ou documento jÃ¡ enviado; as fotos do servidor aparecem numa lista Ã  parte ao retomar; mapa real no lugar do bloco de aviso; revisÃ£o final antes do envio (a tarefa cita "revisÃ£o"); revisar o texto do interruptor "castrados"; motivo da reprovaÃ§Ã£o ainda nÃ£o chega ao app.
- **Pets da busca:** o `SearchModal` ainda usa os pets de exemplo (#371); a reserva jÃ¡ usa os pets reais.
- **Pets da API:** a lista, o cadastro, a busca e o botÃ£o "Adicionar Pet" estÃ£o implementados na #371. EdiÃ§Ã£o, remoÃ§Ã£o/desativaÃ§Ã£o e foto continuam dependentes de endpoints futuros.
- Itens da #477: o aviso para Tutor sem pet (tela 08I).
- Itens da #472: estados de carregamento, vazio e erro e testes da Home; navegaÃ§Ã£o de Reservas, Perfil, "ver mais" e sino.
- Fora dessas tasks: recuperar senha, textos de erro do design, Ã­cone do `ErrorModal` em SVG e ESLint.

## Bloqueado ou dependente
- **Login, busca e detalhe na web:** tokens ficam somente em memÃ³ria durante a aba (DT-24). Atualizar a pÃ¡gina encerra a sessÃ£o. Falta validar o fluxo completo contra as APIs publicadas.
- **Teste do cadastro com PIN real:** o Auth agora envia o PIN por e-mail (PR !58, #517). Falta testar no Expo Go.
- **Atalho temporÃ¡rio da Home na `codigo.tsx`:** sÃ³ sai quando a #261 estiver integrada.

## Problemas conhecidos
- O steering `hospetse-architecture.md` (seÃ§Ã£o 6) permite tokens em AsyncStorage, o que contradiz a ADR-005. Corrigir em outra task.
- Quem entra pelo login vÃª o nome de exemplo na Home e nos resultados.
- O merge e o voto pelo MCP do Azure DevOps falham ("Unexpected end of JSON input"). Faltaria o escopo Code (Read & Write) no token.
- A branch `feature/267-...` continua no servidor, e sÃ³ o Murilo pode apagÃ¡-la.
- A primeira rodada do Jest Ã s vezes estoura o limite de 5 s em alguns testes de tela. Na segunda, passa.

## Testes que ainda precisam rodar
- No Expo Go: a solicitaÃ§Ã£o de hospedagem (#495) no Android, os modais de erro dela, o modal de rotina no Android, a renovaÃ§Ã£o do token depois de 15 minutos e os testes em Android e iOS separados.
- Criar os testes Jest da Home.

## InformaÃ§Ãµes necessÃ¡rias para continuar
- O design das seÃ§Ãµes de identificaÃ§Ã£o, documentos, espÃ©cies e capacidade do cadastro de Host (#326). O Azure DevOps nÃ£o trouxe o anexo, e a #322 estÃ¡ como Removed.
- As telas 08D, 08E e 08I do Figma (HPET03), para o Tutor sem pet.
- A confirmaÃ§Ã£o da regra "nÃ£o criar pastas fora de `src/`" para a pasta `docs/` (DT-10).
- No Azure Boards: tempo trabalhado e status das tasks. Isso cabe Ã  desenvolvedora.

## ConcluÃ­do recentemente
- 2026-11-01: PRs !66 (modal de rotina, #519) e !67 (chat, #520) mergeados na `develop` (`4a806dd`).
- 2026-11-01: PR !63 (integraÃ§Ã£o com o back-end, #518) mergeado na `develop` (`69facdd`).
