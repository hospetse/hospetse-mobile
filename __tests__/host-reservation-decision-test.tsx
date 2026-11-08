import { render, screen, userEvent } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';

import HostReservationDecisionScreen from '../src/app/reserva-host/[id]';
import { backendApi } from '../src/services/api';
import { HostPendingReservation, hostDecisionErrorMessage } from '../src/services/hostReservations';
import { apiError } from '../test-utils/http';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../src/services/api', () => ({ backendApi: { get: jest.fn(), post: jest.fn() } }));

const mockedParams = useLocalSearchParams as jest.Mock;
const mockedGet = backendApi.get as jest.Mock;
const mockedPost = backendApi.post as jest.Mock;
const REQUEST_ID = '11111111-1111-4111-8111-111111111111';
const REQUEST: HostPendingReservation = {
  id: REQUEST_ID,
  status: 'requested',
  serviceId: 'service-1',
  startDate: '2026-12-18',
  endDate: '2026-12-21',
  dailyPrice: 120,
  totalValue: 360,
  notes: 'Levar medicação.',
  createdAt: '2026-12-01T10:00:00.000Z',
  tutor: { name: 'Ana Clara' },
  pet: {
    name: 'Luna',
    species: 'cat',
    size: 'small',
    breed: null,
    medicalNotes: 'Duas vezes ao dia.',
    behavioralNotes: null,
  },
};

async function renderScreen() {
  mockedParams.mockReturnValue({ id: REQUEST_ID });
  mockedGet.mockResolvedValue({ data: { items: [REQUEST], page: 1, pageSize: 20, total: 1 } });
  await render(<HostReservationDecisionScreen />);
  return userEvent.setup();
}

describe('Decisão de solicitação do Host', () => {
  beforeEach(() => jest.clearAllMocks());

  test('aceitar confirma e envia a solicitação', async () => {
    mockedPost.mockResolvedValue({ data: { id: REQUEST_ID, status: 'awaiting_payment', decidedAt: '2026-12-01T12:00:00Z', rejectionReason: null } });
    const user = await renderScreen();

    await user.press(await screen.findByRole('button', { name: 'Aceitar solicitação' }));
    await user.press(screen.getByRole('button', { name: 'Confirmar' }));

    expect(mockedPost).toHaveBeenCalledWith(`/api/v1/me/host/reservations/${REQUEST_ID}/accept`);
    expect(router.replace).toHaveBeenCalledWith('/reservas');
  });

  test('recusar exige motivo e envia o texto aparado', async () => {
    mockedPost.mockResolvedValue({ data: { id: REQUEST_ID, status: 'rejected', decidedAt: '2026-12-01T12:00:00Z', rejectionReason: 'Período indisponível' } });
    const user = await renderScreen();

    await user.press(await screen.findByRole('button', { name: 'Recusar solicitação' }));
    await user.press(screen.getByRole('button', { name: 'Confirmar' }));
    expect(screen.getByText('Informe o motivo da recusa.')).toBeOnTheScreen();

    await user.type(screen.getByLabelText('Motivo da recusa'), '  Período indisponível  ');
    await user.press(screen.getByRole('button', { name: 'Confirmar' }));

    expect(mockedPost).toHaveBeenCalledWith(`/api/v1/me/host/reservations/${REQUEST_ID}/reject`, {
      reason: 'Período indisponível',
    });
    expect(router.replace).toHaveBeenCalledWith('/reservas');
  });

  test('mostra informações médicas e comportamento do pet', async () => {
    await renderScreen();
    expect(await screen.findByText('Duas vezes ao dia.')).toBeOnTheScreen();
  });
});

describe('Erros da decisão do Host', () => {
  test('conflito vira mensagem compreensível', () => {
    expect(hostDecisionErrorMessage(apiError(409, 'RESERVATION_ALREADY_DECIDED'))).toContain('já foi decidida');
  });
});
