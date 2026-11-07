import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ErrorModal } from '../components/ErrorModal';
import { Icon } from '../components/Icon';
import { theme } from '../constants/theme';

type PreviewType = 'pet-not-allowed' | 'date-unavailable';

type PreviewCopy = {
  title: string;
  message: string;
};

const COPY: Record<PreviewType, PreviewCopy> = {
  'pet-not-allowed': {
    title: 'Pet não permitido',
    message: 'Infelizmente o Host não aceita esse tipo de pet.',
  },
  'date-unavailable': {
    title: 'Data indisponível',
    message: 'Infelizmente o Host não está disponível nos dias selecionados.',
  },
};

// Pré-visualização local dos avisos da #489. Não chama API e não exige login.
export default function ErrorPreviewScreen() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const previewType: PreviewType = type === 'pet-not-allowed' ? type : 'date-unavailable';
  const copy = COPY[previewType];

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Icon color={theme.colors.button} name="pets" size={theme.icon.large} />
        <Text style={styles.brand}>Hospetse</Text>
      </View>
      <Text accessibilityRole="header" style={styles.title}>
        Confirmar Reserva
      </Text>
      <Text style={styles.section}>Anfitrião/Local</Text>
      <View style={styles.hostCard}>
        <View style={styles.hostPhoto}>
          <Text style={styles.hostPhotoText}>Hotel Aberto</Text>
        </View>
        <View>
          <Text style={styles.hostName}>Hotel Gatos Demonstração</Text>
          <Text style={styles.location}>Bela Vista, São Paulo</Text>
        </View>
      </View>
      <Text style={styles.section}>Período da Estadia</Text>
      <View style={styles.dates}>
        <View style={styles.date}>
          <Text>Check-in</Text>
          <Text style={styles.dateValue}>Escolher</Text>
        </View>
        <View style={styles.date}>
          <Text>Check-out</Text>
          <Text style={styles.dateValue}>Escolher</Text>
        </View>
      </View>
      <Text style={styles.section}>Quem vai se hospedar?</Text>
      <Text style={styles.pet}>🐾 Rex    🐾 Mia    🐾 Thor</Text>
      <View style={styles.footer}>
        <Text>Total</Text>
        <Text style={styles.total}>R$ 750,00</Text>
      </View>

      <ErrorModal
        message={copy.message}
        onClose={() => undefined}
        title={copy.title}
        visible
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: theme.colors.background,
    flex: 1,
    padding: theme.spacing.page,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.small,
    marginBottom: theme.spacing.large,
  },
  brand: {
    color: theme.colors.button,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.sectionTitle,
  },
  title: {
    color: theme.colors.title,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.title,
  },
  section: {
    color: theme.colors.text,
    fontFamily: theme.fonts.medium,
    fontSize: theme.typography.button,
    marginTop: theme.spacing.large,
  },
  hostCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.rangeFill,
    borderRadius: theme.radius.button,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.medium,
    marginTop: theme.spacing.small,
    padding: theme.spacing.medium,
  },
  hostPhoto: {
    alignItems: 'center',
    backgroundColor: theme.colors.skeleton,
    borderRadius: theme.radius.round,
    height: theme.spacing.avatar,
    justifyContent: 'center',
    width: theme.spacing.avatar,
  },
  hostPhotoText: {
    color: theme.colors.placeholder,
    fontSize: theme.typography.captionSmall,
    textAlign: 'center',
  },
  hostName: {
    color: theme.colors.title,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.button,
  },
  location: {
    color: theme.colors.button,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
  },
  dates: {
    flexDirection: 'row',
    gap: theme.spacing.medium,
    marginTop: theme.spacing.small,
  },
  date: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.divider,
    borderRadius: theme.radius.badge,
    borderWidth: 1,
    flex: 1,
    padding: theme.spacing.medium,
  },
  dateValue: {
    color: theme.colors.placeholder,
    fontSize: theme.typography.modalTitle,
    marginTop: theme.spacing.small,
  },
  pet: {
    color: theme.colors.placeholder,
    fontFamily: theme.fonts.medium,
    fontSize: theme.typography.button,
    marginTop: theme.spacing.medium,
  },
  footer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    bottom: theme.spacing.page,
    left: theme.spacing.page,
    padding: theme.spacing.large,
    position: 'absolute',
    right: theme.spacing.page,
  },
  total: {
    color: theme.colors.button,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.sectionTitle,
    marginTop: theme.spacing.small,
  },
});
