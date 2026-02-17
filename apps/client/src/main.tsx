import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App.tsx'
import ErrorBoundary from './components/common/ErrorBoundary'
import { AppProviders } from './contexts/AppProviders'

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Fatal: Root element not found');
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <AppProviders>
          <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center text-iob-blue animate-pulse font-bold italic tracking-tighter shadow-sm">
            <span className="opacity-70">IOBIAN</span> Dashboard
          </div>}>
            <App />
          </Suspense>
        </AppProviders>
      </ErrorBoundary>
    </StrictMode>,
  )
}
