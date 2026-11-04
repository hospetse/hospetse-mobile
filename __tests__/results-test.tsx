import { render, screen, userEvent } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';

import ResultsScreen, { resultsTitle } from '../src/app/resultados';
import { useSession } from '../src/context/SessionContext';
import { backendApi } from '../src/services/api';
import { cityName, HostSearch, HostSummary, toSearchQuery } from '../src/services/hosts';
import { toSearchParams } from '../src/utils/searchParams';
import { httpError, networkError } from '../test-utils/http';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn(), replace: jest.fn(), setParams: jest.fn() },
  useLocalSearchParams: jest.fn(),
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

jest.mock('../src/services/api', () => ({
  backendApi: { get: jest.fn() },
}));

const mockedParams = useLocalSearchParams as jest.Mock;
const mockedSession = useSession as jest.Mock;
const mockedGet = backendApi.get as jest.Mock;

// Mesmo formato de um item do GET /api/v1/hosts/search
function offer(overrides: Partial<HostSummary>): HostSummary {
  return {
    hostId: '3f1c2a9e-6b1d-4c3e-9a51-2f0f6d1b7c11',
    serviceId: 'service-1',
    name: 'Hotelzinho da Ana',
    serviceName: 'Diária',
    dailyPrice: 120,
    pictureUrl: null,
    location: { city: 'Maringá', neighborhood: 'Zona 7' },
    reputation: { rating: 4.8, reviewCount: 12 },
    ...overrides,
  };
}

function respond(items: HostSummary[], total = items.length) {
  mockedGet.mockResolvedValue({ data: { items, page: 1, pageSize: 50, total } });
}

const NO_FILTERS: HostSearch = {
  city: '',
  checkIn: null,
  checkOut: null,
  petId: null,
  services: [],
  sizes: [],
  maxPrice: null,
  amenities: [],
};

async function renderScreen(params: Record<string, string>) {
  mockedParams.mockReturnValue(params);
  await render(<ResultsScreen />);
  return userEvent.setup();
}

// Parâmetros da última chamada à busca
function lastQuery() {
  const calls = mockedGet.mock.calls;
  return calls[calls.length - 1][1].params;
}

describe('Tela de resultados', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedSession.mockReturnValue({ currentUser: null });
    respond([offer({}), offer({ serviceId: 'service-2', hostId: 'host-2', name: 'Recanto Pata Mansa', dailyPrice: 250 })]);
  });

  test('mostra o nome da sessão no cabeçalho', async () => {
    mockedSession.mockReturnValue({
      currentUser: {
        user: { name: 'Raul Jorge' },
        profile: { status: 'incomplete', missingFields: [] },
        permissions: { canSearch: true, canContract: false },
      },
    });

    await renderScreen({ city: 'Maringá' });

    expect(await screen.findByText('Raul Jorge')).toBeOnTheScreen();
    expect(screen.queryByText('Murilo Barbosa')).not.toBeOnTheScreen();
  });

  test('Sair encerra a sessão local e volta ao login', async () => {
    const logout = jest.fn().mockResolvedValue(undefined);
    mockedSession.mockReturnValue({ currentUser: null, logout });
    const user = await renderScreen({ city: 'Maringá' });
    await screen.findByText('Hotelzinho da Ana');

    await user.press(screen.getByRole('button', { name: 'Sair' }));

    expect(logout).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith('/');
  });

  test('chama a busca com a cidade sem o estado e as datas', async () => {
    await renderScreen({ city: 'Maringá, PR', checkIn: '2026-12-18', checkOut: '2026-12-21' });

    expect(await screen.findByText('Hotelzinho da Ana')).toBeOnTheScreen();
    expect(mockedGet).toHaveBeenCalledWith('/api/v1/hosts/search', {
      params: { city: 'Maringá', startDate: '2026-12-18', endDate: '2026-12-21', page: 1, pageSize: 50 },
    });
  });

  test('mostra os cards com nome, bairro e cidade e preço, e o total da API', async () => {
    respond([offer({})], 7);
    await renderScreen({ city: 'Maringá' });

    expect(await screen.findByText('7 resultados encontrados')).toBeOnTheScreen();
    expect(screen.getByText('Zona 7, Maringá')).toBeOnTheScreen();
    expect(screen.getByText('R$120/diário')).toBeOnTheScreen();
  });

  test('o título segue o serviço escolhido na busca', async () => {
    respond([offer({})]);
    await renderScreen({ city: 'Maringá', service: 'Pet Sitter' });

    expect(await screen.findByText('1 Pet-Sitter encontrado')).toBeOnTheScreen();
  });

  test('o porte escolhido nos filtros vai para a busca', async () => {
    const user = await renderScreen({ city: 'Maringá' });
    await screen.findByText('Hotelzinho da Ana');

    await user.press(screen.getByRole('button', { name: 'Filtros' }));
    await user.press(screen.getByRole('checkbox', { name: 'Pequeno' }));
    await user.press(screen.getByRole('button', { name: 'Aplicar Filtros' }));

    await screen.findByRole('button', { name: 'Filtros, 1 ativos' });
    expect(lastQuery()).toEqual({ city: 'Maringá', size: 'small', page: 1, pageSize: 50 });
  });

  test('sem resultados mostra o estado vazio, e "Ajustar filtros" abre os filtros', async () => {
    respond([]);
    const user = await renderScreen({ city: 'Curitiba' });

    expect(await screen.findByText('Nenhuma hospedagem encontrada')).toBeOnTheScreen();
    expect(screen.getByText('0 resultados encontrados')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Ajustar filtros' }));
    expect(screen.getByRole('header', { name: 'Filtros' })).toBeOnTheScreen();
  });

  test('abrir um resultado leva ao detalhe do Host com as datas da busca', async () => {
    const user = await renderScreen({ city: 'Maringá', checkIn: '2026-12-18', checkOut: '2026-12-21' });

    await user.press(await screen.findByText('Recanto Pata Mansa'));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/host/[id]',
      params: { id: 'host-2', checkIn: '2026-12-18', checkOut: '2026-12-21' },
    });
  });

  test('sem rede mostra o erro e "Tentar de novo" refaz a busca', async () => {
    mockedGet.mockRejectedValueOnce(networkError());
    const user = await renderScreen({ city: 'Maringá' });

    expect(
      await screen.findByText('Não foi possível conectar. Verifique sua internet e tente de novo.'),
    ).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(await screen.findByText('Hotelzinho da Ana')).toBeOnTheScreen();
  });

  test('resposta sem lista de resultados mostra erro recuperável em vez de quebrar a tela', async () => {
    mockedGet.mockResolvedValueOnce({ data: { total: 0 } });
    await renderScreen({ city: 'Maringá' });

    expect(await screen.findByText('Algo deu errado')).toBeOnTheScreen();
  });

  test('400 da API avisa que algum filtro não é válido', async () => {
    mockedGet.mockRejectedValueOnce(httpError(400));
    await renderScreen({ city: 'Maringá' });

    expect(
      await screen.findByText('Algum filtro da busca não é válido. Confira as datas e tente de novo.'),
    ).toBeOnTheScreen();
  });
});

