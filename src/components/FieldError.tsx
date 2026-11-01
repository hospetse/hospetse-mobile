import { StyleSheet, Text } from 'react-native';

import { theme } from '../constants/theme';

type FieldErrorProps = {
  message?: string;
};

// Mensagem de erro embaixo de um campo. Sem mensagem, não mostra nada
export function FieldError({ message }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <Text accessibilityLiveRegion="polite" style={styles.text}>
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    color: theme.colors.error,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
    marginTop: theme.spacing.small,
  },
});
