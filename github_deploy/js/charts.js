/* ============================================
   BYROEXC — Canvas Chart Library
   ============================================ */

const Charts = (() => {

  // ── Sparkline Chart ──
  function drawSparkline(canvas, data, color = '#00d4aa', fill = true) {
    if (!canvas || !data || data.length < 2) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = 2;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    ctx.clearRect(0, 0, w, h);

    // Determine color based on trend
    const isUp = data[data.length - 1] >= data[0];
    const lineColor = color || (isUp ? '#00c853' : '#ff3b5c');

    // Draw fill
    if (fill) {
      ctx.beginPath();
      data.forEach((val, i) => {
        const x = padding + (i / (data.length - 1)) * (w - padding * 2);
        const y = h - padding - ((val - min) / range) * (h - padding * 2);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.lineTo(w - padding, h);
      ctx.lineTo(padding, h);
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, 0, 0, h);
      gradient.addColorStop(0, lineColor + '20');
      gradient.addColorStop(1, lineColor + '00');
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Draw line
    ctx.beginPath();
    data.forEach((val, i) => {
      const x = padding + (i / (data.length - 1)) * (w - padding * 2);
      const y = h - padding - ((val - min) / range) * (h - padding * 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  // ── Candlestick Chart ──
  function drawCandlestick(canvas, candles, options = {}) {
    if (!canvas || !candles || candles.length < 2) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 20, right: 60, bottom: 30, left: 10 };

    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    // Find price range
    let minPrice = Infinity, maxPrice = -Infinity;
    candles.forEach(c => {
      minPrice = Math.min(minPrice, c.low);
      maxPrice = Math.max(maxPrice, c.high);
    });
    const priceRange = maxPrice - minPrice || 1;
    // Add 5% padding
    minPrice -= priceRange * 0.05;
    maxPrice += priceRange * 0.05;
    const adjustedRange = maxPrice - minPrice;

    ctx.clearRect(0, 0, w, h);

    // Draw grid lines
    const gridLines = 5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#5e6673';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';

    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (i / gridLines) * chartH;
      const price = maxPrice - (i / gridLines) * adjustedRange;

      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();

      // Price label
      ctx.fillText(formatChartPrice(price), w - 5, y + 4);
    }

    // Draw candles
    const candleWidth = Math.max(2, (chartW / candles.length) * 0.7);
    const gap = chartW / candles.length;

    candles.forEach((candle, i) => {
      const x = padding.left + i * gap + gap / 2;
      const isGreen = candle.close >= candle.open;

      const openY = padding.top + ((maxPrice - candle.open) / adjustedRange) * chartH;
      const closeY = padding.top + ((maxPrice - candle.close) / adjustedRange) * chartH;
      const highY = padding.top + ((maxPrice - candle.high) / adjustedRange) * chartH;
      const lowY = padding.top + ((maxPrice - candle.low) / adjustedRange) * chartH;

      const color = isGreen ? '#00c853' : '#ff3b5c';

      // Wick
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Body
      const bodyTop = Math.min(openY, closeY);
      const bodyH = Math.max(1, Math.abs(closeY - openY));
      ctx.fillStyle = color;
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyH);
    });

    // Draw volume bars at bottom
    const maxVol = Math.max(...candles.map(c => c.volume));
    const volHeight = chartH * 0.15;

    candles.forEach((candle, i) => {
      const x = padding.left + i * gap + gap / 2;
      const isGreen = candle.close >= candle.open;
      const volH = (candle.volume / maxVol) * volHeight;
      const y = h - padding.bottom - volH;

      ctx.fillStyle = isGreen ? 'rgba(0, 200, 83, 0.15)' : 'rgba(255, 59, 92, 0.15)';
      ctx.fillRect(x - candleWidth / 2, y, candleWidth, volH);
    });

    // Current price line
    const currentPrice = candles[candles.length - 1].close;
    const currentY = padding.top + ((maxPrice - currentPrice) / adjustedRange) * chartH;
    const isCurrentGreen = candles[candles.length - 1].close >= candles[candles.length - 1].open;

    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = isCurrentGreen ? '#00c853' : '#ff3b5c';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, currentY);
    ctx.lineTo(w - padding.right, currentY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Price tag
    const tagColor = isCurrentGreen ? '#00c853' : '#ff3b5c';
    const tagText = formatChartPrice(currentPrice);
    const tagW = ctx.measureText(tagText).width + 12;
    ctx.fillStyle = tagColor;
    roundRect(ctx, w - padding.right, currentY - 10, tagW + 8, 20, 4);
    ctx.fill();
    ctx.fillStyle = '#0a0e17';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(tagText, w - padding.right + 6, currentY + 4);
  }

  // ── Donut Chart ──
  function drawDonut(canvas, segments, options = {}) {
    if (!canvas || !segments || segments.length === 0) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const centerX = w / 2;
    const centerY = h / 2;
    const radius = Math.min(w, h) / 2 - 10;
    const innerRadius = radius * (options.innerRatio || 0.65);

    const total = segments.reduce((sum, s) => sum + s.value, 0);
    let startAngle = -Math.PI / 2;

    segments.forEach(segment => {
      const sliceAngle = (segment.value / total) * Math.PI * 2;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();

      ctx.fillStyle = segment.color;
      ctx.fill();

      // Gap between segments
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, endAngle - 0.01, endAngle + 0.01);
      ctx.arc(centerX, centerY, innerRadius, endAngle + 0.01, endAngle - 0.01, true);
      ctx.closePath();
      ctx.fillStyle = '#0a0e17';
      ctx.fill();

      startAngle = endAngle;
    });
  }

  // ── Area Chart ──
  function drawAreaChart(canvas, data, options = {}) {
    if (!canvas || !data || data.length < 2) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 20, right: 50, bottom: 30, left: 10 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    const min = Math.min(...data) * 0.98;
    const max = Math.max(...data) * 1.02;
    const range = max - min || 1;

    ctx.clearRect(0, 0, w, h);

    const color = options.color || '#00d4aa';
    
    // Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (i / 4) * chartH;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
    }

    // Fill
    ctx.beginPath();
    data.forEach((val, i) => {
      const x = padding.left + (i / (data.length - 1)) * chartW;
      const y = padding.top + ((max - val) / range) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(padding.left + chartW, padding.top + chartH);
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    gradient.addColorStop(0, color + '30');
    gradient.addColorStop(1, color + '00');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    data.forEach((val, i) => {
      const x = padding.left + (i / (data.length - 1)) * chartW;
      const y = padding.top + ((max - val) / range) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Current dot
    const lastVal = data[data.length - 1];
    const lastX = padding.left + chartW;
    const lastY = padding.top + ((max - lastVal) / range) * chartH;

    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(lastX, lastY, 8, 0, Math.PI * 2);
    ctx.fillStyle = color + '30';
    ctx.fill();

    // Price labels
    ctx.fillStyle = '#5e6673';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (i / 4) * chartH;
      const price = max - (i / 4) * range;
      ctx.fillText(formatChartPrice(price), w - 5, y + 4);
    }
  }

  // Helper: format price for chart labels
  function formatChartPrice(price) {
    if (price >= 10000) return price.toFixed(0);
    if (price >= 100) return price.toFixed(1);
    if (price >= 1) return price.toFixed(2);
    return price.toFixed(4);
  }

  // Helper: rounded rectangle
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  return {
    drawSparkline,
    drawCandlestick,
    drawDonut,
    drawAreaChart
  };
})();
