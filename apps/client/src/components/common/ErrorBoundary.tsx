import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex h-screen items-center justify-center bg-red-50 p-4 text-center">
                    <div className="rounded-xl border border-red-200 bg-white p-8 shadow-xl">
                        <h1 className="mb-4 text-2xl font-bold text-red-600 italic">System Interruption</h1>
                        <p className="mb-6 text-gray-600">The interface encountered an unexpected error. This has been logged for remediation.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="rounded-lg bg-red-600 px-6 py-2 font-bold text-white transition-colors hover:bg-red-700"
                        >
                            Reload Interface
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
