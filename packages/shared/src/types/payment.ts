export type PaymentMethod = 'card' | 'paypal' | 'mobile_money' | 'cash';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface StripePaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface PayPalOrder {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface MobileMoneyPayment {
  provider: 'orange' | 'mtn' | 'moov' | 'wave';
  phoneNumber: string;
  transactionId?: string;
  status: PaymentStatus;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  message?: string;
}
