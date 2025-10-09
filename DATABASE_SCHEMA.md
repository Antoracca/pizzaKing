# 🗄️ Pizza King - Schéma Base de Données Firestore

## 📊 Vue d'ensemble

Firebase Firestore - Base de données NoSQL orientée documents

**Conventions de nommage :**
- Collections : `camelCase` au pluriel (ex: `users`, `orders`)
- Documents : ID généré automatiquement ou UUID
- Champs : `camelCase`
- Timestamps : format ISO 8601 (Firebase Timestamp)

---

## 👤 Collection: `users`

### Structure

```typescript
interface User {
  // Identifiant
  id: string;                    // UID Firebase Auth

  // Informations personnelles
  email: string;                 // Email
  phoneNumber: string;           // +XXX XXXXXXXXX
  displayName: string;           // Nom complet
  firstName?: string;            // Prénom
  lastName?: string;             // Nom

  // Rôle et permissions
  role: 'customer' | 'admin' | 'deliverer' | 'superadmin';
  status: 'active' | 'suspended' | 'deleted';

  // Avatar
  photoURL?: string;             // URL Storage Firebase

  // Adresses
  defaultAddressId?: string;     // Référence vers addresses

  // Programme fidélité
  loyaltyPoints: number;         // Points accumulés
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalSpent: number;            // Total dépensé (€)
  totalOrders: number;           // Nombre de commandes

  // Préférences
  preferences: {
    notifications: {
      push: boolean;
      sms: boolean;
      email: boolean;
      whatsapp: boolean;
    };
    language: 'fr' | 'en' | 'ar';
    newsletter: boolean;
  };

  // Marketing
  referralCode: string;          // Code parrain unique
  referredBy?: string;           // ID user parrain

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;

  // Stats (calculées via Cloud Functions)
  stats?: {
    averageOrderValue: number;
    favoriteProducts: string[];  // IDs des pizzas préférées
    lastOrderDate?: Timestamp;
  };
}
```

### Indexes
```
Composite:
- role + status
- loyaltyTier + loyaltyPoints (desc)
- totalOrders (desc)
```

### Exemples

```javascript
// Client normal
{
  id: "abc123",
  email: "client@example.com",
  phoneNumber: "+22678901234",
  displayName: "Jean Dupont",
  firstName: "Jean",
  lastName: "Dupont",
  role: "customer",
  status: "active",
  photoURL: "https://storage.googleapis.com/...",
  defaultAddressId: "addr_xyz789",
  loyaltyPoints: 250,
  loyaltyTier: "silver",
  totalSpent: 125.50,
  totalOrders: 15,
  preferences: {
    notifications: {
      push: true,
      sms: true,
      email: false,
      whatsapp: true
    },
    language: "fr",
    newsletter: true
  },
  referralCode: "JEAN2024",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastLoginAt: Timestamp
}

// Livreur
{
  id: "del456",
  email: "livreur@pizzaking.com",
  phoneNumber: "+22678901235",
  displayName: "Mohammed Ali",
  role: "deliverer",
  status: "active",
  photoURL: "https://...",
  vehicleType: "moto",
  vehicleNumber: "AB-1234-CD",
  isAvailable: true,
  currentLocation: {
    latitude: 12.3456,
    longitude: -1.5678,
    updatedAt: Timestamp
  },
  deliveryStats: {
    totalDeliveries: 245,
    averageRating: 4.8,
    onTimeRate: 0.95
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 🍕 Collection: `pizzas`

### Structure

```typescript
interface Pizza {
  // Identifiant
  id: string;

  // Informations de base
  name: string;                  // Nom de la pizza
  slug: string;                  // URL-friendly (ex: margherita)
  description: string;           // Description
  shortDescription?: string;     // Description courte (1 ligne)

  // Images
  images: {
    main: string;                // Image principale
    thumbnail: string;           // Miniature
    gallery?: string[];          // Galerie d'images
  };

  // Catégorie
  category: 'classic' | 'special' | 'vegetarian' | 'meat-lovers' | 'premium';
  tags: string[];                // Ex: ['spicy', 'popular', 'new']

  // Prix par taille
  pricing: {
    S: {
      price: number;             // Prix en €
      size: string;              // Ex: "20cm"
    };
    M: {
      price: number;
      size: string;              // Ex: "30cm"
    };
    L: {
      price: number;
      size: string;              // Ex: "40cm"
    };
    XL: {
      price: number;
      size: string;              // Ex: "50cm"
    };
  };

