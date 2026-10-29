import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { theme } from '../constants/theme';

type ButtonProps = {
  onPress: () => void;
  title: string;
  loading?: boolean;
};

// Enquanto loading, o botão fica desabilitado para não enviar duas vezes
export function Button({ onPress, title, loading = false }: ButtonProps) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: loading }}
      disabled={loading}
      onPress={onPress}
      style={[styles.button, loading && styles.buttonLoading]}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.white} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: theme.colors.button,
    borderRadius: theme.radius.button,
    justifyContent: 'center',
    marginTop: theme.spacing.large,
    minHeight: 48,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.shadow.opacity,
    shadowRadius: theme.shadow.radius,
    elevation: theme.shadow.elevation,
  },
  buttonLoading: {
    opacity: 0.7,
  },
  text: {
    color: theme.colors.white,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.button,
  },
});
