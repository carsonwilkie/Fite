import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, Image, ImageSourcePropType } from 'react-native';
import { Colors, Typography } from '../theme';

// Real brand assets — copied from the website's /public/Logo folder.
const LOGO_STANDARD: ImageSourcePropType = require('../../assets/fite-logo.png');
const LOGO_PREMIUM: ImageSourcePropType = require('../../assets/fite-logo-premium.png');

interface Props {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  premium?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function BrandLogo({ size = 'md', showText = true, premium, style }: Props) {
  const dim = size === 'sm' ? 28 : size === 'md' ? 38 : 52;
  const fontSize = size === 'sm' ? 16 : size === 'md' ? 19 : 24;

  return (
    <View style={[styles.row, style]}>
      <View
        style={[
          styles.markWrap,
          { width: dim, height: dim },
          { shadowColor: premium ? Colors.gold : Colors.secondary },
        ]}
      >
        <Image
          source={premium ? LOGO_PREMIUM : LOGO_STANDARD}
          style={{ width: dim, height: dim }}
          resizeMode="contain"
        />
      </View>
      {showText && (
        <View style={{ marginLeft: 10 }}>
          <Text style={[styles.brand, { fontSize }]}>
            <Text style={{ color: premium ? Colors.gold : Colors.primary }}>Fite</Text>
            <Text style={{ color: premium ? Colors.goldLight : Colors.secondary }}> Finance</Text>
          </Text>
          {premium && <Text style={styles.premium}>PREMIUM</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  markWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 8,
  },
  brand: {
    color: Colors.text,
    fontFamily: Typography.fonts.displayExtra,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  premium: {
    color: Colors.gold,
    fontFamily: Typography.fonts.display,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2.5,
    marginTop: -2,
  },
});
