import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  SHADOWS,
} from '@/constants/theme';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';
import { SafeAreaView } from 'react-native-safe-area-context';
import useCartStore from '@/store/useCartStore';
import FloatingCartButton from '@/components/cart/FloatingCartButton';

const allPizzas = [
  {
    id: '1',
    name: 'Margherita Royale',
    description: 'Tomates San Marzano, mozzarella di bufala',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
    price: 12000,
    rating: 4.8,
    category: 'vegetarian',
    isPopular: true,
    isVegetarian: true,
    prepTime: '15-20',
  },
  {
    id: '2',
    name: 'BBQ Chicken',
    description: 'Poulet grillé, sauce BBQ, oignons rouges',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    price: 13500,
    rating: 4.9,
    category: 'meat',
    isPopular: true,
    prepTime: '20-25',
  },
  {
    id: '3',
    name: '4 Fromages',
    description: 'Mozzarella, gorgonzola, parmesan, chèvre',
    image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400',
    price: 14000,
    rating: 4.7,
    category: 'vegetarian',
    isVegetarian: true,
    prepTime: '15-20',
  },
  {
    id: '4',
    name: 'Pepperoni',
    description: 'Pepperoni épicé, mozzarella, origan',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400',
    price: 11500,
    rating: 4.6,
    category: 'meat',
    isSpicy: true,
    prepTime: '15-20',
  },
  {
    id: '5',
    name: 'Végétarienne',
    description: 'Légumes grillés, mozzarella, pesto',
    image: 'https://images.unsplash.com/photo-1511689660979-10d2b1aada49?w=400',
    price: 12500,
    rating: 4.5,
    category: 'vegetarian',
    isVegetarian: true,
    prepTime: '15-20',
  },
  {
    id: '6',
    name: 'Hawai',
    description: 'Jambon, ananas, mozzarella',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400',
    price: 13000,
    rating: 4.3,
    category: 'meat',
    prepTime: '18-22',
  },
];

const categories = [
  { id: 'all', name: 'Tout', icon: '🍕' },
  { id: 'popular', name: 'Populaires', icon: '🔥' },
  { id: 'vegetarian', name: 'Végé', icon: '🥬' },
  { id: 'meat', name: 'Viandes', icon: '🍖' },
  { id: 'spicy', name: 'Épicées', icon: '🌶️' },
];

