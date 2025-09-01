import React, { useState, useEffect } from 'react';
import { performanceMonitor, analyzeBundleSize, checkPerformanceBudget } from '../utils/performance';
import { getCacheSize, clearCache } from '../../../app/utils/serviceWorker';
import './PerformanceDashboard.css';

interface PerformanceDashboardProps {
  isVisible: boolean;
  onClose: () => void;
}

interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  chunkCount: number;
  largestChunks: Array<{ name: string; size: number }>;
}

interface ChunkInfo {
  name: string;
  size: number;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ isVisible, onClose }) => {
  const [metrics, setMetrics] = useState(performanceMonitor.getMetrics());
  const [cacheSizes, setCacheSizes] = useState<Array<{ name: string; size: number }>>([]);
  const [bundleAnalysis, setBundleAnalysis] = useState<BundleAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const unsubscribe = performanceMonitor.subscribe(setMetrics);
    
    // Load cache sizes
    loadCacheSizes();
    
    // Load bundle analysis
    loadBundleAnalysis();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isVisible]);

  const loadCacheSizes = async () => {
    try {
      const sizes = await getCacheSize();
      setCacheSizes(sizes);
    } catch (error) {
      console.error('Failed to load cache sizes:', error);
    }
  };

  const loadBundleAnalysis = async () => {
    try {
      setIsLoading(true);
      const analysis = await analyzeBundleSize();
      setBundleAnalysis(analysis);
    } catch (error) {
      console.error('Failed to load bundle analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCache = async () => {
    try {
      await clearCache();
      await loadCacheSizes();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const budgetCheck = checkPerformanceBudget(metrics);

  if (!isVisible) return null;

  return (
    <div className="performance-dashboard-overlay">
      <div className="performance-dashboard">
        <div className="performance-dashboard-header">
          <h2>Performance Dashboard</h2>
          <button onClick={onClose} className="close-button" aria-label="Close dashboard">
            ×
          </button>
        </div>

        <div className="performance-dashboard-content">
          {/* Performance Metrics */}
          <section className="metrics-section">
            <h3>Performance Metrics</h3>
            <div className="metrics-grid">
              <div className="metric-card">
                <label>Load Time</label>
                <span className={metrics.loadTime > 3000 ? 'warning' : 'good'}>
                  {formatTime(metrics.loadTime)}
                </span>
              </div>
              <div className="metric-card">
                <label>Render Time</label>
                <span className={metrics.renderTime > 100 ? 'warning' : 'good'}>
                  {formatTime(metrics.renderTime)}
                </span>
              </div>
              <div className="metric-card">
                <label>Bundle Size</label>
                <span className={metrics.bundleSize > 100000 ? 'warning' : 'good'}>
                  {formatBytes(metrics.bundleSize)}
                </span>
              </div>
              {metrics.memoryUsage && (
                <div className="metric-card">
                  <label>Memory Usage</label>
                  <span>{formatBytes(metrics.memoryUsage)}</span>
                </div>
              )}
            </div>
          </section>

          {/* Performance Budget */}
          <section className="budget-section">
            <h3>Performance Budget</h3>
            <div className={`budget-status ${budgetCheck.passed ? 'passed' : 'failed'}`}>
              <span className="status-indicator">
                {budgetCheck.passed ? '✅' : '❌'}
              </span>
              <span>{budgetCheck.passed ? 'All budgets met' : 'Budgets exceeded'}</span>
            </div>
            {budgetCheck.warnings.length > 0 && (
              <ul className="budget-warnings">
                {budgetCheck.warnings.map((warning, index) => (
                  <li key={index} className="warning-item">{warning}</li>
                ))}
              </ul>
            )}
          </section>

          {/* Component Render Count */}
          <section className="components-section">
            <h3>Component Renders</h3>
            <div className="components-list">
              {Object.entries(metrics.componentRenderCount)
                .sort(([, a], [, b]) => b - a)
                .map(([component, count]) => (
                  <div key={component} className="component-item">
                    <span className="component-name">{component}</span>
                    <span className="render-count">{count}</span>
                  </div>
                ))}
            </div>
          </section>

          {/* Cache Information */}
          <section className="cache-section">
            <h3>Cache Information</h3>
            <div className="cache-controls">
              <button onClick={loadCacheSizes} className="refresh-button">
                Refresh Cache Info
              </button>
              <button onClick={handleClearCache} className="clear-button">
                Clear Cache
              </button>
            </div>
            <div className="cache-sizes">
              {cacheSizes.map((cache) => (
                <div key={cache.name} className="cache-item">
                  <span className="cache-name">{cache.name}</span>
                  <span className="cache-size">{formatBytes(cache.size)}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Bundle Analysis */}
          <section className="bundle-section">
            <h3>Bundle Analysis</h3>
            {isLoading ? (
              <div className="loading">Loading bundle analysis...</div>
            ) : bundleAnalysis ? (
              <div className="bundle-info">
                <div className="bundle-item">
                  <label>Total Size:</label>
                  <span>{formatBytes(bundleAnalysis.totalSize)}</span>
                </div>
                <div className="bundle-item">
                  <label>Gzipped Size:</label>
                  <span>{formatBytes(bundleAnalysis.gzippedSize)}</span>
                </div>
                <div className="bundle-item">
                  <label>Chunk Count:</label>
                  <span>{bundleAnalysis.chunkCount}</span>
                </div>
                {bundleAnalysis.largestChunks.length > 0 && (
                  <div className="chunks-list">
                    <label>Largest Chunks:</label>
                    {bundleAnalysis.largestChunks.map((chunk: ChunkInfo) => (
                      <div key={chunk.name} className="chunk-item">
                        <span>{chunk.name}</span>
                        <span>{formatBytes(chunk.size)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="error">Failed to load bundle analysis</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
