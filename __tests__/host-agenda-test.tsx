import { render, screen } from '@testing-library/react-native';

import HostAgendaScreen from '../src/app/agenda-host';
import { backendApi } from '../src/services/api';
import { blockHostAgenda, getHostAgenda, hostAgendaErrorMessage, unblockHostAgendaDay } from '../src/services/hostAgenda';
import { apiError, networkError } from '../test-utils/http';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() },
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../src/services/api', () => ({ backendApi: { get: jest.fn(), post: jest.fn(), delete: jest.fn() } }));

const mockedGet = backendApi.get as jest.Mock;
const mockedPost = backendApi.post as jest.Mock;
const mockedDelete = backendApi.delete as jest.Mock;

const AGENDA = {
  startDate: '2026-12-01',
  endDate: '2027-01-01',
  capacity: 2,
  days: [
    { date: '2026-12-01', status: 'free', occupied: 0 },
    { date: '2026-12-02', status: 'blocked', occupied: 0, block: { id: 'block-1', reason: 'Reforma' } },
    { date: '2026-12-03', status: 'occupied', occupied: 2 },
  ],
};

describe('services/hostAgenda', () => {
  test('consulta a agenda com o período informado', async () => {
    mockedGet.mockResolvedValue({ data: AGENDA });
    await expect(getHostAgenda('2026-12-01', '2027-01-01')).resolves.toEqual(AGENDA);
    expect(mockedGet).toHaveBeenCalledWith('/api/v1/me/host/agenda', {
      params: { startDate: '2026-12-01', endDate: '2027-01-01' },
    });
  });

  test('bloqueia e libera um dia', async () => {
    mockedPost.mockResolvedValue({ data: { items: [] } });
    mockedDelete.mockResolvedValue({ status: 204 });
    await blockHostAgenda({ startDate: '2026-12-10', endDate: '2026-12-12', reason: 'Reforma' });
    await unblockHostAgendaDay('block-1');
    expect(mockedPost).toHaveBeenCalledWith('/api/v1/me/host/agenda/blocks', {
      startDate: '2026-12-10', endDate: '2026-12-12', reason: 'Reforma',
    });
    expect(mockedDelete).toHaveBeenCalledWith('/api/v1/me/host/agenda/blocks/block-1');
  });

  test('traduz conflitos e conexão', () => {
    expect(hostAgendaErrorMessage(apiError(409, 'PERIOD_OCCUPIED'))).toContain('Há hospedagem');
    expect(hostAgendaErrorMessage(networkError())).toContain('conectar');
  });
});

describe('Tela de agenda do Host', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGet.mockResolvedValue({ data: AGENDA });
  });

  test('mostra a capacidade e a legenda dos três estados', async () => {
    await render(<HostAgendaScreen />);
    expect(await screen.findByRole('header', { name: 'Agenda do Host' })).toBeOnTheScreen();
    expect(screen.getByText('2 pets')).toBeOnTheScreen();
    expect(screen.getByText('Livre')).toBeOnTheScreen();
    expect(screen.getByText('Bloqueado')).toBeOnTheScreen();
    expect(screen.getByText('Ocupado')).toBeOnTheScreen();
  });
});
