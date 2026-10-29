# Diretrizes de Arquitetura e Código - Hospetse

Você é um desenvolvedor Sênior atuando num projeto React Native com Expo (Template Blank) e Expo Router. O princípio fundamental do projeto é o "simples bem feito".

## 1. Regras de Estrutura de Pastas (Obrigatório)

O projeto utiliza uma Arquitetura Plana adaptada ao Expo Router. Respeite rigorosamente os locais de criação de arquivos:

- **TELAS (Rotas):** Toda nova tela inteira solicitada DEVE ser criada dentro da pasta `src/app/`.

  - (Ex: `src/app/index.tsx`, `src/app/cadastro.tsx`). Não crie telas em outras pastas.

- **COMPONENTES (UI):** Todo novo bloco visual isolado (ex: Botões, Inputs, Cards) DEVE ser criado dentro da pasta `src/components/`.

  - As telas em `src/app/` devem importar os componentes desta pasta.

- **FUNÇÕES LÓGICAS:** Funções matemáticas ou de formatação que não possuem visual DEVEM ser criadas em `src/utils/`.

## 2. Regras de Estilização e Design System

A identidade visual do aplicativo está centralizada. Você está PROIBIDO de utilizar valores hexadecimais de cores ou medidas de borda "hardcoded" (fixas) no StyleSheet dos componentes.

- **Uso do Tema:** Sempre que for estilizar um componente (botão, texto, fundo de tela), você DEVE importar e consumir as variáveis do arquivo `src/constants/theme.ts`.

- **Exemplo de fluxo:** Se o usuário pedir "Crie um botão com a cor principal e borda arredondada", importe a cor correspondente do `theme.ts` e aplique no estilo, em vez de injetar `#FF790F` diretamente no componente.

## 3. Comportamento Geral

- Escreva código limpo em TypeScript.

- Não crie pastas fora do diretório `src/`.

## 4. Padrões de Código e Lógica (Nível Acadêmico / Fundamentos)
Para garantir que o código gerado seja simples e passível de explicação em uma banca de apresentação de TCC, siga estritamente estas regras de implementação:
- *Componentes Funcionais:* Todos os componentes devem ser escritos como funções JavaScript/TypeScript tradicionais que retornam JSX, começando com letra maiúscula.
- *Gerenciamento de Estado Local:* Utilize prioritariamente o hook useState do React para estados locais simples (ex: inputs, alternância de visualização, modais e formulários básicos).
- *Passagem de Dados (Props):* Utilize props e desestruturação de objetos para passar parâmetros e tornar os componentes reaproveitáveis. 
- *Manipulação de Eventos:* Para interações de botões e cliques, passe funções via props de forma explícita (ex: onPress={funcao}), mantendo a lógica legível.

## 5. Regras de Layout com Flexbox e Estilização
Todo o sistema visual das telas do Hospetse deve ser construído utilizando os fundamentos de layout apresentados em aula:
- *Flexbox como Padrão:* Tudo no React Native usa Flexbox por padrão (flexDirection: 'column' por padrão). Utilize flexDirection, justifyContent (eixo principal) e alignItems (eixo cruzado) para organizar os elementos.
- *Distribuição Proporcional:* Prefira usar flex: 1 para preencher o espaço disponível em vez de definir larguras ou alturas estáticas excessivas.
- *Estilos Centralizados:* Utilize obrigatoriamente StyleSheet.create() para criar os objetos de estilo no final do arquivo, melhorando a performance e a organização. Proíba estilos inline complexos diretamente nas tags JSX.
- *Espaçamentos e Dimensões:* Utilize as propriedades de gap, margin e padding puxando os valores do theme.ts. Caso precise de medidas dinâmicas de tela, utilize o hook reativo useWindowDimensions.

## 6. Gerenciamento de Estado Avançado e Arquitetura com Expo Router
Para lidar com o crescimento da aplicação no Expo Router sem cair em complexidades desnecessárias para a banca, siga estas diretrizes de arquitetura:
- *Evolução do Estado:* Embora o useState local atenda telas isoladas, utilize Context API nativa (React.createContext) combinada com Hooks personalizados (hooks/) ou bibliotecas de estado global leves quando houver necessidade real de compartilhar dados entre rotas diferentes (ex: dados do usuário logado, token de autenticação ou preferências globais).
- *Passagem de Parâmetros entre Rotas (Expo Router):*
  - Utilize os parâmetros de rota (useLocalSearchParams e o objeto params do router.push({ pathname, params })) exclusivamente para passar identificadores leves entre telas (ex: passar apenas o id do pet ou da hospedagem).
  - *Evite* passar objetos complexos inteiros via parâmetros de URL. Prefira buscar os dados atualizados na tela de destino utilizando o identificador recebido.
- *Persistência de Sessão:* Para dados que precisam persistir após o fechamento do aplicativo (como tokens de acesso), utilize soluções compatíveis com Expo (como expo-secure-store ou AsyncStorage).
