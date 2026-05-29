import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen p-4 bg-red-50 flex flex-col items-center justify-center text-red-900">
                    <h1 className="text-xl font-bold mb-4">Ops! Algo deu errado.</h1>
                    <div className="bg-white p-4 rounded shadow border border-red-200 w-full overflow-auto text-xs font-mono">
                        <p className="font-bold mb-2">{this.state.error?.toString()}</p>
                        <pre>{this.state.errorInfo?.componentStack}</pre>
                    </div>
                    <button
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
                        onClick={() => window.location.reload()}
                    >
                        Recarregar App
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
