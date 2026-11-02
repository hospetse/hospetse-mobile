import { act, render, screen, userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';

import CodeScreen from '../src/app/codigo';
import { TERMS_VERSION } from '../src/constants/terms';
import { SessionProvider } from '../src/context/SessionContext';
import { SignupData, SignupProvider } from '../src/context/SignupContext';
import { register, requestPin } from '../src/services/auth';
import { saveTokens } from '../src/services/token-storage';
import { getCurrentUser } from '../src/services/users';
import { httpError, networkError, spyOnConsole } from '../test-utils/http';

const mockRedirect = jest.fn();

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  Redirect: ({ href }: { href: string }) => {
    mockRedirect(href);
    return null;
  },
}));

jest.mock('../src/services/auth', () => ({
  ...jest.requireActual('../src/services/auth'),
  requestPin: jest.fn(),
  register: jest.fn(),
}));

jest.mock('../src/services/token-storage', () => ({
  saveTokens: jest.fn(),
}));

jest.mock('../src/services/users', () => ({
  getCurrentUser: jest.fn(),
}));

const mockedRegister = register as jest.Mock;
const mockedRequestPin = requestPin as jest.Mock;
const mockedSaveTokens = saveTokens as jest.Mock;
const mockedGetCurrentUser = getCurrentUser as jest.Mock;

const PASSWORD = 'Senha@123';
const PIN = '482915';
const TOKENS = {
  accessToken: 'access-token',
  tokenType: 'Bearer',
  expiresIn: 900,
  refreshToken: 'refresh-token',
};
const CURRENT_USER = {
  user: {
    id: 'user-1',
    authUserId: 'auth-user-1',
    email: 'ana@exemplo.com',
    name: 'Ana Souza',
  },
  profile: {
    status: 'incomplete' as const,
    missingFields: ['cpf', 'birthDate', 'phone', 'address', 'emergencyContact'],
  },
  permissions: {
    canSearch: true,
    canContract: false,
  },
};

function buildSignup(): SignupData {
  return {
    name: 'Ana Souza',
    email: 'ana@exemplo.com',
    password: PASSWORD,
    acceptedTerms: true,
    challengeId: 'challenge-1',
    pinRequestedAt: Date.now(),
  };
}

async function renderScreen(signup: SignupData | null = buildSignup()) {
  await render(
    <SessionProvider>
      <SignupProvider initialSignup={signup}>
        <CodeScreen />
      </SignupProvider>
    </SessionProvider>,
  );
  return userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
}

async function typeCode(user: ReturnType<typeof userEvent.setup>, code = PIN) {
  for (const [index, digit] of code.split('').entries()) {
    await user.type(screen.getByLabelText(`Dígito ${index + 1} do código`), digit);
  }
}

async function confirm(user: ReturnType<typeof userEvent.setup>) {
  await user.press(screen.getByRole('button', { name: 'Criar conta' }));
}

