import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';
import { Button } from './Button';
import { Icon } from './Icon';

type HostInviteCardProps = {
  onPress: () => void;
  // Enquanto o cadastro em andamento é buscado no servidor
  loading?: boolean;
};

// Convite do Perfil para quem quer receber pets: é a entrada do cadastro de Host (#326)
export function HostInviteCard({ onPress, loading = false }: HostInviteCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Icon color={theme.colors.button} name="add_home_work" size={theme.icon.large} />
        </View>
        <View style={styles.texts}>
          <Text accessibilityRole="header" style={styles.title}>
            Seja um Host
          </Text>
          <Text style={styles.subtitle}>
            Cadastre sua casa ou hotel e receba pets de outros tutores.
          </Text>
        </View>
      </View>
      <Button icon="arrow_forward" loading={loading} onPress={onPress} title="Quero ser Host" />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    boxShadow: theme.shadow.soft,
    padding: theme.spacing.large,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.medium,
  },
  iconBox: {
    alignItems: 'center',
    backgroundColor: theme.colors.selectedTint,
    borderRadius: theme.radius.input,
    height: theme.spacing.menuIcon,
    justifyContent: 'center',
    width: theme.spacing.menuIcon,
  },
  texts: {
    flex: 1,
  },
  title: {
    color: theme.colors.title,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.userName,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
    marginTop: theme.spacing.tiny / 2,
  },
});
