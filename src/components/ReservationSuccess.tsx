import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { theme } from '../constants/theme';
import { Button } from './Button';
import { Icon } from './Icon';

// PROVISÓRIO: horários do protótipo. A API ainda não tem os horários de entrada e saída do Host
const CHECK_IN_TIME = 'A partir das 14:00';
const CHECK_OUT_TIME = 'Até às 12:00';

type ReservationSuccessProps = {
  checkIn: string;
  checkOut: string;
  hostLocation: string;
  hostName: string;
  hostPicture: string | null;
  nights: number;
  onGoHome: () => void;
  onSeeReservations: () => void;
  petName: string;
  total: string;
};

// Tela de sucesso da solicitação: o Host ainda vai aceitar ou recusar
export function ReservationSuccess({
  checkIn,
  checkOut,
  hostLocation,
  hostName,
  hostPicture,
  nights,
  onGoHome,
  onSeeReservations,
  petName,
  total,
}: ReservationSuccessProps) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.halo}>
        <View style={styles.circle}>
          <Icon color={theme.colors.white} name="check" size={theme.icon.huge} />
        </View>
      </View>
      <Text accessibilityRole="header" style={styles.title}>
        Reserva solicitada com sucesso!
      </Text>
      <Text style={styles.subtitle}>
        Sua solicitação foi enviada ao anfitrião. Você receberá uma confirmação em breve.
      </Text>

      <View style={styles.card}>
        <View style={styles.hostRow}>
          {hostPicture ? (
            <Image source={{ uri: hostPicture }} style={styles.hostPicture} />
          ) : (
            <View style={[styles.hostPicture, styles.hostPlaceholder]}>
              <Icon color={theme.colors.button} name="pets" size={theme.icon.medium} />
            </View>
          )}
          <View style={styles.hostText}>
            <Text style={styles.hostName}>{hostName}</Text>
            <Text style={styles.hostLocation}>{hostLocation}</Text>
          </View>
        </View>

        <View style={styles.dates}>
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>Check-in</Text>
            <Text style={styles.dateValue}>{checkIn}</Text>
            <Text style={styles.dateHint}>{CHECK_IN_TIME}</Text>
          </View>
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>Check-out</Text>
            <Text style={styles.dateValue}>{checkOut}</Text>
            <Text style={styles.dateHint}>{CHECK_OUT_TIME}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.petRow}>
            <View style={styles.petIcon}>
              <Icon color={theme.colors.button} name="pets" size={theme.icon.medium} />
            </View>
            <View>
              <Text style={styles.label}>Hóspedes Pet</Text>
              <Text style={styles.value}>1 Pet ({petName})</Text>
            </View>
          </View>
          <View style={styles.nights}>
            <Text style={styles.label}>Diárias</Text>
            <Text style={styles.value}>{nights}</Text>
          </View>
        </View>

        <View style={[styles.row, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{total}</Text>
        </View>
      </View>

      <Button onPress={onSeeReservations} title="Ver minhas reservas" />
      <TouchableOpacity accessibilityRole="button" onPress={onGoHome} style={styles.homeLink}>
        <Text style={styles.homeLinkText}>Voltar para Início</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'stretch',
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.page,
  },
  halo: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: theme.colors.rangeFill,
    borderRadius: theme.radius.round,
    padding: theme.spacing.medium,
  },
  circle: {
    alignItems: 'center',
    backgroundColor: theme.colors.button,
    borderRadius: theme.radius.round,
    height: theme.spacing.successCircle,
    justifyContent: 'center',
    width: theme.spacing.successCircle,
  },
  title: {
    color: theme.colors.title,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.title,
    marginTop: theme.spacing.large,
    textAlign: 'center',
  },
  subtitle: {
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
    marginTop: theme.spacing.small,
    textAlign: 'center',
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    boxShadow: theme.shadow.card,
    gap: theme.spacing.medium,
    marginTop: theme.spacing.page,
    padding: theme.spacing.large,
  },
  hostRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.medium,
  },
  hostPicture: {
    borderRadius: theme.radius.badge,
    height: theme.spacing.avatar,
    width: theme.spacing.avatar,
  },
  hostPlaceholder: {
    alignItems: 'center',
    backgroundColor: theme.colors.selectedTint,
    justifyContent: 'center',
  },
  hostText: {
    flex: 1,
  },
  hostName: {
    color: theme.colors.title,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.button,
  },
  hostLocation: {
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
  },
  dates: {
    flexDirection: 'row',
    gap: theme.spacing.small,
  },
  dateBox: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.badge,
    flex: 1,
    padding: theme.spacing.small,
  },
  dateLabel: {
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
  },
  dateValue: {
    color: theme.colors.title,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.button,
  },
  dateHint: {
    color: theme.colors.placeholder,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.captionSmall,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  petRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.small,
  },
  petIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.selectedTint,
    borderRadius: theme.radius.round,
    height: theme.spacing.serviceIcon,
    justifyContent: 'center',
    width: theme.spacing.serviceIcon,
  },
  label: {
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
  },
  value: {
    color: theme.colors.title,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.body,
  },
  nights: {
    alignItems: 'flex-end',
  },
  totalRow: {
    borderTopColor: theme.colors.divider,
    borderTopWidth: 1,
    paddingTop: theme.spacing.medium,
  },
  totalLabel: {
    color: theme.colors.title,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.filterTitle,
  },
  totalValue: {
    color: theme.colors.button,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.filterTitle,
  },
  homeLink: {
    alignSelf: 'center',
    marginTop: theme.spacing.large,
  },
  homeLinkText: {
    color: theme.colors.button,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.button,
  },
});