export default function MenuScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const router = useRouter();
  const addItemToCart = useCartStore(state => state.addItem);

  const filteredPizzas = useMemo(
    () =>
      allPizzas.filter(pizza => {
        const matchesSearch = pizza.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesCategory =
          selectedCategory === 'all' ||
          (selectedCategory === 'popular' && pizza.isPopular) ||
          (selectedCategory === 'vegetarian' && pizza.isVegetarian) ||
          (selectedCategory === 'meat' && pizza.category === 'meat') ||
          (selectedCategory === 'spicy' && pizza.isSpicy);
        return matchesSearch && matchesCategory;
      }),
    [searchQuery, selectedCategory]
  );

  const handleAddToCart = (
    pizza: (typeof allPizzas)[0],
    shouldOpenCart = false
  ) => {
    addItemToCart({
      productId: pizza.id,
      name: pizza.name,
      image: pizza.image,
      description: pizza.description,
      price: pizza.price,
      category: pizza.category,
      metadata: {
        rating: pizza.rating,
        prepTime: pizza.prepTime,
      },
    });

    if (shouldOpenCart) {
      router.push('/(tabs)/cart');
    }
  };

  const renderPizzaCard = ({ item }: { item: (typeof allPizzas)[0] }) => {
    if (viewMode === 'grid') {
      return (
        <TouchableOpacity style={styles.gridCard} activeOpacity={0.9}>
          <Card style={styles.pizzaGridCard} shadow="md" noPadding>
            <Image source={{ uri: item.image }} style={styles.gridImage} />

            <View style={styles.gridBadges}>
              {item.isPopular && (
                <Badge variant="error" size="sm">
                  🔥
                </Badge>
              )}
              {item.isVegetarian && (
                <Badge variant="success" size="sm">
                  🥬
                </Badge>
              )}
              {item.isSpicy && (
                <Badge variant="warning" size="sm">
                  🌶️
                </Badge>
              )}
            </View>

            <TouchableOpacity style={styles.gridFavorite}>
              <Ionicons
                name="heart-outline"
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>

            <View style={styles.gridContent}>
              <Text style={styles.gridName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.gridDescription} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.gridFooter}>
                <View>
                  <Text style={styles.gridPrice}>
                    {formatPrice(item.price)}
                  </Text>
                  <View style={styles.gridRating}>
                    <Ionicons name="star" size={14} color={COLORS.warning} />
                    <Text style={styles.gridRatingText}>{item.rating}</Text>
                  </View>
                </View>

                <View style={styles.gridActions}>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => handleAddToCart(item)}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={[COLORS.orangeStart, COLORS.orangeEnd]}
                      style={styles.addGradient}
                    >
                      <Ionicons name="add" size={16} color={COLORS.white} />
                      <Text style={styles.addButtonText}>Ajouter</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.orderButton}
                    onPress={() => handleAddToCart(item, true)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.orderButtonText}>Commander</Text>
                    <Ionicons
                      name="arrow-forward"
                      size={16}
                      color={COLORS.primary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      );
    }

    // List view
    return (
      <TouchableOpacity style={styles.listCard} activeOpacity={0.9}>
        <Card style={styles.pizzaListCard} shadow="md" noPadding>
          <View style={styles.listContent}>
            <Image source={{ uri: item.image }} style={styles.listImage} />

            <View style={styles.listDetails}>
              <Text style={styles.listName}>{item.name}</Text>
              <Text style={styles.listDescription} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.listBadges}>
                {item.isPopular && (
                  <Badge variant="error" size="sm">
                    🔥 Populaire
                  </Badge>
                )}
                {item.isVegetarian && (
                  <Badge variant="success" size="sm">
                    🥬 Végé
                  </Badge>
                )}
              </View>

              <View style={styles.listFooter}>
                <View>
                  <View style={styles.listRating}>
                    <Ionicons name="star" size={14} color={COLORS.warning} />
                    <Text style={styles.listRatingText}>{item.rating}</Text>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={COLORS.textSecondary}
                      style={{ marginLeft: SPACING.md }}
                    />
                    <Text style={styles.listTime}>{item.prepTime} min</Text>
                  </View>
                  <Text style={styles.listPrice}>
                    {formatPrice(item.price)}
                  </Text>
                </View>

                <View style={styles.listActions}>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => handleAddToCart(item)}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={[COLORS.orangeStart, COLORS.orangeEnd]}
                      style={styles.addGradient}
                    >
                      <Ionicons name="add" size={16} color={COLORS.white} />
                      <Text style={styles.addButtonText}>Ajouter</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.orderButton}
                    onPress={() => handleAddToCart(item, true)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.orderButtonText}>Commander</Text>
                    <Ionicons
                      name="arrow-forward"
                      size={16}
                      color={COLORS.primary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notre Menu</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.viewModeButton}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            <Ionicons
              name={viewMode === 'grid' ? 'list' : 'grid'}
              size={22}
              color={COLORS.textPrimary}
            />
          </TouchableOpacity>
        </View>
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
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons
              name="close-circle"
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            onPress={() => setSelectedCategory(category.id)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive,
              ]}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive,
                ]}
              >
                {category.name}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredPizzas.length} pizza{filteredPizzas.length > 1 ? 's' : ''}{' '}
          disponible{filteredPizzas.length > 1 ? 's' : ''}
        </Text>
      </View>

      {/* Pizza List/Grid */}
      <FlatList
        data={filteredPizzas}
        renderItem={renderPizzaCard}
        keyExtractor={item => item.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode}
        contentContainerStyle={styles.pizzaList}
        showsVerticalScrollIndicator={false}
      />
      <FloatingCartButton />
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
  headerRight: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  viewModeButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.base,
    color: COLORS.textPrimary,
  },
  categoriesContainer: {
    marginBottom: SPACING.md,
  },
  categoriesContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    gap: SPACING.xs,
    ...SHADOWS.sm,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryIcon: {
    fontSize: 18,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  resultsHeader: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  resultsText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  pizzaList: {
    padding: SPACING.lg,
    paddingBottom: SPACING['6xl'],
  },

  // Grid styles
  gridCard: {
    flex: 1,
    margin: SPACING.xs,
  },
  pizzaGridCard: {
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  gridBadges: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    flexDirection: 'column',
    gap: SPACING.xs,
  },
  gridFavorite: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContent: {
    padding: SPACING.md,
  },
  gridName: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  gridDescription: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: TYPOGRAPHY.lineHeightNormal * TYPOGRAPHY.xs,
  },
  gridFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  gridPrice: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  gridRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  gridRatingText: {
    fontSize: TYPOGRAPHY.xs,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
  },
  gridActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  addButton: {
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  addGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    height: 36,
    borderRadius: RADIUS.full,
  },
  addButtonText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.white,
  },
  orderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  orderButtonText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.primary,
  },

  // List styles
  listCard: {
    marginBottom: SPACING.md,
  },
  pizzaListCard: {
    overflow: 'hidden',
  },
  listContent: {
    flexDirection: 'row',
  },
  listImage: {
    width: 120,
    height: 140,
    resizeMode: 'cover',
  },
  listDetails: {
    flex: 1,
    padding: SPACING.md,
  },
  listName: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  listDescription: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: TYPOGRAPHY.lineHeightNormal * TYPOGRAPHY.sm,
  },
  listBadges: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  listFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  listRatingText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.textPrimary,
  },
  listTime: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
  },
  listPrice: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  listActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
});
