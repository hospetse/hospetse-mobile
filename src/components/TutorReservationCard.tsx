import { Image, StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';
import type { TutorReservation, TutorReservationStatus } from '../services/tutorReservations';
import { formatDate, fromIsoDate } from '../utils/calendar';
import { formatCurrency } from '../utils/money';
import { Button } from './Button';
import { Icon } from './Icon';
import { OutlineButton } from './OutlineButton';
import { StatusPill } from './StatusPill';

type TutorReservationCardProps = {
  reservation: TutorReservation;
  onPrimaryAction: () => void;
  onChat: () => void;
};

const STATUS: Record<TutorReservationStatus, { label: string; color: string; background: string }> = {
  awaiting_payment: { label: 'Aguardando pagamento', color: theme.colors.yellow, background: theme.colors.yellowTint },
  requested: { label: 'Aguardando aceite', color: theme.colors.subtitle, background: theme.colors.selectedTint },
  confirmed: { label: 'Confirmada', color: theme.colors.green, background: theme.colors.greenTint },
  in_progress: { label: 'Em andamento', color: theme.colors.blue, background: theme.colors.blueTint },
  completed: { label: 'Concluída', color: theme.colors.green, background: theme.colors.greenTint },
  cancelled: { label: 'Cancelada', color: theme.colors.error, background: theme.colors.iconBackground },
};

function date(value: string): string {
  const parsed = fromIsoDate(value);
  return parsed ? formatDate(parsed) : value;
}

function actionTitle(status: TutorReservationStatus): string | null {
  if (status === 'awaiting_payment') return 'Pagar agora';
  if (status === 'in_progress' || status === 'completed') return 'Acompanhar';
  return null;
}

export function TutorReservationCard({ reservation, onPrimaryAction, onChat }: TutorReservationCardProps) {
  const status = STATUS[reservation.status];
  const primaryTitle = actionTitle(reservation.status);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {reservation.hostPicture ? (
          <Image accessibilityLabel={`Foto de ${reservation.hostName}`} source={{ uri: reservation.hostPicture }} style={styles.hostPicture} />
        ) : (
          <View style={[styles.hostPicture, styles.placeholder]}><Icon color={theme.colors.button} name="pets" size={theme.icon.medium} /></View>
        )}
        <View style={styles.hostText}>
          <Text style={styles.hostName}>{reservation.hostName}</Text>
          <Text style={styles.location}>{reservation.hostLocation}</Text>
        </View>
        <StatusPill backgroundColor={status.background} color={status.color} label={status.label} />
      </View>

      <View style={styles.separator} />
      <View style={styles.infoRow}>
        <View style={styles.infoBlock}><Text style={styles.label}>Pet</Text><Text style={styles.value}>{reservation.petName}</Text></View>
        <View style={styles.infoBlock}><Text style={styles.label}>Período</Text><Text style={styles.value}>{date(reservation.startDate)} a {date(reservation.endDate)}</Text></View>
      </View>
      <View style={styles.totalRow}><Text style={styles.label}>Total</Text><Text style={styles.total}>{formatCurrency(reservation.totalValue)}</Text></View>

      {primaryTitle ? <Button onPress={onPrimaryAction} title={primaryTitle} /> : null}
      {reservation.status !== 'cancelled' ? <OutlineButton icon="chat" onPress={onChat} title="Falar com o Host" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: theme.colors.white, borderRadius: theme.radius.card, boxShadow: theme.shadow.soft, padding: theme.spacing.large },
  header: { alignItems: 'center', flexDirection: 'row', gap: theme.spacing.medium },
  hostPicture: { borderRadius: theme.radius.input, height: theme.spacing.avatar, width: theme.spacing.avatar },
  placeholder: { alignItems: 'center', backgroundColor: theme.colors.selectedTint, justifyContent: 'center' },
  hostText: { flex: 1 },
  hostName: { color: theme.colors.title, fontFamily: theme.fonts.bold, fontSize: theme.typography.button },
  location: { color: theme.colors.subtitle, fontFamily: theme.fonts.regular, fontSize: theme.typography.caption, marginTop: theme.spacing.tiny },
  separator: { backgroundColor: theme.colors.divider, height: 1, marginVertical: theme.spacing.medium },
  infoRow: { flexDirection: 'row', gap: theme.spacing.medium },
  infoBlock: { flex: 1 },
  label: { color: theme.colors.subtitle, fontFamily: theme.fonts.regular, fontSize: theme.typography.caption },
  value: { color: theme.colors.title, fontFamily: theme.fonts.semiBold, fontSize: theme.typography.body, marginTop: theme.spacing.tiny },
  totalRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.large },
  total: { color: theme.colors.title, fontFamily: theme.fonts.bold, fontSize: theme.typography.sectionTitle },
});
