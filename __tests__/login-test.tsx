import { render, screen, userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';

import LoginScreen from '../src/app/index';
import { login } from '../src/services/auth';
import { saveTokens } from '../src/services/token-storage';
import { httpError, networkError, spyOnConsole } from '../test-utils/http';

const mockParams: { aviso?: string } = {};

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => mockParams,
}));

jest.mock('../src/services/auth', () => ({
  ...jest.requireActual('../src/services/auth'),
  login: jest.fn(),
}));

jest.mock('../src/services/token-storage', () => ({
  saveTokens: jest.fn(),
}));

const mockedLogin = login as jest.Mock;
const mockedSaveTokens = saveTokens as jest.Mock;

const PASSWORD = 'Senha@123';
const TOKENS = {
  accessToken: 'access-token',
  tokenType: 'Bearer',
  expiresIn: 900,
  refreshToken: 'refresh-token',
};

async function renderScreen() {
  await render(<LoginScreen />);
  return userEvent.setup();
}

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  email = 'ana@exemplo.com',
  password = PASSWORD,
) {
  if (email) {
    await user.type(screen.getByLabelText('E-mail'), email);
  }
  if (password) {
    await user.type(screen.getByLabelText('Senha'), password);
  }
}

async function pressEnter(user: ReturnType<typeof userEvent.setup>) {
  await user.press(screen.getByRole('button', { name: 'Entrar' }));
}

describe('Tela de login', () => {
  let consoleSpy: ReturnType<typeof spyOnConsole>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockParams.aviso = undefined;
    consoleSpy = spyOnConsole();
  });

  afterEach(() => {
    // A senha e os tokens nunca podem aparecer em log
    const output = consoleSpy.output();
    expect(output).not.toContain(PASSWORD);
    expect(output).not.toContain(TOKENS.accessToken);
    consoleSpy.restore();
  });

  test('campos vazios mostram os dois erros de uma vez e não chamam o Auth', async () => {
    const user = await renderScreen();

    await pressEnter(user);

    expect(screen.getByText('Informe seu e-mail.')).toBeOnTheScreen();
    expect(screen.getByText('Informe sua senha.')).toBeOnTheScreen();
    expect(mockedLogin).not.toHaveBeenCalled();
  });

  test('e-mail fora do formato não chama o Auth', async () => {
    const user = await renderScreen();

    await fillForm(user, 'ana.exemplo.com');
    await pressEnter(user);

    expect(screen.getByText('Informe um e-mail válido, como nome@email.com.')).toBeOnTheScreen();
    expect(mockedLogin).not.toHaveBeenCalled();
  });

  test('login certo salva os tokens no secure store e vai para a Home', async () => {
    mockedLogin.mockResolvedValue(TOKENS);
    const user = await renderScreen();

    await fillForm(user);
    await pressEnter(user);

    expect(mockedLogin).toHaveBeenCalledWith('ana@exemplo.com', PASSWORD);
    expect(mockedSaveTokens).toHaveBeenCalledWith(TOKENS);
    expect(router.replace).toHaveBeenCalledWith('/home');
  });

  test('401 abre o aviso "Login ou senha incorretos" e não entra na Home', async () => {
    mockedLogin.mockRejectedValue(httpError(401));
    const user = await renderScreen();

    await fillForm(user);
    await pressEnter(user);

    expect(await screen.findByText('Login ou senha incorretos')).toBeOnTheScreen();
    expect(screen.getByText('Verifique seu e-mail e senha e tente novamente.')).toBeOnTheScreen();
    expect(mockedSaveTokens).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();

    await user.press(screen.getByRole('button', { name: 'Voltar' }));

    expect(screen.queryByText('Login ou senha incorretos')).not.toBeOnTheScreen();
  });

  test('403 avisa que o cadastro não foi concluído e leva ao cadastro', async () => {
    mockedLogin.mockRejectedValue(httpError(403));
    const user = await renderScreen();

    await fillForm(user);
    await pressEnter(user);

    expect(await screen.findByText('Cadastro não concluído')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Concluir cadastro' }));

    expect(router.push).toHaveBeenCalledWith('/cadastro');
    expect(router.replace).not.toHaveBeenCalled();
  });

  test('sem rede abre o aviso de conexão', async () => {
    mockedLogin.mockRejectedValue(networkError());
    const user = await renderScreen();

    await fillForm(user);
    await pressEnter(user);

    expect(await screen.findByText('Sem conexão')).toBeOnTheScreen();
  });

  test('toque duplo durante o envio chama o Auth uma vez só', async () => {
    mockedLogin.mockReturnValue(new Promise(() => {}));
    const user = await renderScreen();

    await fillForm(user);
    await pressEnter(user);

    const loadingButton = screen.getByRole('button', { busy: true });
    await user.press(loadingButton);

    expect(mockedLogin).toHaveBeenCalledTimes(1);
    expect(loadingButton).toBeDisabled();
  });

  test('vindo do cadastro com e-mail já cadastrado mostra o aviso', async () => {
    mockParams.aviso = 'email-cadastrado';
    await renderScreen();

    expect(screen.getByText('Este e-mail já tem conta. Entre com sua senha.')).toBeOnTheScreen();
  });
});
