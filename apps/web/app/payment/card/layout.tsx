// Force dynamic rendering pour la page de paiement par carte
export const dynamic = 'force-dynamic';

export default function CardPaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
