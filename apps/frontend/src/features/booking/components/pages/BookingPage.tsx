import type { JSX } from 'react';
import { useAuthStore } from '@features/auth/store/auth.store';
import { MyAvailability } from '../organisms/MyAvailability';
import { ReferentList } from '../organisms/ReferentList';

export function BookingPage(): JSX.Element {
  const role = useAuthStore(s => s.user?.role);
  return role === 'technical_ref' ? <MyAvailability /> : <ReferentList />;
}
