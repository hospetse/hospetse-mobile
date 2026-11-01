# Hospetse Mobile

App do Hospetse para tutores encontrarem e contratarem cuidadores de pets. Feito com Expo (SDK 58), React Native e TypeScript, com Expo Router.

## Como rodar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Crie o arquivo `.env.local` a partir do modelo. Sem ele, o app não sabe o endereço do Auth Server, e o login e o cadastro mostram "Sem conexão".
   ```bash
   cp .env.example .env.local
   ```
   No PowerShell: `Copy-Item .env.example .env.local`.
3. Suba o app limpando o cache (necessário sempre que o `.env.local` mudar):
   ```bash
   npx expo start -c
   ```
4. Abra no **Expo Go** (Android ou iOS) lendo o QR Code, ou aperte `w` para a web.

## Limitações na web

- O **login e o cadastro não funcionam na web** por enquanto. Os tokens ficam no `expo-secure-store` (ADR-005), que não existe no navegador. A liberação de CORS no Auth está no bug #516. Para testar essas telas, use o Expo Go.
- As outras telas podem ser abertas direto pela URL, por exemplo `http://localhost:8081/home`.

## Variáveis de ambiente

| Variável | Para quê |
| --- | --- |
| `EXPO_PUBLIC_AUTH_URL` | Endereço do Auth Server. O valor publicado está no `.env.example` e na Wiki, em Desenvolvimento > Back-end > APIs publicadas. |

Variáveis `EXPO_PUBLIC_` vão dentro do app e qualquer pessoa consegue ler. Nunca coloque segredos nelas.

## Testes e verificação

```bash
npm test            # testes com Jest e Testing Library
npx tsc --noEmit    # checagem de tipos
```

## Como contribuir

- Branches, commits e Pull Requests seguem a ADR-014 (resumo em `.kiro/steering/git-workflow.md`).
- Padrões de código e de estilo: `.kiro/steering/hospetse-architecture.md`.
- Contexto, decisões e pendências do desenvolvimento: `docs/memoria/`.
