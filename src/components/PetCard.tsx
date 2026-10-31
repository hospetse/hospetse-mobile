import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { theme } from '../constants/theme';
import { Icon } from './Icon';

type PetCardProps = {
  imageUri: string;
  location: string;
  name: string;
  onPress: () => void;
  price: string;
  rating: string;
  size: 'large' | 'small';
  width: number;
};

// Proporcao altura/largura da foto em cada tamanho de card
const IMAGE_RATIO = {
  large: 0.56,
  small: 0.95,
};

// Card de hotel para pets: foto, avaliacao, nome, localizacao e preco
export function PetCard({
  imageUri,
  location,
  name,
  onPress,
  price,
  rating,
  size,
  width,
}: PetCardProps) {
  const isSmall = size === 'small';
  const imageHeight = width * IMAGE_RATIO[size];

  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, { width }]}>
      <Image source={{ uri: imageUri }} style={[styles.image, { height: imageHeight }]} />

      <View style={styles.ratingBadge}>
        <Icon color={theme.colors.white} name="star" size={theme.icon.small} />
        <Text style={styles.ratingText}>{rating}</Text>
      </View>

      <View style={[styles.info, isSmall && styles.infoSmall]}>
        <Text numberOfLines={1} style={[styles.name, isSmall && styles.nameSmall]}>
          {name}
        </Text>

        <View style={styles.locationRow}>
          <Icon
            color={theme.colors.button}
            name="location_on"
            size={isSmall ? theme.typography.caption : theme.icon.small}
          />
          <Text numberOfLines={1} style={[styles.location, isSmall && styles.locationSmall]}>
            {location}
          </Text>
        </View>

        <Text style={[styles.price, isSmall && styles.priceSmall]}>
          {price}
          <Text style={[styles.priceUnit, isSmall && styles.priceUnitSmall]}>/diário</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.card,
    boxShadow: theme.shadow.card,
  },
  image: {
    borderTopLeftRadius: theme.radius.card,
    borderTopRightRadius: theme.radius.card,
    width: '100%',
  },
  ratingBadge: {
    alignItems: 'center',
    backgroundColor: theme.colors.badge,
    borderRadius: theme.radius.badge,
    flexDirection: 'row',
    gap: theme.spacing.tiny / 2,
    paddingHorizontal: theme.spacing.tiny + 2,
    paddingVertical: theme.spacing.tiny / 2,
    position: 'absolute',
    right: theme.spacing.small,
    top: theme.spacing.small,
  },
  ratingText: {
    color: theme.colors.white,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.caption,
  },
  info: {
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.medium,
  },
  infoSmall: {
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.small,
  },
  name: {
    color: theme.colors.title,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.cardTitle,
  },
  nameSmall: {
    fontSize: theme.typography.cardTitleSmall,
  },
  locationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.tiny / 2,
    marginTop: theme.spacing.tiny / 2,
  },
  location: {
    color: theme.colors.button,
    flex: 1,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
  },
  locationSmall: {
    fontSize: theme.typography.captionSmall,
  },
  price: {
    color: theme.colors.title,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.price,
    marginTop: theme.spacing.medium,
  },
  priceSmall: {
    fontSize: theme.typography.priceSmall,
    marginTop: theme.spacing.small,
  },
  priceUnit: {
    color: theme.colors.placeholder,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
  },
  priceUnitSmall: {
    fontSize: theme.typography.captionSmall,
  },
});
