/**
 * Service Worker Registration Utility
 */

export interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

/**
 * Register service worker
 */
export function registerServiceWorker(config: ServiceWorkerConfig = {}) {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      registerValidSW(swUrl, config);
    });
  }
}

/**
 * Register valid service worker
 */
function registerValidSW(swUrl: string, config: ServiceWorkerConfig) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // At this point, the updated precached content has been fetched,
              // but the previous service worker will still serve the older
              // content until all client tabs are closed.
              console.log(
                'New content is available and will be used when all ' +
                  'tabs for this page are closed. See https://cra.link/PWA.'
              );

              // Execute callback
              config.onUpdate?.(registration);
            } else {
              // At this point, everything has been precached.
              // It's the perfect time to display a
              // "Content is cached for offline use." message.
              console.log('Content is cached for offline use.');

              // Execute callback
              config.onSuccess?.(registration);
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
      config.onError?.(error);
    });
}

/**
 * Unregister service worker
 */
export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}

/**
 * Check if service worker is supported
 */
export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator;
}

/**
 * Get service worker registration
 */
export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!isServiceWorkerSupported()) {
    return null;
  }

  try {
    return await navigator.serviceWorker.ready;
  } catch (error) {
    console.error('Error getting service worker registration:', error);
    return null;
  }
}

/**
 * Send message to service worker
 */
export async function sendMessageToServiceWorker(message: any): Promise<any> {
  const registration = await getServiceWorkerRegistration();
  if (!registration) {
    throw new Error('Service worker not available');
  }

  return new Promise((resolve, reject) => {
    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = (event) => {
      resolve(event.data);
    };

    registration.active?.postMessage(message, [messageChannel.port2]);
  });
}

/**
 * Cache game data in service worker
 */
export async function cacheGameData(gameData: any): Promise<void> {
  try {
    await sendMessageToServiceWorker({
      type: 'CACHE_GAME_DATA',
      data: gameData,
    });
  } catch (error) {
    console.error('Failed to cache game data:', error);
  }
}

/**
 * Get cached game data from service worker
 */
export async function getCachedGameData(): Promise<any> {
  try {
    return await sendMessageToServiceWorker({
      type: 'GET_CACHED_GAME_DATA',
    });
  } catch (error) {
    console.error('Failed to get cached game data:', error);
    return null;
  }
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'default') {
    return await Notification.requestPermission();
  }

  return Notification.permission;
}

/**
 * Show notification
 */
export async function showNotification(
  title: string,
  options: NotificationOptions = {}
): Promise<void> {
  const permission = await requestNotificationPermission();
  
  if (permission === 'granted') {
    const registration = await getServiceWorkerRegistration();
    if (registration) {
      await registration.showNotification(title, {
        icon: '/dart.svg',
        badge: '/dart.svg',
        vibrate: [100, 50, 100],
        ...options,
      });
    }
  }
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  try {
    const registration = await getServiceWorkerRegistration();
    if (!registration) {
      throw new Error('Service worker not available');
    }

    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY || ''),
    });

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  try {
    const registration = await getServiceWorkerRegistration();
    if (!registration) {
      return false;
    }

    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error);
    return false;
  }
}

/**
 * Check if app is installed
 */
export function isAppInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
}

/**
 * Check if app is online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Listen for online/offline status changes
 */
export function onOnlineStatusChange(callback: (isOnline: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Convert VAPID public key to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Get service worker update info
 */
export async function getServiceWorkerUpdateInfo(): Promise<{
  hasUpdate: boolean;
  registration: ServiceWorkerRegistration | null;
}> {
  const registration = await getServiceWorkerRegistration();
  if (!registration) {
    return { hasUpdate: false, registration: null };
  }

  const hasUpdate = registration.waiting !== null;
  return { hasUpdate, registration };
}

/**
 * Skip waiting and reload for service worker update
 */
export async function skipWaitingAndReload(): Promise<void> {
  const registration = await getServiceWorkerRegistration();
  if (!registration || !registration.waiting) {
    return;
  }

  registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  
  // Reload the page when the new service worker takes control
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}
