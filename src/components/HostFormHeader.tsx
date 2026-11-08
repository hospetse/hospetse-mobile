import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { theme } from '../constants/theme';
import { Icon } from './Icon';

type HostFormHeaderProps = {
  onBack: () => void;
};

// Topo das etapas do cadastro de Host: seta de voltar, título e explicação
export function HostFormHeader({ onBack }: HostFormHeaderProps) {
  return (
    <View>
      <TouchableOpacity
        accessibilityLabel="Voltar"
        accessibilityRole="button"
        hitSlop={theme.spacing.medium}
        onPress={onBack}
        style={styles.back}
      >
        <Icon color={theme.colors.title} name="arrow_back" size={theme.icon.large} />
      </TouchableOpacity>
      <Text accessibilityRole="header" style={styles.title}>
        Torne-se Anfitrião
      </Text>
      <Text style={styles.subtitle}>
        Cadastre as características do seu espaço e defina sua disponibilidade para os pets
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  back: {
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.large,
  },
  title: {
    color: theme.colors.title,
    fontFamily: theme.fonts.extraBold,
    fontSize: theme.typography.title,
  },
  subtitle: {
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.medium,
    fontSize: theme.typography.subtitle,
    marginTop: theme.spacing.small,
  },
});
