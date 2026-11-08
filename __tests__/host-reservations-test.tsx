import { render, screen, userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';

import HostReservationsScreen, { hostReservationsErrorMessage } from '../src/app/reservas';
import { backendApi } from '../src/services/api';
import { HostPendingReservation } from '../src/services/hostReservations';
import { formatDate, formatIsoDateTime } from '../src/utils/calendar';
import { httpError, networkError } from '../test-utils/http';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() },
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../src/services/api', () => ({ backendApi: { get: jest.fn() } }));

const mockedGet = backendApi.get as jest.Mock;
const REQUEST: HostPendingReservation = {
  id: 'request-1',
  status: 'requested',
  serviceId: 'service-1',
  startDate: '2026-12-18',
  endDate: '2026-12-21',
  dailyPrice: 120,
  totalValue: 360,
  notes: 'A Luna precisa de medicação oral.',
  createdAt: '2026-12-01T10:00:00.000Z',
  tutor: { name: 'Ana Clara' },
  pet: {
    name: 'Luna',
    species: 'cat',
    size: 'small',
    breed: null,
    medicalNotes: 'Medicação duas vezes ao dia.',
    behavioralNotes: null,
  },
};

async function renderScreen(items: HostPendingReservation[] = [REQUEST]) {
  mockedGet.mockResolvedValue({ data: { items, page: 1, pageSize: 20, total: items.length } });
  await render(<HostReservationsScreen />);
  return userEvent.setup();
}

describe('Tela de solicitações pendentes do Host', () => {
  beforeEach(() => jest.clearAllMocks());

  test('busca a primeira página e mostra Tutor, pet, período, valor e observação', async () => {
    await renderScreen();

    expect(mockedGet).toHaveBeenCalledWith('/api/v1/me/host/reservations', {
      params: { status: 'requested', page: 1, pageSize: 20 },
    });
    expect(await screen.findByRole('header', { name: /solicitações pendentes/i })).toBeOnTheScreen();
    expect(screen.getByText(`Solicitado em ${formatIsoDateTime(REQUEST.createdAt)}`)).toBeOnTheScreen();
    expect(screen.getByText('Ana Clara')).toBeOnTheScreen();
    expect(screen.getByText('Luna')).toBeOnTheScreen();
    expect(screen.getByText('18/12/2026')).toBeOnTheScreen();
    expect(screen.getByText('21/12/2026')).toBeOnTheScreen();
    expect(screen.getByText('R$ 360,00')).toBeOnTheScreen();
    expect(screen.getByText('A Luna precisa de medicação oral.')).toBeOnTheScreen();
  });

  test('mostra estado vazio', async () => {
    await renderScreen([]);
    expect(await screen.findByText('Nenhuma solicitação pendente')).toBeOnTheScreen();
  });

  test('mostra erro e tenta novamente', async () => {
    mockedGet.mockRejectedValueOnce(networkError()).mockResolvedValueOnce({
      data: { items: [REQUEST], page: 1, pageSize: 20, total: 1 },
    });
    const user = await render(<HostReservationsScreen />).then(() => userEvent.setup());

    expect(await screen.findByText('Não foi possível conectar. Verifique sua internet e tente de novo.')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(await screen.findByText('Ana Clara')).toBeOnTheScreen();
  });

  test('converte o timestamp UTC para o fuso local antes de formatar o dia', () => {
    const timestamp = '2026-12-02T01:00:00.000Z';
    expect(formatIsoDateTime(timestamp)).toBe(formatDate(new Date(timestamp)));
  });

  test('a aba Home volta para a Home', async () => {
    const user = await renderScreen();
    await user.press(screen.getByLabelText('Home'));
    expect(router.replace).toHaveBeenCalledWith('/home');
  });
});

describe('Mensagens da lista do Host', () => {
  test('diferencia acesso de Tutor', () => {
    expect(hostReservationsErrorMessage(httpError(403))).toBe(
      'Esta área está disponível apenas para prestadores de serviço.',
    );
  });
});
