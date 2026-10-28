import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Skeleton } from '../components/Skeleton';
import { theme } from '../constants/theme';

// Tempo do skeleton antes de avisar que a Home ainda está em construção
const NOTICE_DELAY_MS = 1500;

// Card de prestador (foto, nome, cidade e preço) em carregamento
function SkeletonCard() {
  return (
    <View style={styles.card}>
      <Skeleton height={140} radius={0} width="100%" />
      <View style={styles.cardBody}>
        <Skeleton height={16} width={150} />
        <Skeleton height={10} style={styles.lineSpaced} width={100} />
        <Skeleton height={16} style={styles.priceLine} width={80} />
      </View>
    </View>
  );
}

// PET-005 Home: por enquanto só o skeleton do layout. O conteúdo vem em outra PBI
export default function HomeScreen() {
  const { nome } = useLocalSearchParams<{ nome?: string }>();
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowNotice(true), NOTICE_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.screen}>
      <ScrollView
        accessibilityLabel="Carregando"
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Skeleton height={48} radius={theme.radius.round} width={48} />
          <View style={styles.headerText}>
            <Skeleton height={16} width={140} />
            <Skeleton height={10} style={styles.lineSpaced} width={100} />
          </View>
          <Skeleton height={44} radius={theme.radius.round} width={44} />
        </View>

        <Skeleton height={56} style={styles.search} width="100%" />

        <View style={styles.chips}>
          <Skeleton height={48} style={styles.chip} width="31%" />
          <Skeleton height={48} style={styles.chip} width="31%" />
          <Skeleton height={48} width="31%" />
        </View>

        <Skeleton height={20} style={styles.sectionTitle} width={220} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <SkeletonCard />
          <SkeletonCard />
        </ScrollView>

        <View style={styles.sectionRow}>
          <Skeleton height={20} width={160} />
          <Skeleton height={14} width={60} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <SkeletonCard />
          <SkeletonCard />
        </ScrollView>
      </ScrollView>

      <View style={styles.tabBar}>
        {[0, 1, 2, 3].map((item) => (
          <View key={item} style={styles.tabItem}>
            <Skeleton height={32} radius={theme.radius.round} width={32} />
            <Skeleton height={8} style={styles.lineSpaced} width={40} />
          </View>
        ))}
      </View>

      {showNotice ? (
        <View style={styles.overlay}>
          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>{nome ? `Olá, ${nome}! 🐾` : 'Olá! 🐾'}</Text>
            <Text style={styles.noticeText}>Sua conta foi criada.</Text>
            <Text style={styles.noticeText}>
              A tela inicial está em construção e chega em breve.
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  content: {
    padding: theme.spacing.page,
    paddingBottom: 120,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerText: {
    flex: 1,
    marginLeft: theme.spacing.medium,
  },
  lineSpaced: {
    marginTop: theme.spacing.small,
  },
  search: {
    marginTop: theme.spacing.page,
  },
  chips: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.page,
  },
  chip: {
    marginRight: theme.spacing.small,
  },
  sectionTitle: {
    marginBottom: theme.spacing.large,
    marginTop: theme.spacing.page,
  },
  sectionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.large,
    marginTop: theme.spacing.page,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    marginRight: theme.spacing.large,
    overflow: 'hidden',
    width: 240,
  },
  cardBody: {
    padding: theme.spacing.large,
  },
  priceLine: {
    marginTop: theme.spacing.section,
  },
  tabBar: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.round,
    bottom: theme.spacing.page,
    flexDirection: 'row',
    justifyContent: 'space-around',
    left: theme.spacing.page,
    paddingVertical: theme.spacing.medium,
    position: 'absolute',
    right: theme.spacing.page,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: theme.shadow.opacity,
    shadowRadius: theme.shadow.radius,
    elevation: theme.shadow.elevation,
  },
  tabItem: {
    alignItems: 'center',
  },
  overlay: {
    backgroundColor: theme.colors.overlay,
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    padding: theme.spacing.page,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  notice: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    padding: theme.spacing.page,
  },
  noticeTitle: {
    color: theme.colors.title,
    fontFamily: theme.fonts.extraBold,
    fontSize: theme.typography.title,
    marginBottom: theme.spacing.small,
    textAlign: 'center',
  },
  noticeText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.medium,
    fontSize: theme.typography.button,
    marginTop: theme.spacing.small,
    textAlign: 'center',
  },
});
