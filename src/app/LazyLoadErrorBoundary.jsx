import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class LazyLoadErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            retryCount: 0,
            isRetrying: false
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Lazy load error caught:', error, errorInfo);

        // Log specific information about the error
        if (error.message && error.message.includes('Failed to fetch dynamically imported module')) {
            console.error('Dynamic import failed - possible MIME type or network issue');
        }

        // Auto-retry once for network errors
        if (this.state.retryCount === 0 && this.isNetworkError(error)) {
            setTimeout(() => {
                this.handleRetry();
            }, 1000);
        }
    }

    isNetworkError = (error) => {
        return error.message && (
            error.message.includes('Failed to fetch') ||
            error.message.includes('dynamically imported module') ||
            error.message.includes('NetworkError')
        );
    };

    handleRetry = () => {
        const { retryCount } = this.state;

        this.setState({ isRetrying: true });

        // After 2 retries, force a full page reload
        if (retryCount >= 2) {
            window.location.reload();
            return;
        }

        // Try to recover without full page reload
        setTimeout(() => {
            this.setState(prevState => ({
                hasError: false,
                error: null,
                retryCount: prevState.retryCount + 1,
                isRetrying: false
            }));
        }, 500);
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
                    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                                Error al cargar el componente
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                No se pudo cargar esta página. Por favor, intenta recargar.
                            </p>
                            {this.state.error && (
                                <div className="w-full mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-left">
                                    <p className="text-xs text-gray-600 dark:text-gray-400 font-mono break-all">
                                        {this.state.error.message}
                                    </p>
                                </div>
                            )}
                            <button
                                onClick={this.handleRetry}
                                disabled={this.state.isRetrying}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors"
                            >
                                <RefreshCw className={`w-4 h-4 ${this.state.isRetrying ? 'animate-spin' : ''}`} />
                                {this.state.isRetrying ? 'Reintentando...' : 'Reintentar'}
                            </button>
                            {this.state.retryCount > 0 && (
                                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                                    Intentos: {this.state.retryCount}/3
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default LazyLoadErrorBoundary;
