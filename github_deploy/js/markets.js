/* ============================================
   BYROEXC — Markets Page
   ============================================ */

const MarketsPage = (() => {
  let sortBy = 'mcap';
  let sortDir = 'desc';
  let filterQuery = '';

  function render() {
    return `
      <div class="stagger-children">
        <!-- Market Overview -->
        <div class="grid grid-4 mb-xl">
          <div class="card hover-lift" style="padding: var(--space-xl);">
            <div class="text-sm text-muted mb-sm">Total Market Cap</div>
            <div style="font-size: var(--fs-xl); font-weight: 700;">$2.54T</div>
            <div class="text-sm price-up mt-sm">+2.34%</div>
          </div>
          <div class="card hover-lift" style="padding: var(--space-xl);">
            <div class="text-sm text-muted mb-sm">24h Volume</div>
            <div style="font-size: var(--fs-xl); font-weight: 700;">$98.2B</div>
            <div class="text-sm price-up mt-sm">+12.5%</div>
          </div>
          <div class="card hover-lift" style="padding: var(--space-xl);">
            <div class="text-sm text-muted mb-sm">BTC Dominance</div>
            <div style="font-size: var(--fs-xl); font-weight: 700;">52.3%</div>
            <div class="text-sm price-down mt-sm">-0.42%</div>
          </div>
          <div class="card hover-lift" style="padding: var(--space-xl);">
            <div class="text-sm text-muted mb-sm">Active Cryptos</div>
            <div style="font-size: var(--fs-xl); font-weight: 700;">24,532</div>
            <div class="text-sm text-muted mt-sm">+148 new</div>
          </div>
        </div>

        <!-- Markets Table -->
        <div class="card">
          <div class="card__header">
            <div class="flex items-center gap-lg">
              <div class="card__title">All Markets</div>
              <div class="tabs">
                <div class="tab active">All</div>
                <div class="tab">Favorites</div>
                <div class="tab">DeFi</div>
                <div class="tab">Layer 1</div>
                <div class="tab">Memes</div>
              </div>
            </div>
            <div class="asset-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input type="text" placeholder="Search markets..." id="markets-search" oninput="MarketsPage.filter()">
            </div>
          </div>
          <div class="card__body" style="padding:0">
            <table class="data-table" id="markets-table">
              <thead>
                <tr>
                  <th style="width:40px">#</th>
                  <th>Name</th>
                  <th class="text-right" style="cursor:pointer" onclick="MarketsPage.sort('price')">Price ↕</th>
                  <th class="text-right" style="cursor:pointer" onclick="MarketsPage.sort('change')">24h % ↕</th>
                  <th class="text-right" style="cursor:pointer" onclick="MarketsPage.sort('mcap')">Market Cap ↕</th>
                  <th class="text-right" style="cursor:pointer" onclick="MarketsPage.sort('volume')">Volume (24h) ↕</th>
                  <th style="width:120px">Last 7 Days</th>
                  <th style="width:60px"></th>
                </tr>
              </thead>
              <tbody id="markets-body">
                ${renderMarketRows()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  function renderMarketRows() {
    let coins = [...MarketData.getCoins()];

    // Filter
    if (filterQuery) {
      coins = coins.filter(c =>
        c.name.toLowerCase().includes(filterQuery) ||
        c.symbol.toLowerCase().includes(filterQuery)
      );
    }

    // Sort
    coins.sort((a, b) => {
      let va, vb;
      switch (sortBy) {
        case 'price': va = a.price; vb = b.price; break;
        case 'change': va = a.change24h; vb = b.change24h; break;
        case 'volume': va = a.volume24h || 0; vb = b.volume24h || 0; break;
        case 'mcap': default: va = MarketData.getMarketCap(a.id); vb = MarketData.getMarketCap(b.id);
      }
      return sortDir === 'desc' ? vb - va : va - vb;
    });

    return coins.map((coin, i) => `
      <tr onclick="App.navigate('trading', '${coin.id}')" style="cursor:pointer">
        <td class="text-muted">${i + 1}</td>
        <td>
          <div class="coin-cell">
            <div class="coin-icon" style="background:${coin.color}">${coin.symbol.slice(0, 2)}</div>
            <div>
              <div class="coin-name">${coin.name}</div>
              <div class="coin-symbol">${coin.symbol}</div>
            </div>
          </div>
        </td>
        <td class="text-right text-mono" style="font-weight:600">${MarketData.formatUSD(coin.price)}</td>
        <td class="text-right text-mono ${coin.change24h >= 0 ? 'price-up' : 'price-down'}" style="font-weight:600">
          ${MarketData.formatChange(coin.change24h)}
        </td>
        <td class="text-right text-mono text-muted">${MarketData.formatCompact(MarketData.getMarketCap(coin.id))}</td>
        <td class="text-right text-mono text-muted">${MarketData.formatCompact(coin.volume24h || Math.random() * 5e9)}</td>
        <td><canvas id="market-spark-${coin.id}" width="120" height="36"></canvas></td>
        <td>
          <button class="btn btn--ghost btn--sm" onclick="event.stopPropagation(); App.navigate('trading', '${coin.id}')">Trade</button>
        </td>
      </tr>
    `).join('');
  }

  function afterRender() {
    drawSparklines();
  }

  function drawSparklines() {
    MarketData.getCoins().forEach(coin => {
      const canvas = document.getElementById(`market-spark-${coin.id}`);
      if (canvas) {
        const history = MarketData.getPriceHistory(coin.id).slice(-40);
        Charts.drawSparkline(canvas, history, coin.change24h >= 0 ? '#00c853' : '#ff3b5c');
      }
    });
  }

  function onUpdate() {
    const body = document.getElementById('markets-body');
    if (body) {
      body.innerHTML = renderMarketRows();
      drawSparklines();
    }
  }

  function sort(by) {
    if (sortBy === by) {
      sortDir = sortDir === 'desc' ? 'asc' : 'desc';
    } else {
      sortBy = by;
      sortDir = 'desc';
    }
    onUpdate();
  }

  function filter() {
    filterQuery = document.getElementById('markets-search').value.toLowerCase();
    onUpdate();
  }

  return { render, afterRender, onUpdate, sort, filter };
})();
