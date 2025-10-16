import SignupForm from '@/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 px-4 py-10 sm:py-12">
      <div className="w-full max-w-md">
        <SignupForm />
      </div>
    </div>
  );
}
