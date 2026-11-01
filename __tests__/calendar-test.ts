import { buildMonthWeeks, formatDate, isSameDay, selectRangeDay } from '../src/utils/calendar';

describe('utils/calendar', () => {
  test('outubro de 2026 começa na quinta e tem 5 semanas', () => {
    const weeks = buildMonthWeeks(2026, 9);

    expect(weeks).toHaveLength(5);
    expect(weeks[0].slice(0, 4)).toEqual([null, null, null, null]);
    expect(weeks[0][4]?.getDate()).toBe(1);
    expect(weeks.flat().filter((day) => day !== null)).toHaveLength(31);
    expect(weeks.every((week) => week.length === 7)).toBe(true);
  });

  test('formata a data como dd/mm/aaaa', () => {
    expect(formatDate(new Date(2026, 9, 18))).toBe('18/10/2026');
    expect(formatDate(new Date(2026, 0, 5))).toBe('05/01/2026');
  });

  test('compara só o dia, sem a hora', () => {
    expect(isSameDay(new Date(2026, 9, 18, 8), new Date(2026, 9, 18, 22))).toBe(true);
    expect(isSameDay(new Date(2026, 9, 18), new Date(2026, 9, 19))).toBe(false);
    expect(isSameDay(null, new Date(2026, 9, 18))).toBe(false);
  });

  describe('selectRangeDay', () => {
    const day18 = new Date(2026, 9, 18);
    const day21 = new Date(2026, 9, 21);
    const day10 = new Date(2026, 9, 10);

    test('o primeiro toque escolhe o check-in', () => {
      expect(selectRangeDay({ checkIn: null, checkOut: null }, day18)).toEqual({
        checkIn: day18,
        checkOut: null,
      });
    });

    test('o segundo toque, depois do check-in, escolhe o check-out', () => {
      expect(selectRangeDay({ checkIn: day18, checkOut: null }, day21)).toEqual({
        checkIn: day18,
        checkOut: day21,
      });
    });

    test('tocar antes do check-in ou no mesmo dia recomeça', () => {
      expect(selectRangeDay({ checkIn: day18, checkOut: null }, day10)).toEqual({
        checkIn: day10,
        checkOut: null,
      });
      expect(selectRangeDay({ checkIn: day18, checkOut: null }, day18)).toEqual({
        checkIn: day18,
        checkOut: null,
      });
    });

    test('com o período completo, o próximo toque recomeça', () => {
      expect(selectRangeDay({ checkIn: day18, checkOut: day21 }, day10)).toEqual({
        checkIn: day10,
        checkOut: null,
      });
    });
  });
});
