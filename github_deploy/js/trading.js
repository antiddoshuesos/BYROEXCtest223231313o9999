/* ============================================
   BYROEXC — Trading View Page
   ============================================ */

const TradingPage = (() => {
  let currentPair = 'btc';
  let tradeType = 'buy';
  let chartInterval = null;

  function render(coinId) {
    if (coinId) currentPair = coinId;
    const coin = MarketData.getCoin(currentPair);
    if (!coin) return '<div>Coin not found</div>';

    const coins = MarketData.getCoins();

    return `
      <div class="trading-view">
        <!-- Pair Bar -->
        <div class="card pair-bar">
          <div class="pair-selector" onclick="TradingPage.showPairDropdown()">
            <div class="pair-selector__icon" style="background:${coin.color}">${coin.symbol.slice(0, 2)}</div>
            <span class="pair-selector__name">${coin.symbol}/USDT</span>
            <svg class="pair-selector__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </div>
          <div class="pair-stats">
            <div class="pair-stat">
              <span class="pair-stat__label">Price</span>
              <span class="pair-stat__value ${coin.change24h >= 0 ? 'price-up' : 'price-down'}" id="trading-price">${MarketData.formatPrice(coin.price)}</span>
            </div>
            <div class="pair-stat">
              <span class="pair-stat__label">24h Change</span>
              <span class="pair-stat__value ${coin.change24h >= 0 ? 'price-up' : 'price-down'}" id="trading-change">${MarketData.formatChange(coin.change24h)}</span>
            </div>
            <div class="pair-stat">
              <span class="pair-stat__label">24h High</span>
              <span class="pair-stat__value" id="trading-high">${MarketData.formatPrice(coin.price * 1.02)}</span>
            </div>
            <div class="pair-stat">
              <span class="pair-stat__label">24h Low</span>
              <span class="pair-stat__value" id="trading-low">${MarketData.formatPrice(coin.price * 0.98)}</span>
            </div>
            <div class="pair-stat">
              <span class="pair-stat__label">24h Volume</span>
              <span class="pair-stat__value" id="trading-vol">${MarketData.formatCompact(coin.volume24h || 2500000000)}</span>
            </div>
          </div>
          <div style="margin-left:auto; display:flex; align-items:center; gap:8px;">
            <div class="live-dot"></div>
            <span class="text-sm text-muted">Live</span>
          </div>
        </div>

        <!-- Chart -->
        <div class="card chart-area">
          <div class="card__body">
            <div class="chart-toolbar">
              <div class="chart-timeframes">
                <button class="chart-timeframe" data-tf="1m">1m</button>
                <button class="chart-timeframe" data-tf="5m">5m</button>
                <button class="chart-timeframe active" data-tf="15m">15m</button>
                <button class="chart-timeframe" data-tf="1h">1H</button>
                <button class="chart-timeframe" data-tf="4h">4H</button>
                <button class="chart-timeframe" data-tf="1d">1D</button>
                <button class="chart-timeframe" data-tf="1w">1W</button>
              </div>
              <div class="chart-types">
                <button class="chart-type-btn active" title="Candlestick">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="8" width="4" height="8" rx="1"/><line x1="7" y1="4" x2="7" y2="8"/><line x1="7" y1="16" x2="7" y2="20"/><rect x="15" y="6" width="4" height="10" rx="1"/><line x1="17" y1="2" x2="17" y2="6"/><line x1="17" y1="16" x2="17" y2="22"/></svg>
                </button>
                <button class="chart-type-btn" title="Line Chart">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 17l5-5 4 4 5-7 6 3"/></svg>
                </button>
              </div>
            </div>
            <div class="chart-canvas-container">
              <canvas id="trading-chart"></canvas>
            </div>
          </div>
        </div>

        <!-- Order Book -->
        <div class="card orderbook">
          <div class="card__header">
            <div class="card__title">Order Book</div>
          </div>
          <div class="card__body">
            <div class="orderbook__header-row">
              <span>Price (USDT)</span>
              <span style="text-align:center">Amount (${coin.symbol})</span>
              <span style="text-align:right">Total</span>
            </div>
            <div class="orderbook__asks" id="orderbook-asks"></div>
            <div class="orderbook__spread" id="orderbook-spread">Spread: --</div>
            <div class="orderbook__bids" id="orderbook-bids"></div>
          </div>
        </div>

        <!-- Trade History -->
        <div class="card trade-history">
          <div class="card__header">
            <div class="card__title">Recent Trades</div>
          </div>
          <div class="card__body">
            <div class="trade-history__header">
              <span>Price</span>
              <span>Amount</span>
              <span>Total</span>
              <span style="text-align:right">Time</span>
            </div>
            <div id="trade-history-body"></div>
          </div>
        </div>

        <!-- Trade Panel -->
        <div class="card trade-panel">
          <div class="card__body">
            <div class="trade-tabs">
              <div class="trade-tab trade-tab--buy active" id="trade-tab-buy" onclick="TradingPage.setTradeType('buy')">Buy</div>
              <div class="trade-tab trade-tab--sell" id="trade-tab-sell" onclick="TradingPage.setTradeType('sell')">Sell</div>
            </div>
            <div class="trade-form">
              <div class="trade-input">
                <span class="trade-input__label">Price</span>
                <input type="number" id="trade-price" value="${coin.price.toFixed(2)}" step="0.01">
                <span class="trade-input__unit">USDT</span>
              </div>
              <div class="trade-input">
                <span class="trade-input__label">Amount</span>
                <input type="number" id="trade-amount" placeholder="0.00" step="0.001">
                <span class="trade-input__unit">${coin.symbol}</span>
              </div>
              <div class="trade-pct-buttons">
                <button class="trade-pct-btn" onclick="TradingPage.setPct(25)">25%</button>
                <button class="trade-pct-btn" onclick="TradingPage.setPct(50)">50%</button>
                <button class="trade-pct-btn" onclick="TradingPage.setPct(75)">75%</button>
                <button class="trade-pct-btn" onclick="TradingPage.setPct(100)">100%</button>
              </div>
              <div class="trade-input">
                <span class="trade-input__label">Total</span>
                <input type="number" id="trade-total" placeholder="0.00" step="0.01">
                <span class="trade-input__unit">USDT</span>
              </div>
              <div class="trade-summary">
                <div class="trade-summary__row">
                  <span>Available</span>
                  <span>125,430.00 USDT</span>
                </div>
                <div class="trade-summary__row">
                  <span>Fee (0.1%)</span>
                  <span id="trade-fee">0.00 USDT</span>
                </div>
              </div>
              <button class="btn btn--success btn--full btn--lg" id="trade-submit-btn" onclick="TradingPage.submitTrade()">
                Buy ${coin.symbol}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function afterRender() {
    drawChart();
    updateOrderBook();
    updateTradeHistory();

    // Timeframe buttons
    document.querySelectorAll('.chart-timeframe').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.chart-timeframe').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        drawChart();
      });
    });

    // Trade input listeners
    const priceInput = document.getElementById('trade-price');
    const amountInput = document.getElementById('trade-amount');
    const totalInput = document.getElementById('trade-total');

    if (amountInput && priceInput && totalInput) {
      amountInput.addEventListener('input', () => {
        const amount = parseFloat(amountInput.value) || 0;
        const price = parseFloat(priceInput.value) || 0;
        totalInput.value = (amount * price).toFixed(2);
        updateFee();
      });

      totalInput.addEventListener('input', () => {
        const total = parseFloat(totalInput.value) || 0;
        const price = parseFloat(priceInput.value) || 0;
        if (price > 0) amountInput.value = (total / price).toFixed(6);
        updateFee();
      });
    }
  }

  function drawChart() {
    const canvas = document.getElementById('trading-chart');
    if (!canvas) return;
    const candles = MarketData.getCandleHistory(currentPair);
    Charts.drawCandlestick(canvas, candles.slice(-80));
  }

  function updateOrderBook() {
    const book = MarketData.getOrderBook(currentPair, 12);
    const coin = MarketData.getCoin(currentPair);

    const asksContainer = document.getElementById('orderbook-asks');
    const bidsContainer = document.getElementById('orderbook-bids');
    const spreadEl = document.getElementById('orderbook-spread');

    if (!asksContainer || !bidsContainer) return;

    const maxTotal = Math.max(
      ...book.asks.map(a => a.total),
      ...book.bids.map(b => b.total)
    );

    asksContainer.innerHTML = book.asks.reverse().map(ask => `
      <div class="orderbook__row orderbook__row--ask">
        <span>${MarketData.formatPrice(ask.price)}</span>
        <span>${ask.size.toFixed(4)}</span>
        <span>${MarketData.formatCompact(ask.total)}</span>
        <div class="orderbook__depth" style="width:${(ask.total / maxTotal * 100)}%"></div>
      </div>
    `).join('');

    bidsContainer.innerHTML = book.bids.map(bid => `
      <div class="orderbook__row orderbook__row--bid">
        <span>${MarketData.formatPrice(bid.price)}</span>
        <span>${bid.size.toFixed(4)}</span>
        <span>${MarketData.formatCompact(bid.total)}</span>
        <div class="orderbook__depth" style="width:${(bid.total / maxTotal * 100)}%"></div>
      </div>
    `).join('');

    if (spreadEl && book.asks.length && book.bids.length) {
      const spread = book.asks[book.asks.length - 1].price - book.bids[0].price;
      spreadEl.textContent = `Spread: ${MarketData.formatPrice(spread)} (${(spread / coin.price * 100).toFixed(3)}%)`;
    }
  }

  function updateTradeHistory() {
    const container = document.getElementById('trade-history-body');
    if (!container) return;

    const trades = MarketData.getRecentTrades(currentPair, 15);
    container.innerHTML = trades.map(t => `
      <div class="trade-history__row">
        <span class="${t.type === 'buy' ? 'price-up' : 'price-down'}">${MarketData.formatPrice(t.price)}</span>
        <span>${t.amount.toFixed(4)}</span>
        <span>${MarketData.formatUSD(t.price * t.amount)}</span>
        <span style="text-align:right; color: var(--text-tertiary)">${t.time.toLocaleTimeString()}</span>
      </div>
    `).join('');
  }

  function onUpdate(coins) {
    const coin = coins.find(c => c.id === currentPair);
    if (!coin) return;

    // Update price
    const priceEl = document.getElementById('trading-price');
    const changeEl = document.getElementById('trading-change');
    if (priceEl) {
      priceEl.textContent = MarketData.formatPrice(coin.price);
      priceEl.className = `pair-stat__value ${coin.change24h >= 0 ? 'price-up' : 'price-down'}`;
    }
    if (changeEl) {
      changeEl.textContent = MarketData.formatChange(coin.change24h);
      changeEl.className = `pair-stat__value ${coin.change24h >= 0 ? 'price-up' : 'price-down'}`;
    }

    // Redraw chart
    drawChart();
    updateOrderBook();
    updateTradeHistory();

    // Update trade price input
    const tradePrice = document.getElementById('trade-price');
    if (tradePrice && document.activeElement !== tradePrice) {
      tradePrice.value = coin.price.toFixed(2);
    }
  }

  function updateFee() {
    const totalInput = document.getElementById('trade-total');
    const feeEl = document.getElementById('trade-fee');
    if (totalInput && feeEl) {
      const total = parseFloat(totalInput.value) || 0;
      feeEl.textContent = (total * 0.001).toFixed(2) + ' USDT';
    }
  }

  // Public methods
  function setTradeType(type) {
    tradeType = type;
    const buyTab = document.getElementById('trade-tab-buy');
    const sellTab = document.getElementById('trade-tab-sell');
    const submitBtn = document.getElementById('trade-submit-btn');
    const coin = MarketData.getCoin(currentPair);

    if (type === 'buy') {
      buyTab.classList.add('active');
      sellTab.classList.remove('active');
      submitBtn.className = 'btn btn--success btn--full btn--lg';
      submitBtn.textContent = `Buy ${coin.symbol}`;
    } else {
      buyTab.classList.remove('active');
      sellTab.classList.add('active');
      submitBtn.className = 'btn btn--danger btn--full btn--lg';
      submitBtn.textContent = `Sell ${coin.symbol}`;
    }
  }

  function setPct(pct) {
    const coin = MarketData.getCoin(currentPair);
    const priceInput = document.getElementById('trade-price');
    const amountInput = document.getElementById('trade-amount');
    const totalInput = document.getElementById('trade-total');
    
    if (tradeType === 'buy') {
      const available = 125430;
      const total = available * pct / 100;
      const price = parseFloat(priceInput.value) || coin.price;
      totalInput.value = total.toFixed(2);
      amountInput.value = (total / price).toFixed(6);
    } else {
      const amount = coin.holdings * pct / 100;
      const price = parseFloat(priceInput.value) || coin.price;
      amountInput.value = amount.toFixed(6);
      totalInput.value = (amount * price).toFixed(2);
    }
    updateFee();
  }

  function submitTrade() {
    const coin = MarketData.getCoin(currentPair);
    const amount = document.getElementById('trade-amount').value;
    if (!amount || parseFloat(amount) <= 0) {
      App.showToast('Please enter a valid amount', 'error');
      return;
    }
    App.showToast(`${tradeType === 'buy' ? 'Bought' : 'Sold'} ${amount} ${coin.symbol} successfully!`, 'success');
  }

  function showPairDropdown() {
    // Simple pair switching via prompt for now
    const coins = MarketData.getCoins();
    const symbols = coins.map(c => c.symbol).join(', ');
    // Navigate to a different coin
    const nextIdx = (coins.findIndex(c => c.id === currentPair) + 1) % coins.length;
    currentPair = coins[nextIdx].id;
    App.navigate('trading', currentPair);
  }

  return { render, afterRender, onUpdate, setTradeType, setPct, submitTrade, showPairDropdown };
})();
