(function () {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }

  let deferredInstallPrompt = null;

  function isStandaloneMode() {
    return (
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      window.navigator.standalone === true
    );
  }

  function notifyInstallHint(message) {
    const toast = document.getElementById('toastNotification');
    const msgEl = document.getElementById('toastMessage');
    if (toast && msgEl) {
      msgEl.textContent = message;
      toast.classList.add('show');
      clearTimeout(toast._pwaTimer);
      toast._pwaTimer = setTimeout(() => {
        toast.classList.remove('show');
      }, 4000);
      return;
    }

    let banner = document.getElementById('pwaInstallToast');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'pwaInstallToast';
      banner.setAttribute('role', 'status');
      banner.style.cssText =
        'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#0f172a;color:#ffffff;' +
        'padding:10px 16px;border-radius:10px;font-size:13px;font-weight:600;z-index:2000;' +
        'box-shadow:0 8px 24px rgba(0,0,0,0.2);max-width:90vw;text-align:center;';
      document.body.appendChild(banner);
    }
    banner.textContent = message;
    banner.style.display = 'block';
    clearTimeout(banner._pwaTimer);
    banner._pwaTimer = setTimeout(() => {
      banner.style.display = 'none';
    }, 4000);
  }

  function initInstallButton() {
    const installBtn = document.getElementById('installAppBtn');
    if (!installBtn) return;

    if (isStandaloneMode()) {
      installBtn.style.display = 'none';
      return;
    }

    installBtn.addEventListener('click', async () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        try {
          const result = await deferredInstallPrompt.userChoice;
          if (result && result.outcome === 'accepted') {
            installBtn.style.display = 'none';
          }
        } catch (_) {}
        deferredInstallPrompt = null;
        return;
      }

      const isIos = /(iphone|ipad|ipod)/i.test(navigator.userAgent);
      const isUr =
        (document.documentElement.getAttribute('lang') || '').toLowerCase() === 'ur' ||
        document.body.getAttribute('data-lang') === 'ur';

      if (isIos) {
        notifyInstallHint(
          isUr
            ? 'سفاری میں Share بٹن دبائیں اور "Add to Home Screen" منتخب کریں۔'
            : 'In Safari, tap Share and select "Add to Home Screen" to install.'
        );
      } else {
        notifyInstallHint(
          isUr
            ? 'براؤزر مینو کھولیں اور "Install app" یا "Add to Home screen" منتخب کریں۔'
            : 'Open your browser menu and select "Install app" or "Add to Home screen".'
        );
      }
    });
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    const installBtn = document.getElementById('installAppBtn');
    if (installBtn && !isStandaloneMode()) {
      installBtn.style.display = '';
    }
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    const installBtn = document.getElementById('installAppBtn');
    if (installBtn) {
      installBtn.style.display = 'none';
    }
    notifyInstallHint('Check Bill Online app installed.');
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInstallButton);
  } else {
    initInstallButton();
  }
})();
