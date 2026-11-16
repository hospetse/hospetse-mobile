import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';

import ServiceRequestScreen from '../src/app/solicitar-servico/[id]';
import { backendApi } from '../src/services/api';
import { clearMockServiceRequests } from '../src/services/serviceRequests';
import { listMyReservations, resetMockReservations } from '../src/services/tutorReservations';
import { toIsoDate } from '../src/utils/calendar';
import { apiError } from '../test-utils/http';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), dismissTo: jest.fn(), push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('../src/services/api', () => ({
  backendApi: { get: jest.fn() },
}));

const mockedParams = useLocalSearchParams as jest.Mock;
const mockedGet = backendApi.get as jest.Mock;

const HOST_ID = '3f1c2a9e-6b1d-4c3e-9a51-2f0f6d1b7c11';
const PET_ID = '22222222-2222-4222-8222-222222222222';
const HOST = {
  id: HOST_ID,
  name: 'Passeio Feliz',
  description: null,
  pictureUrl: null,
  location: { city: 'Maringá', neighborhood: 'Zona 7' },
  photos: [],
  accepts: { species: [], sizes: [], breeds: [] },
  services: [{ id: 'service-1', name: 'Serviço', price: 50 }],
  reputation: { rating: null, reviewCount: 0 },
};
const PETS = [{ id: PET_ID, name: 'Luna', species: 'cat', breed: null, size: 'small' }];

function futureDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return toIsoDate(date);
}

function respond() {
  mockedGet.mockImplementation((url: string) =>
    Promise.resolve({ data: url === '/api/v1/me/pets' ? { items: PETS } : HOST }),
  );
}

async function renderScreen(service = 'Pet Sitter') {
  mockedParams.mockReturnValue({ id: HOST_ID, service, checkIn: futureDate(), petId: PET_ID });
  await render(<ServiceRequestScreen />);
  const user = userEvent.setup();
  await screen.findByRole('header', { name: service === 'Pet Walker' ? 'Passeio' : 'Visita' });
  return user;
}

describe('Solicitação de visita e passeio', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetMockReservations();
    clearMockServiceRequests();
    respond();
  });

  test('mostra o pet, a data recebida da busca e o resumo com o preço', async () => {
    await renderScreen();

    expect(screen.getByRole('radio', { name: 'Luna' })).toBeSelected();
    expect(screen.getByText('Passeio Feliz')).toBeOnTheScreen();
    expect(screen.getByText('R$ 70,00')).toBeOnTheScreen();
    expect(screen.getByText('Resumo da solicitação')).toBeOnTheScreen();
  });

  test('exige pet, data, horário e endereço antes de enviar', async () => {
    mockedParams.mockReturnValue({ id: HOST_ID, service: 'Pet Sitter' });
    await render(<ServiceRequestScreen />);
    const user = userEvent.setup();
    await screen.findByRole('header', { name: 'Visita' });
    await user.press(screen.getByRole('button', { name: 'Solicitar visita' }));

    expect(screen.getByText('Escolha o pet que receberá o serviço.')).toBeOnTheScreen();
    expect(screen.getByText('Escolha a data do serviço.')).toBeOnTheScreen();
    expect(screen.getByText('Escolha o horário do serviço.')).toBeOnTheScreen();
    expect(screen.getByText('Informe o endereço do serviço.')).toBeOnTheScreen();
  });

  test('pede instruções quando o Tutor estará ausente', async () => {
    const user = await renderScreen();

    fireEvent(screen.getByRole('switch', { name: 'Estarei ausente' }), 'valueChange', true);
    await user.press(screen.getByRole('button', { name: 'Solicitar visita' }));

    expect(screen.getByText('Explique como o prestador poderá entrar.')).toBeOnTheScreen();
  });

  test('mostra medicamentos quando o prestador oferece esse cuidado', async () => {
    await renderScreen();
    expect(screen.getByText('Precisa administrar medicamento')).toBeOnTheScreen();
  });

  test('não mostra medicamentos para um passeio', async () => {
    await renderScreen('Pet Walker');
    expect(screen.queryByText('Precisa administrar medicamento')).not.toBeOnTheScreen();
  });

  test('cria a solicitação simulada e deixa-a aguardando aceite', async () => {
    const user = await renderScreen();

    await user.press(screen.getByRole('radio', { name: '14:00' }));
    await user.type(screen.getByLabelText('Endereço do serviço'), 'Rua das Flores, 123, Maringá');
    await user.press(screen.getByRole('button', { name: 'Solicitar visita' }));

    expect(await screen.findByRole('header', { name: 'Visita solicitada!' })).toBeOnTheScreen();
    expect(router.replace).not.toHaveBeenCalled();

    const reservations = await listMyReservations();
    expect(reservations.items[0]).toMatchObject({
      status: 'requested',
      serviceType: 'Pet Sitter',
      scheduledTime: '14:00',
      petId: PET_ID,
      address: 'Rua das Flores, 123, Maringá',
    });
  });

  test('erro de carregamento permite tentar novamente', async () => {
    mockedGet.mockRejectedValueOnce(apiError(500, 'INTERNAL_ERROR'));
    mockedParams.mockReturnValue({ id: HOST_ID, service: 'Pet Sitter', checkIn: futureDate(), petId: PET_ID });
    await render(<ServiceRequestScreen />);
    const user = userEvent.setup();

    expect(await screen.findByText('Não foi possível carregar os dados do prestador. Tente de novo.')).toBeOnTheScreen();
    mockedGet.mockImplementation((url: string) =>
      Promise.resolve({ data: url === '/api/v1/me/pets' ? { items: PETS } : HOST }),
    );
    await user.press(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(await screen.findByRole('header', { name: 'Visita' })).toBeOnTheScreen();
  });
});
