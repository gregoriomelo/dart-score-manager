/**
 * PWA Install Component
 * Prompts users to install the Progressive Web App
 */

import React, { useState, useEffect } from 'react';
import { useDeviceCapabilities } from '../hooks/useTouch';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallProps {
  className?: string;
  onInstall?: () => void;
  onDismiss?: () => void;
}

export const PWAInstall: React.FC<PWAInstallProps> = ({
  className = '',
  onInstall,
  onDismiss,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const { isMobile } = useDeviceCapabilities();

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a delay
      setTimeout(() => {
        if (!checkIfInstalled()) {
          setShowPrompt(true);
        }
      }, 3000);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      onInstall?.();
    };

    // Check if already installed
    if (checkIfInstalled()) {
      return;
    }

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Show prompt for mobile users after a delay
    if (isMobile) {
      const timer = setTimeout(() => {
        if (!checkIfInstalled() && !deferredPrompt) {
          setShowPrompt(true);
        }
      }, 5000);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isMobile, deferredPrompt, onInstall]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Fallback for browsers that don't support beforeinstallprompt
      if (isMobile) {
        // Show instructions for manual installation
        alert(
          'To install this app:\n\n' +
          'iOS: Tap the share button and select "Add to Home Screen"\n' +
          'Android: Tap the menu button and select "Add to Home Screen"'
        );
      }
      return;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setIsInstalled(true);
        setShowPrompt(false);
        onInstall?.();
      } else {
        console.log('User dismissed the install prompt');
        setShowPrompt(false);
        onDismiss?.();
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    onDismiss?.();
  };

  const handleClose = () => {
    setShowPrompt(false);
    onDismiss?.();
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div className={`pwa-install-prompt ${className}`}>
      <div className="pwa-install-content">
        <div className="pwa-install-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
        </div>
        <div className="pwa-install-text">
          <div className="pwa-install-title">Install Dart Score Manager</div>
          <div className="pwa-install-description">
            Add to home screen for quick access
          </div>
        </div>
      </div>
      <button 
        className="pwa-install-button"
        onClick={handleInstall}
        aria-label="Install app"
      >
        Install
      </button>
      <button 
        className="pwa-install-dismiss"
        onClick={handleDismiss}
        aria-label="Dismiss install prompt"
      >
        Later
      </button>
      <button 
        className="close"
        onClick={handleClose}
        aria-label="Close install prompt"
      >
        ×
      </button>
    </div>
  );
};

export default PWAInstall;
