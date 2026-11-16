import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';
import type { ServiceRequest } from '../services/serviceRequests';
import { formatDate, fromIsoDate } from '../utils/calendar';
import { formatCurrency } from '../utils/money';
import { Button } from './Button';
import { Icon } from './Icon';

type ServiceRequestSuccessProps = {
  onGoHome: () => void;
  onSeeReservations: () => void;
  request: ServiceRequest;
};

function serviceLabel(type: ServiceRequest['serviceType']): string {
  return type === 'Pet Walker' ? 'Passeio solicitado' : 'Visita solicitada';
}

export function ServiceRequestSuccess({ onGoHome, onSeeReservations, request }: ServiceRequestSuccessProps) {
  const date = fromIsoDate(request.startDate);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.halo}>
        <View style={styles.circle}>
          <Icon color={theme.colors.white} name="check" size={theme.icon.huge} />
        </View>
      </View>
      <Text accessibilityRole="header" style={styles.title}>
        {serviceLabel(request.serviceType)}!
      </Text>
      <Text style={styles.subtitle}>
        Sua solicitação foi enviada ao prestador. Você receberá uma confirmação em breve.
      </Text>

      <View style={styles.card}>
        <View style={styles.providerRow}>
          {request.hostPicture ? (
            <Image accessibilityLabel={`Foto de ${request.hostName}`} source={{ uri: request.hostPicture }} style={styles.providerPicture} />
          ) : (
            <View style={[styles.providerPicture, styles.placeholder]}>
              <Icon color={theme.colors.button} name="pets" size={theme.icon.medium} />
            </View>
          )}
          <View style={styles.providerText}>
            <Text style={styles.providerName}>{request.hostName}</Text>
            <Text style={styles.location}>{request.hostLocation}</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.label}>Data</Text>
            <Text style={styles.value}>{date ? formatDate(date) : request.startDate}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.label}>Horário</Text>
            <Text style={styles.value}>{request.scheduledTime}</Text>
          </View>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.label}>Pet</Text>
          <Text style={styles.value}>{request.petName}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.label}>Endereço</Text>
          <Text style={styles.value}>{request.address}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatCurrency(request.totalValue)}</Text>
        </View>
      </View>

      <Button onPress={onSeeReservations} title="Ver minhas contratações" />
      <Button onPress={onGoHome} title="Voltar para Início" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
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
  providerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.medium,
  },
  providerPicture: {
    borderRadius: theme.radius.input,
    height: theme.spacing.avatar,
    width: theme.spacing.avatar,
  },
  placeholder: {
    alignItems: 'center',
    backgroundColor: theme.colors.selectedTint,
    justifyContent: 'center',
  },
  providerText: { flex: 1 },
  providerName: {
    color: theme.colors.title,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.button,
  },
  location: {
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
    marginTop: theme.spacing.tiny,
  },
  summaryRow: { flexDirection: 'row', gap: theme.spacing.medium },
  summaryItem: { flex: 1 },
  label: {
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
  },
  value: {
    color: theme.colors.title,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.body,
    marginTop: theme.spacing.tiny,
  },
  totalRow: {
    alignItems: 'center',
    borderTopColor: theme.colors.divider,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
});
