import { render, screen, userEvent } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';

import ResultsScreen, { resultsTitle } from '../src/app/resultados';
import { HostSearch, matchesSearch, searchHosts } from '../src/services/hosts';
import { toSearchParams } from '../src/utils/searchParams';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn(), setParams: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = jest.requireActual('react-native');
  return {
    SafeAreaView: View,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

const mockedParams = useLocalSearchParams as jest.Mock;

const ALL: HostSearch = { city: '', services: [], sizes: [], maxPrice: null, amenities: [] };

async function renderScreen(params: Record<string, string>) {
  mockedParams.mockReturnValue(params);
  await render(<ResultsScreen />);
  return userEvent.setup();
}

describe('Tela de resultados', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('o título mostra o serviço escolhido na busca', async () => {
    await renderScreen({ city: 'Maringá, PR', service: 'Pet Sitter' });

    expect(await screen.findByText('1 Pet-Sitter encontrado')).toBeOnTheScreen();
    expect(screen.getByText('Hotelzinho da Ana')).toBeOnTheScreen();
    expect(screen.queryByText('Passeio Feliz')).not.toBeOnTheScreen();
  });

  test('sem serviço, mostra todos da cidade com "resultados"', async () => {
    await renderScreen({ city: 'Maringá, PR' });

    expect(await screen.findByText('3 resultados encontrados')).toBeOnTheScreen();
  });

  test('o botão de filtros abre a tela de filtros, e aplicar muda a lista', async () => {
    const user = await renderScreen({ city: 'Maringá, PR' });
    await screen.findByText('3 resultados encontrados');

    await user.press(screen.getByRole('button', { name: 'Filtros' }));
    expect(screen.getByRole('header', { name: 'Filtros' })).toBeOnTheScreen();

    await user.press(screen.getByRole('checkbox', { name: 'Pet Walker' }));
    await user.press(screen.getByRole('button', { name: 'Aplicar Filtros' }));

    expect(await screen.findByText('1 Pet-Walker encontrado')).toBeOnTheScreen();
    expect(screen.getByText('Passeio Feliz')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Filtros, 1 ativos' })).toBeOnTheScreen();
  });

  test('"Limpar filtros" desmarca tudo, inclusive o serviço da busca', async () => {
    const user = await renderScreen({ city: 'Maringá, PR', service: 'Pet Hotel' });
    await screen.findByText('2 Pet-Hotéis encontrados');

    await user.press(screen.getByRole('button', { name: 'Filtros, 1 ativos' }));
    expect(screen.getByRole('checkbox', { name: 'Pet Hotel' })).toBeChecked();

    await user.press(screen.getByRole('button', { name: 'LIMPAR FILTROS' }));
    expect(screen.getByRole('checkbox', { name: 'Pet Hotel' })).not.toBeChecked();

    await user.press(screen.getByRole('button', { name: 'Aplicar Filtros' }));
    expect(await screen.findByText('3 resultados encontrados')).toBeOnTheScreen();
  });

  test('sem resultados mostra o estado vazio, e "Ajustar filtros" abre os filtros', async () => {
    const user = await renderScreen({ city: 'Curitiba' });

    expect(await screen.findByText('Nenhuma hospedagem encontrada')).toBeOnTheScreen();
    expect(screen.getByText('0 resultados encontrados')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Ajustar filtros' }));
    expect(screen.getByRole('header', { name: 'Filtros' })).toBeOnTheScreen();
  });

  test('abrir um resultado leva ao detalhe com as datas da busca', async () => {
    const user = await renderScreen({
      city: 'Londrina',
      checkIn: '2026-12-18',
      checkOut: '2026-12-21',
      service: 'Pet Sitter',
    });

    const card = await screen.findByText('Cantinho do Bicho');
    await user.press(card);

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/host/[id]',
      params: { id: 'host-4', checkIn: '2026-12-18', checkOut: '2026-12-21' },
    });
    expect(screen.getByText('Em Londrina · 18/12/2026 a 21/12/2026')).toBeOnTheScreen();
  });

  test('os cards mostram nome, cidade e preço', async () => {
    await renderScreen({ city: 'Sarandi' });

    const name = await screen.findByText('Pata na Rua');
    expect(name).toBeOnTheScreen();
    expect(screen.getByText('Centro, Sarandi')).toBeOnTheScreen();
    // No PetCard, "/diário" fica dentro do mesmo texto do preço
    expect(screen.getByText('R$50/diário')).toBeOnTheScreen();
  });
});

describe('Regras da busca de exemplo', () => {
  test('a cidade ignora acento, maiúsculas e o estado depois da vírgula', async () => {
    const found = await searchHosts({ ...ALL, city: 'maringa, pr' });
    expect(found.map((host) => host.city)).toEqual(['Maringá', 'Maringá', 'Maringá']);
  });

  test('vem do mais barato para o mais caro', async () => {
    const prices = (await searchHosts(ALL)).map((host) => host.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('preço máximo, porte e comodidades precisam ser atendidos', async () => {
    const [host] = await searchHosts({ ...ALL, city: 'Londrina' });

    expect(matchesSearch(host, { ...ALL, maxPrice: 100 })).toBe(false);
    expect(matchesSearch(host, { ...ALL, maxPrice: 120 })).toBe(true);
    expect(matchesSearch(host, { ...ALL, sizes: ['small', 'large'] })).toBe(false);
    expect(matchesSearch(host, { ...ALL, amenities: ['oral-medication'] })).toBe(true);
    expect(matchesSearch(host, { ...ALL, amenities: ['green-area'] })).toBe(false);
  });

  test('o título usa singular e plural', () => {
    expect(resultsTitle(1, ['Pet Hotel'])).toBe('1 Pet-Hotel encontrado');
    expect(resultsTitle(4, ['Pet Hotel'])).toBe('4 Pet-Hotéis encontrados');
    expect(resultsTitle(2, ['Pet Hotel', 'Pet Walker'])).toBe('2 resultados encontrados');
  });

  test('a busca vira parâmetros da rota sem os campos vazios', () => {
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