describe('Parâmetros da busca', () => {
  test('a cidade vai sem o estado', () => {
    expect(cityName(' Maringá, PR ')).toBe('Maringá');
    expect(cityName('Londrina')).toBe('Londrina');
  });

  test('só os filtros que a API aceita entram na busca', () => {
    expect(
      toSearchQuery({
        ...NO_FILTERS,
        city: 'Maringá, PR',
        checkIn: '2026-12-18',
        checkOut: null,
        services: ['Pet Walker'],
        amenities: ['green-area'],
        maxPrice: 200,
      }),
    ).toEqual({ city: 'Maringá', maxPrice: 200, page: 1, pageSize: 50 });
  });

  test('porte vai só com um marcado, e pet sem id real fica de fora', () => {
    expect(toSearchQuery({ ...NO_FILTERS, sizes: ['small', 'large'] })).toEqual({ page: 1, pageSize: 50 });
    expect(toSearchQuery({ ...NO_FILTERS, petId: 'pet-1', sizes: ['medium'] })).toEqual({
      size: 'medium',
      page: 1,
      pageSize: 50,
    });
    const petId = '2c1d0e9f-8a7b-4c6d-9e5f-1a2b3c4d5e6f';
    expect(toSearchQuery({ ...NO_FILTERS, petId, sizes: ['medium'] })).toEqual({
      petId,
      page: 1,
      pageSize: 50,
    });
  });

  test('o título usa singular e plural', () => {
    expect(resultsTitle(1, ['Pet Hotel'])).toBe('1 Pet-Hotel encontrado');
    expect(resultsTitle(4, ['Pet Hotel'])).toBe('4 Pet-Hotéis encontrados');
    expect(resultsTitle(2, ['Pet Hotel', 'Pet Walker'])).toBe('2 resultados encontrados');
  });

  test('a busca do modal vira parâmetros da rota sem os campos vazios', () => {
    expect(
      toSearchParams({
        city: ' Londrina, PR ',
        checkIn: new Date(2026, 11, 18),
        checkOut: null,
        service: 'Pet Hotel',
        petId: null,
      }),
    ).toEqual({ city: 'Londrina, PR', checkIn: '2026-12-18', service: 'Pet Hotel' });
  });
});
