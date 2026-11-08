import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { theme } from '../constants/theme';
import { FieldError } from './FieldError';
import { Icon } from './Icon';

type DocumentRowProps = {
  label: string;
  onPick: () => void;
  onRemove: () => void;
  // Arquivo escolhido agora, ainda não enviado
  fileName?: string;
  // O servidor já tem um arquivo deste documento (rascunho retomado)
  alreadySent?: boolean;
  error?: string;
};

// Linha de um documento do cadastro: nome, arquivo escolhido e botão para enviar ou trocar
export function DocumentRow({
  label,
  onPick,
  onRemove,
  fileName,
  alreadySent = false,
  error,
}: DocumentRowProps) {
  const hasFile = Boolean(fileName) || alreadySent;
  const detail = fileName ?? (alreadySent ? 'Já enviado' : 'Nenhum arquivo escolhido');

  return (
    <View>
      <View style={[styles.row, error ? styles.rowError : null]}>
        <View style={styles.texts}>
          <Text style={styles.label}>{label}</Text>
          <Text numberOfLines={1} style={styles.detail}>
            {detail}
          </Text>
        </View>
        {fileName ? (
          <TouchableOpacity
            accessibilityLabel={`Remover arquivo: ${label}`}
            accessibilityRole="button"
            hitSlop={theme.spacing.medium}
            onPress={onRemove}
          >
            <Icon color={theme.colors.error} name="delete" size={theme.icon.medium} />
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          accessibilityLabel={`${hasFile ? 'Trocar arquivo' : 'Enviar arquivo'}: ${label}`}
          accessibilityRole="button"
          onPress={onPick}
          style={styles.button}
        >
          <Icon color={theme.colors.button} name="upload" size={theme.icon.medium} />
          <Text style={styles.buttonText}>{hasFile ? 'Trocar' : 'Enviar'}</Text>
        </TouchableOpacity>
      </View>
      <FieldError message={error} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    backgroundColor: theme.colors.input,
    borderColor: theme.colors.input,
    borderRadius: theme.radius.input,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.medium,
    minHeight: theme.spacing.footer,
    padding: theme.spacing.medium,
  },
  rowError: {
    borderColor: theme.colors.error,
  },
  texts: {
    flex: 1,
  },
  label: {
    color: theme.colors.title,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.body,
  },
  detail: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
  },
  button: {
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.button,
    borderRadius: theme.radius.input,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.tiny,
    justifyContent: 'center',
    minHeight: theme.spacing.footer,
    paddingHorizontal: theme.spacing.medium,
  },
  buttonText: {
    color: theme.colors.button,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.caption,
  },
});
