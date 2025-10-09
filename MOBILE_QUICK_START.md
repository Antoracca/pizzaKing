# 📱 Quick Start Guide - Pizza King Mobile

**Lancer l'application mobile en 5 minutes**

---

## ⚡ Prérequis

- **Node.js** 20+ installé ✅
- **pnpm** installé ✅
- **Dépendances du monorepo** installées ✅
- **Expo CLI** (installé automatiquement)
- **Expo Go** app sur votre téléphone (optionnel)

---

## 📦 Étape 1: Vérifier l'installation

```bash
# Depuis la racine du projet
cd apps/mobile

# Vérifier que les dépendances sont installées
ls node_modules
```

Si `node_modules` n'existe pas:

```bash
cd C:\Users\admin\PizzaKing
pnpm install
```

---

## 🚀 Étape 2: Lancer l'application Mobile

### Option A: Depuis la racine (Recommandé)

```bash
cd C:\Users\admin\PizzaKing
pnpm dev:mobile
```

### Option B: Depuis le dossier mobile

```bash
cd C:\Users\admin\PizzaKing\apps\mobile
pnpm start
```

**Ce qui se passe:**
- Expo démarre le serveur de développement
- Un QR code s'affiche dans le terminal
- L'interface Expo DevTools s'ouvre

---

## 📲 Étape 3: Ouvrir sur votre appareil

### Option 1: Expo Go (Le plus simple)

