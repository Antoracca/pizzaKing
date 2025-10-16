# @pizza-king/shared

Package partagé contenant les types, constantes et utilitaires communs pour l'ensemble de la plateforme Pizza King.

## Installation

Ce package est utilisé en interne via pnpm workspace.

```bash
pnpm add @pizza-king/shared --filter <app-name>
```

## Contenu

### Types

Types TypeScript partagés pour :

- User (utilisateurs, livreurs, admins)
- Pizza (menu, personnalisation)
- Order (commandes, livraison, retrait)
- Payment (paiements)
- Address (adresses de livraison)
- Notification (notifications)
- Loyalty (programme fidélité)
- Promotion (codes promo)

### Constants

Constantes de l'application :

- Statuts de commande
- Tailles de pizzas
- Rôles utilisateurs
- Tiers de fidélité
- Configuration app (horaires, frais, limites, etc.)

### Utilities

Fonctions utilitaires :

- **Formatters** : formatPrice, formatDate, formatPhoneNumber, etc.
- **Validators** : isValidEmail, isValidPhoneNumber, isStrongPassword, etc.
- **Calculators** : calculateSubtotal, calculateTax, calculateDistance, etc.
- **Helpers** : generateOrderNumber, createSlug, debounce, etc.

## Usage

```typescript
import {
  // Types
  User,
  Pizza,
  Order,

  // Constants
  ORDER_STATUS,
  PIZZA_SIZES,

  // Utils
  formatPrice,
  calculateTotal,
  generateOrderNumber,
} from '@pizza-king/shared';

// Example
const price = formatPrice(12.5); // "12.50€"
const orderNumber = generateOrderNumber(); // "PK-2024-00123"
```

## Structure

```
src/
├── types/           # TypeScript types
├── constants/       # Application constants
└── utils/           # Utility functions
```

## Development

```bash
# Type check
pnpm type-check

# Lint
pnpm lint
```
