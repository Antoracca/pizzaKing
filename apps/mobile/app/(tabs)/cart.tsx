import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  SHADOWS,
} from '@/constants/theme';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import useCartStore, {
  selectCartItems,
  selectCartSubtotal,
  selectItemCount,
} from '@/store/useCartStore';

export default function CartScreen() {
  const router = useRouter();
  const items = useCartStore(selectCartItems);
  const itemCount = useCartStore(selectItemCount);
  const subtotal = useCartStore(selectCartSubtotal);
  const removeItem = useCartStore(state => state.removeItem);
  const updateQuantity = useCartStore(state => state.updateQuantity);

  const deliveryFee = subtotal >= 10000 ? 0 : 1000;
  const total = subtotal + deliveryFee;

  const deliveryProgress = Math.min((subtotal / 10000) * 100, 100);

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mon Panier</Text>
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="cart-outline"
              size={80}
              color={COLORS.textTertiary}
            />
          </View>
          <Text style={styles.emptyTitle}>Votre panier est vide</Text>
          <Text style={styles.emptySubtitle}>
            Ajoutez des pizzas pour commencer
          </Text>
          <Button
            style={{ marginTop: SPACING.xl }}
            onPress={() => router.push('/(tabs)/menu')}
          >
            <Ionicons name="pizza" size={20} color={COLORS.white} />
            Voir le Menu
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon Panier</Text>
        <Badge variant="default">{itemCount}</Badge>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Items */}
        <View style={styles.section}>
          {items.map(item => (
            <Card key={item.uid} style={styles.itemCard} shadow="md">
              <View style={styles.itemContent}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />

                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {(item.sizeLabel || item.crustLabel) && (
                    <View style={styles.itemBadges}>
                      {item.sizeLabel && (
                        <Badge variant="outline" size="sm">
                          {item.sizeLabel}
                        </Badge>
                      )}
                      {item.crustLabel && (
                        <Badge variant="outline" size="sm">
                          {item.crustLabel}
                        </Badge>
                      )}
                    </View>
                  )}
                  {item.extras.length > 0 && (
                    <Text style={styles.itemExtras} numberOfLines={1}>
                      + {item.extras.join(', ')}
                    </Text>
                  )}

                  <View style={styles.itemFooter}>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        onPress={() =>
                          updateQuantity(item.uid, item.quantity - 1)
                        }
                        style={styles.quantityButton}
                      >
                        <Ionicons
                          name="remove"
                          size={16}
                          color={COLORS.primary}
                        />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity
                        onPress={() =>
                          updateQuantity(item.uid, item.quantity + 1)
                        }
                        style={styles.quantityButton}
                      >
                        <Ionicons name="add" size={16} color={COLORS.primary} />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.itemPrice}>
                      {formatPrice(item.unitPrice * item.quantity)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => removeItem(item.uid)}
                  style={styles.removeButton}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={COLORS.error}
                  />
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>

        {/* Free Delivery Progress */}
        {deliveryFee > 0 && (
          <View style={styles.section}>
            <Card style={styles.deliveryCard}>
              <View style={styles.deliveryHeader}>
                <Ionicons name="bicycle" size={24} color={COLORS.primary} />
                <Text style={styles.deliveryText}>
                  Ajoutez {formatPrice(10000 - subtotal)} pour la livraison
                  gratuite
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${deliveryProgress}%` },
                  ]}
                />
              </View>
            </Card>
          </View>
        )}

        {/* Promo Code */}
        <View style={styles.section}>
          <Card>
            <View style={styles.promoHeader}>
              <Ionicons name="pricetag" size={20} color={COLORS.primary} />
              <Text style={styles.promoTitle}>Code promo</Text>
            </View>
            <View style={styles.promoInput}>
              <Ionicons
                name="ticket-outline"
                size={20}
                color={COLORS.textSecondary}
              />
              <Text style={styles.promoInputText}>Entrer un code promo</Text>
              <TouchableOpacity>
                <Text style={styles.promoApply}>Appliquer</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Card>
            <Text style={styles.summaryTitle}>Récapitulatif</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Sous-total</Text>
              <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Livraison</Text>
              {deliveryFee === 0 ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: SPACING.xs,
                  }}
                >
                  <Badge variant="success" size="sm">
                    Gratuit
                  </Badge>
                  <Text
                    style={[styles.summaryValue, { color: COLORS.success }]}
                  >
                    0 FCFA
                  </Text>
                </View>
              ) : (
                <Text style={styles.summaryValue}>
                  {formatPrice(deliveryFee)}
                </Text>
              )}
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>{formatPrice(total)}</Text>
            </View>
          </Card>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <LinearGradient
          colors={['rgba(255,255,255,0)', COLORS.white]}
          style={styles.bottomGradient}
        />
        <View style={styles.bottomContent}>
          <View>
            <Text style={styles.bottomLabel}>Total</Text>
            <Text style={styles.bottomTotal}>{formatPrice(total)}</Text>
          </View>
          <Button size="lg" style={{ flex: 1 }}>
            Commander
            <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY['3xl'],
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: {
    width: 160,
    height: 160,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // Item card
  itemCard: {
    marginBottom: SPACING.md,
    padding: 0,
  },
  itemContent: {
    flexDirection: 'row',
    padding: SPACING.md,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.md,
    resizeMode: 'cover',
  },
  itemDetails: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  itemName: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  itemBadges: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  itemExtras: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
    padding: 2,
  },
  quantityButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.white,
  },
  quantityText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.md,
  },
  itemPrice: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.primary,
  },
  removeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.errorLight,
    marginLeft: SPACING.sm,
  },

  // Delivery progress
  deliveryCard: {
    backgroundColor: COLORS.backgroundTertiary,
  },
  deliveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  deliveryText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.medium,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.borderLight,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
  },

  // Promo
  promoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  promoTitle: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
  },
  promoInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  promoInputText: {
    flex: 1,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
  },
  promoApply: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.primary,
  },

  // Summary
  summaryTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.textPrimary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  summaryTotalLabel: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  summaryTotalValue: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.primary,
  },

  // Bottom
  bottomContainer: {
    position: 'relative',
  },
  bottomGradient: {
    position: 'absolute',
    top: -40,
    left: 0,
    right: 0,
    height: 40,
  },
  bottomContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    ...SHADOWS.xl,
  },
  bottomLabel: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  bottomTotal: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.primary,
  },
});
