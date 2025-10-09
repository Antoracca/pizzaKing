# Pizza King - Application Web

Application web Next.js 14 pour Pizza King.

## Démarrage

```bash
# Installer les dépendances (depuis la racine du projet)
pnpm install

# Lancer le serveur de développement
pnpm dev:web

# Build pour production
pnpm build:web
```

L'application sera accessible sur http://localhost:3000

## Structure

```
app/
├── (auth)/          # Routes authentification
├── (main)/          # Routes principales (menu, panier, etc.)
├── admin/           # Dashboard admin
├── api/             # API Routes
├── layout.tsx       # Layout racine
└── page.tsx         # Page d'accueil

components/          # Composants React
lib/                 # Utilitaires et configuration
hooks/               # Custom hooks
store/               # State management (Zustand)
services/            # Services API
types/               # Types TypeScript
```

## Variables d'environnement

Copier `.env.example` vers `.env.local` et remplir les valeurs.

## Technologies

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Firebase (Auth, Firestore, Storage)
- Zustand (State management)
- React Hook Form + Zod
- Shadcn/ui (Composants)
