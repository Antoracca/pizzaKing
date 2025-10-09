# 💳 Payment Integrations - Pizza King

**Comprehensive Guide to Payment Systems**

---

## 🎯 Overview

Pizza King supports 4 payment methods to serve customers in Burkina Faso and internationally:

1. **Stripe** - International credit/debit cards
2. **PayPal** - International PayPal accounts
3. **Mobile Money** - Local payment (Orange Money, Moov Money, Coris Money)
4. **Cash on Delivery** - Pay in cash upon delivery

---

## 🔐 Security & Compliance

- **PCI DSS**: Stripe handles card data, we never store card numbers
- **Encryption**: All payment data transmitted via HTTPS
- **Webhooks**: Verified using signatures
- **Firestore Rules**: Payment data access restricted by user ID
- **Audit Logs**: All payment transactions logged

---

## 1️⃣ Stripe Integration

### Configuration

**Environment Variables:**
```bash
STRIPE_SECRET_KEY=sk_test_xxxxx # Test key
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

**Get Keys:**
1. Create account at [stripe.com](https://stripe.com)
2. Go to Developers → API Keys
3. Copy Secret Key (sk_test_xxx for test, sk_live_xxx for production)
4. Go to Developers → Webhooks
5. Add endpoint: `https://your-functions-url/handleStripeWebhook`
6. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
7. Copy Webhook Secret

### Cloud Functions

#### `createStripePaymentIntent`

Creates a Stripe Payment Intent for an order.

**Input:**
```typescript
{
  orderId: string;
  amount: number; // Amount in FCFA
  currency?: string; // Default: 'xof'
  paymentMethodTypes?: string[]; // Default: ['card']
  metadata?: Record<string, string>;
}
```

**Process:**
1. Verify user authentication
2. Get order and verify ownership
3. Check order status (pending/confirmed only)
4. Verify amount matches order total
5. Create or get Stripe customer ID
6. Create Payment Intent
7. Update order with payment info
8. Return client secret

**Output:**
```typescript
{
  success: true;
  paymentIntentId: string;
  clientSecret: string;
  amount: number;
  currency: string;
  customerId: string;
}
```

**Usage (Web):**
```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';
import { loadStripe } from '@stripe/stripe-js';

const functions = getFunctions();
const createPaymentIntent = httpsCallable(functions, 'createStripePaymentIntent');

// Create Payment Intent
const result = await createPaymentIntent({
  orderId: 'order123',
  amount: 15000, // 15,000 FCFA
});

// Initialize Stripe
const stripe = await loadStripe('pk_test_your_publishable_key');

// Confirm payment
const { error } = await stripe.confirmCardPayment(result.data.clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: {
      name: 'Customer Name',
    },
  },
});
```

**Usage (Mobile):**
```typescript
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';

// Initialize payment sheet
const { error: initError } = await initPaymentSheet({
  paymentIntentClientSecret: clientSecret,
  merchantDisplayName: 'Pizza King',
  customerId: customerId,
});

// Present payment sheet
const { error } = await presentPaymentSheet();
```

#### `handleStripeWebhook`

Handles Stripe webhook events.

**Events:**
- `payment_intent.succeeded` → Update order to confirmed, notify user
- `payment_intent.payment_failed` → Update order, notify user of failure
- `payment_intent.canceled` → Mark payment as canceled
- `charge.refunded` → Update order status to refunded

**Webhook URL:** `https://your-functions-url/handleStripeWebhook`

---

## 2️⃣ PayPal Integration

### Configuration

**Environment Variables:**
```bash
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_MODE=sandbox # or 'live'
```

