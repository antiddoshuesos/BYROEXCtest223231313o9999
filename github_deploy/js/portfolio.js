/* ============================================
   BYROEXC — Portfolio Page
   ============================================ */

const PortfolioPage = (() => {

  function render() {
    const coins = MarketData.getCoins();
    const portfolioValue = MarketData.getPortfolioValue();
    const holdings = coins
      .map(c => ({ ...c, usdValue: c.price * c.holdings }))
      .filter(c => c.usdValue > 0)
      .sort((a, b) => b.usdValue - a.usdValue);
    const totalValue = holdings.reduce((s, h) => s + h.usdValue, 0);

    // Simulated P/L
    const totalPnL = portfolioValue * 0.15; // ~15% total gain
    const todayPnL = portfolioValue * (Math.random() * 0.04 - 0.01);

    return `
      <div class="stagger-children">
        <!-- Portfolio Stats Row -->
        <div class="grid grid-4 mb-xl">
          <div class="card hover-lift" style="padding: var(--space-xl);">
            <div class="text-sm text-muted mb-sm">Portfolio Value</div>
            <div style="font-size: var(--fs-xl); font-weight: 700;" id="pf-value">${MarketData.formatUSD(portfolioValue)}</div>
          </div>
          <div class="card hover-lift" style="padding: var(--space-xl);">
            <div class="text-sm text-muted mb-sm">Total P&L</div>
            <div style="font-size: var(--fs-xl); font-weight: 700;" class="price-up">+${MarketData.formatUSD(totalPnL)}</div>
            <div class="text-sm price-up mt-sm">+15.23%</div>
          </div>
          <div class="card hover-lift" style="padding: var(--space-xl);">
            <div class="text-sm text-muted mb-sm">Today's P&L</div>
            <div style="font-size: var(--fs-xl); font-weight: 700;" class="${todayPnL >= 0 ? 'price-up' : 'price-down'}">
              ${todayPnL >= 0 ? '+' : ''}${MarketData.formatUSD(todayPnL)}
            </div>
            <div class="text-sm ${todayPnL >= 0 ? 'price-up' : 'price-down'} mt-sm">${todayPnL >= 0 ? '+' : ''}${(todayPnL / portfolioValue * 100).toFixed(2)}%</div>
          </div>
          <div class="card hover-lift" style="padding: var(--space-xl);">
            <div class="text-sm text-muted mb-sm">Assets</div>
            <div style="font-size: var(--fs-xl); font-weight: 700;">${holdings.length}</div>
            <div class="text-sm text-muted mt-sm">Active positions</div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-2 mb-xl">
          <!-- Performance Chart -->
          <div class="card hover-lift">
            <div class="card__header">
              <div class="card__title">Portfolio Performance</div>
              <div class="tabs">
                <div class="tab">24H</div>
                <div class="tab">7D</div>
                <div class="tab active">1M</div>
                <div class="tab">1Y</div>
                <div class="tab">All</div>
              </div>
            </div>
            <div class="card__body">
              <div style="height: 250px;">
                <canvas id="portfolio-chart" style="width:100%; height:100%"></canvas>
              </div>
            </div>
          </div>

          <!-- Allocation Chart -->
          <div class="card hover-lift">
            <div class="card__header">
              <div class="card__title">Asset Allocation</div>
            </div>
            <div class="card__body" style="display: flex; align-items: center; gap: var(--space-2xl);">
              <div style="width: 220px; height: 220px; position: relative; flex-shrink: 0;">
                <canvas id="portfolio-donut"></canvas>
                <div class="holdings-chart-center" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); text-align:center;">
                  <div class="text-xs text-muted">Total</div>
                  <div style="font-size: var(--fs-lg); font-weight: 700;">${MarketData.formatCompact(totalValue)}</div>
                </div>
              </div>
              <div class="holdings-legend" style="flex: 1;">
                ${holdings.slice(0, 8).map(h => `
                  <div class="holdings-legend__item">
                    <div class="holdings-legend__left">
                      <div class="holdings-legend__color" style="background:${h.color}"></div>
                      <span class="holdings-legend__coin">${h.symbol}</span>
                      <span class="holdings-legend__pct">${((h.usdValue / totalValue) * 100).toFixed(1)}%</span>
                    </div>
                    <span class="holdings-legend__value">${MarketData.formatUSD(h.usdValue)}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- Holdings Detail -->
        <div class="card">
          <div class="card__header">
            <div class="card__title">Holdings</div>
          </div>
          <div class="card__body" style="padding:0">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th class="text-right">Price</th>
                  <th class="text-right">Holdings</th>
                  <th class="text-right">Value</th>
                  <th class="text-right">Allocation</th>
                  <th class="text-right">24h Change</th>
                  <th class="text-right">P&L</th>
                </tr>
              </thead>
              <tbody>
                ${holdings.map(h => {
                  const pnl = h.usdValue * (Math.random() * 0.3 - 0.05); // simulated P&L
                  return `
                    <tr onclick="App.navigate('trading', '${h.id}')" style="cursor:pointer">
                      <td>
                        <div class="coin-cell">
                          <div class="coin-icon" style="background:${h.color}">${h.symbol.slice(0, 2)}</div>
                          <div>
                            <div class="coin-name">${h.name}</div>
                            <div class="coin-symbol">${h.symbol}</div>
                          </div>
                        </div>
                      </td>
                      <td class="text-right text-mono">${MarketData.formatUSD(h.price)}</td>
                      <td class="text-right text-mono">${h.holdings.toFixed(4)}</td>
                      <td class="text-right text-mono" style="font-weight:600">${MarketData.formatUSD(h.usdValue)}</td>
                      <td class="text-right text-mono text-muted">${((h.usdValue / totalValue) * 100).toFixed(1)}%</td>
                      <td class="text-right text-mono ${h.change24h >= 0 ? 'price-up' : 'price-down'}" style="font-weight:600">
                        ${MarketData.formatChange(h.change24h)}
                      </td>
                      <td class="text-right text-mono ${pnl >= 0 ? 'price-up' : 'price-down'}" style="font-weight:600">
                        ${pnl >= 0 ? '+' : ''}${MarketData.formatUSD(pnl)}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  function afterRender() {
    // Performance chart
    const chartCanvas = document.getElementById('portfolio-chart');
    if (chartCanvas) {
      // Generate portfolio value over time
      const data = [];
      let val = MarketData.getPortfolioValue() * 0.85;
      for (let i = 0; i < 100; i++) {
        val += (Math.random() - 0.45) * val * 0.02;
        data.push(val);
      }
      data.push(MarketData.getPortfolioValue());
      Charts.drawAreaChart(chartCanvas, data, { color: '#00d4aa' });
    }

    // Donut chart
    const donutCanvas = document.getElementById('portfolio-donut');
    if (donutCanvas) {
      const coins = MarketData.getCoins();
      const segments = coins
        .map(c => ({ color: c.color, value: c.price * c.holdings }))
        .filter(s => s.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);
      Charts.drawDonut(donutCanvas, segments);
    }
  }

  function onUpdate() {
    const el = document.getElementById('pf-value');
    if (el) el.textContent = MarketData.formatUSD(MarketData.getPortfolioValue());
  }

  return { render, afterRender, onUpdate };
})();
