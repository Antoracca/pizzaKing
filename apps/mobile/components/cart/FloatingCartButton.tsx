import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '@/constants/theme';
import { formatPrice } from '@/lib/utils';
import useCartStore, {
  selectCartSubtotal,
  selectItemCount,
  selectLastAddedItemId,
} from '@/store/useCartStore';

const FloatingCartButton = () => {
  const router = useRouter();
  const itemCount = useCartStore(selectItemCount);
  const subtotal = useCartStore(selectCartSubtotal);
  const lastAddedItemId = useCartStore(selectLastAddedItemId);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = useState(false);
  const opacity = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    if (itemCount > 0) {
      setIsVisible(true);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
      }).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setIsVisible(false);
      });
    }
  }, [itemCount, scaleAnim]);

  useEffect(() => {
    if (!lastAddedItemId || itemCount === 0) {
      return;
    }

    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.08,
        useNativeDriver: true,
        friction: 6,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 7,
      }),
    ]).start();
  }, [lastAddedItemId, scaleAnim, itemCount]);

  if (!isVisible) {
    return null;
  }

  const handlePress = () => {
    router.push('/(tabs)/cart');
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ scale: scaleAnim }],
        },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.orangeEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <View style={styles.content}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{itemCount}</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.label}>Voir mon panier</Text>
              <Text style={styles.amount}>{formatPrice(subtotal)}</Text>
            </View>
            <Ionicons name="cart" size={20} color={COLORS.white} />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING['4xl'],
    zIndex: 10,
  },
  button: {
    borderRadius: RADIUS['2xl'],
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    ...SHADOWS.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.primary,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.white,
    marginBottom: 2,
  },
  amount: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.white,
  },
});

export default FloatingCartButton;
