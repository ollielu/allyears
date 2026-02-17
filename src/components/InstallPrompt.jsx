import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // 檢查是否已經安裝
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // 檢查是否已經顯示過提示（使用 localStorage）
    const hasShownPrompt = localStorage.getItem('pwa-install-prompt-shown');
    if (hasShownPrompt) {
      return;
    }

    // 監聽 beforeinstallprompt 事件
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 檢查是否支援 PWA 安裝
    // 對於 iOS Safari，我們顯示自定義提示
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isIOS && !isStandalone && !hasShownPrompt) {
      // 延遲顯示，讓用戶先看到內容
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // iOS 或其他不支援 beforeinstallprompt 的瀏覽器
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      localStorage.setItem('pwa-install-prompt-shown', 'true');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-prompt-shown', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) {
    return null;
  }

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              安裝 My Planner
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {isIOS ? (
                <>
                  點擊 <span className="font-semibold">分享</span> 按鈕，然後選擇{' '}
                  <span className="font-semibold">「加入主畫面」</span>
                </>
              ) : isAndroid ? (
                '將應用程式加入主畫面，以便快速存取'
              ) : (
                '將應用程式安裝到您的裝置，以便離線使用'
              )}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="關閉"
          >
            <X size={20} />
          </button>
        </div>
        
        {isIOS ? (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-700 dark:text-gray-300">步驟：</div>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>點擊瀏覽器底部的分享按鈕</li>
                <li>向下滾動找到「加入主畫面」</li>
                <li>點擊即可完成安裝</li>
              </ol>
            </div>
          </div>
        ) : (
          <button
            onClick={handleInstallClick}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            安裝應用程式
          </button>
        )}
      </div>
    </div>
  );
}
