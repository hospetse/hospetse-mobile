import { render, screen, userEvent } from '@testing-library/react-native';

import { PetSummary, SearchModal } from '../src/components/SearchModal';
import { MONTH_NAMES } from '../src/utils/calendar';

const PETS: PetSummary[] = [
  { id: 'pet-1', name: 'Paçoca', imageUri: 'https://exemplo.com/pacoca.jpg' },
  { id: 'pet-2', name: 'Luna', imageUri: 'https://exemplo.com/luna.jpg' },
];

// O mês seguinte ao atual, para os dias nunca estarem no passado
const today = new Date();
const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
const NEXT_MONTH_NAME = MONTH_NAMES[nextMonth.getMonth()];

type Props = {
  onClose?: jest.Mock;
  onSearch?: jest.Mock;
  pets?: PetSummary[];
  visible?: boolean;
};

function modal({ onClose = jest.fn(), onSearch = jest.fn(), pets = PETS, visible = true }: Props) {
  return <SearchModal onClose={onClose} onSearch={onSearch} pets={pets} visible={visible} />;
}

async function renderModal(props: Props = {}) {
  await render(modal(props));
  return userEvent.setup();
}

describe('SearchModal', () => {
  test('envia todos os filtros escolhidos ao tocar em Buscar e fecha', async () => {
    const onSearch = jest.fn();
    const onClose = jest.fn();
    const user = await renderModal({ onClose, onSearch });

    await user.press(screen.getByText('Londrina, PR'));

    await user.press(screen.getByRole('button', { name: 'Para quando?' }));
    await user.press(screen.getByLabelText('Próximo mês'));
    await user.press(screen.getByLabelText(`18 de ${NEXT_MONTH_NAME}`));
    await user.press(screen.getByLabelText(`21 de ${NEXT_MONTH_NAME}`));

    await user.press(screen.getByRole('button', { name: 'Qual serviço?' }));
    await user.press(screen.getByRole('radio', { name: 'Pet Hotel' }));

    await user.press(screen.getByRole('button', { name: 'Para quem?' }));
    await user.press(screen.getByRole('radio', { name: 'Paçoca' }));

    await user.press(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).toHaveBeenCalledWith({
      city: 'Londrina, PR',
      checkIn: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 18),
      checkOut: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 21),
      service: 'Pet Hotel',
      petId: 'pet-1',
    });
    expect(onClose).toHaveBeenCalled();
    // Fluxo com 9 toques: passa dos 5 s padrão do Jest
  }, 20000);

  test('mostra as datas escolhidas nos campos de check-in e check-out', async () => {
    const user = await renderModal();

    await user.press(screen.getByRole('button', { name: 'Para quando?' }));
    expect(screen.getByText('Check-in')).toBeOnTheScreen();

    await user.press(screen.getByLabelText('Próximo mês'));
    await user.press(screen.getByLabelText(`18 de ${NEXT_MONTH_NAME}`));
    await user.press(screen.getByLabelText(`21 de ${NEXT_MONTH_NAME}`));

    const month = String(nextMonth.getMonth() + 1).padStart(2, '0');
    expect(screen.getByText(`18/${month}/${nextMonth.getFullYear()}`)).toBeOnTheScreen();
    expect(screen.getByText(`21/${month}/${nextMonth.getFullYear()}`)).toBeOnTheScreen();
  });

  test('não deixa voltar para antes do mês atual', async () => {
    await renderModal();
    const user = userEvent.setup();

    await user.press(screen.getByRole('button', { name: 'Para quando?' }));

    expect(screen.getByLabelText('Mês anterior')).toBeDisabled();
  });

  test('as sugestões de cidade seguem o que foi digitado', async () => {
    const user = await renderModal();

    await user.type(screen.getByLabelText('Cidade'), 'mar');

    expect(screen.getByText('Maringá, PR')).toBeOnTheScreen();
    expect(screen.queryByText('Londrina, PR')).not.toBeOnTheScreen();
    expect(screen.queryByText('Sarandi, PR')).not.toBeOnTheScreen();
  });

  test('só uma seção fica aberta por vez', async () => {
    const user = await renderModal();
    expect(screen.getByLabelText('Cidade')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Qual serviço?' }));

    expect(screen.queryByLabelText('Cidade')).not.toBeOnTheScreen();
    expect(screen.getByRole('radio', { name: 'Pet Walker' })).toBeOnTheScreen();
  });

  test('o serviço e o pet escolhidos ficam marcados, e o pet desmarca ao tocar de novo', async () => {
    const user = await renderModal();

    await user.press(screen.getByRole('button', { name: 'Qual serviço?' }));
    await user.press(screen.getByRole('radio', { name: 'Pet Sitter' }));
    expect(screen.getByRole('radio', { name: 'Pet Sitter' })).toBeSelected();
    expect(screen.getByRole('radio', { name: 'Pet Hotel' })).not.toBeSelected();

    await user.press(screen.getByRole('button', { name: 'Para quem?' }));
    await user.press(screen.getByRole('radio', { name: 'Luna' }));
    expect(screen.getByRole('radio', { name: 'Luna' })).toBeSelected();

    await user.press(screen.getByRole('radio', { name: 'Luna' }));
    expect(screen.getByRole('radio', { name: 'Luna' })).not.toBeSelected();
  });

  test('fechar sem buscar não envia os filtros', async () => {
    const onSearch = jest.fn();
    const onClose = jest.fn();
    const user = await renderModal({ onClose, onSearch });

    await user.press(screen.getByText('Londrina, PR'));
    await user.press(screen.getByLabelText('Fechar busca'));

    expect(onClose).toHaveBeenCalled();
    expect(onSearch).not.toHaveBeenCalled();
  });

  test('ao reabrir, a busca começa vazia', async () => {
    const user = await renderModal();

    await user.press(screen.getByText('Londrina, PR'));
    expect(screen.getByLabelText('Cidade')).toHaveDisplayValue('Londrina, PR');

    await screen.rerender(modal({ visible: false }));
    await screen.rerender(modal({ visible: true }));

    expect(screen.getByLabelText('Cidade')).toHaveDisplayValue('');
    expect(screen.getByText('Maringá, PR')).toBeOnTheScreen();
    expect(screen.getByText('Sarandi, PR')).toBeOnTheScreen();
  });

  test('sem pets cadastrados mostra o aviso', async () => {
    const user = await renderModal({ pets: [] });

    await user.press(screen.getByRole('button', { name: 'Para quem?' }));

    expect(screen.getByText('Você ainda não tem pets cadastrados.')).toBeOnTheScreen();
  });
});
