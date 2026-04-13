/* ============================================
   BYROEXC — Dashboard Page
   ============================================ */

const DashboardPage = (() => {
  let sparklineCanvases = {};

  function render() {
    const coins = MarketData.getCoins();
    const portfolioValue = MarketData.getPortfolioValue();
    const topGainers = MarketData.getTopGainers(5);
    const topLosers = MarketData.getTopLosers(5);
    const txHistory = MarketData.getTransactionHistory().slice(0, 6);

    // Top holdings for pie chart
    const holdings = coins
      .map(c => ({ ...c, usdValue: c.price * c.holdings }))
      .sort((a, b) => b.usdValue - a.usdValue)
      .slice(0, 6);

    const totalHoldings = holdings.reduce((s, h) => s + h.usdValue, 0);

    return `
      <div class="dashboard stagger-children">
        <!-- Portfolio Value -->
        <div class="card portfolio-card hover-lift" id="portfolio-card">
          <div class="portfolio-card__label">Total Portfolio Value</div>
          <div class="portfolio-card__value" id="portfolio-value">${MarketData.formatUSD(portfolioValue)}</div>
          <div class="portfolio-card__change ${portfolioValue > 150000 ? 'price-up' : 'price-down'}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 15l-6-6-6 6"/></svg>
            <span id="portfolio-change">+${(Math.random() * 5 + 1).toFixed(2)}% today</span>
          </div>
          <div class="portfolio-card__actions">
            <button class="btn btn--primary" onclick="App.navigate('trading')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 17l10-10 4 4 6-6"/><path d="M18 7h4v4"/></svg>
              Trade
            </button>
            <button class="btn btn--secondary" onclick="App.navigate('wallet')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 10H2"/></svg>
              Deposit
            </button>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="card quick-stat hover-lift">
          <div class="quick-stat__icon quick-stat__icon--btc">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.5 11.5V7.5H13.5C14.6 7.5 15.5 8.4 15.5 9.5S14.6 11.5 13.5 11.5H11.5ZM9.5 4V20H13.5C16.3 20 18.5 17.8 18.5 15C18.5 13.4 17.7 12 16.5 11.1C17.3 10.3 17.5 9.2 17.5 8C17.5 5.8 15.7 4 13.5 4H9.5ZM11.5 13.5H13.5C15.2 13.5 16.5 14.8 16.5 16.5S15.2 19.5 13.5 19.5H11.5V13.5Z"/></svg>
          </div>
          <div class="quick-stat__label">Bitcoin</div>
          <div class="quick-stat__value" id="stat-btc-price">${MarketData.formatUSD(coins[0].price)}</div>
          <div class="quick-stat__sub ${coins[0].change24h >= 0 ? 'price-up' : 'price-down'}" id="stat-btc-change">
            ${MarketData.formatChange(coins[0].change24h)}
          </div>
        </div>

        <div class="card quick-stat hover-lift">
          <div class="quick-stat__icon quick-stat__icon--eth">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1.75l-6.25 10.5L12 16l6.25-3.75L12 1.75zM12 22.25l-6.25-8.5L12 17.5l6.25-3.75L12 22.25z"/></svg>
          </div>
          <div class="quick-stat__label">Ethereum</div>
          <div class="quick-stat__value" id="stat-eth-price">${MarketData.formatUSD(coins[1].price)}</div>
          <div class="quick-stat__sub ${coins[1].change24h >= 0 ? 'price-up' : 'price-down'}" id="stat-eth-change">
            ${MarketData.formatChange(coins[1].change24h)}
          </div>
        </div>

        <!-- Holdings Chart -->
        <div class="card holdings-card hover-lift">
          <div class="card__header">
            <div class="card__title">Asset Allocation</div>
            <div class="tabs">
              <div class="tab active">Value</div>
              <div class="tab">Tokens</div>
            </div>
          </div>
          <div class="card__body">
            <div class="holdings-chart-container">
              <canvas id="holdings-donut"></canvas>
              <div class="holdings-chart-center">
                <div class="holdings-chart-center__label">Total</div>
                <div class="holdings-chart-center__value" id="holdings-total">${MarketData.formatCompact(totalHoldings)}</div>
              </div>
            </div>
            <div class="holdings-legend">
              ${holdings.map(h => `
                <div class="holdings-legend__item">
                  <div class="holdings-legend__left">
                    <div class="holdings-legend__color" style="background:${h.color}"></div>
                    <span class="holdings-legend__coin">${h.symbol}</span>
                    <span class="holdings-legend__pct">${((h.usdValue / totalHoldings) * 100).toFixed(1)}%</span>
                  </div>
                  <span class="holdings-legend__value">${MarketData.formatUSD(h.usdValue)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Watchlist -->
        <div class="card watchlist-card">
          <div class="card__header">
            <div class="card__title">Watchlist</div>
            <button class="btn btn--ghost btn--sm">View All</button>
          </div>
          <div class="card__body" id="watchlist-body">
            ${renderWatchlist(coins.slice(0, 10))}
          </div>
        </div>

        <!-- Recent Transactions -->
        <div class="card recent-tx-card hover-lift">
          <div class="card__header">
            <div class="card__title">Recent Transactions</div>
            <button class="btn btn--ghost btn--sm" onclick="App.navigate('wallet')">See All</button>
          </div>
          <div class="card__body">
            ${txHistory.map(tx => `
              <div class="tx-item">
                <div class="tx-item__icon tx-item__icon--${tx.type}">
                  ${getTxIcon(tx.type)}
                </div>
                <div class="tx-item__info">
                  <div class="tx-item__type">${capitalize(tx.type)} ${tx.coin}</div>
                  <div class="tx-item__date">${formatTimeAgo(tx.date)}</div>
                </div>
                <div class="tx-item__amount">
                  <div class="tx-item__amount-value ${tx.type === 'buy' || tx.type === 'receive' ? 'price-up' : 'price-down'}">
                    ${tx.type === 'buy' || tx.type === 'receive' ? '+' : '-'}${tx.amount} ${tx.coin}
                  </div>
                  <div class="tx-item__amount-usd">$${tx.usdValue}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Market Movers -->
        <div class="card movers-card hover-lift">
          <div class="card__header">
            <div class="card__title">Market Movers</div>
            <div class="tabs">
              <div class="tab active" id="movers-gainers-tab" onclick="showMovers('gainers')">Gainers</div>
              <div class="tab" id="movers-losers-tab" onclick="showMovers('losers')">Losers</div>
            </div>
          </div>
          <div class="card__body" id="movers-body">
            ${renderMovers(topGainers)}
          </div>
        </div>
      </div>
    `;
  }

  function renderWatchlist(coins) {
    return coins.map(coin => `
      <div class="watchlist-item" onclick="App.navigate('trading', '${coin.id}')">
        <div class="watchlist-item__icon" style="background:${coin.color}">${coin.symbol.slice(0, 2)}</div>
        <div class="watchlist-item__info">
          <div class="watchlist-item__name">${coin.name}</div>
          <div class="watchlist-item__pair">${coin.symbol}/USDT</div>
        </div>
        <div class="watchlist-item__chart">
          <canvas id="sparkline-${coin.id}" width="80" height="32"></canvas>
        </div>
        <div class="watchlist-item__price">
          <div class="watchlist-item__price-value" id="watch-price-${coin.id}">${MarketData.formatUSD(coin.price)}</div>
          <div class="watchlist-item__change ${coin.change24h >= 0 ? 'price-up' : 'price-down'}" id="watch-change-${coin.id}">
            ${MarketData.formatChange(coin.change24h)}
          </div>
        </div>
      </div>
    `).join('');
  }

  function renderMovers(movers) {
    return movers.map((m, i) => `
      <div class="mover-item">
        <div class="mover-item__left">
          <span class="mover-item__rank">${i + 1}</span>
          <div class="mover-item__icon" style="background:${m.color}">${m.symbol.slice(0, 2)}</div>
          <span class="mover-item__name">${m.symbol}</span>
        </div>
        <span class="mover-item__change ${m.change24h >= 0 ? 'price-up' : 'price-down'}">
          ${MarketData.formatChange(m.change24h)}
        </span>
      </div>
    `).join('');
  }

  function afterRender() {
    // Draw donut chart
    const donutCanvas = document.getElementById('holdings-donut');
    if (donutCanvas) {
      const coins = MarketData.getCoins();
      const holdings = coins
        .map(c => ({ color: c.color, value: c.price * c.holdings }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);
      Charts.drawDonut(donutCanvas, holdings);
    }

    // Draw sparklines
    const coins = MarketData.getCoins();
    coins.slice(0, 10).forEach(coin => {
      const canvas = document.getElementById(`sparkline-${coin.id}`);
      if (canvas) {
        const history = MarketData.getPriceHistory(coin.id).slice(-30);
        const isUp = coin.change24h >= 0;
        Charts.drawSparkline(canvas, history, isUp ? '#00c853' : '#ff3b5c');
      }
    });
  }

  function onUpdate(coins) {
    // Update portfolio value
    const el = document.getElementById('portfolio-value');
    if (el) {
      el.textContent = MarketData.formatUSD(MarketData.getPortfolioValue());
    }

    // Update BTC & ETH stats
    const btc = coins.find(c => c.id === 'btc');
    const eth = coins.find(c => c.id === 'eth');
    if (btc) {
      const btcPrice = document.getElementById('stat-btc-price');
      const btcChange = document.getElementById('stat-btc-change');
      if (btcPrice) btcPrice.textContent = MarketData.formatUSD(btc.price);
      if (btcChange) {
        btcChange.textContent = MarketData.formatChange(btc.change24h);
        btcChange.className = `quick-stat__sub ${btc.change24h >= 0 ? 'price-up' : 'price-down'}`;
      }
    }
    if (eth) {
      const ethPrice = document.getElementById('stat-eth-price');
      const ethChange = document.getElementById('stat-eth-change');
      if (ethPrice) ethPrice.textContent = MarketData.formatUSD(eth.price);
      if (ethChange) {
        ethChange.textContent = MarketData.formatChange(eth.change24h);
        ethChange.className = `quick-stat__sub ${eth.change24h >= 0 ? 'price-up' : 'price-down'}`;
      }
    }

    // Update watchlist prices
    coins.slice(0, 10).forEach(coin => {
      const priceEl = document.getElementById(`watch-price-${coin.id}`);
      const changeEl = document.getElementById(`watch-change-${coin.id}`);
      if (priceEl) priceEl.textContent = MarketData.formatUSD(coin.price);
      if (changeEl) {
        changeEl.textContent = MarketData.formatChange(coin.change24h);
        changeEl.className = `watchlist-item__change ${coin.change24h >= 0 ? 'price-up' : 'price-down'}`;
      }

      // Redraw sparklines
      const canvas = document.getElementById(`sparkline-${coin.id}`);
      if (canvas) {
        const history = MarketData.getPriceHistory(coin.id).slice(-30);
        Charts.drawSparkline(canvas, history, coin.change24h >= 0 ? '#00c853' : '#ff3b5c');
      }
    });
  }

  // Helpers
  function getTxIcon(type) {
    const icons = {
      buy: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
      sell: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>',
      send: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>',
      receive: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>'
    };
    return icons[type] || icons.buy;
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function formatTimeAgo(date) {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  // Expose for movers tab switching
  window.showMovers = function(type) {
    const gainersTab = document.getElementById('movers-gainers-tab');
    const losersTab = document.getElementById('movers-losers-tab');
    const body = document.getElementById('movers-body');

    if (type === 'gainers') {
      gainersTab.classList.add('active');
      losersTab.classList.remove('active');
      body.innerHTML = renderMovers(MarketData.getTopGainers(5));
    } else {
      gainersTab.classList.remove('active');
      losersTab.classList.add('active');
      body.innerHTML = renderMovers(MarketData.getTopLosers(5));
    }
  };

  return { render, afterRender, onUpdate };
})();
