import type { ReactNode } from 'react';
import { DecisionProvider } from './DecisionContext';

export function AppProviders({ children }: { children: ReactNode }) {
    return (
        <DecisionProvider>
            {children}
        </DecisionProvider>
    );
}
