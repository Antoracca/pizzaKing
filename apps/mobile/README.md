# Pizza King - Application Mobile

Application mobile React Native (Expo) pour Pizza King.

## Démarrage

```bash
# Installer les dépendances (depuis la racine du projet)
pnpm install

# Lancer le serveur de développement
pnpm dev:mobile

# Scanner le QR code avec Expo Go (iOS/Android)
```

## Build & Deploy

```bash
# Build Android
pnpm --filter mobile build:android

# Build iOS
pnpm --filter mobile build:ios

# Submit to stores
pnpm --filter mobile submit:android
pnpm --filter mobile submit:ios
```

## Structure

```
app/
├── (tabs)/          # Navigation tabs
│   ├── index.tsx    # Home
│   ├── menu.tsx     # Menu
│   ├── orders.tsx   # Orders
│   └── profile.tsx  # Profile
├── _layout.tsx      # Root layout
└── index.tsx        # Welcome screen

components/          # UI Components
services/            # API Services
hooks/               # Custom hooks
store/               # State management
utils/               # Utilities
```

## Technologies

- React Native 0.74
- Expo 51
- Expo Router (file-based routing)
- TypeScript
- Firebase (Auth, Firestore, Storage)
- Zustand (State management)
- React Hook Form + Zod
