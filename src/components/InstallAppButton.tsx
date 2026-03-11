import { useState, useEffect } from 'react';

// Tell TypeScript about the special PWA install event
interface BeforeInstallPromptEvent extends Event {
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Check if the device is Android
    const userAgent = navigator.userAgent.toLowerCase();
    setIsAndroid(userAgent.includes('android'));

    // 2. Capture the install event when Chrome says it's ready
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // Stop Chrome's default popups
      setDeferredPrompt(e as BeforeInstallPromptEvent); // Save it to our button
    };

    // 3. Check if they already installed it
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Trigger the official install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to click yes or no
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null); // Hide button after successful install
    }
  };

  // ONLY show the button if: It's Android + Not Installed + Chrome is ready
  if (!isAndroid || isInstalled || !deferredPrompt) {
    return null; 
  }

// A clean, standard button that fits perfectly in a Navbar
  return (
    <button 
      onClick={handleInstallClick}
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
      Install App
    </button>
  );
}
