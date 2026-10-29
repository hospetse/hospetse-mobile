import { useEffect, useRef } from 'react';
import { Animated, DimensionValue, StyleProp, ViewStyle } from 'react-native';

import { theme } from '../constants/theme';

type SkeletonProps = {
  width: DimensionValue;
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

// Bloco que pulsa no lugar de um conteúdo que ainda está carregando
export function Skeleton({ width, height, radius = theme.radius.input, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { backgroundColor: theme.colors.skeleton, borderRadius: radius, height, opacity, width },
        style,
      ]}
    />
  );
}
