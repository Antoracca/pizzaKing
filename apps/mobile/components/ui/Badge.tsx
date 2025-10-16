import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'outline';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  style,
}: BadgeProps) {
  const variantStyles: Record<string, ViewStyle> = {
    default: { backgroundColor: COLORS.primary },
    success: { backgroundColor: COLORS.success },
    error: { backgroundColor: COLORS.error },
    warning: { backgroundColor: COLORS.warning },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: COLORS.border,
    },
  };

  const textVariantStyles = {
    default: { color: COLORS.white },
    success: { color: COLORS.white },
    error: { color: COLORS.white },
    warning: { color: COLORS.white },
    outline: { color: COLORS.textSecondary },
  };

  const sizeStyles = {
    sm: { paddingHorizontal: SPACING.sm, paddingVertical: 2 },
    md: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs },
  };

  const textSizeStyles = {
    sm: { fontSize: TYPOGRAPHY.xs },
    md: { fontSize: TYPOGRAPHY.sm },
  };

  return (
    <View
      style={[styles.badge, variantStyles[variant], sizeStyles[size], style]}
    >
      <Text
        style={[styles.text, textVariantStyles[variant], textSizeStyles[size]]}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: TYPOGRAPHY.medium,
  },
});
