import React from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import { GlassCard } from './GlassCard';

// Back-compat shim mapping to the new GlassCard.
interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  glow?: boolean;
  gold?: boolean;
  noPad?: boolean;
}

export function Card({ children, style, glow, gold, noPad }: CardProps) {
  return (
    <GlassCard
      style={style}
      glow={!!glow}
      accent={gold ? 'gold' : 'ghost'}
      padding={noPad ? 0 : 16}
      animate={false}
    >
      {children}
    </GlassCard>
  );
}
