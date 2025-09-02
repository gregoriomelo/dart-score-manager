// Service Worker registration and management

// Use the built-in ServiceWorkerRegistration type instead of custom interface

// ServiceWorkerMessage interface removed as it's not used

class ServiceWorkerManager {
  private registration: globalThis.ServiceWorkerRegistration | null = null;
  private updateAvailable = false;

  async register(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/service-worker.js');
        // Service Worker registered successfully

        this.setupEventListeners();
        this.checkForUpdates();
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  private setupEventListeners(): void {
    if (!this.registration) return;

    // Handle service worker updates
    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration?.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            this.updateAvailable = true;
            this.notifyUpdateAvailable();
          }
        });
      }
    });

    // Handle service worker activation
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Service Worker activated
      this.updateAvailable = false;
    });
  }

  private checkForUpdates(): void {
    if (this.registration) {
      this.registration.update();
    }
  }

  private notifyUpdateAvailable(): void {
    // Dispatch custom event for app to handle
    window.dispatchEvent(new CustomEvent('swUpdateAvailable'));
  }

  async update(): Promise<void> {
    if (this.registration && this.registration.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  async getCacheSize(): Promise<Array<{ name: string; size: number }>> {
    return new Promise((resolve) => {
      if (this.registration && this.registration.active) {
        const channel = new MessageChannel();
        channel.port1.onmessage = (event) => {
          if (event.data.type === 'CACHE_SIZE') {
            resolve(event.data.data);
          }
        };
        this.registration.active.postMessage(
          { type: 'GET_CACHE_SIZE' },
          [channel.port2]
        );
      } else {
        resolve([]);
      }
    });
  }

  async clearCache(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
      // Cache cleared successfully
    }
  }

  isUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  isSupported(): boolean {
    return 'serviceWorker' in navigator;
  }
}

// Global service worker manager instance
export const serviceWorkerManager = new ServiceWorkerManager();

// Export for use in components
export const registerServiceWorker = () => serviceWorkerManager.register();
export const updateServiceWorker = () => serviceWorkerManager.update();
export const clearCache = () => serviceWorkerManager.clearCache();
export const getCacheSize = () => serviceWorkerManager.getCacheSize();
export const isUpdateAvailable = () => serviceWorkerManager.isUpdateAvailable();
export const isServiceWorkerSupported = () => serviceWorkerManager.isSupported();
