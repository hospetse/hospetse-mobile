import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { theme } from '../constants/theme';
import { HostPendingReservation } from '../services/hostReservations';
import { formatDate, fromIsoDate } from '../utils/calendar';
import { formatCurrency } from '../utils/money';
import { Icon } from './Icon';

type HostRequestCardProps = {
  onPress?: () => void;
  request: HostPendingReservation;
};

const SPECIES: Record<string, string> = { cat: 'Gato', dog: 'Cachorro' };
const SIZES: Record<string, string> = { small: 'Pequeno', medium: 'Médio', large: 'Grande' };

function dateLabel(value: string | null): string {
  const date = value ? fromIsoDate(value) : null;
  return date ? formatDate(date) : 'Não informado';
}

function petSubtitle(request: HostPendingReservation): string {
  const details = [SPECIES[request.pet.species] ?? request.pet.species, request.pet.size ? SIZES[request.pet.size] : null, request.pet.breed];
  return details.filter(Boolean).join(' · ');
}

// Card de solicitação pendente, adaptado do card de reserva do Tutor para o Host.
export function HostRequestCard({ onPress, request }: HostRequestCardProps) {
  const content = (
    <>
      <View style={styles.topRow}>
        <View style={styles.requestIcon}>
          <Icon color={theme.colors.button} name="calendar_month" size={theme.icon.medium} />
        </View>
        <View style={styles.titleArea}>
          <Text style={styles.status}>PENDENTE</Text>
          <Text style={styles.createdAt}>Solicitado em {dateLabel(request.createdAt.slice(0, 10))}</Text>
        </View>
      </View>

      <View style={styles.personRow}>
        <Icon color={theme.colors.button} name="person" size={theme.icon.medium} />
        <View style={styles.detailText}>
          <Text style={styles.label}>Tutor</Text>
          <Text style={styles.value}>{request.tutor.name}</Text>
        </View>
      </View>

      <View style={styles.personRow}>
        <Icon color={theme.colors.button} name="pets" size={theme.icon.medium} />
        <View style={styles.detailText}>
          <Text style={styles.label}>Pet</Text>
          <Text style={styles.value}>{request.pet.name}</Text>
          <Text style={styles.muted}>{petSubtitle(request)}</Text>
        </View>
      </View>

      <View style={styles.dateRow}>
        <View style={styles.dateBlock}>
          <Text style={styles.label}>Check-in</Text>
          <Text style={styles.value}>{dateLabel(request.startDate)}</Text>
        </View>
        <View style={styles.dateBlock}>
          <Text style={styles.label}>Check-out</Text>
          <Text style={styles.value}>{dateLabel(request.endDate)}</Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.label}>Valor total</Text>
          <Text style={styles.total}>{formatCurrency(request.totalValue)}</Text>
        </View>
        <Text style={styles.details}>Ver detalhes</Text>
      </View>

      {request.notes ? (
        <View style={styles.notes}>
          <Text style={styles.label}>Observações do Tutor</Text>
          <Text style={styles.muted}>{request.notes}</Text>
        </View>
      ) : null}
    </>
  );

  return onPress ? (
    <TouchableOpacity accessibilityRole="button" onPress={onPress} style={styles.card}>
      {content}
    </TouchableOpacity>
  ) : (
    <View style={styles.card}>{content}</View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    boxShadow: theme.shadow.soft,
    gap: theme.spacing.medium,
    padding: theme.spacing.medium,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.small,
  },
  requestIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.selectedTint,
    borderRadius: theme.radius.badge,
    height: theme.spacing.serviceIcon,
    justifyContent: 'center',
    width: theme.spacing.serviceIcon,
  },
  titleArea: {
    flex: 1,
  },
  status: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.selectedTint,
    borderRadius: theme.radius.round,
    color: theme.colors.button,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.captionSmall,
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.tiny,
  },
  createdAt: {
    color: theme.colors.placeholder,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
    marginTop: theme.spacing.tiny,
  },
  personRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.small,
  },
  detailText: {
    flex: 1,
  },
  label: {
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
  },
  value: {
    color: theme.colors.title,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.button,
  },
  muted: {
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
    marginTop: theme.spacing.tiny,
  },
  dateRow: {
    borderTopColor: theme.colors.divider,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.medium,
    paddingTop: theme.spacing.medium,
  },
  dateBlock: {
    flex: 1,
  },
  bottomRow: {
    alignItems: 'flex-end',
    borderTopColor: theme.colors.divider,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.medium,
  },
  total: {
    color: theme.colors.button,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.sectionTitle,
  },
  details: {
    color: theme.colors.button,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.caption,
    textDecorationLine: 'underline',
  },
  notes: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.badge,
    padding: theme.spacing.small,
  },
});
