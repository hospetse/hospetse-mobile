import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Image,
  Keyboard,
  Platform,
  ScrollView,
  ScrollViewInstance,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BookingInterest } from '../../components/BookingInterest';
import { Button } from '../../components/Button';
import { ChatBubble } from '../../components/ChatBubble';
import { ChatInput } from '../../components/ChatInput';
import { Icon } from '../../components/Icon';
import { Skeleton } from '../../components/Skeleton';
import { ChatMessage, SAMPLE_CHAT } from '../../constants/sampleChat';
import { SAMPLE_PETS } from '../../constants/sampleData';
import { theme } from '../../constants/theme';
import { usePets } from '../../context/PetsContext';
import { getHostPage, HostDetails, HostNotFoundError, lowestPrice } from '../../services/hosts';
import { formatDate, fromIsoDate } from '../../utils/calendar';
import { countNights, formatPrice, formatTime } from '../../utils/chat';

type LoadState = 'loading' | 'ready' | 'not-found' | 'error';

// Valor da faixa "Interesse em reservar": total das noites ou o preço da diária
function priceText(host: HostDetails, checkIn: Date | null, checkOut: Date | null): string | null {
  const price = lowestPrice(host);
  if (price === null) {
    return null;
  }
  if (checkIn && checkOut) {
    const nights = countNights(checkIn, checkOut);
    return `${formatPrice(price * nights)} (${nights} ${nights === 1 ? 'noite' : 'noites'})`;
  }
  return `${formatPrice(price)} / noite`;
}

