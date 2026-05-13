import React, { useEffect, useState } from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedReaction,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

interface Props {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  style?: StyleProp<TextStyle>;
}

export function AnimatedNumber({
  value,
  duration = 900,
  decimals = 0,
  prefix = '',
  suffix = '',
  style,
}: Props) {
  const progress = useSharedValue(0);
  const [display, setDisplay] = useState(value);
  const [from, setFrom] = useState(0);

  useEffect(() => {
    setFrom(display);
    progress.value = 0;
    progress.value = withTiming(1, { duration, easing: Easing.out(Easing.cubic) });
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  useAnimatedReaction(
    () => progress.value,
    (p) => {
      const next = from + (value - from) * p;
      runOnJS(setDisplay)(next);
    },
    [value, from]
  );

  const formatted =
    decimals > 0 ? display.toFixed(decimals) : Math.round(display).toString();

  return (
    <Animated.Text style={style as any}>
      {prefix}
      {formatted}
      {suffix}
    </Animated.Text>
  );
}
