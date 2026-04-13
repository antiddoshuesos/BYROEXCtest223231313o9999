/* ============================================
   BYROEXC — Simulated Market Data Engine
   ============================================ */

const MarketData = (() => {
  // ── Coin definitions ──
  const COINS = [
    { id: 'btc', name: 'Bitcoin', symbol: 'BTC', color: '#f7931a', price: 67432.50, holdings: 1.2453 },
    { id: 'eth', name: 'Ethereum', symbol: 'ETH', color: '#627eea', price: 3521.80, holdings: 15.7821 },
    { id: 'bnb', name: 'BNB', symbol: 'BNB', color: '#f0b90b', price: 598.42, holdings: 24.5 },
    { id: 'sol', name: 'Solana', symbol: 'SOL', color: '#9945ff', price: 172.35, holdings: 85.32 },
    { id: 'xrp', name: 'XRP', symbol: 'XRP', color: '#00aae4', price: 0.6234, holdings: 15000 },
    { id: 'ada', name: 'Cardano', symbol: 'ADA', color: '#0033ad', price: 0.4821, holdings: 8500 },
    { id: 'doge', name: 'Dogecoin', symbol: 'DOGE', color: '#c2a633', price: 0.1542, holdings: 25000 },
    { id: 'dot', name: 'Polkadot', symbol: 'DOT', color: '#e6007a', price: 7.85, holdings: 350 },
    { id: 'avax', name: 'Avalanche', symbol: 'AVAX', color: '#e84142', price: 38.92, holdings: 120 },
    { id: 'matic', name: 'Polygon', symbol: 'MATIC', color: '#8247e5', price: 0.8921, holdings: 5000 },
    { id: 'link', name: 'Chainlink', symbol: 'LINK', color: '#2a5ada', price: 15.67, holdings: 200 },
    { id: 'uni', name: 'Uniswap', symbol: 'UNI', color: '#ff007a', price: 7.23, holdings: 450 },
    { id: 'atom', name: 'Cosmos', symbol: 'ATOM', color: '#2e3148', price: 9.45, holdings: 280 },
    { id: 'ltc', name: 'Litecoin', symbol: 'LTC', color: '#bfbbbb', price: 72.34, holdings: 45 },
    { id: 'near', name: 'NEAR Protocol', symbol: 'NEAR', color: '#00c08b', price: 5.87, holdings: 600 },
    { id: 'apt', name: 'Aptos', symbol: 'APT', color: '#4dd9b4', price: 9.12, holdings: 180 },
    { id: 'arb', name: 'Arbitrum', symbol: 'ARB', color: '#28a0f0', price: 1.23, holdings: 3000 },
    { id: 'op', name: 'Optimism', symbol: 'OP', color: '#ff0420', price: 2.45, holdings: 1500 },
    { id: 'inj', name: 'Injective', symbol: 'INJ', color: '#0082ff', price: 25.67, holdings: 75 },
    { id: 'sei', name: 'Sei', symbol: 'SEI', color: '#9b1c2e', price: 0.65, holdings: 4000 },
    { id: 'sui', name: 'Sui', symbol: 'SUI', color: '#4da2ff', price: 1.87, holdings: 2500 },
    { id: 'ftm', name: 'Fantom', symbol: 'FTM', color: '#1969ff', price: 0.42, holdings: 8000 },
    { id: 'aave', name: 'Aave', symbol: 'AAVE', color: '#b6509e', price: 98.50, holdings: 35 },
    { id: 'algo', name: 'Algorand', symbol: 'ALGO', color: '#000000', price: 0.1821, holdings: 10000 },
  ];

  // Market cap multipliers for realism
  const MCAP_MULTIPLIERS = {
    btc: 1320000000000, eth: 423000000000, bnb: 89000000000,
    sol: 76000000000, xrp: 34000000000, ada: 17000000000,
    doge: 22000000000, dot: 9800000000, avax: 14500000000,
    matic: 8200000000, link: 9100000000, uni: 5400000000,
    atom: 3200000000, ltc: 5300000000, near: 5800000000,
    apt: 4100000000, arb: 2300000000, op: 2800000000,
    inj: 2500000000, sei: 1800000000, sui: 2100000000,
    ftm: 1200000000, aave: 1500000000, algo: 1400000000
  };

  // State
  let coins = JSON.parse(JSON.stringify(COINS));
  let priceHistory = {};
  let candleHistory = {};
  let listeners = [];
  let updateInterval = null;

  // Initialize price history (last 100 points)
  function initHistory() {
    coins.forEach(coin => {
      priceHistory[coin.id] = [];
      candleHistory[coin.id] = [];
      let price = coin.price;

      // Generate 200 candle data points
      for (let i = 200; i >= 0; i--) {
        const volatility = getVolatility(coin.id);
        const change = (Math.random() - 0.48) * volatility * price;
        price = Math.max(price * 0.5, price + change);
        priceHistory[coin.id].push(price);

        // Candle data
        const open = price;
        const closeChange = (Math.random() - 0.48) * volatility * price;
        const close = open + closeChange;
        const high = Math.max(open, close) + Math.random() * volatility * price * 0.5;
        const low = Math.min(open, close) - Math.random() * volatility * price * 0.5;
        const volume = Math.random() * 1000000 + 100000;
        
        const time = Date.now() - i * 60000; // 1 min candles
        candleHistory[coin.id].push({ time, open, high, low, close, volume });
      }

      // Set current price to last history point
      coin.price = price;
      coin.change24h = ((price - priceHistory[coin.id][0]) / priceHistory[coin.id][0]) * 100;
      coin.volume24h = Math.random() * 5000000000 + 100000000;
    });
  }

  function getVolatility(coinId) {
    const volatilities = {
      btc: 0.003, eth: 0.004, bnb: 0.005, sol: 0.007,
      xrp: 0.006, ada: 0.006, doge: 0.01, dot: 0.006,
      avax: 0.007, matic: 0.007, link: 0.006, uni: 0.008
    };
    return volatilities[coinId] || 0.008;
  }

  // Update prices with random walk
  function updatePrices() {
    coins.forEach(coin => {
      const volatility = getVolatility(coin.id);
      const change = (Math.random() - 0.48) * volatility * coin.price;
      const oldPrice = coin.price;
      coin.price = Math.max(coin.price * 0.01, coin.price + change);
      coin.priceDirection = coin.price >= oldPrice ? 'up' : 'down';

      // Update history
      priceHistory[coin.id].push(coin.price);
      if (priceHistory[coin.id].length > 200) priceHistory[coin.id].shift();

      // Update candle
      const lastCandle = candleHistory[coin.id][candleHistory[coin.id].length - 1];
      const now = Date.now();
      if (now - lastCandle.time > 60000) {
        // New candle
        candleHistory[coin.id].push({
          time: now,
          open: coin.price,
          high: coin.price,
          low: coin.price,
          close: coin.price,
          volume: Math.random() * 100000
        });
        if (candleHistory[coin.id].length > 200) candleHistory[coin.id].shift();
      } else {
        // Update current candle
        lastCandle.close = coin.price;
        lastCandle.high = Math.max(lastCandle.high, coin.price);
        lastCandle.low = Math.min(lastCandle.low, coin.price);
        lastCandle.volume += Math.random() * 10000;
      }

      // Recalculate 24h change
      const oldestRelevant = priceHistory[coin.id][0];
      coin.change24h = ((coin.price - oldestRelevant) / oldestRelevant) * 100;
    });

    // Notify listeners
    listeners.forEach(fn => fn(coins));
  }

  // Start the data engine
  function start(intervalMs = 1500) {
    initHistory();
    updateInterval = setInterval(updatePrices, intervalMs);
    // Immediate first notify
    setTimeout(() => listeners.forEach(fn => fn(coins)), 100);
  }

  function stop() {
    if (updateInterval) clearInterval(updateInterval);
  }

  function onUpdate(callback) {
    listeners.push(callback);
  }

  function removeListener(callback) {
    listeners = listeners.filter(fn => fn !== callback);
  }

  function getCoins() {
    return coins;
  }

  function getCoin(id) {
    return coins.find(c => c.id === id);
  }

  function getPriceHistory(coinId) {
    return priceHistory[coinId] || [];
  }

  function getCandleHistory(coinId) {
    return candleHistory[coinId] || [];
  }

  function getPortfolioValue() {
    return coins.reduce((total, coin) => total + (coin.price * coin.holdings), 0);
  }

  function getTopGainers(count = 5) {
    return [...coins].sort((a, b) => b.change24h - a.change24h).slice(0, count);
  }

  function getTopLosers(count = 5) {
    return [...coins].sort((a, b) => a.change24h - b.change24h).slice(0, count);
  }

  function getMarketCap(coinId) {
    return MCAP_MULTIPLIERS[coinId] || 1000000000;
  }

  // Generate order book data
  function getOrderBook(coinId, levels = 15) {
    const coin = getCoin(coinId);
    if (!coin) return { asks: [], bids: [] };

    const price = coin.price;
    const asks = [];
    const bids = [];

    for (let i = 0; i < levels; i++) {
      const askPrice = price * (1 + (i + 1) * 0.0003 + Math.random() * 0.0002);
      const bidPrice = price * (1 - (i + 1) * 0.0003 - Math.random() * 0.0002);
      const askSize = Math.random() * 5 + 0.1;
      const bidSize = Math.random() * 5 + 0.1;

      asks.push({ price: askPrice, size: askSize, total: askSize * askPrice });
      bids.push({ price: bidPrice, size: bidSize, total: bidSize * bidPrice });
    }

    return { asks, bids };
  }

  // Generate recent trades
  function getRecentTrades(coinId, count = 20) {
    const coin = getCoin(coinId);
    if (!coin) return [];

    const trades = [];
    let tradePrice = coin.price;

    for (let i = 0; i < count; i++) {
      const isBuy = Math.random() > 0.5;
      tradePrice += (Math.random() - 0.5) * coin.price * 0.001;
      trades.push({
        price: tradePrice,
        amount: Math.random() * 3 + 0.01,
        time: new Date(Date.now() - i * (Math.random() * 30000 + 5000)),
        type: isBuy ? 'buy' : 'sell'
      });
    }

    return trades;
  }

  // Generate fake transaction history
  function getTransactionHistory() {
    const types = ['buy', 'sell', 'send', 'receive'];
    const txs = [];
    const now = Date.now();

    for (let i = 0; i < 20; i++) {
      const coin = coins[Math.floor(Math.random() * Math.min(8, coins.length))];
      const type = types[Math.floor(Math.random() * types.length)];
      const amount = Math.random() * coin.holdings * 0.1;

      txs.push({
        id: `tx_${i}`,
        type,
        coin: coin.symbol,
        coinColor: coin.color,
        coinName: coin.name,
        amount: amount.toFixed(6),
        usdValue: (amount * coin.price).toFixed(2),
        date: new Date(now - i * (Math.random() * 86400000 + 3600000)),
        status: Math.random() > 0.05 ? 'completed' : 'pending'
      });
    }

    return txs.sort((a, b) => b.date - a.date);
  }

  // Update holdings
  function setHoldings(coinId, amount) {
    const coin = coins.find(c => c.id === coinId);
    if (coin) {
      coin.holdings = parseFloat(amount) || 0;
    }
  }

  // Format helpers
  function formatPrice(price, decimals) {
    if (decimals === undefined) {
      if (price >= 1000) decimals = 2;
      else if (price >= 1) decimals = 4;
      else decimals = 6;
    }
    return price.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  function formatUSD(value) {
    return '$' + value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function formatChange(change) {
    const sign = change >= 0 ? '+' : '';
    return sign + change.toFixed(2) + '%';
  }

  function formatCompact(value) {
    if (value >= 1e12) return '$' + (value / 1e12).toFixed(2) + 'T';
    if (value >= 1e9) return '$' + (value / 1e9).toFixed(2) + 'B';
    if (value >= 1e6) return '$' + (value / 1e6).toFixed(2) + 'M';
    if (value >= 1e3) return '$' + (value / 1e3).toFixed(2) + 'K';
    return '$' + value.toFixed(2);
  }

  return {
    start, stop, onUpdate, removeListener,
    getCoins, getCoin, getPriceHistory, getCandleHistory,
    getPortfolioValue, getTopGainers, getTopLosers,
    getMarketCap, getOrderBook, getRecentTrades,
    getTransactionHistory, setHoldings,
    formatPrice, formatUSD, formatChange, formatCompact,
    COINS
  };
})();
