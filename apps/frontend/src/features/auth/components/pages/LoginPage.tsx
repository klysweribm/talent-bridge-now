import { DotMatrixBackdrop } from '@features/auth/components/atoms/DotMatrixBackdrop';
import { LoginForm } from '@features/auth/components/organisms/LoginForm';
import { AuthFooter } from '@features/auth/components/molecules/AuthFooter';

export function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-base relative overflow-hidden bg-surface">
      <DotMatrixBackdrop />

      <LoginForm />

      <AuthFooter />
    </div>
  );
}
