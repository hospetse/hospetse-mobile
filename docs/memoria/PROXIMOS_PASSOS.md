# Próximos passos: Hospetse Mobile

Lista viva. Mova os itens entre as seções conforme o estado real, e apague da seção **Concluído** o que tiver mais de duas tasks (o histórico fica no `LOG_DESENVOLVIMENTO.md`).

> Última atualização: 2026-11-01

## Próxima atividade recomendada
1. **#518:** push e PR para a `develop`. Depois, revisão e merge (*no fast-forward*, com a branch apagada).

## Em andamento
- **#518, Integração da busca e do detalhe:** testado no Expo Go pela desenvolvedora e commitado na branch `feature/518-integrar-a-lista-de-resultados-e-o-detalhe-do-host-com-a-api-no-mobile`. Push e PR pendentes (DT-19 e DT-20).

## Pendente
- **Filtros sem efeito**, até o back-end acrescentar: tipo de serviço, comodidades e vários portes (DT-20).
- **Campos que a API não tem:** comodidades, requisitos e rotina do detalhe (`HostExtras`).
- **Paginação** dos resultados: hoje vêm até 50.
- **Home com dados reais:** os cards de exemplo abrem um id que não existe na API ("Hospedagem não encontrada"). A Home precisa de uma rota de destaques e do nome pelo `GET /api/v1/me`.
- **Botões sem ação:** "Tire suas dúvidas", "Solicitar reserva", "Ver todos" e a galeria completa.
- Itens da #477: pets reais (#371) e o aviso para Tutor sem pet (tela 08I).
- Itens da #472: estados de carregamento, vazio e erro e testes da Home; navegação de Reservas, Perfil, "ver mais" e sino.
- Fora dessas tasks: recuperar senha, conclusão do perfil do Tutor, textos de erro do design, ícone do `ErrorModal` em SVG e ESLint.

## Bloqueado ou dependente
- **Login, busca e detalhe na web:** o CORS já foi liberado, mas não há SecureStore no navegador, então não há token. Precisa de uma task da ADR-005 (tokens na web). Teste no Expo Go.
- **Teste do cadastro com PIN real:** o Auth agora envia o PIN por e-mail (PR !58, #517). Falta testar no Expo Go.
- **Atalho temporário da Home na `codigo.tsx`:** só sai quando a #261 estiver integrada.

## Problemas conhecidos
- O steering `hospetse-architecture.md` (seção 6) permite tokens em AsyncStorage, o que contradiz a ADR-005. Corrigir em outra task.
- Quem entra pelo login vê o nome de exemplo na Home e nos resultados.
- O merge e o voto pelo MCP do Azure DevOps falham ("Unexpected end of JSON input"). Faltaria o escopo Code (Read & Write) no token.
- A branch `feature/267-...` continua no servidor, e só o Murilo pode apagá-la.

## Testes que ainda precisam rodar
- No Expo Go, a busca, os resultados, os filtros e o detalhe já foram conferidos em 2026-11-01. Faltam a renovação do token depois de 15 minutos de uso e os testes em Android e iOS separados.
- Criar os testes Jest da Home.

## Informações necessárias para continuar
- As telas 08D, 08E e 08I do Figma (HPET03), para o Tutor sem pet.
- A confirmação da regra "não criar pastas fora de `src/`" para a pasta `docs/` (DT-10).
- No Azure Boards: tempo trabalhado e status das tasks. Isso cabe à desenvolvedora.

## Concluído recentemente
- 2026-11-01: PR !57 (#480 e bug #516 no mobile) mergeado na `develop`.
- 2026-11-01: PR !52 (validação do cadastro e login, #267) mergeado na `develop`.
