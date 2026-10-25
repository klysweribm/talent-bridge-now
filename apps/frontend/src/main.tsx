import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
import { queryClient } from '@shared/infrastructure/queryClient';
import { installSessionCacheGuard } from '@shared/infrastructure/sessionCacheGuard';

// A nivel de módulo: se instala una sola vez, aunque StrictMode re-renderice.
installSessionCacheGuard(queryClient);

const root = document.getElementById('root');
if (!root) throw new Error('Root element #root not found in DOM');

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
