// Force dynamic rendering pour toutes les pages de checkout
export const dynamic = 'force-dynamic';

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
