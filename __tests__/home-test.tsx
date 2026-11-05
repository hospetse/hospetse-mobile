import { fireEvent, render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import HomeScreen from '../src/app/home';
import { useSession } from '../src/context/SessionContext';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({}),
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = jest.requireActual('react-native');
  return {
    SafeAreaView: View,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock('../src/context/SessionContext', () => ({
  useSession: jest.fn(),
}));

const mockedSession = useSession as jest.Mock;

const CURRENT_USER = {
  user: { id: 'user-1', authUserId: 'auth-user-1', email: 'ana@exemplo.com', name: 'Ana Souza' },
  profile: { status: 'complete', missingFields: [] },
  permissions: { canSearch: true, canContract: true },
};

describe('Home', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Sair encerra a sessão local e volta ao login', async () => {
    const logout = jest.fn().mockResolvedValue(undefined);
    mockedSession.mockReturnValue({ currentUser: CURRENT_USER, logout });
    await render(<HomeScreen />);
    const user = userEvent.setup();

    await user.press(screen.getByRole('button', { name: 'Sair' }));

    expect(logout).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith('/');
  });

  test('só volta ao login depois que o logout termina', async () => {
    let finishLogout: () => void = () => undefined;
    const logout = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          finishLogout = resolve;
        }),
    );
    mockedSession.mockReturnValue({ currentUser: CURRENT_USER, logout });
    await render(<HomeScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Sair' }));

    expect(logout).toHaveBeenCalledTimes(1);
    expect(router.replace).not.toHaveBeenCalled();

    finishLogout();
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/'));
  });
});
