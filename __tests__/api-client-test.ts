import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { router } from 'expo-router';

import { authApi, backendApi, SessionExpiredError } from '../src/services/api';
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from '../src/services/token-storage';
import { spyOnConsole } from '../test-utils/http';

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
}));

jest.mock('../src/services/token-storage', () => ({
  getAccessToken: jest.fn(),
  getRefreshToken: jest.fn(),
  saveTokens: jest.fn(),
  clearTokens: jest.fn(),
}));

const mockedAccess = getAccessToken as jest.Mock;
const mockedRefresh = getRefreshToken as jest.Mock;
const mockedSave = saveTokens as jest.Mock;
const mockedClear = clearTokens as jest.Mock;

const NEW_TOKENS = {
  accessToken: 'access-novo',
  tokenType: 'Bearer',
  expiresIn: 900,
  refreshToken: 'refresh-novo',
};

function reply(config: InternalAxiosRequestConfig, status: number, data: unknown = {}): AxiosResponse {
  return { config, data, headers: {}, status, statusText: '' };
}

// Resposta com erro do jeito que o axios entrega aos interceptors
function fail(config: InternalAxiosRequestConfig, status: number): Promise<never> {
  return Promise.reject(
    new AxiosError('Erro HTTP', 'ERR_BAD_REQUEST', config, undefined, reply(config, status)),
  );
}

// Back-end falso: aceita só o token "access-novo"
function acceptsNewToken(config: InternalAxiosRequestConfig) {
  return config.headers.Authorization === 'Bearer access-novo'
    ? Promise.resolve(reply(config, 200, { ok: true }))
    : fail(config, 401);
}
const backendAdapter = jest.fn(acceptsNewToken);
const authAdapter = jest.fn();

describe('Cliente do back-end', () => {
  let consoleSpy: ReturnType<typeof spyOnConsole>;

  beforeEach(() => {
    jest.clearAllMocks();
    backendAdapter.mockImplementation(acceptsNewToken);
    backendApi.defaults.adapter = backendAdapter;
    authApi.defaults.adapter = authAdapter;
    mockedAccess.mockResolvedValue('access-vencido');
    mockedRefresh.mockResolvedValue('refresh-atual');
    authAdapter.mockImplementation((config: InternalAxiosRequestConfig) =>
      Promise.resolve(reply(config, 200, NEW_TOKENS)),
    );
    consoleSpy = spyOnConsole();
  });

  afterEach(() => {
    // Tokens nunca podem aparecer em log
    const output = consoleSpy.output();
    for (const token of ['access-vencido', 'refresh-atual', 'access-novo', 'refresh-novo']) {
      expect(output).not.toContain(token);
    }
    consoleSpy.restore();
  });

  test('envia o access token no cabeçalho', async () => {
    mockedAccess.mockResolvedValue('access-novo');

    await backendApi.get('/api/v1/me');

    expect(backendAdapter.mock.calls[0][0].headers.Authorization).toBe('Bearer access-novo');
    expect(authAdapter).not.toHaveBeenCalled();
  });

  test('401 renova o token, salva e repete a chamada', async () => {
    const response = await backendApi.get('/api/v1/me');

    expect(response.data).toEqual({ ok: true });
    expect(JSON.parse(authAdapter.mock.calls[0][0].data)).toEqual({ refreshToken: 'refresh-atual' });
    expect(mockedSave).toHaveBeenCalledWith(NEW_TOKENS);
    expect(backendAdapter).toHaveBeenCalledTimes(2);
  });

  test('várias chamadas vencidas ao mesmo tempo renovam uma vez só', async () => {
    await Promise.all([
      backendApi.get('/api/v1/me'),
      backendApi.get('/api/v1/hosts/search'),
      backendApi.get('/api/v1/hosts/1'),
    ]);

    expect(authAdapter).toHaveBeenCalledTimes(1);
    expect(backendAdapter).toHaveBeenCalledTimes(6);
  });

  test('refresh recusado encerra a sessão e leva ao login', async () => {
    authAdapter.mockImplementation((config: InternalAxiosRequestConfig) => fail(config, 401));

    await expect(backendApi.get('/api/v1/me')).rejects.toBeInstanceOf(SessionExpiredError);
    expect(mockedClear).toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith({ pathname: '/', params: { aviso: 'sessao-expirada' } });
  });

  test('sem refresh token guardado também leva ao login', async () => {
    mockedRefresh.mockResolvedValue(null);

    await expect(backendApi.get('/api/v1/me')).rejects.toBeInstanceOf(SessionExpiredError);
    expect(authAdapter).not.toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalled();
  });

  test('falha de rede no refresh não encerra a sessão', async () => {
    authAdapter.mockImplementation((config: InternalAxiosRequestConfig) =>
      Promise.reject(new AxiosError('Network Error', 'ERR_NETWORK', config)),
    );

    await expect(backendApi.get('/api/v1/me')).rejects.toBeInstanceOf(AxiosError);
    expect(mockedClear).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  test('se o token novo também for recusado, não renova de novo', async () => {
    backendAdapter.mockImplementation((config: InternalAxiosRequestConfig) => fail(config, 401));

    await expect(backendApi.get('/api/v1/me')).rejects.toBeInstanceOf(AxiosError);
    expect(authAdapter).toHaveBeenCalledTimes(1);
    expect(backendAdapter).toHaveBeenCalledTimes(2);
  });
});
