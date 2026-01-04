import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-card border-2 border-primary rounded-xl shadow-2xl p-4 z-50 animate-slide-up">
      <button
        onClick={() => setShowPrompt(false)}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 p-3 rounded-lg flex-shrink-0">
          <img src="/assets/logo.png" alt="Logo" className="w-10 h-10" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">نزّل التطبيق</h3>
          <p className="text-sm text-muted-foreground mb-3">
            ثبت هاي سيفيتي على جهازك للوصول السريع
          </p>
          
          <Button 
            onClick={handleInstall}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <Download className="w-4 h-4 mr-2" />
            تثبيت التطبيق
          </Button>
        </div>
      </div>
    </div>
  );
}
