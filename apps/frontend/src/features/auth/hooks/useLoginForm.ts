import type { FormEvent } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuthStore } from '@features/auth/store/auth.store';
import { loginUser } from '@features/auth/infrastructure/auth.infra';

export const loginSchema = z.object({
  email: z.string().min(1, 'El correo es obligatorio.').email('Ingresa un correo válido.'),
  password: z.string().min(1, 'La contraseña es obligatoria.'),
});

export type TLoginFormValues = z.infer<typeof loginSchema>;

export function useLoginForm() {
  const { register, handleSubmit: buildSubmit, formState: { errors } } = useForm<TLoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  const setAuth = useAuthStore(state => state.setAuth);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: ({ user, token }) => {
      setAuth(user, token);
      navigate('/dashboard', { replace: true });
    },
  });

  const onSubmit = buildSubmit(values => mutation.mutate(values));
  const handleSubmit = (event: FormEvent): void => { void onSubmit(event); };

  return {
    register,
    errors,
    handleSubmit,
    loading: mutation.isPending,
    error: mutation.isError ? mutation.error.message : null,
  };
}
