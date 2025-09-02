import React, { Suspense, lazy } from 'react';

// Lazy load components for code splitting
export const LazyPlayerSetup = lazy(() => import('../../features/player/components/PlayerSetup'));
export const LazyMultiStepSetup = lazy(() => import('../../features/player/components/MultiStepSetup'));

// Loading fallback component
export const LoadingFallback: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => (
  <div 
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
      minHeight: '200px'
    }}
    role="status"
    aria-live="polite"
  >
    <div style={{ textAlign: 'center' }}>
      <div 
        style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }}
        aria-hidden="true"
      />
      <p>{message}</p>
    </div>
  </div>
);

// Lazy component wrapper with error boundary
interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

export const LazyComponent: React.FC<LazyComponentProps> = ({ 
  children, 
  fallback = <LoadingFallback />,
  errorFallback = <div>Error loading component</div>
}) => {
  return (
    <Suspense fallback={fallback}>
      <ErrorBoundary fallback={errorFallback}>
        {children}
      </ErrorBoundary>
    </Suspense>
  );
};

// Simple error boundary for lazy components
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): { hasError: boolean; error: Error } {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleStartOver = () => {
    // Clear any corrupted game state from localStorage
    try {
      localStorage.removeItem('dartScoreManager_gameState');
      sessionStorage.removeItem('dartScoreManager_gameState');
    } catch (e) {
      console.warn('Could not clear game state:', e);
    }
    
    // Reload the page to start fresh
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem',
          minHeight: '200px',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3>Something went wrong</h3>
            <p>There was an error loading the component.</p>
            {this.state.error && (
              <details style={{ marginTop: '1rem', textAlign: 'left' }}>
                <summary>Error details</summary>
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: '0.5rem', 
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  overflow: 'auto'
                }}>
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={this.handleRetry}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
            <button 
              onClick={this.handleStartOver}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Start Over
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Add CSS for loading spinner
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
