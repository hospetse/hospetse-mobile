# Próximos passos: Hospetse Mobile

Lista viva. Mova os itens entre as seções conforme o estado real, e apague da seção **Concluído** o que tiver mais de duas tasks (o histórico fica no `LOG_DESENVOLVIMENTO.md`).

> Última atualização: 2026-11-04

## Próxima atividade recomendada
1. **#492:** teste no Expo Go com uma conta Host, commit e PR.

## Em andamento
- **#492, Aceitar e recusar solicitações do Host:** implementada na branch `feature/492-implementar-as-acoes-de-aceitar-e-recusar-no-mobile` (DT-28). Falta teste manual, commit e PR.

## Pendente
- **Tela de Reservas do Tutor** ("Ver minhas reservas"): PBI #199 (HSP-PBI-046), sem task. O back-end ainda não tem a lista de reservas do Tutor.
- **Cadastro de pet** (HSP-PBI-016): "Adicionar Pet" da reserva está sem ação, e o Tutor sem pet não é levado ao cadastro.
- **Conclusão do perfil** (HSP-PBI-002): "Completar Cadastro" só fecha o aviso.
- **Serviços adicionais e horários de entrada e saída** na API (DT-23).
- **Texto da "Garantia Veterinária Hospetse"** no modal de rotina: é de exemplo, confirmar com a PO.
- **Modal de rotina no Android:** ainda não testado.
- **Rotas de conversa** (#209, #219 e #220): o chat usa a conversa de exemplo, e o envio só mostra a mensagem na tela. Anexo, microfone e "Mais opções" estão sem ação.
- **Descrição da task #520:** ainda cita o botão de ligar, que saiu.
- **Filtros sem efeito**, até o back-end acrescentar: tipo de serviço, comodidades e vários portes (DT-20).
- **Campos que a API não tem:** comodidades, requisitos e rotina do detalhe (`HostExtras`).
- **Paginação** dos resultados: hoje vêm até 50.
- **Home com dados reais:** o nome e o aviso do perfil vêm do `/me` após login ou cadastro. Os cards de exemplo ainda abrem um id que não existe na API ("Hospedagem não encontrada") e precisam de uma rota de destaques.
- **Botões sem ação:** "Ver todos" e a galeria completa.
- **Pets da busca:** o `SearchModal` ainda usa os pets de exemplo (#371); a reserva já usa os pets reais.
- Itens da #477: o aviso para Tutor sem pet (tela 08I).
- Itens da #472: estados de carregamento, vazio e erro e testes da Home; navegação de Reservas, Perfil, "ver mais" e sino.
- Fora dessas tasks: recuperar senha, textos de erro do design, ícone do `ErrorModal` em SVG e ESLint.

## Bloqueado ou dependente
- **Login, busca e detalhe na web:** tokens ficam somente em memória durante a aba (DT-24). Atualizar a página encerra a sessão. Falta validar o fluxo completo contra as APIs publicadas.
- **Teste do cadastro com PIN real:** o Auth agora envia o PIN por e-mail (PR !58, #517). Falta testar no Expo Go.
- **Atalho temporário da Home na `codigo.tsx`:** só sai quando a #261 estiver integrada.

## Problemas conhecidos
- O steering `hospetse-architecture.md` (seção 6) permite tokens em AsyncStorage, o que contradiz a ADR-005. Corrigir em outra task.
- Quem entra pelo login vê o nome de exemplo na Home e nos resultados.
- O merge e o voto pelo MCP do Azure DevOps falham ("Unexpected end of JSON input"). Faltaria o escopo Code (Read & Write) no token.
- A branch `feature/267-...` continua no servidor, e só o Murilo pode apagá-la.
- A primeira rodada do Jest às vezes estoura o limite de 5 s em alguns testes de tela. Na segunda, passa.

## Testes que ainda precisam rodar
- No Expo Go: a solicitação de hospedagem (#495) no Android, os modais de erro dela, o modal de rotina no Android, a renovação do token depois de 15 minutos e os testes em Android e iOS separados.
- Criar os testes Jest da Home.

## Informações necessárias para continuar
- As telas 08D, 08E e 08I do Figma (HPET03), para o Tutor sem pet.
- A confirmação da regra "não criar pastas fora de `src/`" para a pasta `docs/` (DT-10).
- No Azure Boards: tempo trabalhado e status das tasks. Isso cabe à desenvolvedora.

## Concluído recentemente
- 2026-11-01: PRs !66 (modal de rotina, #519) e !67 (chat, #520) mergeados na `develop` (`4a806dd`).
- 2026-11-01: PR !63 (integração com o back-end, #518) mergeado na `develop` (`69facdd`).
