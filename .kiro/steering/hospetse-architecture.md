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
