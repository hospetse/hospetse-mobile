import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { theme } from '../constants/theme';
import { Icon } from './Icon';

type BookingInterestProps = {
  dates: string;
  onDetails: () => void;
  petName: string | null;
  price: string | null;
};

// Faixa "Interesse em reservar" do chat, com o contexto da busca: datas, valor e pet
export function BookingInterest({ dates, onDetails, petName, price }: BookingInterestProps) {
  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.title}>Interesse em reservar</Text>
        <View style={styles.row}>
          <Icon color={theme.colors.button} name="calendar_month" size={theme.icon.small} />
          <Text style={styles.text}>{dates}</Text>
        </View>
        <View style={styles.row}>
          {price ? <Text style={styles.price}>{price}</Text> : null}
          {petName ? (
            <>
              <Icon color={theme.colors.button} name="pets" size={theme.icon.small} />
              <Text style={styles.text}>{petName}</Text>
            </>
          ) : null}
        </View>
      </View>
      <TouchableOpacity accessibilityRole="button" onPress={onDetails}>
        <Text style={styles.link}>Ver detalhes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: theme.colors.selectedTint,
    borderBottomColor: theme.colors.rangeFill,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.medium,
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.small,
  },
  info: {
    flex: 1,
    gap: theme.spacing.tiny / 2,
  },
  title: {
    color: theme.colors.subtitle,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.caption,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.tiny,
  },
  text: {
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    fontSize: theme.typography.caption,
  },
  price: {
    color: theme.colors.button,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.body,
    marginRight: theme.spacing.small,
  },
  link: {
    color: theme.colors.button,
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.typography.caption,
    textDecorationLine: 'underline',
  },
});