  // Ingrédients
  ingredients: Array<{
    id: string;
    name: string;
    isRemovable: boolean;        // Client peut retirer
    extraPrice?: number;         // Prix supplément si ajouté
  }>;

  // Allergènes
  allergens: string[];           // Ex: ['gluten', 'lactose', 'nuts']

  // Options de personnalisation
  customizationOptions: {
    crustTypes: Array<{
      id: string;
      name: string;               // Ex: "Fine", "Épaisse", "Cheese-stuffed"
      extraPrice: number;
    }>;
    sauces: Array<{
      id: string;
      name: string;               // Ex: "Tomate", "Crème", "BBQ"
      extraPrice: number;
    }>;
    extraToppings: Array<{
      id: string;
      name: string;               // Ex: "Fromage supplémentaire"
      price: number;
    }>;
  };

  // Informations nutritionnelles (optionnel)
  nutrition?: {
    calories: number;            // Par portion
    protein: number;             // g
    carbs: number;              // g
    fat: number;                // g
  };

  // Disponibilité
  isAvailable: boolean;
  availableFrom?: string;        // Heure (ex: "11:00")
  availableUntil?: string;       // Heure (ex: "23:00")

  // Statut et visibilité
  status: 'active' | 'draft' | 'archived';
  featured: boolean;             // Mise en avant

  // Stats (calculées)
  stats: {
    totalOrders: number;
    averageRating: number;
    reviewCount: number;
    popularityScore: number;     // Calculé via algo
  };

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;             // ID admin
}
```

### Indexes
```
Composite:
- category + isAvailable + status
- featured + status
- stats.popularityScore (desc)
```

### Exemple

```javascript
{
  id: "pizza_001",
  name: "Margherita Royale",
  slug: "margherita-royale",
  description: "La classique revisitée avec mozzarella di bufala et basilic frais",
  shortDescription: "Tomate, mozzarella, basilic",
  images: {
    main: "https://storage.googleapis.com/pizzas/margherita.jpg",
    thumbnail: "https://storage.googleapis.com/pizzas/margherita_thumb.jpg",
    gallery: ["url1", "url2"]
  },
  category: "classic",
  tags: ["classic", "vegetarian", "popular"],
  pricing: {
    S: { price: 8.50, size: "20cm" },
    M: { price: 12.50, size: "30cm" },
    L: { price: 16.50, size: "40cm" },
    XL: { price: 20.50, size: "50cm" }
  },
  ingredients: [
    { id: "ing_001", name: "Sauce tomate", isRemovable: false },
    { id: "ing_002", name: "Mozzarella", isRemovable: false },
    { id: "ing_003", name: "Basilic", isRemovable: true },
    { id: "ing_004", name: "Huile d'olive", isRemovable: true }
  ],
  allergens: ["gluten", "lactose"],
  customizationOptions: {
    crustTypes: [
      { id: "crust_thin", name: "Pâte fine", extraPrice: 0 },
      { id: "crust_thick", name: "Pâte épaisse", extraPrice: 1.50 }
    ],
    sauces: [
      { id: "sauce_tomato", name: "Sauce tomate", extraPrice: 0 },
      { id: "sauce_cream", name: "Crème fraîche", extraPrice: 1.00 }
    ],
    extraToppings: [
      { id: "topping_cheese", name: "Fromage +", price: 2.00 },
      { id: "topping_olives", name: "Olives", price: 1.50 }
    ]
  },
  nutrition: {
    calories: 850,
    protein: 35,
    carbs: 90,
    fat: 28
  },
  isAvailable: true,
  status: "active",
  featured: true,
  stats: {
    totalOrders: 1250,
    averageRating: 4.7,
    reviewCount: 320,
    popularityScore: 95
  },
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: "admin_001"
}
```

---

## 🛒 Collection: `orders`

### Structure

```typescript
interface Order {
  // Identifiant
  id: string;
  orderNumber: string;           // Ex: "PK-2024-00123" (unique, user-friendly)

  // Client
  userId: string;                // Référence vers users
  userInfo: {                    // Snapshot au moment commande
    displayName: string;
    phoneNumber: string;
    email: string;
  };

