import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AmenityItem } from '../../components/AmenityItem';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { OutlineButton } from '../../components/OutlineButton';
import { RoutineModal } from '../../components/RoutineModal';
import { Skeleton } from '../../components/Skeleton';
import { theme } from '../../constants/theme';
import {
  formatHostLocation,
  getHostPage,
  HostNotFoundError,
  HostPage,
  lowestPrice,
} from '../../services/hosts';
import { formatDate, fromIsoDate } from '../../utils/calendar';

// Quantas fotos da galeria aparecem; a última mostra "+N" quando há mais
const GALLERY_VISIBLE = 4;
// Quantos itens da rotina aparecem no detalhe; o resto fica no modal
const ROUTINE_VISIBLE = 4;
// Linhas da descrição antes do "Ler mais"
const DESCRIPTION_LINES = 5;

type LoadState = 'loading' | 'ready' | 'not-found' | 'error';

export default function HostDetailsScreen() {
  // O id vem na rota. As datas são opcionais e chegam da busca (2026-08-01)
  const { id, checkIn, checkOut } = useLocalSearchParams<{
    id: string;
    checkIn?: string;
    checkOut?: string;
  }>();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [page, setPage] = useState<HostPage | null>(null);
  const [state, setState] = useState<LoadState>('loading');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showRoutine, setShowRoutine] = useState(false);

  useEffect(() => {
    let active = true;
    getHostPage(id)
      .then((result) => {
        if (active) {
          setPage(result);
          setState('ready');
        }
      })
      .catch((error) => {
        if (active) {
          setState(error instanceof HostNotFoundError ? 'not-found' : 'error');
        }
      });
    // Se a tela fechar antes da resposta, não atualiza o estado
    return () => {
      active = false;
    };
  }, [id]);

  const coverHeight = width * 0.62;
  const backButton = (
    <TouchableOpacity
      accessibilityLabel="Voltar"
      accessibilityRole="button"
      onPress={() => router.back()}
      style={[styles.backButton, { top: insets.top + theme.spacing.small }]}
    >
      <Icon color={theme.colors.title} name="arrow_back" size={theme.icon.medium} />
    </TouchableOpacity>
  );

  if (state === 'loading') {
    return (
      <View accessibilityLabel="Carregando" style={styles.screen}>
        <Skeleton height={coverHeight} radius={0} width="100%" />
        <View style={styles.loadingBody}>
          <Skeleton height={20} width={200} />
          <Skeleton height={12} width={160} />
          <Skeleton height={80} width="100%" />
        </View>
        {backButton}
      </View>
    );
  }

  if (state !== 'ready' || !page) {
    return (
      <View style={[styles.screen, styles.message]}>
        <Text accessibilityRole="header" style={styles.messageTitle}>
          {state === 'not-found' ? 'Hospedagem não encontrada' : 'Algo deu errado'}
        </Text>
        <Text style={styles.messageText}>
          {state === 'not-found'
            ? 'Essa hospedagem não está mais disponível.'
            : 'Não foi possível carregar a hospedagem. Tente de novo.'}
        </Text>
        <Button onPress={() => router.back()} title="Voltar" />
      </View>
    );
  }

  const { host, extras } = page;
  const price = lowestPrice(host);
  const cover = host.photos[0] ?? host.pictureUrl;
  const gallery = host.photos.slice(1);
  const hiddenPhotos = gallery.length - GALLERY_VISIBLE;
  const routine = extras.routine.slice(0, ROUTINE_VISIBLE);

  const startDate = fromIsoDate(checkIn);
  const endDate = fromIsoDate(checkOut);
  const dates =
    startDate && endDate ? `${formatDate(startDate)}  -  ${formatDate(endDate)}` : 'Escolha as datas na busca';

  const { rating, reviewCount } = host.reputation;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: theme.spacing.footer * 2 + insets.bottom + theme.spacing.page },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {cover ? (
          <Image
            accessibilityLabel={`Foto de ${host.name}`}
            source={{ uri: cover }}
            style={{ height: coverHeight, width }}
          />
        ) : (
          <View style={[styles.coverPlaceholder, { height: coverHeight }]} />
        )}

        {/* Nome, local, avaliação e preço */}
        <View style={[styles.section, styles.divider]}>
          <View style={styles.titleRow}>
            <Text accessibilityRole="header" style={styles.hostName}>
              {host.name}
            </Text>
            {price !== null ? (
              <View style={styles.priceBox}>
                <Text style={styles.price}>R$ {price}</Text>
                <Text style={styles.priceUnit}>/ noite</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.location}>{formatHostLocation(host)}</Text>
          <View style={styles.ratingRow}>
            <Icon color={theme.colors.button} name="star" size={theme.icon.small} />
            <Text style={styles.rating}>
              {rating !== null
                ? `${rating.toFixed(1)} (${reviewCount.toLocaleString('pt-BR')} Avaliações)`
                : 'Sem avaliações ainda'}
            </Text>
          </View>
        </View>

        <View style={[styles.section, styles.divider]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Comodidades</Text>
            <TouchableOpacity accessibilityRole="button">
              <Text style={styles.link}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.amenities}>
            {extras.amenities.map((amenity) => (
              <AmenityItem key={amenity.label} icon={amenity.icon} label={amenity.label} />
            ))}
          </View>
        </View>

        <View style={[styles.section, styles.divider]}>
          <Text style={styles.sectionTitle}>Disponibilidade</Text>
          <View style={styles.dateCard}>
            <Text style={styles.dateTitle}>Confirme a data</Text>
            <View style={styles.dateRow}>
              <Icon color={theme.colors.button} name="calendar_month" size={theme.icon.small} />
              <Text style={styles.dateText}>{dates}</Text>
            </View>
          </View>
        </View>

        {host.description ? (
          <View style={[styles.section, styles.divider]}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <Text
              numberOfLines={showFullDescription ? undefined : DESCRIPTION_LINES}
              style={styles.bodyText}
            >
              {host.description}
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => setShowFullDescription(!showFullDescription)}
              style={styles.readMore}
            >
              <Text style={styles.linkSmall}>{showFullDescription ? 'Ler menos' : 'Ler mais'}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {gallery.length > 0 ? (
          <View style={[styles.section, styles.divider]}>
            <Text style={styles.sectionTitle}>Galeria</Text>
            <View style={styles.gallery}>
              {gallery.slice(0, GALLERY_VISIBLE).map((photo, index) => {
                const isLast = index === GALLERY_VISIBLE - 1 && hiddenPhotos > 0;
                return (
                  <View key={photo} style={styles.thumb}>
                    <Image source={{ uri: photo }} style={styles.thumbImage} />
                    {isLast ? (
                      <View style={styles.thumbOverlay}>
                        <Text style={styles.thumbMore}>+{hiddenPhotos}</Text>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}

        <View style={[styles.section, styles.divider]}>
          <Text style={styles.sectionTitle}>Endereço</Text>
          <Text style={styles.bodyText}>{formatHostLocation(host)}</Text>
        </View>

        <View style={[styles.section, styles.divider]}>
          <Text style={styles.sectionTitle}>Requisitos</Text>
          {extras.requirements.map((item) => (
            <Text key={item} style={styles.listItem}>
              {item}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rotina</Text>
          {routine.map((item) => (
            <Text key={item} style={styles.listItem}>
              {item}
            </Text>
          ))}
          {/* O "Ler mais" abre o modal com os horários e a garantia (#519) */}
          {extras.routineSteps.length > 0 ? (
            <TouchableOpacity
              accessibilityLabel="Ler mais sobre a rotina"
              accessibilityRole="button"
              onPress={() => setShowRoutine(true)}
              style={styles.readMore}
            >
              <Text style={styles.linkSmall}>Ler mais</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>

      {backButton}

      {/* Rodapé fixo. Os dois botões ainda não têm ação: o contato é só pelo
          Assistente de IA, e a solicitação de reserva é de outra task */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + theme.spacing.medium }]}>
        <View style={styles.footerButton}>
          <OutlineButton icon="chat" onPress={() => {}} title="Tire suas dúvidas" />
        </View>
        <View style={styles.footerButton}>
          <Button onPress={() => {}} title="Solicitar reserva" />
        </View>
      </View>

      <RoutineModal
        onClose={() => setShowRoutine(false)}
        steps={extras.routineSteps}
        visible={showRoutine}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  coverPlaceholder: {
    backgroundColor: theme.colors.skeleton,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.round,
    boxShadow: theme.shadow.soft,
    height: theme.spacing.backButton,
    justifyContent: 'center',
    left: theme.spacing.large,
    position: 'absolute',
    width: theme.spacing.backButton,
  },
  loadingBody: {
    gap: theme.spacing.medium,
    padding: theme.spacing.page,
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
  section: {
    paddingHorizontal: theme.spacing.page,
    paddingVertical: theme.spacing.large,
  },
  divider: {
    borderBottomColor: theme.colors.divider,
    borderBottomWidth: 1,
  },
  titleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.medium,
    justifyContent: 'space-between',
  },
  hostName: {
    color: theme.colors.title,
    flex: 1,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.hostName,
  },
  priceBox: {
    alignItems: 'flex-end',
  },
  price: {
    color: theme.colors.button,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.sectionTitle,
  },
  priceUnit: {
    color: theme.colors.placeholder,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
  },
  location: {
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
    marginTop: theme.spacing.tiny,
  },
  ratingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.tiny,
    marginTop: theme.spacing.tiny,
  },
  rating: {
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: theme.colors.title,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.sectionTitle,
  },
  link: {
    color: theme.colors.button,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.body,
  },
  linkSmall: {
    color: theme.colors.button,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.caption,
    textDecorationLine: 'underline',
  },
  amenities: {
    flexDirection: 'row',
    marginTop: theme.spacing.medium,
  },
  dateCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.chip,
    boxShadow: theme.shadow.soft,
    marginTop: theme.spacing.medium,
    padding: theme.spacing.medium,
  },
  dateTitle: {
    color: theme.colors.button,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.button,
  },
  dateRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.small,
    marginTop: theme.spacing.tiny,
  },
  dateText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
  },
  bodyText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
    marginTop: theme.spacing.small,
    textAlign: 'justify',
  },
  readMore: {
    alignSelf: 'flex-start',
    marginTop: theme.spacing.small,
  },
  gallery: {
    flexDirection: 'row',
    gap: theme.spacing.small,
    marginTop: theme.spacing.medium,
  },
  thumb: {
    borderRadius: theme.radius.badge,
    flex: 1,
    height: theme.spacing.galleryThumb,
    overflow: 'hidden',
  },
  thumbImage: {
    height: '100%',
    width: '100%',
  },
  thumbOverlay: {
    alignItems: 'center',
    backgroundColor: theme.colors.badge,
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  thumbMore: {
    color: theme.colors.white,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.button,
  },
  listItem: {
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.body,
    marginTop: theme.spacing.tiny,
  },
  footer: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.radius.card,
    borderTopRightRadius: theme.radius.card,
    bottom: 0,
    boxShadow: theme.shadow.bar,
    flexDirection: 'row',
    gap: theme.spacing.medium,
    left: 0,
    paddingHorizontal: theme.spacing.large,
    position: 'absolute',
    right: 0,
  },
  footerButton: {
    flex: 1,
  },
});
