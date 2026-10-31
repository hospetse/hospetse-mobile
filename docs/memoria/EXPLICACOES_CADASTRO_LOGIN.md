# Explicações do código: cadastro e login (#267)

Esta nota explica os trechos do cadastro e do login que fogem do básico (`useState`, `if`, `switch`, props e `StyleSheet.create`). Ela serve para estudar o código e para a apresentação na banca.

Os números de linha são os do commit `c4f8cb7`. Se o arquivo mudar, procure pelo nome da função.

## 1. Foco no primeiro campo com erro (`useRef`)

**Onde:** `src/app/cadastro.tsx`, linhas 40 a 55 (`focusFirstError`). O login faz o mesmo em `src/app/index.tsx`, dentro de `handleLogin`.

**O que é:** o `useRef` guarda uma referência para o campo de texto. Com essa referência, o código chama `nameRef.current?.focus()`, e o cursor vai para aquele campo.

**Por que existe:** a Definition of Done pede foco correto para acessibilidade. Quando o usuário toca em "Criar conta" e há erro, o cursor e o leitor de tela vão direto para o primeiro campo errado.

**Como explicar:** "o `useState` guarda um valor que aparece na tela; o `useRef` guarda uma referência para um elemento da tela, sem redesenhar a tela".

**Detalhe:** no React Native 0.88, o tipo do `ref` é `TextInputInstance`, e não `TextInput`. O `?.` evita erro se o campo ainda não existir na tela.

## 2. Limpar o erro de um campo (`keyof` e `[field]`)

**Onde:** `src/app/cadastro.tsx`, linha 58 (`clearError`).

```ts
function clearError(field: keyof SignupFormErrors) {
  if (errors[field]) {
    setErrors({ ...errors, [field]: undefined });
  }
}
```

**O que é:**
- `keyof SignupFormErrors` significa "um dos nomes de campo do tipo": `'name'`, `'email'`, `'password'`, `'passwordConfirmation'` ou `'acceptedTerms'`. O TypeScript recusa qualquer outro texto.
- `{ ...errors }` copia o objeto de erros.
- `[field]: undefined` apaga só o erro do campo recebido. Os colchetes usam o **valor** da variável como nome da chave.

**Por que existe:** quando o usuário corrige um campo, só o erro dele some, e os outros continuam na tela. Uma função evita repetir o mesmo código em cinco campos.

**Como explicar:** `clearError('email')` faz o mesmo que `setErrors({ ...errors, email: undefined })`. No login, que tem só dois campos, o código usa essa forma direta.

## 3. Formato do e-mail (expressão regular)

**Onde:** `src/utils/validateSignup.ts`, linha 24 (`EMAIL_FORMAT`).

```ts
const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
```

**Como ler, da esquerda para a direita:**
- `[^\s@]+`: um ou mais caracteres que não são espaço nem `@` (o nome).
- `@`: a arroba.
- `[^\s@]+`: o domínio.
- `\.`: um ponto.
- `[^\s@]{2,}`: pelo menos 2 caracteres no final (`com`, `br`).
- `^` e `$`: o texto inteiro precisa seguir esse formato.

**Importante:** é uma conferência simples para avisar o usuário antes do envio. O Auth Server valida de novo e é ele que decide.

## 4. Todos os erros de uma vez

**Onde:** `src/utils/validateSignup.ts`, linha 32 (`validateSignup`), e `src/app/cadastro.tsx`, linha 71.

**Como funciona:** a função começa com um objeto vazio e, para cada campo com problema, coloca uma mensagem nele. Ela **não para** no primeiro erro. A tela guarda o objeto inteiro num `useState` e cada `<FieldError>` mostra a mensagem do seu campo. `hasErrors` (linha 70) diz se o objeto tem alguma mensagem.

## 5. Bloqueio do envio duplicado

**Onde:** `src/components/Button.tsx`, linha 17 (`disabled={loading}`), e `src/app/cadastro.tsx`, linha 66 (`if (loading) return`).

**Por que são duas proteções:** o botão desabilitado já impede o toque duplo. O `if (loading)` cobre o envio pelo teclado (`onSubmitEditing`), que não passa pelo botão.

## 6. Props de acessibilidade

| Prop | Onde | O que faz |
| --- | --- | --- |
| `accessibilityLabel` | campos e botões | Nome que o leitor de tela fala |
| `accessibilityRole="checkbox"` | termos, `cadastro.tsx` | Diz que o quadradinho é uma caixa de marcar |
| `accessibilityState={{ checked }}` | termos, `cadastro.tsx` linha 235 | Diz se a caixa está marcada |
| `accessibilityHint` | campos, a partir de `cadastro.tsx` linha 143 | O leitor de tela lê a mensagem de erro ao focar o campo |
| `accessibilityLiveRegion="polite"` | `FieldError.tsx` linha 16 | No Android, avisa quando a mensagem de erro aparece |
| `accessibilityViewIsModal` | `ErrorModal.tsx` linha 26 | No iOS, o leitor de tela fica só dentro do modal |
| `hitSlop` | termos, `cadastro.tsx` linha 236 | Aumenta a área de toque da caixa, que é pequena |

## 7. Modal de erro e ícone

**Onde:** `src/components/ErrorModal.tsx`.

- `<Modal transparent visible={visible}>` é um componente do próprio React Native que aparece por cima da tela. `onRequestClose` é obrigatório no Android e fecha o modal com o botão voltar do aparelho.
- `require('../../assets/pets.png')` é a forma do React Native de usar uma imagem que está dentro do projeto.
- `tintColor` (linha 75) pinta o ícone preto com a cor do `theme.ts`.

**Regra:** erro de formato aparece no campo; erro do servidor ou da conexão aparece no modal.

## 8. Testes

**Onde:** `__tests__/cadastro-test.tsx` e `__tests__/login-test.tsx`.

- `jest.mock(...)` (linhas 11 a 20 do teste do cadastro) troca o `expo-router`, o Auth e o Secure Store por versões falsas. Assim o teste não chama o servidor de verdade.
- `spyOnConsole()` (`test-utils/http.ts`, linha 16) captura tudo o que sairia no console. Depois de cada teste, o código confere que a senha não aparece.
- `SignupKeys` (linha 41 do teste do cadastro) é um componente que existe só no teste. Ele mostra **os nomes** dos campos guardados no `SignupContext`, sem os valores. Isso prova que a confirmação da senha não foi guardada.
- `getByRole('button', { busy: true })` (linha 226) encontra o botão enquanto ele está carregando. Nesse momento ele mostra só o indicador, sem o texto "Criar conta".
- `findByText` (com `await`) espera a mensagem aparecer, porque a resposta do Auth falsa chega depois de um instante.