1. **Installer Expo Go:**
   - **Android:** [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - **iOS:** [App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Scanner le QR code:**
   - **Android:** Ouvrir Expo Go → Scanner QR
   - **iOS:** Ouvrir Camera → Scanner QR

3. **L'app se charge automatiquement** 🎉

### Option 2: Émulateur Android

```bash
# Dans le terminal Expo, appuyer sur:
a
```

**Prérequis:**
- Android Studio installé
- AVD (Android Virtual Device) créé
- Émulateur lancé

### Option 3: Simulateur iOS (Mac uniquement)

```bash
# Dans le terminal Expo, appuyer sur:
i
```

**Prérequis:**
- Xcode installé
- iOS Simulator configuré

---

## 🧪 Tester l'application Mobile

### Écrans disponibles:

1. **Home (Accueil)**
   - Hero section
   - Pizzas populaires
   - Catégories
   - Deals du jour

2. **Menu**
   - Liste des pizzas
   - Filtres par catégorie
   - Recherche
   - Détails pizza

3. **Cart (Panier)**
   - Items dans le panier
   - Calcul total
   - Bouton checkout

4. **Orders (Commandes)**
   - Historique des commandes
   - Statut de livraison
   - Détails commande

5. **Profile (Compte)**
   - Informations utilisateur
   - Adresses
   - Moyens de paiement
   - Paramètres

### Features à tester:

- ✅ **Navigation** - Bottom tabs
- ✅ **Animations** - Transitions, gestures
- ✅ **Touch interactions** - Buttons, swipes
- ✅ **Liste scrollable** - Pizzas, commandes
- ✅ **Modal** - Détails pizza
- ✅ **Formulaires** - Login, signup, checkout
- ✅ **Images** - Loading, placeholder

---

## 🎨 Mode Développement

### Raccourcis Expo:

Dans le terminal Expo, vous pouvez appuyer sur:

- **r** - Reload l'app
- **m** - Toggle menu
- **d** - Ouvrir DevTools
- **j** - Ouvrir debugger
- **a** - Ouvrir sur Android
- **i** - Ouvrir sur iOS
- **w** - Ouvrir dans le navigateur (web)

### Shake Menu (Sur l'app):

Sur votre téléphone, **secouer l'appareil** pour ouvrir:
- **Reload** - Recharger l'app
- **Debug** - Ouvrir le debugger
- **Performance Monitor** - Voir les FPS
- **Element Inspector** - Inspecter les composants

---

## 🐛 Dépannage

### Erreur: "Metro bundler not running"

```bash
# Redémarrer le serveur
cd apps/mobile
pnpm start --clear
```

### Erreur: "Unable to resolve module"

```bash
# Nettoyer le cache
cd apps/mobile
rm -rf node_modules
cd ../..
pnpm install
```

### Erreur: "Network response timed out"

**Cause:** Votre téléphone et PC ne sont pas sur le même réseau

**Solutions:**
1. Connecter les deux au même Wi-Fi
2. Vérifier que le firewall n'est pas bloqué
3. Utiliser le mode Tunnel:

```bash
pnpm start --tunnel
```

### Erreur: "Android SDK not found"

**Cause:** Android Studio pas installé ou mal configuré

**Solution:**
1. Installer [Android Studio](https://developer.android.com/studio)
2. Configurer le SDK
3. Ajouter les variables d'environnement

### Erreur: "Xcode not found" (Mac)

**Solution:**
1. Installer Xcode depuis l'App Store
2. Installer Command Line Tools:

```bash
xcode-select --install
```

### L'app ne se charge pas sur Expo Go

**Solutions:**
1. Vérifier que les deux appareils sont sur le même réseau
2. Redémarrer Expo: `Ctrl+C` puis `pnpm start`
3. Utiliser le mode Tunnel: `pnpm start --tunnel`
4. Scanner le QR à nouveau

---

## 🔥 Mode Firebase (Optionnel)

Par défaut, l'app mobile fonctionne en **mode démo** avec des données mock.

Pour connecter Firebase:

1. **Créer `.env` dans `apps/mobile`:**

```bash
cd apps/mobile
```

Créer `.env`:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

2. **Relancer l'app:**

```bash
pnpm start --clear
```

---

## 📝 Scripts disponibles

```bash
# Mobile
pnpm start              # Lancer Expo (mode normal)
pnpm start --clear      # Lancer avec cache clear
pnpm start --tunnel     # Lancer en mode tunnel
pnpm android            # Ouvrir sur Android
pnpm ios                # Ouvrir sur iOS
pnpm web                # Ouvrir dans le navigateur

# Build
pnpm build:android      # Build APK Android
pnpm build:ios          # Build IPA iOS
```

---

## 🎯 Différences Web vs Mobile

| Feature | Web | Mobile |
|---------|-----|--------|
| **Navigation** | Header + links | Bottom tabs |
| **Animations** | Framer Motion | React Native Animated |
| **Gestures** | Hover, click | Touch, swipe, pinch |
| **Layout** | CSS Flexbox/Grid | React Native Flexbox |
| **Images** | Next/Image | Expo Image |
| **Icons** | Lucide React | Lucide React Native |
| **Forms** | HTML inputs | RN TextInput |

---

## 📊 État actuel du Mobile

**✅ Fonctionnel (Mode Mock Data):**
- Écrans principaux (Home, Menu, Cart, Orders, Profile)
- Navigation bottom tabs
- Composants UI réutilisables
- Animations natives
- Responsive (toutes tailles d'écran)

**⏳ Nécessite configuration:**
- Firebase (pour données réelles)
- Notifications push
- GPS tracking
- Paiements in-app

**🔜 À tester:**
- Performance sur devices réels
- Gestes natifs (swipe, pinch)
- Notifications
- Background tasks

---

## 💡 Conseils

- **Hot Reload:** Les changements sont automatiques (save = reload)
- **Fast Refresh:** Garde l'état de l'app pendant le reload
- **Logs:** Visibles dans le terminal Expo
- **Erreurs:** Affichées en overlay rouge sur l'app
- **Warnings:** Affichées en overlay jaune

### Performance:

- Utiliser `React.memo()` pour les composants lourds
- Optimiser les images (compression, taille)
- Lazy loading pour les listes longues (`FlatList`)
- Éviter les re-renders inutiles

---

## 🚀 Prochaines étapes

1. ✅ **Lancer l'app mobile** (pnpm dev:mobile)
2. ✅ **Tester sur Expo Go**
3. ⏳ **Tester tous les écrans**
4. ⏳ **Vérifier les animations**
5. ⏳ **Tester les formulaires**
6. ⏳ **Reporter les bugs éventuels**

---

## 📚 Documentation

- **Expo:** https://docs.expo.dev
- **React Native:** https://reactnative.dev
- **React Navigation:** https://reactnavigation.org
- **Expo Go:** https://expo.dev/go

---

**Version:** 1.0.0
**Date:** 2025-10-07
**Status:** ✅ Prêt à tester

**Bon test ! 📱🍕🚀**
