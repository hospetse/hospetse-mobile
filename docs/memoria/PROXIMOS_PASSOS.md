# Próximos passos: Hospetse Mobile

Lista viva. Mova os itens entre as seções conforme o estado real, e apague da seção **Concluído** o que tiver mais de duas tasks (o histórico fica no `LOG_DESENVOLVIMENTO.md`).

> Última atualização: 2026-11-01

## Próxima atividade recomendada
1. **#480:** push e PR para a `develop`, ligado à #480 e ao #516.
2. **Integração com o back-end** (etapa separada), porque a #476 e a #479 já estão prontas:
   - criar a `EXPO_PUBLIC_API_URL` e um cliente que envie o token e o renove numa fila única (veja as regras na Wiki);
   - depois, trocar o corpo de `searchHosts` e `getHostPage`.
3. **Bug #516:** depois do merge e do deploy do PR !55 do Auth, testar o CORS de novo. O login na web ainda depende de uma task da ADR-005 para guardar os tokens na web.

## Em andamento
- **#480, Resultados e detalhe do Host:** commits feitos na branch `feature/480-implementar-a-lista-de-resultados-e-a-tela-de-detalhes-do-host-no-mobile`, com o visual aprovado. Push e PR pendentes (DT-15 a DT-18).
- **#516, Erro de conexão no login (bug da desenvolvedora):**
  - Mobile: mensagem correta (`177c961`) e `.env.example` com README (`6dd91c6`), na branch da #480.
  - Auth: CORS no PR !55 do `hospetse-auth-service`, aberto em 2026-11-01.

## Pendente
Itens da #480 que ainda não foram feitos:
- **Integração com a API:**
  - Detalhe: trocar o corpo de `getHostPage` pelo `GET /api/v1/hosts/{id}` (#479, pronto).
  - Lista: trocar o corpo de `searchHosts` pela rota da #476.
  - Antes, falta criar a `EXPO_PUBLIC_API_URL` e um cliente que envie o token.
- **Campos que a API não tem:** comodidades, requisitos e rotina (`HostExtras`, DT-17). Pedir ao back-end.
- **Botões sem ação:** "Tire suas dúvidas" (vai para o Assistente de IA) e "Solicitar reserva" (fluxo do HSP-PBI-039). Também "Ver todos" das comodidades e a galeria completa.
- **Erros da API mapeados para as mensagens do design** (envelope da #56).

Itens da #477 que ainda não foram feitos:
- **Pets reais** no "Para quem?" (#371) e o aviso para **Tutor sem pet** (tela 08I), com porte e raça.
- **"Filtros mantidos ao voltar dos resultados":** voltar dos resultados para a Home reabre a busca vazia (DT-12). Confirmar com a PO se isso basta.

Itens da #472 (Home) que continuam pendentes:
- **Dados reais na Home** (DT-05), com o nome pelo `GET /api/v1/me`.
- **Estados de carregamento, vazio e erro** e **testes automatizados** da Home.
- **Navegação** de Reservas, Perfil, "ver mais" e sino.

Fora dessas tasks:
- **Recuperar senha:** a tela não chama nenhuma API, e o Auth ainda não tem rota para isso.
- **Conclusão do perfil do Tutor:** o back-end tem `PUT /api/v1/me/tutor-profile`. Ainda não há tela.
- **Textos de erro do cadastro e do login:** só "Login ou senha incorretos" veio do design.
- **Ícone do `ErrorModal`:** usa um PNG (`assets/pets.png`). Pela DT-01, poderia usar o ícone `pets` do `Icon.tsx`, que agora existe.
- **ESLint no mobile.** O README foi escrito no bug #516.

## Bloqueado ou dependente
- **Login e cadastro na web:** o Auth não manda CORS para `localhost:8081`, e o SecureStore não existe no navegador. O time de back-end vai tratar o CORS. Guardar os tokens na web é uma decisão da ADR-005. Enquanto isso, teste no Expo Go.
- **Lista de resultados real:** a #476 foi mergeada (PR !53 do `hospetse-backend`). Agora depende só do cliente do back-end no mobile (veja a próxima atividade).
- **Teste do cadastro com PIN real:** o PIN só aparece no log do Auth no Railway.
- **Atalho temporário da Home na `codigo.tsx`:** só sai quando a #261 estiver integrada.

## Problemas conhecidos
- O steering `hospetse-architecture.md` (seção 6) diz que tokens podem ir para o AsyncStorage. Isso contradiz a ADR-005 e a DT-07. Corrigir em outra task.
- Quem entra pelo login vê o nome de exemplo no cabeçalho da Home e dos resultados.
- As fotos dos cards, dos Hosts e dos pets são URLs de exemplo (Unsplash).
- O fundo da busca fica escurecido, e não desfocado como no print (DT-11).
- A branch `feature/267-...` continua no servidor e precisa ser apagada pelo Murilo.

## Testes que ainda precisam rodar
- Conferir no Expo Go (Android e iOS): cadastro, login, Home, busca, resultados, filtros (principalmente o arraste da barra de preço) e detalhe do Host.
- Criar os testes Jest da Home.

## Informações necessárias para continuar
- A conferência visual da #480.
- As telas 08D, 08E e 08I do Figma (HPET03), para o Tutor sem pet.
- A confirmação da regra "não criar pastas fora de `src/`" para a pasta `docs/` (DT-10).
- No Azure Boards: tempo trabalhado e status das tasks #472, #503, #477 e #267, conforme a DoD da Task. Esses registros cabem à desenvolvedora.

## Concluído recentemente
- 2026-11-01: PR !52 (validação do cadastro e login, #267) mergeado na `develop`.
- 2026-10-30: PR !47 (busca e filtros, #477) mergeado na `develop`.
