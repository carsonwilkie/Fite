import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme';

/**
 * Overlays a soft gradient at the top (and optionally bottom) of a ScrollView
 * so content fades behind the status bar / tab bar instead of slicing off
 * at a hard edge.
 *
 * Renders absolutely positioned — drop in as a sibling of the ScrollView
 * inside a flex container.
 */
export function ScrollFade({
  top = 36,
  bottom = 0,
  color = Colors.bg,
  pointerEvents = 'none',
}: {
  top?: number;
  bottom?: number;
  color?: string;
  pointerEvents?: 'none' | 'auto';
}) {
  return (
    <>
      {top > 0 && (
        <LinearGradient
          colors={[color, color + 'cc', 'transparent']}
          locations={[0, 0.55, 1]}
          pointerEvents={pointerEvents}
          style={[styles.top, { height: top }]}
        />
      )}
      {bottom > 0 && (
        <LinearGradient
          colors={['transparent', color + 'cc', color]}
          locations={[0, 0.45, 1]}
          pointerEvents={pointerEvents}
          style={[styles.bottom, { height: bottom }]}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  top: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 50,
  },
  bottom: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    zIndex: 50,
  },
});