  // Contenu commande
  items: Array<{
    pizzaId: string;
    pizzaName: string;
    pizzaImage: string;
    size: 'S' | 'M' | 'L' | 'XL';
    quantity: number;
    basePrice: number;

    // Personnalisation
    customization: {
      crust?: { id: string; name: string; price: number };
      sauce?: { id: string; name: string; price: number };
      extraToppings: Array<{ id: string; name: string; price: number }>;
      removedIngredients: string[];  // IDs ingrédients retirés
    };

    // Instructions spéciales
    instructions?: string;

    // Prix ligne
    subtotal: number;             // Prix total pour cette ligne
  }>;

  // Type de commande
  orderType: 'delivery' | 'pickup';

  // Adresse livraison (si delivery)
  deliveryAddress?: {
    addressId?: string;           // Si adresse enregistrée
    fullAddress: string;
    streetAddress: string;
    city: string;
    zipCode?: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    deliveryInstructions?: string;
    floor?: string;
    building?: string;
  };

  // Livreur (si delivery)
  deliveryInfo?: {
    delivererId?: string;
    delivererName?: string;
    delivererPhone?: string;
    vehicleType?: string;

    // Tracking
    estimatedDeliveryTime: Timestamp;
    actualDeliveryTime?: Timestamp;
    trackingUpdates: Array<{
      status: string;
      timestamp: Timestamp;
      location?: { latitude: number; longitude: number };
      notes?: string;
    }>;
  };

  // Temps de préparation/retrait
  pickupInfo?: {
    estimatedReadyTime: Timestamp;
    actualReadyTime?: Timestamp;
    pickupCode: string;           // Code à 4 chiffres pour retrait
  };

  // Prix
  pricing: {
    subtotal: number;             // Total items
    deliveryFee: number;          // Frais livraison (0 si pickup)
    taxAmount: number;            // TVA
    discountAmount: number;       // Réduction appliquée
    loyaltyPointsUsed: number;    // Points utilisés
    loyaltyDiscount: number;      // Valeur €
    total: number;                // Prix final
  };

  // Promotion/Code promo
  promoCode?: {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    appliedAmount: number;
  };

  // Paiement
  payment: {
    method: 'card' | 'paypal' | 'mobile_money' | 'cash';
    status: 'pending' | 'completed' | 'failed' | 'refunded';

    // Détails paiement en ligne
    transactionId?: string;
    provider?: string;            // Ex: "stripe", "paypal"

    // Pour cash
    cashReceived?: number;
    changeToReturn?: number;

    // Metadata
    paidAt?: Timestamp;
    refundedAt?: Timestamp;
    refundReason?: string;
  };

  // Statut commande
  status:
    | 'pending'                   // En attente confirmation
    | 'confirmed'                 // Confirmée
    | 'preparing'                 // En préparation
    | 'ready'                     // Prête (pickup)
    | 'out_for_delivery'          // En livraison
    | 'delivered'                 // Livrée
    | 'completed'                 // Terminée
    | 'cancelled'                 // Annulée
    | 'refunded';                 // Remboursée

  statusHistory: Array<{
    status: string;
    timestamp: Timestamp;
    changedBy?: string;           // ID user/admin
    notes?: string;
  }>;

  // Évaluation
  rating?: {
    foodRating: number;           // 1-5
    deliveryRating?: number;      // 1-5
    comment?: string;
    images?: string[];
    createdAt: Timestamp;
  };

  // Notes internes (admin/cuisine)
  internalNotes?: string;

  // Points fidélité gagnés
  loyaltyPointsEarned: number;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Estimations
  estimatedPreparationTime: number; // minutes
  estimatedTotalTime: number;       // minutes

