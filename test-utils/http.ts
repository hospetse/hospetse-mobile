import { AxiosError, AxiosResponse } from 'axios';

// Erro igual ao que o axios lança quando o Auth responde com esse status
export function httpError(status: number): AxiosError {
  return new AxiosError('Erro HTTP', 'ERR_BAD_RESPONSE', undefined, undefined, {
    status,
  } as AxiosResponse);
}

// Erro sem resposta (sem rede ou timeout)
export function networkError(): AxiosError {
  return new AxiosError('Network Error', 'ERR_NETWORK');
}

// Captura tudo que sair no console para conferir que nada sensível foi logado
export function spyOnConsole() {
  const calls: unknown[][] = [];
  const methods = ['log', 'info', 'warn', 'error', 'debug'] as const;
  const spies = methods.map((method) =>
    jest.spyOn(console, method).mockImplementation((...args) => {
      calls.push(args);
    }),
  );

  return {
    output: () => JSON.stringify(calls),
    restore: () => spies.forEach((spy) => spy.mockRestore()),
  };
}

// Erro do back-end com o envelope { code, message, details }
export function apiError(
  status: number,
  code: string,
  details?: { field: string; message: string }[],
): AxiosError {
  return new AxiosError('Erro HTTP', 'ERR_BAD_RESPONSE', undefined, undefined, {
    status,
    data: { code, message: code, details },
  } as AxiosResponse);
}
