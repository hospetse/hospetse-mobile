import { render, screen, userEvent } from '@testing-library/react-native';
import { Text, TouchableOpacity } from 'react-native';

import { SessionProvider, useSession } from '../src/context/SessionContext';
import { clearTokens } from '../src/services/token-storage';
import type { CurrentUser } from '../src/services/users';

jest.mock('../src/services/token-storage', () => ({
  clearTokens: jest.fn(),
}));

const mockedClearTokens = clearTokens as jest.Mock;

const CURRENT_USER: CurrentUser = {
  user: { id: 'user-1', authUserId: 'auth-user-1', email: 'ana@exemplo.com', name: 'Ana Souza' },
  profile: { status: 'complete', missingFields: [] },
  permissions: { canSearch: true, canContract: true },
};

// Mostra o nome da sessão e expõe as ações do contexto como botões
function SessionProbe() {
  const { currentUser, saveCurrentUser, logout } = useSession();

  return (
    <>
      <Text testID="user-name">{currentUser?.user.name ?? ''}</Text>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Entrar" onPress={() => saveCurrentUser(CURRENT_USER)}>
        <Text>Entrar</Text>
      </TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Sair" onPress={() => void logout()}>
        <Text>Sair</Text>
      </TouchableOpacity>
    </>
  );
}

async function renderProbe() {
  await render(
    <SessionProvider>
      <SessionProbe />
    </SessionProvider>,
  );
  const user = userEvent.setup();
  await user.press(screen.getByRole('button', { name: 'Entrar' }));
  expect(screen.getByTestId('user-name')).toHaveTextContent('Ana Souza');
  return user;
}

describe('SessionContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedClearTokens.mockResolvedValue(undefined);
  });

  test('logout apaga os tokens e o usuário em memória', async () => {
    const user = await renderProbe();

    await user.press(screen.getByRole('button', { name: 'Sair' }));

    expect(mockedClearTokens).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('user-name')).toHaveTextContent('');
  });

  test('falha ao apagar os tokens ainda limpa o usuário e não lança erro', async () => {
    mockedClearTokens.mockRejectedValue(new Error('SecureStore indisponível'));
    const user = await renderProbe();

    await user.press(screen.getByRole('button', { name: 'Sair' }));

    expect(mockedClearTokens).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('user-name')).toHaveTextContent('');
  });
});