  // Flags
  isFirstOrder: boolean;            // Première commande client
  isGift: boolean;                  // Commande cadeau
}
```

### Indexes
```
Composite:
- userId + createdAt (desc)
- status + createdAt (desc)
- deliveryInfo.delivererId + status
- orderNumber (unique)
- payment.status
```

### Exemple

```javascript
{
  id: "order_abc123",
  orderNumber: "PK-2024-00123",
  userId: "user_123",
  userInfo: {
    displayName: "Jean Dupont",
    phoneNumber: "+22678901234",
    email: "jean@example.com"
  },
  items: [
    {
      pizzaId: "pizza_001",
      pizzaName: "Margherita Royale",
      pizzaImage: "https://...",
      size: "M",
      quantity: 2,
      basePrice: 12.50,
      customization: {
        crust: { id: "crust_thin", name: "Pâte fine", price: 0 },
        sauce: { id: "sauce_tomato", name: "Sauce tomate", price: 0 },
        extraToppings: [
          { id: "topping_cheese", name: "Fromage +", price: 2.00 }
        ],
        removedIngredients: []
      },
      instructions: "Bien cuite SVP",
      subtotal: 29.00
    }
  ],
  orderType: "delivery",
  deliveryAddress: {
    addressId: "addr_xyz",
    fullAddress: "123 Rue de la République, 75001 Paris",
    streetAddress: "123 Rue de la République",
    city: "Paris",
    zipCode: "75001",
    coordinates: {
      latitude: 48.8566,
      longitude: 2.3522
    },
    deliveryInstructions: "Sonner à l'interphone",
    floor: "3ème étage",
    building: "Bâtiment A"
  },
  deliveryInfo: {
    delivererId: "del_456",
    delivererName: "Mohammed Ali",
    delivererPhone: "+22678901235",
    vehicleType: "moto",
    estimatedDeliveryTime: Timestamp,
    trackingUpdates: [
      {
        status: "preparing",
        timestamp: Timestamp,
        notes: "Commande prise en charge"
      }
    ]
  },
  pricing: {
    subtotal: 29.00,
    deliveryFee: 3.00,
    taxAmount: 3.20,
    discountAmount: 5.00,
    loyaltyPointsUsed: 50,
    loyaltyDiscount: 2.50,
    total: 27.70
  },
  promoCode: {
    code: "FIRST10",
    discountType: "percentage",
    discountValue: 10,
    appliedAmount: 2.90
  },
  payment: {
    method: "card",
    status: "completed",
    transactionId: "txn_stripe_xyz",
    provider: "stripe",
    paidAt: Timestamp
  },
  status: "preparing",
  statusHistory: [
    { status: "pending", timestamp: Timestamp },
    { status: "confirmed", timestamp: Timestamp },
    { status: "preparing", timestamp: Timestamp, changedBy: "admin_001" }
  ],
  loyaltyPointsEarned: 28,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  estimatedPreparationTime: 20,
  estimatedTotalTime: 45,
  isFirstOrder: false,
  isGift: false
}
```

---

## 📍 Collection: `addresses`

### Structure

```typescript
interface Address {
  id: string;
  userId: string;                // Propriétaire

  // Informations adresse
  label: string;                 // Ex: "Maison", "Bureau"
  streetAddress: string;
  city: string;
  zipCode?: string;
  country: string;

  // Géolocalisation
  coordinates: {
    latitude: number;
    longitude: number;
  };

  // Détails supplémentaires
  building?: string;
  floor?: string;
  apartment?: string;
  intercom?: string;
  deliveryInstructions?: string;

  // Métadata
  isDefault: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastUsedAt?: Timestamp;
}
```

---

## 🎁 Collection: `promotions`

### Structure

```typescript
interface Promotion {
  id: string;

  // Informations promo
  code: string;                  // Code promo (unique)
  name: string;
  description: string;

  // Type de réduction
  discountType: 'percentage' | 'fixed' | 'free_delivery' | 'free_item';
  discountValue: number;         // % ou €

  // Conditions
  minOrderAmount?: number;       // Montant minimum commande
  maxDiscountAmount?: number;    // Plafond réduction
  applicableProducts?: string[]; // IDs pizzas (vide = toutes)
  firstOrderOnly: boolean;

  // Utilisations
  maxTotalUses?: number;         // Max utilisations globales
  maxUsesPerUser: number;        // Max par utilisateur
  currentUses: number;

  // Période validité
  startDate: Timestamp;
  endDate: Timestamp;

  // Statut
  isActive: boolean;
  status: 'draft' | 'active' | 'expired' | 'archived';

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
```

---

## 🎯 Collection: `loyalty`

### Structure

```typescript
interface LoyaltyTransaction {
  id: string;
  userId: string;

  // Transaction
  type: 'earn' | 'redeem' | 'expire' | 'bonus' | 'refund';
  points: number;                // Positif (gain) ou négatif (utilisation)

  // Contexte
  orderId?: string;
  description: string;

  // Balance après transaction
  balanceAfter: number;

  // Metadata
  createdAt: Timestamp;
  expiresAt?: Timestamp;         // Pour les points avec expiration
}
```

---

## 🔔 Collection: `notifications`

### Structure

```typescript
interface Notification {
  id: string;
  userId: string;

