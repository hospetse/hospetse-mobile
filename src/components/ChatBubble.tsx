import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ChatMessage } from '../constants/sampleChat';
import { theme } from '../constants/theme';
import { Icon } from './Icon';

type ChatBubbleProps = {
  hostName: string;
  message: ChatMessage;
  onSuggestion: (text: string) => void;
};

// Balão de uma mensagem. O Tutor fica à direita, em laranja. O Assistente (com "Ativa")
// e o Host (com "Atendimento Humano") ficam à esquerda, com cores diferentes
export function ChatBubble({ hostName, message, onSuggestion }: ChatBubbleProps) {
  const isTutor = message.author === 'tutor';
  const isHost = message.author === 'host';
  const authorName = isTutor ? 'Você' : isHost ? hostName : 'Assistente Hospetse';

  return (
    <View style={[styles.row, isTutor && styles.rowTutor]}>
      {!isTutor ? (
        <Text style={styles.author}>
          {authorName}
          {/* Selos ao lado do nome */}
          {'  '}
          <Text style={isHost ? styles.humanTag : styles.activeTag}>
            {isHost ? 'Atendimento Humano' : 'Ativa'}
          </Text>
        </Text>
      ) : null}

      <View
        accessible
        accessibilityLabel={`${authorName}, ${message.time}: ${message.text}`}
        style={[
          styles.bubble,
          isTutor ? styles.bubbleTutor : isHost ? styles.bubbleHost : styles.bubbleAssistant,
        ]}
      >
        {!isTutor && !isHost ? (
          <Icon color={theme.colors.button} name="smart_toy" size={theme.icon.medium} />
        ) : null}
        <Text style={[styles.text, isTutor && styles.textTutor]}>{message.text}</Text>
        {message.imageUri ? (
          <Image
            accessibilityLabel="Foto enviada na conversa"
            source={{ uri: message.imageUri }}
            style={styles.image}
          />
        ) : null}
        <Text style={[styles.time, isTutor && styles.timeTutor]}>{message.time}</Text>
      </View>

      {message.suggestions ? (
        <View style={styles.suggestions}>
          {message.suggestions.map((suggestion) => (
            <TouchableOpacity
              key={suggestion}
              accessibilityRole="button"
              onPress={() => onSuggestion(suggestion)}
              style={styles.suggestion}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'flex-start',
    gap: theme.spacing.tiny,
  },
  rowTutor: {
    alignItems: 'flex-end',
  },
  author: {
    color: theme.colors.title,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.caption,
  },
  activeTag: {
    color: theme.colors.button,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.caption,
  },
  humanTag: {
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.caption,
  },
  bubble: {
    borderRadius: theme.radius.card,
    gap: theme.spacing.tiny,
    maxWidth: '80%',
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
  },
  bubbleAssistant: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.radius.calendarMark,
    boxShadow: theme.shadow.soft,
  },
  bubbleHost: {
    backgroundColor: theme.colors.selectedTint,
    borderColor: theme.colors.rangeFill,
    borderTopLeftRadius: theme.radius.calendarMark,
    borderWidth: 1,
  },
  bubbleTutor: {
    backgroundColor: theme.colors.button,
    borderTopRightRadius: theme.radius.calendarMark,
  },
  text: {
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
  },
  textTutor: {
    color: theme.colors.white,
  },
  image: {
    borderRadius: theme.radius.badge,
    height: theme.spacing.chatImageHeight,
    width: theme.spacing.chatImageWidth,
  },
  time: {
    alignSelf: 'flex-end',
    color: theme.colors.placeholder,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.captionSmall,
  },
  timeTutor: {
    color: theme.colors.white,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.small,
    marginTop: theme.spacing.tiny,
  },
  suggestion: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.button,
    borderRadius: theme.radius.round,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.tiny,
  },
  suggestionText: {
    color: theme.colors.button,
    fontFamily: theme.fonts.medium,
    fontSize: theme.typography.caption,
  },
});
