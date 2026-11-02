import { render, screen, userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Text } from 'react-native';

import RegisterScreen from '../src/app/cadastro';
import { SignupProvider, useSignup } from '../src/context/SignupContext';
import { requestPin } from '../src/services/auth';
import { httpError, networkError, spyOnConsole } from '../test-utils/http';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}));

jest.mock('../src/services/auth', () => ({
  ...jest.requireActual('../src/services/auth'),
  requestPin: jest.fn(),
}));

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const mockedRequestPin = requestPin as jest.Mock;

const PASSWORD = 'Senha@123';

const ERRORS = {
  name: 'Informe seu nome completo.',
  email: 'Informe seu e-mail.',
  emailFormat: 'Informe um e-mail válido, como nome@email.com.',
  password: 'Crie uma senha.',
  weakPassword: 'Sua senha não atende aos requisitos abaixo.',
  passwordConfirmation: 'Confirme sua senha.',
  differentPasswords: 'As senhas não são iguais.',
  terms: 'Aceite os Termos de Uso e a Política de Privacidade.',
};

// Mostra quais campos ficaram guardados no contexto, sem mostrar os valores
function SignupKeys() {
  const { signup } = useSignup();
  return <Text testID="signup-keys">{signup ? Object.keys(signup).sort().join(',') : ''}</Text>;
}

async function renderScreen() {
  await render(
    <SignupProvider>
      <RegisterScreen />
      <SignupKeys />
    </SignupProvider>,
  );
  return userEvent.setup();
}

type FormValues = {
  name?: string;
  email?: string;
  password?: string;
  passwordConfirmation?: string;
  acceptTerms?: boolean;
};

async function fillForm(user: ReturnType<typeof userEvent.setup>, values: FormValues = {}) {
  const {
    name = 'Ana Souza',
    email = 'ana@exemplo.com',
    password = PASSWORD,
    passwordConfirmation = password,
    acceptTerms = true,
  } = values;

  if (name) {
    await user.type(screen.getByLabelText('Nome completo'), name);
  }
  if (email) {
    await user.type(screen.getByLabelText('E-mail'), email);
  }
  if (password) {
    await user.type(screen.getByLabelText('Senha'), password);
  }
  if (passwordConfirmation) {
    await user.type(screen.getByLabelText('Confirmar senha'), passwordConfirmation);
  }
  if (acceptTerms) {
    await user.press(screen.getByLabelText('Concordar com os termos'));
  }
}

