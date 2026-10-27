import { render, screen, userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';

import RegisterScreen from '../src/app/cadastro';
import { SignupProvider } from '../src/context/SignupContext';
import { requestPin } from '../src/services/auth';
import { httpError, networkError, spyOnConsole } from '../test-utils/http';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}));

jest.mock('../src/services/auth', () => ({
  ...jest.requireActual('../src/services/auth'),
  requestPin: jest.fn(),
}));

const mockedRequestPin = requestPin as jest.Mock;
const PASSWORD = 'Senha@123';

async function renderScreen() {
  await render(
    <SignupProvider>
      <RegisterScreen />
    </SignupProvider>,
  );
  return userEvent.setup();
}

async function fillForm(user: ReturnType<typeof userEvent.setup>, password = PASSWORD) {
  await user.type(screen.getByLabelText('Nome completo'), 'Ana Souza');
  await user.type(screen.getByLabelText('E-mail'), 'ana@exemplo.com');
  await user.type(screen.getByLabelText('Senha'), password);
  await user.press(screen.getByLabelText('Concordar com os termos'));
}

describe('Tela de cadastro', () => {
  let consoleSpy: ReturnType<typeof spyOnConsole>;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = spyOnConsole();
  });

  afterEach(() => {
    // A senha nunca pode aparecer em log
    expect(consoleSpy.output()).not.toContain(PASSWORD);
    consoleSpy.restore();
  });

  test('campos vazios mostram erro e não chamam o Auth', async () => {
    const user = await renderScreen();

    await user.press(screen.getByRole('button', { name: 'Criar conta' }));

    expect(screen.getByText('Preencha todos os campos para continuar.')).toBeOnTheScreen();
    expect(mockedRequestPin).not.toHaveBeenCalled();
  });

  test('senha fraca mostra erro e não chama o Auth', async () => {
    const user = await renderScreen();
    await fillForm(user, 'fraca');

    await user.press(screen.getByRole('button', { name: 'Criar conta' }));

    expect(screen.getByText('Sua senha não atende aos requisitos.')).toBeOnTheScreen();
    expect(mockedRequestPin).not.toHaveBeenCalled();
  });

  test('pede o PIN com o e-mail e vai para a tela do código', async () => {
    mockedRequestPin.mockResolvedValue('challenge-1');
    const user = await renderScreen();
    await fillForm(user);

    await user.press(screen.getByRole('button', { name: 'Criar conta' }));

    expect(mockedRequestPin).toHaveBeenCalledWith('ana@exemplo.com');
    expect(router.push).toHaveBeenCalledWith('/codigo');
  });

  test('409 leva ao login com aviso de e-mail cadastrado', async () => {
    mockedRequestPin.mockRejectedValue(httpError(409));
    const user = await renderScreen();
    await fillForm(user);

    await user.press(screen.getByRole('button', { name: 'Criar conta' }));

    expect(router.replace).toHaveBeenCalledWith({
      pathname: '/',
      params: { aviso: 'email-cadastrado' },
    });
  });

  test('429 pede para aguardar', async () => {
    mockedRequestPin.mockRejectedValue(httpError(429));
    const user = await renderScreen();
    await fillForm(user);

    await user.press(screen.getByRole('button', { name: 'Criar conta' }));

    expect(
      await screen.findByText('Você pediu um código há pouco. Aguarde 1 minuto e tente de novo.'),
    ).toBeOnTheScreen();
  });

  test('sem rede mostra mensagem de conexão', async () => {
    mockedRequestPin.mockRejectedValue(networkError());
    const user = await renderScreen();
    await fillForm(user);

    await user.press(screen.getByRole('button', { name: 'Criar conta' }));

    expect(
      await screen.findByText('Não foi possível conectar. Verifique sua internet e tente de novo.'),
    ).toBeOnTheScreen();
  });

  test('toque duplo durante o envio chama o Auth uma vez só', async () => {
    mockedRequestPin.mockReturnValue(new Promise(() => {}));
    const user = await renderScreen();
    await fillForm(user);

    await user.press(screen.getByRole('button', { name: 'Criar conta' }));
    await user.press(screen.getByRole('button'));

    expect(mockedRequestPin).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
