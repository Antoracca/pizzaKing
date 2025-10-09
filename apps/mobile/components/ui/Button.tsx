import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export default function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
}: ButtonProps) {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: RADIUS.xl,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.sm,
    };

    // Size styles
    const sizeStyles: Record<string, ViewStyle> = {
      sm: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm },
      md: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
      lg: { paddingHorizontal: SPACING['2xl'], paddingVertical: SPACING.lg },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...(fullWidth && { width: '100%' }),
      ...(disabled && { opacity: 0.5 }),
    };
  };

  const getTextStyle = (): TextStyle => {
    const sizeStyles: Record<string, TextStyle> = {
      sm: { fontSize: TYPOGRAPHY.sm },
      md: { fontSize: TYPOGRAPHY.base },
      lg: { fontSize: TYPOGRAPHY.lg },
    };

    const variantStyles: Record<string, TextStyle> = {
      primary: { color: COLORS.white, fontWeight: TYPOGRAPHY.semibold },
      secondary: { color: COLORS.white, fontWeight: TYPOGRAPHY.semibold },
      outline: { color: COLORS.primary, fontWeight: TYPOGRAPHY.semibold },
      ghost: { color: COLORS.textPrimary, fontWeight: TYPOGRAPHY.medium },
    };

    return {
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const renderContent = () => (
    <>
      {loading && <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.white} />}
      {!loading && icon && icon}
      {typeof children === 'string' ? (
        <Text style={getTextStyle()}>{children}</Text>
      ) : (
        children
      )}
    </>
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={style}
      >
        <LinearGradient
          colors={[COLORS.orangeStart, COLORS.orangeEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[getButtonStyle(), SHADOWS.orangeGlow]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={style}
      >
        <View style={[getButtonStyle(), { backgroundColor: COLORS.textPrimary }, SHADOWS.md]}>
          {renderContent()}
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[getButtonStyle(), { borderWidth: 2, borderColor: COLORS.primary, backgroundColor: COLORS.white }, style]}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  // Ghost variant
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.6}
      style={[getButtonStyle(), style]}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}
