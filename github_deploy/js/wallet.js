/* ============================================
   BYROEXC — Wallet Page
   ============================================ */

const WalletPage = (() => {

  function render() {
    const coins = MarketData.getCoins();
    const portfolioValue = MarketData.getPortfolioValue();
    const btcPrice = MarketData.getCoin('btc').price;
    const btcEquivalent = portfolioValue / btcPrice;
    const txHistory = MarketData.getTransactionHistory();

    return `
      <div class="wallet-page stagger-children">
        <!-- Balance Overview -->
        <div class="card wallet-balance-card hover-lift">
          <div class="wallet-balance__header">
            <div>
              <div class="wallet-balance__label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 10H2"/></svg>
                Estimated Balance
              </div>
              <div class="wallet-balance__value" id="wallet-total">${MarketData.formatUSD(portfolioValue)}</div>
              <div class="wallet-balance__btc" id="wallet-btc">≈ ${btcEquivalent.toFixed(6)} BTC</div>
            </div>
            <div class="flex gap-md">
              <button class="btn btn--secondary btn--sm" onclick="WalletPage.showEditModal()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit Balances
              </button>
            </div>
          </div>
          <div class="wallet-actions">
            <button class="wallet-action-btn wallet-action-btn--send" onclick="WalletPage.showSendModal()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              Send
            </button>
            <button class="wallet-action-btn wallet-action-btn--receive" onclick="WalletPage.showReceiveModal()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
              Receive
            </button>
            <button class="wallet-action-btn wallet-action-btn--swap" onclick="App.navigate('trading')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>
              Swap
            </button>
            <button class="wallet-action-btn wallet-action-btn--buy" onclick="App.navigate('trading')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M6 12h12"/></svg>
              Buy
            </button>
          </div>
        </div>

        <!-- Asset List -->
        <div class="card asset-list-card">
          <div class="card__header">
            <div class="card__title">Your Assets</div>
            <div class="asset-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input type="text" placeholder="Search assets..." id="wallet-search" oninput="WalletPage.filterAssets()">
            </div>
          </div>
          <div id="wallet-asset-list">
            ${renderAssetList(coins)}
          </div>
        </div>

        <!-- Transaction History -->
        <div class="card tx-history-card">
          <div class="card__header">
            <div class="card__title">Transaction History</div>
            <div class="tabs">
              <div class="tab active">All</div>
              <div class="tab">Buy</div>
              <div class="tab">Sell</div>
              <div class="tab">Transfer</div>
            </div>
          </div>
          <div class="card__body">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Asset</th>
                  <th>Amount</th>
                  <th>USD Value</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${txHistory.map(tx => `
                  <tr>
                    <td>
                      <span class="badge ${tx.type === 'buy' || tx.type === 'receive' ? 'badge--success' : 'badge--danger'}">
                        ${tx.type.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div class="coin-cell">
                        <div class="coin-icon" style="background:${tx.coinColor}">${tx.coin.slice(0, 2)}</div>
                        <div>
                          <div class="coin-name">${tx.coinName}</div>
                          <div class="coin-symbol">${tx.coin}</div>
                        </div>
                      </div>
                    </td>
                    <td class="text-mono">${tx.amount}</td>
                    <td class="text-mono">$${tx.usdValue}</td>
                    <td class="text-muted">${tx.date.toLocaleDateString()}</td>
                    <td><span class="badge badge--success">${tx.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Send Modal -->
      <div class="modal-overlay" id="send-modal">
        <div class="modal">
          <div class="modal__header">
            <h3 class="modal__title">Send Crypto</h3>
            <button class="modal__close" onclick="WalletPage.closeModals()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="modal__body">
            <div class="input-group mb-lg">
              <label>Select Asset</label>
              <select class="input" id="send-asset">
                ${coins.filter(c => c.holdings > 0).map(c => 
                  `<option value="${c.id}">${c.symbol} — Balance: ${c.holdings.toFixed(4)}</option>`
                ).join('')}
              </select>
            </div>
            <div class="input-group mb-lg">
              <label>Recipient Address</label>
              <input type="text" class="input" placeholder="Enter wallet address" id="send-address">
            </div>
            <div class="input-group mb-lg">
              <label>Amount</label>
              <input type="number" class="input" placeholder="0.00" id="send-amount">
            </div>
            <div class="input-group mb-lg">
              <label>Network</label>
              <select class="input">
                <option>ERC-20 (Ethereum)</option>
                <option>BEP-20 (BNB Smart Chain)</option>
                <option>TRC-20 (Tron)</option>
                <option>SOL (Solana)</option>
              </select>
            </div>
            <div class="trade-summary">
              <div class="trade-summary__row">
                <span>Network Fee</span>
                <span>~$2.50</span>
              </div>
              <div class="trade-summary__row">
                <span>You will send</span>
                <span id="send-total">0.00</span>
              </div>
            </div>
          </div>
          <div class="modal__footer">
            <button class="btn btn--secondary" onclick="WalletPage.closeModals()">Cancel</button>
            <button class="btn btn--primary" onclick="WalletPage.confirmSend()">Confirm Send</button>
          </div>
        </div>
      </div>

      <!-- Receive Modal -->
      <div class="modal-overlay" id="receive-modal">
        <div class="modal">
          <div class="modal__header">
            <h3 class="modal__title">Receive Crypto</h3>
            <button class="modal__close" onclick="WalletPage.closeModals()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="modal__body">
            <div class="input-group mb-lg">
              <label>Select Asset</label>
              <select class="input" id="receive-asset" onchange="WalletPage.updateReceiveAddress()">
                ${coins.map(c => 
                  `<option value="${c.id}">${c.symbol} — ${c.name}</option>`
                ).join('')}
              </select>
            </div>
            <div class="input-group mb-lg">
              <label>Network</label>
              <select class="input">
                <option>ERC-20 (Ethereum)</option>
                <option>BEP-20 (BNB Smart Chain)</option>
                <option>TRC-20 (Tron)</option>
              </select>
            </div>
            <div class="qr-code-container">
              <div class="qr-code" id="receive-qr">
                <canvas id="qr-canvas" width="150" height="150"></canvas>
              </div>
              <div class="wallet-address">
                <span class="wallet-address__text" id="receive-address">0x8Ba1f109551bD432803012645Ac136ddd64DBA72</span>
                <button class="wallet-address__copy" onclick="WalletPage.copyAddress()">Copy</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Balances Modal -->
      <div class="modal-overlay" id="edit-modal">
        <div class="modal" style="max-width: 560px;">
          <div class="modal__header">
            <h3 class="modal__title">Edit Balances</h3>
            <button class="modal__close" onclick="WalletPage.closeModals()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="modal__body" style="max-height: 400px; overflow-y: auto;">
            ${coins.map(c => `
              <div class="flex items-center gap-md mb-md">
                <div class="coin-icon" style="background:${c.color}; width:28px; height:28px; font-size:10px; border-radius:50%;">${c.symbol.slice(0, 2)}</div>
                <span style="width: 80px; font-weight: 600;">${c.symbol}</span>
                <input type="number" class="input" style="flex:1" value="${c.holdings}" 
                  id="edit-${c.id}" step="0.0001" min="0">
                <span class="text-sm text-muted" style="width: 100px; text-align: right;" id="edit-usd-${c.id}">
                  ${MarketData.formatUSD(c.holdings * c.price)}
                </span>
              </div>
            `).join('')}
          </div>
          <div class="modal__footer">
            <button class="btn btn--secondary" onclick="WalletPage.closeModals()">Cancel</button>
            <button class="btn btn--primary" onclick="WalletPage.saveBalances()">Save Changes</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderAssetList(coins) {
    return coins.filter(c => c.holdings > 0).sort((a, b) => (b.price * b.holdings) - (a.price * a.holdings)).map(coin => `
      <div class="asset-row" onclick="App.navigate('trading', '${coin.id}')">
        <div class="asset-row__icon" style="background:${coin.color}">${coin.symbol.slice(0, 2)}</div>
        <div class="asset-row__info">
          <div class="asset-row__name">${coin.name}</div>
          <div class="asset-row__symbol">${coin.symbol}</div>
        </div>
        <div class="asset-row__chart">
          <canvas id="wallet-spark-${coin.id}" width="100" height="36"></canvas>
        </div>
        <div class="asset-row__balance">
          <div class="asset-row__amount">${coin.holdings.toFixed(4)} ${coin.symbol}</div>
          <div class="asset-row__usd">${MarketData.formatUSD(coin.price * coin.holdings)}</div>
        </div>
        <div class="asset-row__change ${coin.change24h >= 0 ? 'price-up' : 'price-down'}">
          ${MarketData.formatChange(coin.change24h)}
        </div>
      </div>
    `).join('');
  }

  function afterRender() {
    // Draw sparklines for wallet assets
    MarketData.getCoins().forEach(coin => {
      const canvas = document.getElementById(`wallet-spark-${coin.id}`);
      if (canvas) {
        const history = MarketData.getPriceHistory(coin.id).slice(-30);
        Charts.drawSparkline(canvas, history, coin.change24h >= 0 ? '#00c853' : '#ff3b5c');
      }
    });
  }

  function onUpdate(coins) {
    const el = document.getElementById('wallet-total');
    if (el) el.textContent = MarketData.formatUSD(MarketData.getPortfolioValue());

    const btcEl = document.getElementById('wallet-btc');
    const btcPrice = MarketData.getCoin('btc').price;
    if (btcEl) btcEl.textContent = `≈ ${(MarketData.getPortfolioValue() / btcPrice).toFixed(6)} BTC`;
  }

  function filterAssets() {
    const query = document.getElementById('wallet-search').value.toLowerCase();
    const coins = MarketData.getCoins().filter(c =>
      c.name.toLowerCase().includes(query) || c.symbol.toLowerCase().includes(query)
    );
    const container = document.getElementById('wallet-asset-list');
    if (container) {
      container.innerHTML = renderAssetList(coins);
      // Redraw sparklines
      coins.forEach(coin => {
        const canvas = document.getElementById(`wallet-spark-${coin.id}`);
        if (canvas) {
          const history = MarketData.getPriceHistory(coin.id).slice(-30);
          Charts.drawSparkline(canvas, history, coin.change24h >= 0 ? '#00c853' : '#ff3b5c');
        }
      });
    }
  }

  function showSendModal() {
    document.getElementById('send-modal').classList.add('active');
  }

  function showReceiveModal() {
    document.getElementById('receive-modal').classList.add('active');
    drawQRCode();
  }

  function showEditModal() {
    document.getElementById('edit-modal').classList.add('active');
  }

  function closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  }

  function confirmSend() {
    const address = document.getElementById('send-address').value;
    const amount = document.getElementById('send-amount').value;
    if (!address || !amount) {
      App.showToast('Please fill in all fields', 'error');
      return;
    }
    App.showToast('Transaction submitted successfully!', 'success');
    closeModals();
  }

  function copyAddress() {
    const address = document.getElementById('receive-address').textContent;
    navigator.clipboard.writeText(address).then(() => {
      App.showToast('Address copied to clipboard!', 'success');
    });
  }

  function updateReceiveAddress() {
    // Generate a random-looking address
    const chars = '0123456789abcdef';
    let addr = '0x';
    for (let i = 0; i < 40; i++) addr += chars[Math.floor(Math.random() * chars.length)];
    document.getElementById('receive-address').textContent = addr;
    drawQRCode();
  }

  function drawQRCode() {
    const canvas = document.getElementById('qr-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 150;
    const modules = 25;
    const moduleSize = size / modules;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = 'black';

    // Simple QR-like pattern
    for (let y = 0; y < modules; y++) {
      for (let x = 0; x < modules; x++) {
        // Position detection patterns
        if ((x < 7 && y < 7) || (x >= modules - 7 && y < 7) || (x < 7 && y >= modules - 7)) {
          const isOuter = x === 0 || y === 0 || x === 6 || y === 6 ||
                         x === modules - 1 || y === 6 || x === modules - 7 || y === 0 ||
                         x === 0 || y === modules - 1 || x === 6 || y === modules - 7;
          const isInner = (x >= 2 && x <= 4 && y >= 2 && y <= 4) ||
                         (x >= modules - 5 && x <= modules - 3 && y >= 2 && y <= 4) ||
                         (x >= 2 && x <= 4 && y >= modules - 5 && y <= modules - 3);
          if (isOuter || isInner) {
            ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize);
          }
        } else if (Math.random() > 0.55) {
          ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize);
        }
      }
    }
  }

  function saveBalances() {
    const coins = MarketData.getCoins();
    coins.forEach(coin => {
      const input = document.getElementById(`edit-${coin.id}`);
      if (input) {
        MarketData.setHoldings(coin.id, input.value);
      }
    });
    App.showToast('Balances updated successfully!', 'success');
    closeModals();
    App.navigate('wallet');
  }

  return {
    render, afterRender, onUpdate,
    filterAssets, showSendModal, showReceiveModal, showEditModal,
    closeModals, confirmSend, copyAddress, updateReceiveAddress, saveBalances
  };
})();