**Get Keys:**
1. Create account at [developer.paypal.com](https://developer.paypal.com)
2. Go to My Apps & Credentials
3. Create app
4. Copy Client ID and Secret
5. Use Sandbox for testing

### Cloud Functions

#### `createPayPalOrder`

Creates a PayPal order for payment.

**Input:**
```typescript
{
  orderId: string;
  amount: number; // Amount in FCFA (will be converted to USD)
  returnUrl?: string;
  cancelUrl?: string;
}
```

**Process:**
1. Verify authentication and order ownership
2. Convert FCFA to USD (rate: ~600 FCFA = 1 USD)
3. Get PayPal access token
4. Create PayPal order with purchase units
5. Update Firestore order with PayPal info
6. Return approval URL for redirect

**Output:**
```typescript
{
  success: true;
  paypalOrderId: string;
  approvalUrl: string; // Redirect user here
  amountUSD: number;
  amountFCFA: number;
}
```

**Usage:**
```typescript
const createPayPalOrder = httpsCallable(functions, 'createPayPalOrder');

const result = await createPayPalOrder({
  orderId: 'order123',
  amount: 15000, // 15,000 FCFA
  returnUrl: 'https://myapp.com/success',
  cancelUrl: 'https://myapp.com/cancel',
});

// Redirect user to PayPal
window.location.href = result.data.approvalUrl;
```

#### `capturePayPalOrder`

Captures payment after user approves on PayPal.

**Input:**
```typescript
{
  orderId: string;
  paypalOrderId: string;
}
```

**Process:**
1. Verify authentication
2. Get PayPal access token
3. Capture the PayPal order
4. Update Firestore order to confirmed
5. Send notification to user

**Usage:**
```typescript
// After user returns from PayPal (URL contains ?token=xxx)
const paypalOrderId = new URLSearchParams(window.location.search).get('token');

const capturePayPal = httpsCallable(functions, 'capturePayPalOrder');

const result = await capturePayPal({
  orderId: 'order123',
  paypalOrderId: paypalOrderId,
});
```

---

## 3️⃣ Mobile Money Integration

### Configuration

**Provider:** Cinetpay (supports Burkina Faso mobile operators)

**Environment Variables:**
```bash
CINETPAY_API_KEY=your_api_key
CINETPAY_SITE_ID=your_site_id
CINETPAY_MODE=sandbox # or 'live'
```

**Get Keys:**
1. Create account at [cinetpay.com](https://cinetpay.com)
2. Go to API Settings
3. Copy API Key and Site ID
4. Add callback URL: `https://your-functions-url/handleMobileMoneyCallback`

### Supported Operators

- **Orange Money BF** - Orange Burkina Faso
- **Moov Money BF** - Moov Burkina Faso
- **Coris Money BF** - Coris Bank Burkina Faso

### Cloud Functions

#### `initiateMobileMoneyPayment`

Initiates a mobile money payment.

**Input:**
```typescript
{
  orderId: string;
  amount: number; // Amount in FCFA
  phoneNumber: string; // Format: +22670123456
  provider: 'orange_money' | 'moov_money' | 'coris_money';
  customerName?: string;
}
```

**Process:**
1. Verify authentication and phone number format
2. Map provider to Cinetpay channel
3. Generate unique transaction ID
4. Create Cinetpay payment request
5. Update order with transaction info
6. Return payment URL and instructions

**Output:**
```typescript
{
  success: true;
  transactionId: string;
  paymentToken: string;
  paymentUrl: string; // Redirect or display USSD code
  provider: string;
  amount: number;
  message: string; // Instructions for user
}
```

**Usage:**
```typescript
const initiateMobileMoney = httpsCallable(functions, 'initiateMobileMoneyPayment');

const result = await initiateMobileMoney({
  orderId: 'order123',
  amount: 15000,
  phoneNumber: '+22670123456',
  provider: 'orange_money',
});

// Display USSD code or redirect
alert(result.data.message);
// User dials code on their phone to approve
```

#### `handleMobileMoneyCallback`

Receives payment status notifications from Cinetpay.

**Callback URL:** `https://your-functions-url/handleMobileMoneyCallback`

**Statuses:**
- `ACCEPTED` / `PAID` → Update order to confirmed
- `REFUSED` / `FAILED` → Update order to failed
- Other → Update status, keep pending

---

## 4️⃣ Cash on Delivery

### Cloud Functions

#### `markCashOnDelivery`

Marks order for cash payment on delivery.

**Input:**
```typescript
{
  orderId: string;
}
```

**Process:**
1. Verify order ownership
2. Update payment method to 'cash_on_delivery'
3. Confirm order (status: confirmed)
4. Notify user

**Output:**
```typescript
{
  success: true;
  message: string;
  orderId: string;
  orderNumber: string;
}
```

**Usage:**
```typescript
const markCash = httpsCallable(functions, 'markCashOnDelivery');

await markCash({ orderId: 'order123' });
```

#### `confirmCashPaymentReceived`

Called by deliverer when cash is received.

**Input:**
```typescript
{
  orderId: string;
  amountReceived: number; // Amount in FCFA
}
```

**Permissions:** Only assigned deliverer can call

**Process:**
1. Verify deliverer is assigned to order
2. Verify order is delivered
3. Update payment status to succeeded
4. Notify customer

---

## 🔄 Payment Flow Diagrams

### Stripe Flow
```
User clicks "Pay with Card"
    ↓
createStripePaymentIntent (Cloud Function)
    ↓
Client receives clientSecret
    ↓
User enters card details (Stripe Elements)
    ↓
confirmCardPayment (Stripe SDK)
    ↓
Stripe processes payment
    ↓
handleStripeWebhook receives payment_intent.succeeded
    ↓
Order updated to "confirmed"
    ↓
User notified
```

### PayPal Flow
```
User clicks "Pay with PayPal"
    ↓
createPayPalOrder (Cloud Function)
    ↓
Redirect to PayPal (approvalUrl)
    ↓
User logs in and approves on PayPal
    ↓
Redirect back to app (returnUrl?token=xxx)
    ↓
capturePayPalOrder (Cloud Function)
    ↓
Order updated to "confirmed"
    ↓
User notified
```

### Mobile Money Flow
```
User selects Mobile Money provider
    ↓
initiateMobileMoneyPayment (Cloud Function)
    ↓
User receives USSD code or prompt
    ↓
User dials code on phone
    ↓
Approves payment on phone
    ↓
Cinetpay sends callback to handleMobileMoneyCallback
    ↓
Order updated to "confirmed"
    ↓
User notified
```

### Cash Flow
```
User selects "Cash on Delivery"
    ↓
markCashOnDelivery (Cloud Function)
    ↓
Order confirmed (payment pending)
    ↓
Order prepared and delivered
    ↓
Deliverer receives cash
    ↓
confirmCashPaymentReceived (Cloud Function)
    ↓
Payment marked as succeeded
    ↓
User notified
```

---

## 📊 Payment States

Order document `payment` field structure:

```typescript
{
  provider: 'stripe' | 'paypal' | 'mobile_money' | 'cash';
  status: 'pending' | 'succeeded' | 'failed' | 'canceled' | 'refunded' | 'pending_cash';

  // Stripe
  paymentIntentId?: string;
  clientSecret?: string;
  stripeCustomerId?: string;

  // PayPal
  paypalOrderId?: string;
  approvalUrl?: string;
  captureId?: string;
  amountUSD?: number;

  // Mobile Money
  mobileMoneyProvider?: string;
  transactionId?: string;
  paymentToken?: string;
  phoneNumber?: string;

  // Cash
  method?: 'cash_on_delivery';
  amountReceived?: number;
  receivedBy?: string; // Deliverer UID

  // Common
  paidAt?: Date;
  failureReason?: string;
  createdAt: Date;
}
```

---

## 🧪 Testing

### Stripe Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

CVC: Any 3 digits
Expiry: Any future date

### PayPal Sandbox

Create test accounts at [sandbox.paypal.com](https://sandbox.paypal.com)

### Mobile Money Test

Use Cinetpay sandbox test numbers provided in their dashboard

### Cash

No external testing needed - just function calls

---

## 🚨 Error Handling

All functions throw `HttpsError` with these codes:

- `unauthenticated` - User not logged in
- `permission-denied` - User doesn't own order
- `not-found` - Order not found
- `invalid-argument` - Invalid input
- `failed-precondition` - Order in wrong status
- `already-exists` - Payment already completed
- `internal` - Stripe/PayPal/Cinetpay error

**Example:**
```typescript
try {
  await createStripePaymentIntent({ ... });
} catch (error) {
  if (error.code === 'already-exists') {
    alert('Payment already completed');
  } else if (error.code === 'invalid-argument') {
    alert('Invalid payment amount');
  } else {
    alert('Payment failed: ' + error.message);
  }
}
```

---

## 📈 Analytics & Reporting

Track payment metrics:

```typescript
// In onOrderUpdate trigger
if (order.payment?.status === 'succeeded') {
  await db.collection('analytics').doc('daily').update({
    [`payments.${order.payment.provider}.count`]: FieldValue.increment(1),
    [`payments.${order.payment.provider}.revenue`]: FieldValue.increment(order.pricing.total),
  });
}
```

---

## 🔒 Security Best Practices

1. **Never expose secret keys** in client code
2. **Always verify webhook signatures**
3. **Validate amounts** match order totals
4. **Check order ownership** before processing
5. **Use HTTPS** for all payment URLs
6. **Log all payment events** for audit trail
7. **Rate limit** payment endpoints
8. **Handle refunds** properly with notifications

---

## 📝 Environment Setup Checklist

- [ ] Stripe account created
- [ ] Stripe keys added to `.env`
- [ ] Stripe webhook configured
- [ ] PayPal account created
- [ ] PayPal keys added to `.env`
- [ ] Cinetpay account created
- [ ] Cinetpay keys added to `.env`
- [ ] Cinetpay callback URL configured
- [ ] Functions deployed with env vars
- [ ] Test payments verified
- [ ] Production keys ready for launch

---

**Version:** 1.0.0
**Last Updated:** 2025-10-07
**Status:** ✅ Phase 9 - Payment Integrations Complete
