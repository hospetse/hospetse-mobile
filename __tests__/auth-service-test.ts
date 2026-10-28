import { authApi } from '../src/services/api';
import { getErrorStatus, register, requestPin } from '../src/services/auth';
import { httpError, networkError } from '../test-utils/http';

jest.mock('../src/services/api', () => ({
  authApi: { post: jest.fn() },
}));

const post = authApi.post as jest.Mock;

describe('services/auth', () => {
  beforeEach(() => {
    post.mockReset();
  });

  test('requestPin envia só o e-mail normalizado e devolve o challengeId', async () => {
    post.mockResolvedValue({ data: { challengeId: 'challenge-1' } });

    const challengeId = await requestPin('  Ana@Exemplo.COM ');

    expect(post).toHaveBeenCalledWith('/api/v1/auth/request-pin', { email: 'ana@exemplo.com' });
    expect(challengeId).toBe('challenge-1');
  });

  test('register envia o payload e devolve os tokens', async () => {
    const tokens = {
      accessToken: 'access',
      tokenType: 'Bearer',
      expiresIn: 900,
      refreshToken: 'refresh',
    };
    post.mockResolvedValue({ data: tokens });
    const input = {
      challengeId: 'challenge-1',
      pin: '012345',
      name: 'Ana Souza',
      password: 'Senha@123',
      acceptedTerms: true,
      termsVersion: '2026-10-01',
    };

    await expect(register(input)).resolves.toEqual(tokens);
    expect(post).toHaveBeenCalledWith('/api/v1/auth/register', input);
  });

  test('getErrorStatus devolve o status HTTP ou null sem resposta', () => {
    expect(getErrorStatus(httpError(409))).toBe(409);
    expect(getErrorStatus(networkError())).toBeNull();
    expect(getErrorStatus(new Error('qualquer'))).toBeNull();
  });
});
