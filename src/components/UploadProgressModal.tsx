import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { theme } from '../constants/theme';
import { Button } from './Button';
import { Icon } from './Icon';

export type ProgressRow = {
  key: string;
  label: string;
  status: 'waiting' | 'active' | 'done' | 'error';
  // 0 a 100, só para arquivos em envio
  percent?: number;
};

type UploadProgressModalProps = {
  rows: ProgressRow[];
  visible: boolean;
  // Mensagem do erro que parou o envio
  message?: string | null;
  // Mostra "Tentar de novo" (falha de rede ou do armazenamento)
  canRetry?: boolean;
  onClose: () => void;
  onRetry: () => void;
};

const STATUS_TEXT: Record<ProgressRow['status'], string> = {
  waiting: 'Aguardando',
  active: 'Enviando',
  done: 'Concluído',
  error: 'Falhou',
};

// Mostra o envio do cadastro: uma linha por etapa e por arquivo, com o progresso.
// Se algo falhar, explica o motivo e deixa tentar de novo só o que faltou
export function UploadProgressModal({
  rows,
  visible,
  message,
  canRetry = false,
  onClose,
  onRetry,
}: UploadProgressModalProps) {
  const failed = rows.some((row) => row.status === 'error');

  return (
    <Modal animationType="fade" onRequestClose={failed ? onClose : undefined} transparent visible={visible}>
      <View style={styles.overlay}>
        <View accessibilityViewIsModal style={styles.card}>
          <Text accessibilityRole="header" style={styles.title}>
            {failed ? 'Não foi possível enviar' : 'Enviando seu cadastro'}
          </Text>

          {rows.map((row) => (
            <View key={row.key} style={styles.row}>
              <View style={styles.rowTop}>
                <Text numberOfLines={1} style={styles.rowLabel}>
                  {row.label}
                </Text>
                <View style={styles.rowStatus}>
                  {row.status === 'done' ? (
                    <Icon color={theme.colors.green} name="check_circle" size={theme.icon.medium} />
                  ) : null}
                  <Text
                    style={[
                      styles.rowStatusText,
                      row.status === 'error' ? styles.rowStatusError : null,
                    ]}
                  >
                    {row.status === 'active' && row.percent !== undefined
                      ? `${row.percent}%`
                      : STATUS_TEXT[row.status]}
                  </Text>
                </View>
              </View>
              {row.status === 'active' && row.percent !== undefined ? (
                <View
                  accessibilityLabel={`Progresso: ${row.label}`}
                  accessibilityRole="progressbar"
                  accessibilityValue={{ min: 0, max: 100, now: row.percent }}
                  style={styles.track}
                >
                  <View style={[styles.fill, { width: `${row.percent}%` }]} />
                </View>
              ) : null}
            </View>
          ))}

          {message ? (
            <Text accessibilityLiveRegion="polite" style={styles.message}>
              {message}
            </Text>
          ) : null}

          {failed ? (
            <View style={styles.actions}>
              {canRetry ? <Button onPress={onRetry} title="Tentar de novo" /> : null}
              <TouchableOpacity accessibilityRole="button" onPress={onClose} style={styles.close}>
                <Text style={styles.closeText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: theme.colors.backdrop,
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.page,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    boxShadow: theme.shadow.card,
    gap: theme.spacing.medium,
    maxWidth: 360,
    padding: theme.spacing.page,
    width: '100%',
  },
  title: {
    color: theme.colors.title,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.modalTitle,
  },
  row: {
    gap: theme.spacing.tiny,
  },
  rowTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.small,
    justifyContent: 'space-between',
  },
  rowLabel: {
    color: theme.colors.text,
    flex: 1,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
  },
  rowStatus: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.tiny,
  },
  rowStatusText: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.medium,
    fontSize: theme.typography.caption,
  },
  rowStatusError: {
    color: theme.colors.error,
  },
  track: {
    backgroundColor: theme.colors.divider,
    borderRadius: theme.radius.round,
    height: theme.spacing.sliderTrack,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: theme.colors.button,
    height: '100%',
  },
  message: {
    color: theme.colors.error,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
  },
  actions: {
    gap: theme.spacing.small,
  },
  close: {
    alignSelf: 'center',
    padding: theme.spacing.small,
  },
  closeText: {
    color: theme.colors.button,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.button,
  },
});
