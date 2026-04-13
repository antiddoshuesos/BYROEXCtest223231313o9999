/* ============================================
   BYROEXC — App Router & Core
   ============================================ */

const App = (() => {
  let currentPage = 'dashboard';
  let currentParam = null;

  const pages = {
    dashboard: { module: () => DashboardPage, title: 'Dashboard', icon: 'dashboard' },
    trading: { module: () => TradingPage, title: 'Trade', icon: 'trading' },
    wallet: { module: () => WalletPage, title: 'Wallet', icon: 'wallet' },
    markets: { module: () => MarketsPage, title: 'Markets', icon: 'markets' },
    portfolio: { module: () => PortfolioPage, title: 'Portfolio', icon: 'portfolio' },
    settings: { module: () => SettingsPage, title: 'Settings', icon: 'settings' }
  };

  function init() {
    // Detect if running in Electron
    if (!window.electronAPI) {
      document.body.classList.add('browser-mode');
    }

    // Setup window controls
    setupWindowControls();

    // Start market data
    MarketData.start(1500);

    // Listen for data updates
    MarketData.onUpdate((coins) => {
      const page = pages[currentPage];
      if (page && page.module().onUpdate) {
        page.module().onUpdate(coins);
      }
    });

    // Navigate to default page
    navigate('dashboard');

    // Setup nav click handlers
    document.querySelectorAll('.sidebar__nav-item[data-page]').forEach(item => {
      item.addEventListener('click', () => {
        navigate(item.dataset.page);
      });
    });
  }

  function navigate(page, param) {
    if (!pages[page]) return;

    currentPage = page;
    currentParam = param || null;

    // Update active nav
    document.querySelectorAll('.sidebar__nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });

    // Update header title
    const titleEl = document.querySelector('.header__page-title');
    if (titleEl) titleEl.textContent = pages[page].title;

    // Render page
    const container = document.getElementById('page-container');
    if (container) {
      container.classList.remove('page-enter');
      container.innerHTML = '';

      // Force reflow then add animation
      requestAnimationFrame(() => {
        const module = pages[page].module();
        container.innerHTML = module.render(param);
        container.classList.add('page-enter');

        // After render hook
        if (module.afterRender) {
          requestAnimationFrame(() => module.afterRender());
        }
      });
    }
  }

  function setupWindowControls() {
    const minimizeBtn = document.getElementById('window-minimize');
    const maximizeBtn = document.getElementById('window-maximize');
    const closeBtn = document.getElementById('window-close');

    if (window.electronAPI) {
      if (minimizeBtn) minimizeBtn.addEventListener('click', () => window.electronAPI.minimize());
      if (maximizeBtn) maximizeBtn.addEventListener('click', () => window.electronAPI.maximize());
      if (closeBtn) closeBtn.addEventListener('click', () => window.electronAPI.close());
    }
  }

  // Toast notification system
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        ${type === 'success' ? '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>' :
          type === 'error' ? '<circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>' :
          '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>'}
      </svg>
      <span style="flex:1">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  return { init, navigate, showToast };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', App.init);
