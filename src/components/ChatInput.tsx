import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { theme } from '../constants/theme';
import { Icon } from './Icon';

type ChatInputProps = {
  onChangeText: (text: string) => void;
  onSend: () => void;
  value: string;
};

// Campo de mensagem do chat. Anexo e microfone ainda não têm ação
export function ChatInput({ onChangeText, onSend, value }: ChatInputProps) {
  const canSend = value.trim().length > 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity accessibilityLabel="Anexar arquivo" accessibilityRole="button" style={styles.iconButton}>
        <Icon color={theme.colors.placeholder} name="attach_file" size={theme.icon.medium} />
      </TouchableOpacity>
      <TextInput
        accessibilityLabel="Mensagem"
        multiline
        onChangeText={onChangeText}
        placeholder="Escreva sua mensagem"
        placeholderTextColor={theme.colors.placeholder}
        style={styles.input}
        value={value}
      />
      <TouchableOpacity accessibilityLabel="Gravar áudio" accessibilityRole="button" style={styles.iconButton}>
        <Icon color={theme.colors.placeholder} name="mic" size={theme.icon.medium} />
      </TouchableOpacity>
      <TouchableOpacity
        accessibilityLabel="Enviar mensagem"
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSend }}
        disabled={!canSend}
        onPress={onSend}
        style={[styles.send, !canSend && styles.sendDisabled]}
      >
        <Icon color={theme.colors.white} name="send" size={theme.icon.medium} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: theme.spacing.small,
  },
  iconButton: {
    alignItems: 'center',
    height: theme.spacing.chatInput,
    justifyContent: 'center',
  },
  input: {
    backgroundColor: theme.colors.input,
    borderRadius: theme.radius.input,
    color: theme.colors.text,
    flex: 1,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
    maxHeight: theme.spacing.chatInput * 3,
    minHeight: theme.spacing.chatInput,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.medium,
  },
  send: {
    alignItems: 'center',
    backgroundColor: theme.colors.button,
    borderRadius: theme.radius.round,
    height: theme.spacing.chatInput,
    justifyContent: 'center',
    width: theme.spacing.chatInput,
  },
  sendDisabled: {
    opacity: 0.5,
  },
});
