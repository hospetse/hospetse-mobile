import { useState } from 'react';
import { GestureResponderEvent, StyleSheet, Text, View } from 'react-native';

import { PRICE_MAX, PRICE_MIN, PRICE_STEP } from '../constants/search';
import { theme } from '../constants/theme';

type PriceSliderProps = {
  // Preço máximo escolhido; PRICE_MAX significa "sem limite"
  onChange: (value: number) => void;
  value: number;
};

// Mantém o valor dentro da faixa e no passo de R$ 10
export function clampPrice(value: number): number {
  const stepped = Math.round(value / PRICE_STEP) * PRICE_STEP;
  return Math.min(PRICE_MAX, Math.max(PRICE_MIN, stepped));
}

export function priceLabel(value: number): string {
  return value >= PRICE_MAX ? `R$ ${PRICE_MAX}+` : `R$ ${value}`;
}

// Barra de preço feita só com Views: tocar ou arrastar na barra escolhe o valor.
// O leitor de tela usa as ações de aumentar e diminuir
export function PriceSlider({ onChange, value }: PriceSliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const ratio = (value - PRICE_MIN) / (PRICE_MAX - PRICE_MIN);

  function updateFromTouch(event: GestureResponderEvent) {
    if (trackWidth === 0) {
      return;
    }
    const position = Math.min(1, Math.max(0, event.nativeEvent.locationX / trackWidth));
    onChange(clampPrice(PRICE_MIN + position * (PRICE_MAX - PRICE_MIN)));
  }

  return (
    <View>
      <View
        accessible
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        accessibilityLabel="Preço máximo"
        accessibilityRole="adjustable"
        accessibilityValue={{ min: PRICE_MIN, max: PRICE_MAX, now: value, text: priceLabel(value) }}
        onAccessibilityAction={(event) => {
          const step = event.nativeEvent.actionName === 'increment' ? PRICE_STEP : -PRICE_STEP;
          onChange(clampPrice(value + step));
        }}
        onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={updateFromTouch}
        onResponderMove={updateFromTouch}
        // Não deixa a rolagem da tela "roubar" o arraste da barra
        onResponderTerminationRequest={() => false}
        onStartShouldSetResponder={() => true}
        style={styles.area}
      >
        <View style={styles.track} />
        <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
        <View style={[styles.thumb, { left: ratio * trackWidth - theme.spacing.sliderThumb / 2 }]} />
      </View>

      <View style={styles.labels}>
        <Text style={styles.edgeLabel}>{priceLabel(PRICE_MIN)}</Text>
        <Text style={styles.valueLabel}>{priceLabel(value)}</Text>
        <Text style={styles.edgeLabel}>{priceLabel(PRICE_MAX)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  area: {
    height: theme.spacing.sliderArea,
    justifyContent: 'center',
  },
  // Os filhos não recebem o toque: assim a posição é sempre medida na barra inteira
  track: {
    backgroundColor: theme.colors.divider,
    borderRadius: theme.radius.round,
    height: theme.spacing.sliderTrack,
    pointerEvents: 'none',
  },
  fill: {
    backgroundColor: theme.colors.button,
    borderRadius: theme.radius.round,
    height: theme.spacing.sliderTrack,
    left: 0,
    pointerEvents: 'none',
    position: 'absolute',
  },
  thumb: {
    backgroundColor: theme.colors.button,
    borderColor: theme.colors.white,
    borderRadius: theme.radius.round,
    borderWidth: 3,
    boxShadow: theme.shadow.soft,
    height: theme.spacing.sliderThumb,
    pointerEvents: 'none',
    position: 'absolute',
    width: theme.spacing.sliderThumb,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  edgeLabel: {
    color: theme.colors.button,
    fontFamily: theme.fonts.medium,
    fontSize: theme.typography.caption,
  },
  valueLabel: {
    color: theme.colors.title,
    fontFamily: theme.fonts.bold,
    fontSize: theme.typography.body,
  },
});
