import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/providers/AuthProvider';
import { CartProvider } from '@/providers/CartProvider';
import CartSidebar from '@/components/cart/CartSidebar';
import FloatingCartButton from '@/components/cart/FloatingCartButton';
import PageLoader from '@/components/layout/PageLoader';
import InitialLoader from '@/components/layout/InitialLoader';
import NavLoadingProvider from '@/providers/NavLoadingProvider';
import PostLoginToast from '@/components/ui/PostLoginToast';
import RouteViewport from '@/components/layout/RouteViewport';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pizza King - La meilleure pizza livrée chez vous',
  description:
    'Commandez vos pizzas préférées en quelques clics. Livraison rapide et qualité garantie.',
  keywords: ['pizza', 'livraison', 'restaurant', 'commande en ligne'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <NavLoadingProvider />
            <InitialLoader />
            <PageLoader />
            <PostLoginToast />
            <RouteViewport>{children}</RouteViewport>
            <FloatingCartButton />
            <CartSidebar />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
