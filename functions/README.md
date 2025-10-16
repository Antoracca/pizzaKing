# Pizza King - Firebase Cloud Functions

Backend serverless pour Pizza King utilisant Firebase Cloud Functions.

## Démarrage

```bash
# Installer les dépendances (depuis la racine du projet)
pnpm install

# Build
cd functions
pnpm build

# Lancer les émulateurs
pnpm serve

# Déployer
pnpm deploy
```

## Structure

```
src/
├── index.ts           # Entry point, export all functions
├── triggers/          # Firestore triggers
│   ├── onOrderCreate.ts
│   ├── onOrderUpdate.ts
│   └── onUserCreate.ts
├── https/             # HTTP callable functions
│   ├── createOrder.ts
│   ├── processPayment.ts
│   └── sendNotification.ts
├── scheduled/         # Scheduled functions (cron)
│   ├── dailyAnalytics.ts
│   └── expirePromotions.ts
└── utils/             # Utilities
    ├── validators.ts
    ├── emailTemplates.ts
    └── helpers.ts
```

## Functions

### HTTP Callable Functions

- `getPizzaMenu` - Get pizzas menu
- `createOrder` - Create new order
- `processPayment` - Process payment (Stripe, PayPal, Mobile Money)
- `applyPromoCode` - Apply promo code
- `sendNotification` - Send notification to user

### Firestore Triggers

- `onOrderCreated` - When order is created
- `onOrderUpdated` - When order status changes
- `onUserCreated` - When new user signs up

### Scheduled Functions

- `dailyAnalytics` - Generate daily analytics (runs at midnight)
- `expirePromotions` - Expire old promotions (runs at midnight)
- `sendDailyReport` - Send daily report to admin

## Environment Variables

Copy `.env.example` to `.env` and fill in the values.

## Technologies

- Firebase Cloud Functions (Node.js 20)
- TypeScript
- Firebase Admin SDK
- Stripe SDK
- Twilio SDK
- SendGrid SDK
