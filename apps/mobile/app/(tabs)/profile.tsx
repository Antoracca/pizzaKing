import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getInitials } from '@/lib/utils';

const menuSections = [
  {
    title: 'Mon compte',
    items: [
      { id: 'profile', label: 'Informations personnelles', icon: 'person-outline', badge: null },
      { id: 'addresses', label: 'Mes adresses', icon: 'location-outline', badge: '2' },
      { id: 'payment', label: 'Moyens de paiement', icon: 'card-outline', badge: null },
      { id: 'favorites', label: 'Mes favoris', icon: 'heart-outline', badge: '8' },
    ],
  },
  {
    title: 'Fidélité & Promos',
    items: [
      { id: 'loyalty', label: 'Programme fidélité', icon: 'star-outline', badge: '250 pts' },
      { id: 'promos', label: 'Codes promo', icon: 'pricetag-outline', badge: '3' },
      { id: 'vouchers', label: 'Mes bons d\'achat', icon: 'ticket-outline', badge: null },
    ],
  },
  {
    title: 'Paramètres',
    items: [
      { id: 'notifications', label: 'Notifications', icon: 'notifications-outline', badge: null },
      { id: 'language', label: 'Langue', icon: 'language-outline', badge: 'Français' },
      { id: 'help', label: 'Aide & Support', icon: 'help-circle-outline', badge: null },
      { id: 'about', label: 'À propos', icon: 'information-circle-outline', badge: null },
    ],
  },
];

const stats = [
  { label: 'Commandes', value: '12', icon: 'receipt', color: COLORS.info },
  { label: 'Points', value: '250', icon: 'star', color: COLORS.warning },
  { label: 'Favoris', value: '8', icon: 'heart', color: COLORS.error },
];

export default function ProfileScreen() {
  const user = {
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@email.com',
    phone: '+226 70 12 34 56',
    memberSince: 'Oct 2024',
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Profile Card */}
        <LinearGradient
          colors={[COLORS.orangeStart, COLORS.orangeEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileHeader}
        >
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[COLORS.white, COLORS.backgroundSecondary]}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {getInitials(user.firstName, user.lastName)}
              </Text>
            </LinearGradient>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.userEmail}>{user.email}</Text>

          <View style={styles.memberBadge}>
            <Ionicons name="shield-checkmark" size={16} color={COLORS.white} />
            <Text style={styles.memberText}>Membre depuis {user.memberSince}</Text>
          </View>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <Card key={index} style={styles.statCard} shadow="lg">
              <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                <Ionicons name={stat.icon as any} size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </Card>
          ))}
        </View>

        {/* Menu Sections */}
        <View style={styles.content}>
          {menuSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Card shadow="sm" noPadding>
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.7}
                    style={[
                      styles.menuItem,
                      itemIndex !== section.items.length - 1 && styles.menuItemBorder,
                    ]}
                  >
                    <View style={styles.menuItemLeft}>
                      <View style={styles.menuItemIcon}>
                        <Ionicons name={item.icon as any} size={22} color={COLORS.textPrimary} />
                      </View>
                      <Text style={styles.menuItemLabel}>{item.label}</Text>
                    </View>
                    <View style={styles.menuItemRight}>
                      {item.badge && (
                        <Badge variant="outline" size="sm">
                          {item.badge}
                        </Badge>
                      )}
                      <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                    </View>
                  </TouchableOpacity>
                ))}
              </Card>
            </View>
          ))}

          {/* Logout Button */}
          <View style={styles.section}>
            <TouchableOpacity activeOpacity={0.9}>
              <LinearGradient
                colors={[COLORS.error, '#DC2626']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.logoutButton}
              >
                <Ionicons name="log-out-outline" size={22} color={COLORS.white} />
                <Text style={styles.logoutText}>Déconnexion</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* App Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Pizza King v1.0.0</Text>
            <Text style={styles.versionSubtext}>Made with ❤️ in Burkina Faso</Text>
          </View>

          <View style={{ height: SPACING['6xl'] }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },

  // Profile Header
  profileHeader: {
    paddingTop: SPACING['2xl'],
    paddingBottom: SPACING['4xl'],
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    borderBottomLeftRadius: RADIUS['2xl'],
    borderBottomRightRadius: RADIUS['2xl'],
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: COLORS.white,
    ...SHADOWS.xl,
  },
  avatarText: {
    fontSize: TYPOGRAPHY['4xl'],
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.primary,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  userName: {
    fontSize: TYPOGRAPHY['2xl'],
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: TYPOGRAPHY.base,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: SPACING.lg,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  memberText: {
    fontSize: TYPOGRAPHY.sm,
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.white,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginTop: -SPACING['3xl'],
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.full,
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

  // Content
  content: {
    paddingHorizontal: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },

  // Menu Items
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  menuItemLabel: {
    fontSize: TYPOGRAPHY.base,
    fontWeight: TYPOGRAPHY.medium,
    color: COLORS.textPrimary,
    flex: 1,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.xl,
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  logoutText: {
    fontSize: TYPOGRAPHY.lg,
    fontWeight: TYPOGRAPHY.semibold,
    color: COLORS.white,
  },

  // Version
  versionContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  versionText: {
    fontSize: TYPOGRAPHY.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  versionSubtext: {
    fontSize: TYPOGRAPHY.xs,
    color: COLORS.textTertiary,
  },
});
