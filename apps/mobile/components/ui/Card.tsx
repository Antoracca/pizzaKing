import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  shadow?: 'sm' | 'md' | 'lg' | 'xl';
  noPadding?: boolean;
}

export default function Card({ children, style, shadow = 'md', noPadding = false }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        SHADOWS[shadow],
        !noPadding && styles.padding,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  padding: {
    padding: SPACING.lg,
  },
});
