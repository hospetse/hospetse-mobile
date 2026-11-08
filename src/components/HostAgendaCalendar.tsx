import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AgendaDay } from '../services/hostAgenda';
import { buildMonthWeeks, MONTH_NAMES, startOfDay, WEEKDAY_NAMES } from '../utils/calendar';
import { theme } from '../constants/theme';
import { Icon } from './Icon';

type HostAgendaCalendarProps = {
  days: AgendaDay[];
  month: Date;
  onChangeMonth: (month: Date) => void;
  onPressDay: (day: AgendaDay) => void;
};

const STATUS_LABEL: Record<AgendaDay['status'], string> = {
  free: 'Livre',
  blocked: 'Bloqueado',
  occupied: 'Ocupado',
};

// Calendário mensal da agenda do Host. A tela decide o que fazer ao tocar num dia.
export function HostAgendaCalendar({ days, month, onChangeMonth, onPressDay }: HostAgendaCalendarProps) {
  const today = startOfDay(new Date());
  const dayMap = new Map(days.map((day) => [day.date, day]));
  const weeks = buildMonthWeeks(month.getFullYear(), month.getMonth());
  const isCurrentMonth = month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth();

  function changeMonth(step: number) {
    onChangeMonth(new Date(month.getFullYear(), month.getMonth() + step, 1));
  }

  return (
    <View style={styles.calendar}>
      <View style={styles.monthHeader}>
        <Text style={styles.monthTitle}>{MONTH_NAMES[month.getMonth()]} {month.getFullYear()}</Text>
        <View style={styles.arrows}>
          <TouchableOpacity
            accessibilityLabel="Mês anterior"
            accessibilityRole="button"
            accessibilityState={{ disabled: isCurrentMonth }}
            disabled={isCurrentMonth}
            onPress={() => changeMonth(-1)}
          >
            <Icon color={isCurrentMonth ? theme.colors.border : theme.colors.title} name="chevron_left" size={theme.icon.medium} />
          </TouchableOpacity>
          <TouchableOpacity accessibilityLabel="Próximo mês" accessibilityRole="button" onPress={() => changeMonth(1)}>
            <Icon color={theme.colors.title} name="chevron_right" size={theme.icon.medium} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.week}>
        {WEEKDAY_NAMES.map((name) => <Text key={name} style={styles.weekday}>{name}</Text>)}
      </View>
      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.week}>
          {week.map((date, index) => {
            if (!date) return <View key={index} style={styles.cell} />;
            const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const agendaDay = dayMap.get(iso);
            const isPast = date < today;
  const statusStyle = agendaDay?.status === 'free'
              ? styles.free
              : agendaDay?.status === 'blocked'
                ? styles.blocked
                : agendaDay?.status === 'occupied'
                  ? styles.occupiedDay
                  : undefined;
            return (
              <TouchableOpacity
                key={iso}
                accessibilityLabel={`${date.getDate()} de ${MONTH_NAMES[month.getMonth()]}, ${agendaDay ? STATUS_LABEL[agendaDay.status] : 'Sem dados'}`}
                accessibilityRole="button"
                accessibilityState={{ disabled: isPast || !agendaDay, selected: agendaDay?.status === 'blocked' }}
                disabled={isPast || !agendaDay}
                onPress={() => agendaDay && onPressDay(agendaDay)}
                style={styles.cell}
              >
                <View style={[styles.mark, statusStyle, isPast && styles.past]}>
                  <Text style={[styles.dayText, agendaDay && agendaDay.status !== 'free' && styles.dayLight]}>{date.getDate()}</Text>
                </View>
                {agendaDay?.status === 'occupied' ? <Text style={styles.occupiedCount}>{agendaDay.occupied}</Text> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  calendar: { backgroundColor: theme.colors.white, borderRadius: theme.radius.card, boxShadow: theme.shadow.soft, padding: theme.spacing.medium },
  monthHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.medium },
  monthTitle: { color: theme.colors.title, fontFamily: theme.fonts.bold, fontSize: theme.typography.sectionTitle },
  arrows: { flexDirection: 'row', gap: theme.spacing.medium },
  week: { flexDirection: 'row' },
  weekday: { color: theme.colors.placeholder, flex: 1, fontFamily: theme.fonts.medium, fontSize: theme.typography.caption, textAlign: 'center' },
  cell: { alignItems: 'center', flex: 1, height: theme.spacing.calendarDay + theme.spacing.small, justifyContent: 'center' },
  mark: { alignItems: 'center', borderRadius: theme.radius.round, height: theme.spacing.calendarMark, justifyContent: 'center', width: theme.spacing.calendarMark },
  free: { backgroundColor: theme.colors.selectedTint },
  blocked: { backgroundColor: theme.colors.button },
  occupiedDay: { backgroundColor: theme.colors.subtitle },
  past: { opacity: 0.35 },
  dayText: { color: theme.colors.title, fontFamily: theme.fonts.medium, fontSize: theme.typography.caption },
  dayLight: { color: theme.colors.white },
  occupiedCount: { color: theme.colors.subtitle, fontFamily: theme.fonts.bold, fontSize: theme.typography.captionSmall, position: 'absolute', top: theme.spacing.tiny },
});
