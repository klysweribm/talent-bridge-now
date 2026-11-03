import { LoginForm } from '@features/auth/components/organisms/LoginForm';
import { LoginShowcasePanel } from '@features/auth/components/organisms/LoginShowcasePanel/LoginShowcasePanel';
import { AuthFooter } from '@features/auth/components/molecules/AuthFooter';

export function LoginPage(): JSX.Element {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-surface-card">
      <LoginShowcasePanel />

      <main className="flex flex-col items-center justify-center p-lg">
        <LoginForm />
        <AuthFooter />
      </main>
    </div>
  );
}
