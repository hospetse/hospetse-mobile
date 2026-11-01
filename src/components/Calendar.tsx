import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { theme } from '../constants/theme';
import {
  buildMonthWeeks,
  DateRange,
  isSameDay,
  MONTH_NAMES,
  selectRangeDay,
  startOfDay,
  WEEKDAY_NAMES,
} from '../utils/calendar';
import { Icon } from './Icon';

type CalendarProps = {
  onChange: (range: DateRange) => void;
  range: DateRange;
};

// Calendario de um mes para escolher o periodo (check-in e check-out).
// Dias passados ficam desabilitados.
export function Calendar({ onChange, range }: CalendarProps) {
  const today = startOfDay(new Date());
  const firstMonth = range.checkIn ?? today;
  const [year, setYear] = useState(firstMonth.getFullYear());
  const [month, setMonth] = useState(firstMonth.getMonth());

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
  const weeks = buildMonthWeeks(year, month);

  function changeMonth(step: number) {
    const next = new Date(year, month + step, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  }

  function renderDay(day: Date | null, index: number) {
    if (!day) {
      return <View key={index} style={styles.cell} />;
    }

    const { checkIn, checkOut } = range;
    const isPast = day < today;
    const isStart = isSameDay(day, checkIn);
    const isEnd = isSameDay(day, checkOut);
    const isEdge = isStart || isEnd;
    const hasRange = checkIn !== null && checkOut !== null;
    const isInside = checkIn !== null && checkOut !== null && day > checkIn && day < checkOut;

    return (
      <TouchableOpacity
        key={index}
        accessibilityLabel={`${day.getDate()} de ${MONTH_NAMES[month]}`}
        accessibilityRole="button"
        accessibilityState={{ disabled: isPast, selected: isEdge }}
        disabled={isPast}
        onPress={() => onChange(selectRangeDay(range, day))}
        style={styles.cell}
      >
        {/* Faixa clara entre o check-in e o check-out */}
        {isInside ? <View style={styles.rangeFull} /> : null}
        {hasRange && isStart && !isEnd ? <View style={styles.rangeRight} /> : null}
        {hasRange && isEnd && !isStart ? <View style={styles.rangeLeft} /> : null}

        <View style={[styles.mark, isEdge && styles.markSelected]}>
          <Text
            style={[styles.dayText, isPast && styles.dayPast, isEdge && styles.daySelected]}
          >
            {day.getDate()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View>
      <View style={styles.monthRow}>
        <Text style={styles.monthName}>
          {MONTH_NAMES[month]} {year}
        </Text>
        <View style={styles.arrows}>
          <TouchableOpacity
            accessibilityLabel="Mês anterior"
            accessibilityRole="button"
            accessibilityState={{ disabled: isCurrentMonth }}
            disabled={isCurrentMonth}
            onPress={() => changeMonth(-1)}
          >
            <Icon
              color={isCurrentMonth ? theme.colors.border : theme.colors.title}
              name="chevron_left"
              size={theme.icon.medium}
            />
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityLabel="Próximo mês"
            accessibilityRole="button"
            onPress={() => changeMonth(1)}
          >
            <Icon color={theme.colors.title} name="chevron_right" size={theme.icon.medium} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.week}>
        {WEEKDAY_NAMES.map((name) => (
          <Text key={name} style={styles.weekday}>
            {name}
          </Text>
        ))}
      </View>

      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.week}>
          {week.map(renderDay)}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  monthRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.small,
  },
  monthName: {
    color: theme.colors.title,
    fontFamily: theme.fonts.medium,
    fontSize: theme.typography.body,
  },
  arrows: {
    flexDirection: 'row',
    gap: theme.spacing.small,
  },
  week: {
    flexDirection: 'row',
  },
  weekday: {
    color: theme.colors.title,
    flex: 1,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
    marginBottom: theme.spacing.tiny,
    textAlign: 'center',
  },
  cell: {
    alignItems: 'center',
    flex: 1,
    height: theme.spacing.calendarDay,
    justifyContent: 'center',
  },
  rangeFull: {
    backgroundColor: theme.colors.rangeFill,
    height: theme.spacing.calendarMark,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  rangeRight: {
    backgroundColor: theme.colors.rangeFill,
    height: theme.spacing.calendarMark,
    left: '50%',
    position: 'absolute',
    right: 0,
  },
  rangeLeft: {
    backgroundColor: theme.colors.rangeFill,
    height: theme.spacing.calendarMark,
    left: 0,
    position: 'absolute',
    right: '50%',
  },
  mark: {
    alignItems: 'center',
    borderRadius: theme.radius.calendarMark,
    height: theme.spacing.calendarMark,
    justifyContent: 'center',
    width: theme.spacing.calendarMark,
  },
  markSelected: {
    backgroundColor: theme.colors.button,
  },
  dayText: {
    color: theme.colors.title,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
  },
  dayPast: {
    color: theme.colors.border,
  },
  daySelected: {
    color: theme.colors.white,
    fontFamily: theme.fonts.semiBold,
  },
});
