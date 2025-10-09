import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';

const { width } = Dimensions.get('window');

const featuredPizzas = [
  {
    id: '1',
    name: 'Margherita Royale',
    description: 'Tomates San Marzano, mozzarella di bufala, basilic frais',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
    price: 12000,
    rating: 4.8,
    prepTime: '15-20 min',
    isPopular: true,
    isVegetarian: true,
  },
  {
    id: '2',
    name: 'BBQ Chicken',
    description: 'Poulet grillé, sauce BBQ, oignons rouges, coriandre',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    price: 13500,
    rating: 4.9,
    prepTime: '20-25 min',
    isPopular: true,
    isSpicy: false,
  },
  {
    id: '3',
    name: '4 Fromages',
    description: 'Mozzarella, gorgonzola, parmesan, chèvre',
    image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400',
    price: 14000,
    rating: 4.7,
    prepTime: '15-20 min',
    isVegetarian: true,
  },
];

const categories = [
  { id: '1', name: 'Populaires', icon: '🔥' },
  { id: '2', name: 'Végétariennes', icon: '🥬' },
  { id: '3', name: 'Viandes', icon: '🍖' },
  { id: '4', name: 'Épicées', icon: '🌶️' },
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.orangeStart, COLORS.orangeEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Bonjour 👋</Text>
            <Text style={styles.headerTitle}>Jean Dupont</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une pizza..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard} shadow="lg">
          <View style={styles.statIconContainer}>
            <Ionicons name="star" size={24} color={COLORS.warning} />
          </View>
          <Text style={styles.statValue}>4.9</Text>
          <Text style={styles.statLabel}>Note moyenne</Text>
        </Card>

        <Card style={styles.statCard} shadow="lg">
          <View style={[styles.statIconContainer, { backgroundColor: COLORS.successLight }]}>
            <Ionicons name="time-outline" size={24} color={COLORS.success} />
          </View>
          <Text style={styles.statValue}>25 min</Text>
          <Text style={styles.statLabel}>Livraison</Text>
        </Card>

        <Card style={styles.statCard} shadow="lg">
          <View style={[styles.statIconContainer, { backgroundColor: COLORS.infoLight }]}>
            <Ionicons name="pricetag-outline" size={24} color={COLORS.info} />
          </View>
          <Text style={styles.statValue}>-20%</Text>
          <Text style={styles.statLabel}>Promo</Text>
        </Card>
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Catégories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {categories.map(category => (
            <TouchableOpacity key={category.id} style={styles.categoryCard} activeOpacity={0.7}>
              <Card style={styles.categoryCardInner} shadow="sm">
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={styles.categoryName}>{category.name}</Text>
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Promo Banner */}
      <View style={styles.section}>
        <TouchableOpacity activeOpacity={0.9}>
          <LinearGradient
            colors={['#FF6B35', '#FF8555', '#FFB088']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.promoBanner}
          >
            <View style={styles.promoContent}>
              <Text style={styles.promoTitle}>Offre Spéciale 🎉</Text>
              <Text style={styles.promoSubtitle}>-20% sur votre première commande</Text>
              <View style={styles.promoCodeContainer}>
                <Text style={styles.promoCode}>WELCOME20</Text>
              </View>
            </View>
            <View style={styles.promoImage}>
              <Text style={styles.promoEmoji}>🍕</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Featured Pizzas */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nos Pizzas</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllLink}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        {featuredPizzas.map((pizza, index) => (
          <TouchableOpacity key={pizza.id} activeOpacity={0.9} style={styles.pizzaCardWrapper}>
            <Card style={styles.pizzaCard} shadow="md">
              <Image source={{ uri: pizza.image }} style={styles.pizzaImage} />

              {/* Badges */}
              <View style={styles.pizzaBadges}>
                {pizza.isPopular && (
                  <Badge variant="error" size="sm">
                    🔥 Populaire
                  </Badge>
                )}
                {pizza.isVegetarian && (
                  <Badge variant="success" size="sm">
                    🥬 Végé
                  </Badge>
                )}
              </View>

              <View style={styles.pizzaContent}>
                <View style={styles.pizzaHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pizzaName}>{pizza.name}</Text>
                    <Text style={styles.pizzaDescription} numberOfLines={2}>
                      {pizza.description}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.favoriteButton}>
                    <Ionicons name="heart-outline" size={22} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.pizzaFooter}>
                  <View style={styles.pizzaInfo}>
                    <View style={styles.pizzaRating}>
                      <Ionicons name="star" size={16} color={COLORS.warning} />
                      <Text style={styles.pizzaRatingText}>{pizza.rating}</Text>
                    </View>
                    <View style={styles.pizzaTime}>
                      <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
                      <Text style={styles.pizzaTimeText}>{pizza.prepTime}</Text>
                    </View>
                  </View>
                  <View style={styles.pizzaPriceContainer}>
                    <Text style={styles.pizzaPrice}>{formatPrice(pizza.price)}</Text>
                    <TouchableOpacity style={styles.addButton}>
                      <LinearGradient
                        colors={[COLORS.orangeStart, COLORS.orangeEnd]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.addButtonGradient}
                      >
                        <Ionicons name="add" size={20} color={COLORS.white} />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom Spacing */}
      <View style={{ height: SPACING['6xl'] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    paddingTop: SPACING['5xl'],
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: RADIUS['2xl'],
    borderBottomRightRadius: RADIUS['2xl'],
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  greeting: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.white,
    opacity: 0.9,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY['3xl'],
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.white,
    marginTop: SPACING.xs,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.error,
    borderRadius: RADIUS.full,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.bold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginTop: -SPACING['3xl'],
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
  },
  section: {
    marginTop: SPACING['2xl'],
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
  },
  seeAllLink: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.semibold,
  },
  categoriesScroll: {
    marginTop: SPACING.lg,
    marginHorizontal: -SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  categoryCard: {
    marginRight: SPACING.md,
  },
  categoryCardInner: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  categoryName: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.textPrimary,
  },
  promoBanner: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontSize: TYPOGRAPHY.xl,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  promoSubtitle: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: SPACING.md,
  },
  promoCodeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  promoCode: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.white,
  },
  promoImage: {
    width: 80,
    height: 80,
  },
  promoEmoji: {
    fontSize: 64,
  },
  pizzaCardWrapper: {
    marginBottom: SPACING.lg,
  },
  pizzaCard: {
    overflow: 'hidden',
    padding: 0,
  },
  pizzaImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  pizzaBadges: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  pizzaContent: {
    padding: SPACING.lg,
  },
  pizzaHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  pizzaName: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  pizzaDescription: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.lineHeightNormal * TYPOGRAPHY.sm,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  pizzaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pizzaInfo: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  pizzaRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  pizzaRatingText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
  },
  pizzaTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  pizzaTimeText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  pizzaPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  pizzaPrice: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.primary,
  },
  addButton: {
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  addButtonGradient: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