describe('Tela do código', () => {
  let consoleSpy: ReturnType<typeof spyOnConsole>;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockedSaveTokens.mockResolvedValue(undefined);
    mockedGetCurrentUser.mockResolvedValue(CURRENT_USER);
    consoleSpy = spyOnConsole();
  });

  afterEach(() => {
    // Senha, PIN e tokens nunca podem aparecer em log
    const output = consoleSpy.output();
    for (const value of [PASSWORD, PIN, TOKENS.accessToken, TOKENS.refreshToken]) {
      expect(output).not.toContain(value);
    }
    consoleSpy.restore();
    jest.useRealTimers();
  });

  test('sem cadastro em memória volta para a tela de cadastro', async () => {
    await renderScreen(null);

    expect(mockRedirect).toHaveBeenCalledWith('/cadastro');
  });

  test('salva os tokens, carrega o perfil e mostra a confirmação antes de abrir a Home', async () => {
    mockedRegister.mockResolvedValue(TOKENS);
    const user = await renderScreen();
    await typeCode(user);

    await confirm(user);

    expect(mockedRegister).toHaveBeenCalledWith({
      challengeId: 'challenge-1',
      pin: PIN,
      name: 'Ana Souza',
      password: PASSWORD,
      acceptedTerms: true,
      termsVersion: TERMS_VERSION,
    });
    expect(mockedSaveTokens).toHaveBeenCalledWith(TOKENS);
    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole('header', { name: 'Cadastro concluído!' })).toBeOnTheScreen();
    expect(screen.getByText('Você já pode buscar hospedagens. Complete seu perfil para contratar um serviço.')).toBeOnTheScreen();
    expect(router.replace).not.toHaveBeenCalled();

    await user.press(screen.getByRole('button', { name: 'Ir para o início' }));

    expect(router.replace).toHaveBeenCalledWith('/home');
  });

  test('falha ao carregar /me mantém a conta criada e permite tentar novamente', async () => {
    mockedRegister.mockResolvedValue(TOKENS);
    mockedGetCurrentUser.mockRejectedValueOnce(networkError()).mockResolvedValueOnce(CURRENT_USER);
    const user = await renderScreen();
    await typeCode(user);

    await confirm(user);

    expect(await screen.findByText('Não foi possível carregar seu perfil')).toBeOnTheScreen();
    expect(screen.getByText('Sua conta foi criada. Não foi possível carregar seu perfil agora. Verifique sua conexão e tente novamente.')).toBeOnTheScreen();
    expect(router.replace).not.toHaveBeenCalled();

    await user.press(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(2);
    expect(await screen.findByRole('button', { name: 'Ir para o início' })).toBeOnTheScreen();
  });

  test.each([
    [401, 'Código inválido. Confira e digite de novo.'],
    [410, 'Este código expirou. Toque em Reenviar código.'],
    [429, 'Muitas tentativas. Toque em Reenviar código.'],
    [503, 'Não foi possível concluir o cadastro. Tente de novo.'],
  ])('status %i mostra a mensagem e mantém o código digitado', async (status, message) => {
    mockedRegister.mockRejectedValue(httpError(status));
    const user = await renderScreen();
    await typeCode(user);

    await confirm(user);

    expect(await screen.findByText(message)).toBeOnTheScreen();
    expect(screen.getByLabelText('Dígito 1 do código')).toHaveDisplayValue(PIN[0]);
    expect(mockedSaveTokens).not.toHaveBeenCalled();
  });

  test('sem rede mostra mensagem de conexão', async () => {
    mockedRegister.mockRejectedValue(networkError());
    const user = await renderScreen();
    await typeCode(user);

    await confirm(user);

    expect(
      await screen.findByText('Não foi possível conectar. Verifique sua internet e tente de novo.'),
    ).toBeOnTheScreen();
  });

  test('conta criada sem conseguir salvar os tokens leva ao login com aviso', async () => {
    mockedRegister.mockResolvedValue(TOKENS);
    mockedSaveTokens.mockRejectedValueOnce(new Error('SecureStore indisponível'));
    const user = await renderScreen();
    await typeCode(user);

    await confirm(user);

    expect(router.replace).toHaveBeenCalledWith({ pathname: '/', params: { aviso: 'conta-criada' } });
    expect(
      screen.queryByText('Não foi possível conectar. Verifique sua internet e tente de novo.'),
    ).not.toBeOnTheScreen();
  });

  test('409 leva ao login com aviso de e-mail cadastrado', async () => {
    mockedRegister.mockRejectedValue(httpError(409));
    const user = await renderScreen();
    await typeCode(user);

    await confirm(user);

    expect(router.replace).toHaveBeenCalledWith({
      pathname: '/',
      params: { aviso: 'email-cadastrado' },
    });
  });

  test('reenviar só libera após 60 s e passa a usar o novo challengeId', async () => {
    mockedRequestPin.mockResolvedValue('challenge-2');
    mockedRegister.mockResolvedValue(TOKENS);
    const user = await renderScreen();

    expect(screen.getByRole('button', { name: 'Reenviar código em 1:00' })).toBeDisabled();

    await act(() => jest.advanceTimersByTime(60 * 1000));
    await user.press(screen.getByRole('button', { name: 'Reenviar código' }));

    expect(mockedRequestPin).toHaveBeenCalledWith('ana@exemplo.com');
    expect(await screen.findByText('Enviamos um novo código para seu e-mail.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Reenviar código em 1:00' })).toBeDisabled();

    await typeCode(user);
    await confirm(user);

    expect(mockedRegister).toHaveBeenCalledWith(
      expect.objectContaining({ challengeId: 'challenge-2' }),
    );
  });
});