export default function ChatScreen() {
  // Mesmos parâmetros do detalhe: o id do Host e o contexto opcional da busca
  const { id, checkIn, checkOut, petId } = useLocalSearchParams<{
    id: string;
    checkIn?: string;
    checkOut?: string;
    petId?: string;
  }>();
  const insets = useSafeAreaInsets();
  const { pets } = usePets();
  const scrollRef = useRef<ScrollViewInstance>(null);

  const [host, setHost] = useState<HostDetails | null>(null);
  const [state, setState] = useState<LoadState>('loading');
  // PROVISÓRIO: começa com a conversa de exemplo. O envio mostra a mensagem só na tela
  const [messages, setMessages] = useState<ChatMessage[]>(SAMPLE_CHAT);
  const [draft, setDraft] = useState('');
  // Quanto do teclado fica por cima da tela (0 = fechado)
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  // Altura da tela, medida no onLayout. Fica num ref porque os ouvintes do teclado são criados uma vez só
  const screenHeight = useRef(0);

  // Como no WhatsApp: o teclado empurra o campo e as mensagens para cima, em vez de cobrir.
  // A parte da tela que o teclado cobre (altura da tela menos o topo do teclado) vira margem embaixo.
  // Funciona nos dois sistemas: no iOS e no Android em tela cheia (edge-to-edge) a tela não encolhe
  // sozinha. Se algum aparelho já encolher a tela, a conta dá 0 e a margem não dobra
  useEffect(() => {
    const isIos = Platform.OS === 'ios';
    // No iOS, o evento "Will" chega antes da animação do teclado; no Android só existe o "Did"
    const showEvent = isIos ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = isIos ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      if (isIos) {
        Keyboard.scheduleLayoutAnimation(event);
      }
      const covered = screenHeight.current - event.endCoordinates.screenY;
      setKeyboardHeight(Math.max(0, covered));
    });
    const hideSubscription = Keyboard.addListener(hideEvent, (event) => {
      if (isIos) {
        Keyboard.scheduleLayoutAnimation(event);
      }
      setKeyboardHeight(0);
    });
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  function scrollToLastMessage() {
    scrollRef.current?.scrollToEnd({ animated: true });
  }

  useEffect(() => {
    let active = true;
    getHostPage(id)
      .then((result) => {
        if (active) {
          setHost(result.host);
          setState('ready');
        }
      })
      .catch((error) => {
        if (active) {
          setState(error instanceof HostNotFoundError ? 'not-found' : 'error');
        }
      });
    return () => {
      active = false;
    };
  }, [id]);

  function sendMessage(text: string) {
    const clean = text.trim();
    if (!clean) {
      return;
    }
    const message: ChatMessage = {
      id: `local-${Date.now()}`,
      author: 'tutor',
      day: 'Hoje',
      time: formatTime(new Date()),
      text: clean,
    };
    setMessages([...messages, message]);
    setDraft('');
  }

  const backButton = (
    <TouchableOpacity
      accessibilityLabel="Voltar"
      accessibilityRole="button"
      onPress={() => router.back()}
      style={styles.headerButton}
    >
      <Icon color={theme.colors.title} name="arrow_back" size={theme.icon.large} />
    </TouchableOpacity>
  );

  if (state === 'loading') {
    return (
      <View accessibilityLabel="Carregando" style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          {backButton}
          <Skeleton height={theme.spacing.avatar} radius={theme.radius.round} width={theme.spacing.avatar} />
          <Skeleton height={14} width={140} />
        </View>
      </View>
    );
  }

  if (state !== 'ready' || !host) {
    return (
      <View style={[styles.screen, styles.message]}>
        <Text accessibilityRole="header" style={styles.messageTitle}>
          {state === 'not-found' ? 'Hospedagem não encontrada' : 'Algo deu errado'}
        </Text>
        <Text style={styles.messageText}>
          {state === 'not-found'
            ? 'Essa hospedagem não está mais disponível.'
            : 'Não foi possível abrir a conversa. Tente de novo.'}
        </Text>
        <Button onPress={() => router.back()} title="Voltar" />
      </View>
    );
  }

  const startDate = fromIsoDate(checkIn);
  const endDate = fromIsoDate(checkOut);
  const dates =
    startDate && endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : 'Escolha as datas na busca';
  const pet = pets.find((item) => item.id === petId) ?? (__DEV__ ? SAMPLE_PETS.find((item) => item.id === petId) : null);

  return (
    <View
      onLayout={(event) => {
        screenHeight.current = event.nativeEvent.layout.height;
      }}
      style={[styles.screen, { paddingTop: insets.top, paddingBottom: keyboardHeight }]}
    >
      {/* Cabeçalho. Sem botão de ligar: nenhum contato direto antes da reserva (25/10/2026) */}
      <View style={styles.header}>
        {backButton}
        {host.pictureUrl ? (
          <Image
            accessibilityLabel={`Foto de ${host.name}`}
            source={{ uri: host.pictureUrl }}
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Icon color={theme.colors.button} name="pets" size={theme.icon.medium} />
          </View>
        )}
        <View style={styles.headerText}>
          <Text accessibilityRole="header" numberOfLines={1} style={styles.hostName}>
            {host.name}
          </Text>
          {/* PROVISÓRIO: status de exemplo até existir a rota de conversa */}
          <Text style={styles.status}>Online</Text>
        </View>
        <TouchableOpacity accessibilityLabel="Mais opções" accessibilityRole="button" style={styles.headerButton}>
          <Icon color={theme.colors.title} name="more_vert" size={theme.icon.large} />
        </TouchableOpacity>
      </View>

      <BookingInterest
        dates={dates}
        onDetails={() => router.back()}
        petName={pet?.name ?? null}
        price={priceText(host, startDate, endDate)}
      />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.messages}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        // Mensagem nova aparece no fim da conversa
        onContentSizeChange={scrollToLastMessage}
        // O teclado diminui a área das mensagens: rola para continuar vendo a última
        onLayout={scrollToLastMessage}
      >
        {messages.map((message, index) => {
          const newDay = index === 0 || messages[index - 1].day !== message.day;
          return (
            <View key={message.id} style={styles.messageGroup}>
              {newDay ? <Text style={styles.day}>{message.day}</Text> : null}
              <ChatBubble hostName={host.name} message={message} onSuggestion={sendMessage} />
            </View>
          );
        })}
      </ScrollView>

      {/* Com o teclado aberto, a margem da área segura sai para o campo ficar colado nele */}
      <View
        style={[
          styles.footer,
          { paddingBottom: (keyboardHeight > 0 ? 0 : insets.bottom) + theme.spacing.small },
        ]}
      >
        <ChatInput onChangeText={setDraft} onSend={() => sendMessage(draft)} value={draft} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    flexDirection: 'row',
    gap: theme.spacing.medium,
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.small,
  },
  headerButton: {
    padding: theme.spacing.tiny,
  },
  avatar: {
    borderRadius: theme.radius.round,
    height: theme.spacing.avatar,
    width: theme.spacing.avatar,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    backgroundColor: theme.colors.selectedTint,
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  hostName: {
    color: theme.colors.title,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.userName,
  },
  status: {
    color: theme.colors.button,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
  },
  messages: {
    gap: theme.spacing.medium,
    padding: theme.spacing.large,
  },
  messageGroup: {
    gap: theme.spacing.medium,
  },
  day: {
    alignSelf: 'center',
    backgroundColor: theme.colors.iconButton,
    borderRadius: theme.radius.round,
    color: theme.colors.text,
    fontFamily: theme.fonts.medium,
    fontSize: theme.typography.caption,
    overflow: 'hidden',
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.tiny / 2,
  },
  footer: {
    backgroundColor: theme.colors.white,
    boxShadow: theme.shadow.bar,
    paddingHorizontal: theme.spacing.medium,
    paddingTop: theme.spacing.small,
  },
  message: {
    justifyContent: 'center',
    padding: theme.spacing.page,
  },
  messageTitle: {
    color: theme.colors.title,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.sectionTitle,
    textAlign: 'center',
  },
  messageText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
    marginTop: theme.spacing.small,
    textAlign: 'center',
  },
});
