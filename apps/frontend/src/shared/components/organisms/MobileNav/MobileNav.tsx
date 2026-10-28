import type { JSX } from 'react';
import { BottomNav } from '@shared/components/molecules/BottomNav';
import { useVisibleNavItems } from '@shared/hooks/useVisibleNavItems';

export function MobileNav(): JSX.Element {
  return <BottomNav items={useVisibleNavItems()} />;
}
