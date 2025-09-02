import React from 'react';

// Performance monitoring and optimization utilities

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  bundleSize: number;
  memoryUsage?: number;
  componentRenderCount: Record<string, number>;
}

export interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  chunkCount: number;
  largestChunks: Array<{ name: string; size: number }>;
  duplicateModules: Array<{ name: string; count: number }>;
}

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PerformanceWithMemory extends Performance {
  memory: PerformanceMemory;
}

type GenericFunction = (...args: unknown[]) => unknown;

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    loadTime: 0,
    renderTime: 0,
    bundleSize: 0,
    componentRenderCount: {}
  };

  private observers: Set<(metrics: PerformanceMetrics) => void> = new Set();

  constructor() {
    this.initializeMonitoring();
  }

  private initializeMonitoring() {
    // Monitor page load time
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        const loadTime = performance.now();
        this.metrics.loadTime = loadTime;
        this.notifyObservers();
      });

      // Monitor memory usage if available
      if ('memory' in performance) {
        setInterval(() => {
          this.metrics.memoryUsage = (performance as PerformanceWithMemory).memory.usedJSHeapSize;
          this.notifyObservers();
        }, 5000);
      }
    }
  }

  public trackComponentRender(componentName: string) {
    this.metrics.componentRenderCount[componentName] = 
      (this.metrics.componentRenderCount[componentName] || 0) + 1;
    this.notifyObservers();
  }

  public trackRenderTime(renderTime: number) {
    this.metrics.renderTime = renderTime;
    this.notifyObservers();
  }

  public setBundleSize(size: number) {
    this.metrics.bundleSize = size;
    this.notifyObservers();
  }

  public subscribe(callback: (metrics: PerformanceMetrics) => void) {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  private notifyObservers() {
    this.observers.forEach(callback => callback(this.metrics));
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public reset() {
    this.metrics = {
      loadTime: 0,
      renderTime: 0,
      bundleSize: 0,
      componentRenderCount: {}
    };
    this.notifyObservers();
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for tracking component renders
export const usePerformanceTracking = (componentName: string) => {
  React.useEffect(() => {
    performanceMonitor.trackComponentRender(componentName);
  });
};

// Bundle size analyzer
export const analyzeBundleSize = async (): Promise<BundleAnalysis> => {
  try {
    // In a real implementation, this would analyze the webpack bundle
    // For now, we'll return a mock analysis
    const mockAnalysis: BundleAnalysis = {
      totalSize: 66930, // 66.93 kB
      gzippedSize: 66930,
      chunkCount: 1,
      largestChunks: [
        { name: 'main', size: 66930 }
      ],
      duplicateModules: []
    };

    return mockAnalysis;
  } catch (error) {
    console.error('Bundle analysis failed:', error);
    throw error;
  }
};

// Performance optimization utilities
export const debounce = <T extends GenericFunction>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends GenericFunction>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memory usage monitoring
export const getMemoryUsage = (): number | null => {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    return (performance as PerformanceWithMemory).memory.usedJSHeapSize;
  }
  return null;
};

// Performance budget checking
export const checkPerformanceBudget = (metrics: PerformanceMetrics): {
  passed: boolean;
  warnings: string[];
} => {
  const warnings: string[] = [];
  
  // Load time budget: 3 seconds
  if (metrics.loadTime > 3000) {
    warnings.push(`Load time (${metrics.loadTime.toFixed(0)}ms) exceeds 3s budget`);
  }
  
  // Bundle size budget: 100KB
  if (metrics.bundleSize > 100000) {
    warnings.push(`Bundle size (${(metrics.bundleSize / 1024).toFixed(1)}KB) exceeds 100KB budget`);
  }
  
  // Render time budget: 100ms
  if (metrics.renderTime > 100) {
    warnings.push(`Render time (${metrics.renderTime.toFixed(0)}ms) exceeds 100ms budget`);
  }
  
  return {
    passed: warnings.length === 0,
    warnings
  };
};

// Web Vitals monitoring
export const trackWebVitals = () => {
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    try {
      // Track Largest Contentful Paint (LCP)
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          // LCP tracked for performance monitoring
          performanceMonitor.trackRenderTime(lastEntry.startTime);
        }
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      
      // Track First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
                      if ('processingStart' in entry) {
              // FID tracked for performance monitoring
              // Future: Store FID for performance analysis
            }
        });
      });
      
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      console.warn('Web Vitals tracking not supported:', error);
    }
  }
};

// Initialize web vitals tracking only in browser environment
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  trackWebVitals();
}