  // Contenu
  title: string;
  body: string;
  imageUrl?: string;

  // Type
  type: 'order_update' | 'promotion' | 'loyalty' | 'system';

  // Action
  actionType?: 'open_order' | 'open_promo' | 'open_app';
  actionData?: any;              // Ex: { orderId: "xxx" }

  // Canaux d'envoi
  channels: {
    push: boolean;
    sms: boolean;
    email: boolean;
    whatsapp: boolean;
  };

  // Statut envoi
  sentAt?: Timestamp;
  deliveredAt?: Timestamp;
  readAt?: Timestamp;

  // Metadata
  createdAt: Timestamp;
  isRead: boolean;
}
```

---

## 📊 Collection: `analytics` (agrégé)

### Structure

```typescript
interface DailyAnalytics {
  id: string;                    // Format: YYYY-MM-DD
  date: string;

  // Commandes
  orders: {
    total: number;
    completed: number;
    cancelled: number;
    averageValue: number;
    totalRevenue: number;
  };

  // Clients
  customers: {
    new: number;
    returning: number;
    active: number;
  };

  // Produits
  topProducts: Array<{
    pizzaId: string;
    name: string;
    count: number;
    revenue: number;
  }>;

  // Horaires
  hourlyDistribution: Record<string, number>; // "14": 23 (23 commandes à 14h)

  // Paiements
  paymentMethods: Record<string, number>;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 🔄 Relations entre collections

```
users (1) ----< (*) addresses
users (1) ----< (*) orders
users (1) ----< (*) loyalty
users (1) ----< (*) notifications

pizzas (1) ----< (*) orders.items

orders (1) ----< (1) users (deliverer)
orders (1) ----< (0..1) addresses
orders (1) ----< (0..1) promotions

promotions (1) ----< (*) orders
```

---

## 🔒 Règles de sécurité Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    function isAdmin() {
      return isSignedIn() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'superadmin'];
    }

    function isDeliverer() {
      return isSignedIn() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'deliverer';
    }

    // Users collection
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isSignedIn();
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }

    // Pizzas collection
    match /pizzas/{pizzaId} {
      allow read: if true;  // Public
      allow write: if isAdmin();
    }

    // Orders collection
    match /orders/{orderId} {
      allow read: if isOwner(resource.data.userId) ||
                     isAdmin() ||
                     (isDeliverer() && resource.data.deliveryInfo.delivererId == request.auth.uid);
      allow create: if isSignedIn() && request.auth.uid == request.resource.data.userId;
      allow update: if isAdmin() ||
                       (isDeliverer() && resource.data.deliveryInfo.delivererId == request.auth.uid);
      allow delete: if isAdmin();
    }

    // Addresses collection
    match /addresses/{addressId} {
      allow read: if isOwner(resource.data.userId) || isAdmin();
      allow write: if isOwner(request.resource.data.userId) || isAdmin();
    }

    // Promotions collection
    match /promotions/{promoId} {
      allow read: if true;  // Codes promos publics
      allow write: if isAdmin();
    }

    // Loyalty collection
    match /loyalty/{transactionId} {
      allow read: if isOwner(resource.data.userId) || isAdmin();
      allow create: if false;  // Only via Cloud Functions
      allow update, delete: if isAdmin();
    }

    // Notifications collection
    match /notifications/{notifId} {
      allow read: if isOwner(resource.data.userId);
      allow update: if isOwner(resource.data.userId);  // Mark as read
      allow create, delete: if false;  // Only via Cloud Functions
    }

    // Analytics collection
    match /analytics/{docId} {
      allow read: if isAdmin();
      allow write: if false;  // Only via Cloud Functions
    }
  }
}
```

---

## 📈 Indexes composites Firestore

```javascript
// À créer via Firebase Console ou firebase.indexes.json

{
  "indexes": [
    // Orders
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "deliveryInfo.delivererId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },

    // Pizzas
    {
      "collectionGroup": "pizzas",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "isAvailable", "order": "ASCENDING" },
        { "fieldPath": "stats.popularityScore", "order": "DESCENDING" }
      ]
    },

    // Users
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "role", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },

    // Loyalty
    {
      "collectionGroup": "loyalty",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },

    // Notifications
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "isRead", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## 🔢 Données d'exemple (seed)

Voir fichier `scripts/seed-data.ts` pour les données de test complètes.

---

**Version : 1.0.0**
**Dernière mise à jour : 2025-10-07**
