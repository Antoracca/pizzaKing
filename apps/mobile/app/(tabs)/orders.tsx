import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatPrice, formatTimeAgo } from '@/lib/utils';

const orders = [
  {
    id: '1',
    orderNumber: 'PK20251007001',
    date: new Date('2025-10-07T10:30:00'),
    status: 'on_route',
    items: 2,
    total: 25500,
    pizzas: [
      { name: 'Margherita Royale', quantity: 2, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400' },
      { name: 'BBQ Chicken', quantity: 1, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400' },
    ],
    deliveryAddress: '123 Rue de Ouagadougou, Burkina Faso',
    estimatedTime: '25 min',
    deliverer: {
      name: 'Ibrahim Ouédraogo',
      phone: '+226 70 12 34 56',
      rating: 4.8,
    },
  },
  {
    id: '2',
    orderNumber: 'PK20251005002',
    date: new Date('2025-10-05T18:45:00'),
    status: 'delivered',
    items: 1,
    total: 12000,
    pizzas: [
      { name: '4 Fromages', quantity: 1, image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400' },
    ],
  },
  {
    id: '3',
    orderNumber: 'PK20251003003',
    date: new Date('2025-10-03T14:20:00'),
    status: 'cancelled',
    items: 3,
    total: 37500,
    pizzas: [
      { name: 'Pepperoni', quantity: 2, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400' },
      { name: 'Végétarienne', quantity: 1, image: 'https://images.unsplash.com/photo-1511689660979-10d2b1aada49?w=400' },
    ],
  },
];

const statusConfig = {
  pending: { label: 'En attente', color: COLORS.warning, icon: 'time-outline' },
  confirmed: { label: 'Confirmée', color: COLORS.info, icon: 'checkmark-circle' },
  preparing: { label: 'En préparation', color: COLORS.primary, icon: 'restaurant' },
  ready: { label: 'Prête', color: COLORS.success, icon: 'checkmark-done' },
  on_route: { label: 'En route', color: COLORS.info, icon: 'bicycle' },
  delivered: { label: 'Livrée', color: COLORS.success, icon: 'checkmark-done-circle' },
  cancelled: { label: 'Annulée', color: COLORS.error, icon: 'close-circle' },
};

export default function OrdersScreen() {
  const [selectedTab, setSelectedTab] = useState<'active' | 'history'>('active');

  const activeOrders = orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready', 'on_route'].includes(o.status));
  const historyOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));

  const displayOrders = selectedTab === 'active' ? activeOrders : historyOrders;

  const renderOrderCard = (order: typeof orders[0]) => {
    const config = statusConfig[order.status as keyof typeof statusConfig];

    return (
      <TouchableOpacity key={order.id} activeOpacity={0.9}>
        <Card style={styles.orderCard} shadow="md">
          {/* Header */}
          <View style={styles.orderHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
              <Text style={styles.orderDate}>{formatTimeAgo(order.date)}</Text>
            </View>
            <Badge
              variant={
                order.status === 'delivered'
                  ? 'success'
                  : order.status === 'cancelled'
                  ? 'error'
                  : 'default'
              }
            >
              <Ionicons name={config.icon as any} size={14} color={COLORS.white} />
              {' '}{config.label}
            </Badge>
          </View>

          {/* Pizzas */}
          <View style={styles.orderPizzas}>
            {order.pizzas.map((pizza, index) => (
              <View key={index} style={styles.pizzaItem}>
                <Image source={{ uri: pizza.image }} style={styles.pizzaImage} />
                <View style={styles.pizzaInfo}>
                  <Text style={styles.pizzaName}>{pizza.name}</Text>
                  <Text style={styles.pizzaQuantity}>x{pizza.quantity}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Active order details */}
          {order.status === 'on_route' && order.deliverer && (
            <View style={styles.trackingSection}>
              <LinearGradient
                colors={[COLORS.backgroundSecondary, COLORS.white]}
                style={styles.trackingGradient}
              >
                <View style={styles.delivererInfo}>
                  <View style={styles.delivererAvatar}>
                    <Ionicons name="person" size={24} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.delivererName}>{order.deliverer.name}</Text>
                    <View style={styles.delivererRating}>
                      <Ionicons name="star" size={14} color={COLORS.warning} />
                      <Text style={styles.delivererRatingText}>{order.deliverer.rating}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.callButton}>
                    <Ionicons name="call" size={20} color={COLORS.white} />
                  </TouchableOpacity>
                </View>

                <View style={styles.etaContainer}>
                  <Ionicons name="time-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.etaText}>Arrivée estimée: {order.estimatedTime}</Text>
                </View>

                <View style={styles.trackingProgress}>
                  {['confirmed', 'preparing', 'ready', 'on_route', 'delivered'].map((step, index) => (
                    <View key={step} style={styles.trackingStep}>
                      <View
                        style={[
                          styles.trackingDot,
                          orders[0].status === step && styles.trackingDotActive,
                        ]}
                      >
                        {index <= 3 && <View style={styles.trackingDotInner} />}
                      </View>
                      {index < 4 && (
                        <View
                          style={[
                            styles.trackingLine,
                            index < 3 && styles.trackingLineActive,
                          ]}
                        />
                      )}
                    </View>
                  ))}
                </View>
              </LinearGradient>
            </View>
          )}

          {/* Footer */}
          <View style={styles.orderFooter}>
            <View>
              <Text style={styles.orderItems}>{order.items} article{order.items > 1 ? 's' : ''}</Text>
              <Text style={styles.orderTotal}>{formatPrice(order.total)}</Text>
            </View>

            {order.status === 'on_route' && (
              <Button size="sm">
                <Ionicons name="map-outline" size={16} color={COLORS.white} />
                Suivre
              </Button>
            )}
            {order.status === 'delivered' && (
              <Button size="sm" variant="outline">
                Recommander
              </Button>
            )}
            {(order.status === 'pending' || order.status === 'confirmed') && (
              <Button size="sm" variant="outline">
                <Ionicons name="close" size={16} color={COLORS.primary} />
                Annuler
              </Button>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Commandes</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          onPress={() => setSelectedTab('active')}
          style={[styles.tab, selectedTab === 'active' && styles.tabActive]}
        >
          <Text style={[styles.tabText, selectedTab === 'active' && styles.tabTextActive]}>
            En cours ({activeOrders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedTab('history')}
          style={[styles.tab, selectedTab === 'history' && styles.tabActive]}
        >
          <Text style={[styles.tabText, selectedTab === 'history' && styles.tabTextActive]}>
            Historique ({historyOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      <ScrollView style={styles.ordersList} showsVerticalScrollIndicator={false}>
        {displayOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name={selectedTab === 'active' ? 'receipt-outline' : 'time-outline'}
                size={60}
                color={COLORS.textTertiary}
              />
            </View>
            <Text style={styles.emptyTitle}>
              {selectedTab === 'active' ? 'Aucune commande en cours' : 'Aucun historique'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {selectedTab === 'active'
                ? 'Passez votre première commande'
                : 'Vos commandes passées apparaîtront ici'}
            </Text>
          </View>
        ) : (
          <View style={styles.ordersContent}>
            {displayOrders.map(renderOrderCard)}
          </View>
        )}
        <View style={{ height: SPACING['6xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY['3xl'],
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.white,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.white,
  },

  // Orders list
  ordersList: {
    flex: 1,
  },
  ordersContent: {
    paddingHorizontal: SPACING.lg,
  },

  // Order card
  orderCard: {
    marginBottom: SPACING.lg,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  orderNumber: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  orderDate: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },

  // Pizzas
  orderPizzas: {
    marginBottom: SPACING.md,
  },
  pizzaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  pizzaImage: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.md,
    resizeMode: 'cover',
  },
  pizzaInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pizzaName: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.textPrimary,
  },
  pizzaQuantity: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },

  // Tracking section
  trackingSection: {
    marginHorizontal: -SPACING.lg,
    marginBottom: SPACING.md,
  },
  trackingGradient: {
    padding: SPACING.lg,
  },
  delivererInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  delivererAvatar: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  delivererName: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  delivererRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  delivererRatingText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.textPrimary,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
  },
  etaText: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
  },
  trackingProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackingStep: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackingDot: {
    width: 12,
    height: 12,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackingDotActive: {
    backgroundColor: COLORS.primary,
    width: 16,
    height: 16,
  },
  trackingDotInner: {
    width: 6,
    height: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
  },
  trackingLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.borderDark,
  },
  trackingLineActive: {
    backgroundColor: COLORS.primary,
  },

  // Footer
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  orderItems: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  orderTotal: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.primary,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['6xl'],
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
