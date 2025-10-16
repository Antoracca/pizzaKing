import EnhancedLoginForm from '@/components/auth/EnhancedLoginForm';

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <EnhancedLoginForm backHref="/" />
    </div>
  );
}