async function pressCreateAccount(user: ReturnType<typeof userEvent.setup>) {
  await user.press(screen.getByRole('button', { name: 'Criar conta' }));
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

  describe('validação local', () => {
    test('formulário vazio mostra todos os erros de uma vez e não chama o Auth', async () => {
      const user = await renderScreen();

      await pressCreateAccount(user);

      expect(screen.getByText(ERRORS.name)).toBeOnTheScreen();
      expect(screen.getByText(ERRORS.email)).toBeOnTheScreen();
      expect(screen.getByText(ERRORS.password)).toBeOnTheScreen();
      expect(screen.getByText(ERRORS.passwordConfirmation)).toBeOnTheScreen();
      expect(screen.getByText(ERRORS.terms)).toBeOnTheScreen();
      expect(mockedRequestPin).not.toHaveBeenCalled();
    });

    test('erros de formato diferentes aparecem juntos', async () => {
      const user = await renderScreen();

      await fillForm(user, {
        email: 'ana@exemplo',
        password: 'fraca',
        passwordConfirmation: 'outra',
        acceptTerms: false,
      });
      await pressCreateAccount(user);

      expect(screen.getByText(ERRORS.emailFormat)).toBeOnTheScreen();
      expect(screen.getByText(ERRORS.weakPassword)).toBeOnTheScreen();
      expect(screen.getByText(ERRORS.differentPasswords)).toBeOnTheScreen();
      expect(screen.getByText(ERRORS.terms)).toBeOnTheScreen();
      expect(screen.queryByText(ERRORS.name)).not.toBeOnTheScreen();
      expect(mockedRequestPin).not.toHaveBeenCalled();
    });

    test('e-mail fora do formato não chama o Auth', async () => {
      const user = await renderScreen();

      await fillForm(user, { email: 'ana.exemplo.com' });
      await pressCreateAccount(user);

      expect(screen.getByText(ERRORS.emailFormat)).toBeOnTheScreen();
      expect(mockedRequestPin).not.toHaveBeenCalled();
    });

    test('senha fora da política não chama o Auth', async () => {
      const user = await renderScreen();

      await fillForm(user, { password: 'senhafraca' });
      await pressCreateAccount(user);

      expect(screen.getByText(ERRORS.weakPassword)).toBeOnTheScreen();
      expect(mockedRequestPin).not.toHaveBeenCalled();
    });

    test('confirmação diferente da senha não chama o Auth', async () => {
      const user = await renderScreen();

      await fillForm(user, { passwordConfirmation: 'Senha@124' });
      await pressCreateAccount(user);

      expect(screen.getByText(ERRORS.differentPasswords)).toBeOnTheScreen();
      expect(mockedRequestPin).not.toHaveBeenCalled();
    });

    test('sem aceitar os termos não chama o Auth', async () => {
      const user = await renderScreen();

      await fillForm(user, { acceptTerms: false });
      await pressCreateAccount(user);

      expect(screen.getByText(ERRORS.terms)).toBeOnTheScreen();
      expect(mockedRequestPin).not.toHaveBeenCalled();
    });

    test('corrigir um campo tira só o erro dele', async () => {
      const user = await renderScreen();

      await pressCreateAccount(user);
      await user.type(screen.getByLabelText('Nome completo'), 'Ana Souza');

      expect(screen.queryByText(ERRORS.name)).not.toBeOnTheScreen();
      expect(screen.getByText(ERRORS.email)).toBeOnTheScreen();
      expect(screen.getByText(ERRORS.terms)).toBeOnTheScreen();
    });
  });

  describe('envio', () => {
    test('pede o PIN com o e-mail e vai para a tela do código', async () => {
      mockedRequestPin.mockResolvedValue('challenge-1');
      const user = await renderScreen();

      await fillForm(user);
      await pressCreateAccount(user);

      expect(mockedRequestPin).toHaveBeenCalledWith('ana@exemplo.com');
      expect(router.push).toHaveBeenCalledWith('/codigo');
    });

    test('guarda o cadastro só em memória, sem a confirmação e sem gravar no aparelho', async () => {
      mockedRequestPin.mockResolvedValue('challenge-1');
      const user = await renderScreen();

      await fillForm(user);
      await pressCreateAccount(user);

      expect(screen.getByTestId('signup-keys')).toHaveTextContent(
        'acceptedTerms,challengeId,email,name,password,pinRequestedAt',
      );
      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    test('toque duplo durante o envio chama o Auth uma vez só', async () => {
      mockedRequestPin.mockReturnValue(new Promise(() => {}));
      const user = await renderScreen();

      await fillForm(user);
      await pressCreateAccount(user);

      // Durante o carregamento o botão mostra só o indicador, sem o texto
      const loadingButton = screen.getByRole('button', { busy: true });
      await user.press(loadingButton);

      expect(mockedRequestPin).toHaveBeenCalledTimes(1);
      expect(loadingButton).toBeDisabled();
    });
  });

  describe('respostas do Auth', () => {
    test('409 leva ao login com aviso de e-mail cadastrado', async () => {
      mockedRequestPin.mockRejectedValue(httpError(409));
      const user = await renderScreen();

      await fillForm(user);
      await pressCreateAccount(user);

      expect(router.replace).toHaveBeenCalledWith({
        pathname: '/',
        params: { aviso: 'email-cadastrado' },
      });
    });

    test('400 mostra o erro no campo de e-mail', async () => {
      mockedRequestPin.mockRejectedValue(httpError(400));
      const user = await renderScreen();

      await fillForm(user);
      await pressCreateAccount(user);

      expect(await screen.findByText('Informe um e-mail válido.')).toBeOnTheScreen();
    });

    test('429 abre o aviso pedindo para aguardar, e Voltar fecha', async () => {
      mockedRequestPin.mockRejectedValue(httpError(429));
      const user = await renderScreen();

      await fillForm(user);
      await pressCreateAccount(user);

      expect(await screen.findByText('Aguarde um pouco')).toBeOnTheScreen();
      expect(
        screen.getByText('Você pediu um código há pouco. Aguarde 1 minuto e tente de novo.'),
      ).toBeOnTheScreen();

      await user.press(screen.getByRole('button', { name: 'Voltar' }));

      expect(screen.queryByText('Aguarde um pouco')).not.toBeOnTheScreen();
    });

    test('503 abre o aviso de serviço indisponível e mantém o formulário na tela', async () => {
      mockedRequestPin.mockRejectedValue(httpError(503));
      const user = await renderScreen();

      await fillForm(user);
      await pressCreateAccount(user);

      expect(await screen.findByText('Algo deu errado')).toBeOnTheScreen();
      expect(screen.getByText('Não foi possível enviar o código. Tente de novo.')).toBeOnTheScreen();
      expect(router.push).not.toHaveBeenCalled();
    });

    test('sem rede abre o aviso de conexão', async () => {
      mockedRequestPin.mockRejectedValue(networkError());
      const user = await renderScreen();

      await fillForm(user);
      await pressCreateAccount(user);

      expect(await screen.findByText('Sem conexão')).toBeOnTheScreen();
      expect(
        screen.getByText('Não foi possível conectar. Verifique sua internet e tente de novo.'),
      ).toBeOnTheScreen();
    });
  });

  describe('acessibilidade', () => {
    test('caixa dos termos tem papel de checkbox e informa se está marcada', async () => {
      const user = await renderScreen();
      const checkbox = screen.getByRole('checkbox', { name: 'Concordar com os termos' });

      expect(checkbox).not.toBeChecked();

      await user.press(checkbox);

      expect(checkbox).toBeChecked();
    });

    test('campo com erro informa a mensagem ao leitor de tela', async () => {
      const user = await renderScreen();

      await pressCreateAccount(user);

      expect(screen.getByLabelText('E-mail')).toHaveAccessibleName('E-mail');
      expect(screen.getByLabelText('E-mail').props.accessibilityHint).toBe(ERRORS.email);
    });
  });
});
