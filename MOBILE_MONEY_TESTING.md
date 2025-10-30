# 📱 Guide de test Mobile Money

## 🧪 Codes de test en mode SIMULATION

L'API Mobile Money fonctionne actuellement en **mode simulation** pour permettre les tests sans connexion réelle aux API Orange Money / Telecel.

### ✅ Codes qui FONCTIONNENT (paiement réussi)

**N'importe quel code à 6 chiffres** SAUF les codes d'erreur ci-dessous:

Exemples de codes valides:
- `123456` ✅ Succès
- `000000` ✅ Succès
- `999999` ✅ Succès
- `789456` ✅ Succès
- `555555` ✅ Succès

### ❌ Codes d'ERREUR (pour tester les cas d'échec)

Pour tester le comportement en cas d'erreur, utilisez ces codes spéciaux:

| Code | Erreur simulée |
|------|----------------|
| `111111` | "Code PIN incorrect. Veuillez réessayer." |
| `222222` | "Solde insuffisant. Veuillez recharger votre compte." |
| `333333` | "Transaction annulée par l'utilisateur." |

### 📞 Numéros de téléphone

Pour le numéro de mobile, utilisez n'importe quel numéro à **8 chiffres**:

**Format attendu:** `XX XX XX XX` (avec espaces) ou `XXXXXXXX` (sans espaces)

Exemples:
- `70 12 34 56` ✅
- `72345678` ✅
- `75 55 55 55` ✅

## 🔄 Flux de paiement en simulation

```
1. Utilisateur saisit:
   - Numéro: 70 12 34 56
   - Code: 123456

2. API valide les données
   ✅ Numéro = 8 chiffres
   ✅ Code = 6 chiffres
   ✅ Montants cohérents

3. Simulation du paiement
   ⏱️ Délai de 1.5s (simule appel réseau)
   
4. Résultat:
   ✅ Si code valide → Commande créée avec status "paid"
   ❌ Si code erreur (111111, 222222, 333333) → Message d'erreur
```

## 🚀 Passage en PRODUCTION

### ⚠️ Actions requises avant le déploiement en production:

#### 1. **Obtenir les accès API**

**Orange Money Cameroun/Centrafrique:**
- Site développeur: https://developer.orange.com/
- API: Orange Money WebPay
- Inscrivez-vous et obtenez:
  - `ORANGE_MERCHANT_KEY`
  - `ORANGE_MERCHANT_SECRET`
  - `ORANGE_API_URL` (sandbox puis production)

**Telecel Centrafrique:**
- Contactez Telecel Centrafrique directement
- Demandez la documentation de leur API de paiement
- Obtenez:
  - Clés API
  - URL endpoints (sandbox + production)
  - Documentation technique

#### 2. **Configurer les variables d'environnement**

Ajoutez dans `.env.local`:
```bash
# Orange Money
ORANGE_MERCHANT_KEY=your_merchant_key_here
ORANGE_MERCHANT_SECRET=your_merchant_secret_here
ORANGE_API_URL=https://api.orange.com/orange-money-webpay/cm/v1
ORANGE_MODE=sandbox  # ou "production"

# Telecel Money
TELECEL_API_KEY=your_api_key_here
TELECEL_API_SECRET=your_api_secret_here
TELECEL_API_URL=https://api.telecel.cf/payments/v1
TELECEL_MODE=sandbox  # ou "production"
```

#### 3. **Remplacer la fonction de simulation**

Dans `/app/api/payments/mobile-money/route.ts`, remplacez:

```typescript
// AVANT (simulation)
async function validateMobileMoneyPayment(...) {
  // Code de simulation
}

// APRÈS (production)
async function validateMobileMoneyPayment(
  provider: MobileMoneyProvider,
  phoneNumber: string,
  paymentCode: string,
  amount: number
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  
  if (provider === 'orange') {
    return await validateOrangeMoneyPayment(phoneNumber, paymentCode, amount);
  } else if (provider === 'telecel') {
    return await validateTelecelPayment(phoneNumber, paymentCode, amount);
  }
  
  return { success: false, error: 'Fournisseur non supporté' };
}

async function validateOrangeMoneyPayment(phone: string, code: string, amount: number) {
  // Appel à l'API Orange Money réelle
  const response = await fetch(process.env.ORANGE_API_URL + '/payments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.ORANGE_MERCHANT_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phoneNumber: phone,
      amount: amount,
      currency: 'XAF',
      pin: code,
      merchantTransactionId: `PK_${Date.now()}`,
    }),
  });
  
  const data = await response.json();
  
  return {
    success: data.status === 'SUCCESS',
    transactionId: data.transactionId,
    error: data.message,
  };
}

async function validateTelecelPayment(phone: string, code: string, amount: number) {
  // Appel à l'API Telecel réelle
  // TODO: Implémenter selon la documentation Telecel
}
```

#### 4. **Tester en mode sandbox**

1. Utilisez les endpoints sandbox fournis par Orange/Telecel
2. Utilisez les numéros de test fournis dans leur documentation
3. Testez tous les cas:
   - ✅ Paiement réussi
   - ❌ Code PIN incorrect
   - ❌ Solde insuffisant
   - ❌ Timeout réseau

#### 5. **Configurer les webhooks (callback)**

Les API Mobile Money envoient souvent des notifications de confirmation:

```typescript
// /app/api/webhooks/mobile-money/route.ts
export async function POST(request: NextRequest) {
  const signature = request.headers.get('X-Signature');
  const body = await request.json();
  
  // Vérifier la signature
  if (!verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  // Mettre à jour le statut de la commande
  if (body.status === 'SUCCESS') {
    await updateOrderStatus(body.merchantTransactionId, 'paid');
  } else {
    await updateOrderStatus(body.merchantTransactionId, 'failed');
  }
  
  return NextResponse.json({ received: true });
}
```

## 📊 Monitoring en production

### Logs à surveiller:
- ✅ Taux de succès des paiements
- ❌ Codes d'erreur fréquents
- ⏱️ Temps de réponse des API
- 💰 Montants des transactions

### Métriques importantes:
```typescript
// Exemple de logging
console.log('📊 Payment Stats:', {
  provider,
  amount,
  status: result.success ? 'SUCCESS' : 'FAILED',
  errorCode: result.error,
  duration: Date.now() - startTime,
});
```

## 🆘 Support

En cas de problème en production:

1. **Vérifier les logs serveur** (`/api/payments/mobile-money`)
2. **Contacter le support du fournisseur**:
   - Orange Money: support-api@orange.com
   - Telecel: support@telecel.cf
3. **Vérifier les statuts API**: Incidents, maintenance, etc.

## 📝 Checklist avant mise en production

- [ ] Obtenir les accès API Orange Money
- [ ] Obtenir les accès API Telecel
- [ ] Configurer les variables d'environnement
- [ ] Remplacer la simulation par les vraies API
- [ ] Tester en mode sandbox
- [ ] Configurer les webhooks
- [ ] Mettre en place le monitoring
- [ ] Tester avec de vrais paiements (petits montants)
- [ ] Former l'équipe support
- [ ] Documenter les procédures d'incident

---

**Status actuel:** 🧪 **MODE SIMULATION** - Tous les codes fonctionnent sauf 111111, 222222, 333333

**Status cible:** 🚀 **MODE PRODUCTION** - Intégration avec vraies API Orange Money & Telecel
