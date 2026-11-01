import { Image, Modal, StyleSheet, Text, View } from 'react-native';

import { theme } from '../constants/theme';
import { Button } from './Button';

type ErrorModalProps = {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  buttonTitle?: string;
};

// Aviso de erro por cima da tela, no estilo do design (ícone, título, texto e botão).
// Usado para erros que vêm do servidor ou da conexão, não para erros de formato
export function ErrorModal({
  visible,
  title,
  message,
  onClose,
  buttonTitle = 'Voltar',
}: ErrorModalProps) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.overlay}>
        <View accessibilityViewIsModal style={styles.card}>
          <View style={styles.iconCircle}>
            {/* Ícone "pets" do Material Icons (Google Fonts) */}
            <Image
              accessibilityIgnoresInvertColors
              source={require('../../assets/pets.png')}
              style={styles.icon}
            />
          </View>

          <Text accessibilityRole="header" style={styles.title}>
            {title}
          </Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonArea}>
            <Button onPress={onClose} title={buttonTitle} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: theme.colors.overlay,
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.page,
  },
  card: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    padding: theme.spacing.page,
  },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: theme.colors.iconBackground,
    borderRadius: theme.radius.round,
    height: theme.spacing.modalIconCircle,
    justifyContent: 'center',
    width: theme.spacing.modalIconCircle,
  },
  icon: {
    height: theme.spacing.modalIcon,
    tintColor: theme.colors.icon,
    width: theme.spacing.modalIcon,
  },
  title: {
    color: theme.colors.title,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.modalTitle,
    marginTop: theme.spacing.medium,
    textAlign: 'center',
  },
  message: {
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
    marginTop: theme.spacing.small,
    textAlign: 'center',
  },
  buttonArea: {
    alignSelf: 'stretch',
  },
});
