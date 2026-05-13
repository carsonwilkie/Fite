import React from 'react';
import { ViewStyle, TextStyle } from 'react-native';
import { GradientButton } from './GradientButton';

// Back-compat shim. Old call sites use <Button variant="ghost|primary|gold|danger" />.
// We map straight through to the slick GradientButton.
interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'gold' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
}

export function Button(props: ButtonProps) {
  return <GradientButton {...props} />;
}
