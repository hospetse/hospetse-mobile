import { StyleSheet, Text } from 'react-native';

import { theme } from '../constants/theme';

// Aviso que fica embaixo do botão das etapas do cadastro de Host
export function HostTermsNote() {
  return (
    <Text style={styles.text}>
      Ao prosseguir, você confirma que leu e concorda com as{' '}
      <Text style={styles.link}>Diretrizes da Comunidade</Text> e os{' '}
      <Text style={styles.link}>Termos de Hospedagem Segura</Text> da Hospetse
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
    marginTop: theme.spacing.large,
    textAlign: 'center',
  },
  link: {
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.semiBold,
  },
});
