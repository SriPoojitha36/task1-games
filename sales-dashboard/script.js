const salesData = [
  { month: "Jan", region: "North", category: "Software", product: "CRM", sales: 42000, orders: 80, units: 94, profit: 12000 },
  { month: "Feb", region: "South", category: "Hardware", product: "Tablet", sales: 31000, orders: 62, units: 78, profit: 7600 },
  { month: "Mar", region: "West", category: "Services", product: "Training", sales: 28000, orders: 44, units: 50, profit: 9800 },
  { month: "Apr", region: "East", category: "Software", product: "Analytics", sales: 52000, orders: 96, units: 112, profit: 16800 },
  { month: "May", region: "North", category: "Hardware", product: "Laptop", sales: 61000, orders: 88, units: 91, profit: 14300 },
  { month: "Jun", region: "South", category: "Services", product: "Support", sales: 34000, orders: 70, units: 75, profit: 11000 },
  { month: "Jul", region: "West", category: "Software", product: "CRM", sales: 57000, orders: 108, units: 125, profit: 18500 },
  { month: "Aug", region: "East", category: "Hardware", product: "Tablet", sales: 39000, orders: 74, units: 86, profit: 8700 },
  { month: "Sep", region: "North", category: "Services", product: "Training", sales: 43000, orders: 83, units: 90, profit: 15100 },
  { month: "Oct", region: "South", category: "Software", product: "Analytics", sales: 66000, orders: 118, units: 137, profit: 22400 },
  { month: "Nov", region: "West", category: "Hardware", product: "Laptop", sales: 72000, orders: 122, units: 140, profit: 19600 },
  { month: "Dec", region: "East", category: "Services", product: "Support", sales: 58000, orders: 104, units: 121, profit: 20100 }
];

const colors = ["#0f766e", "#2563eb", "#f97316", "#be123c", "#7c3aed", "#0891b2"];

function money(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function groupBy(rows, key, valueKey) {
  return rows.reduce((acc, row) => {
    acc[row[key]] = (acc[row[key]] || 0) + row[valueKey];
    return acc;
  }, {});
}

function drawBar(canvas, labels, values, formatter = value => value) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width = canvas.offsetWidth * devicePixelRatio;
  const height = canvas.height = canvas.offsetHeight * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
  const w = width / devicePixelRatio;
  const h = height / devicePixelRatio;
  ctx.clearRect(0, 0, w, h);
  const max = Math.max(...values, 1);
  const gap = 12;
  const barWidth = (w - 44 - gap * labels.length) / labels.length;
  ctx.font = "12px Arial";
  labels.forEach((label, index) => {
    const barHeight = (values[index] / max) * (h - 70);
    const x = 34 + index * (barWidth + gap);
    const y = h - 36 - barHeight;
    ctx.fillStyle = colors[index % colors.length];
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.fillStyle = "#172033";
    ctx.textAlign = "center";
    ctx.fillText(label, x + barWidth / 2, h - 14);
    if (barWidth > 36) ctx.fillText(formatter(values[index]), x + barWidth / 2, y - 6);
  });
}

function drawLine(canvas, labels, values) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width = canvas.offsetWidth * devicePixelRatio;
  const height = canvas.height = canvas.offsetHeight * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
  const w = width / devicePixelRatio;
  const h = height / devicePixelRatio;
  const max = Math.max(...values, 1);
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = "#cbd5e1";
  ctx.beginPath();
  ctx.moveTo(30, 18);
  ctx.lineTo(30, h - 34);
  ctx.lineTo(w - 12, h - 34);
  ctx.stroke();
  ctx.strokeStyle = "#be123c";
  ctx.lineWidth = 3;
  ctx.beginPath();
  values.forEach((value, index) => {
    const x = 34 + index * ((w - 60) / (values.length - 1));
    const y = h - 34 - (value / max) * (h - 58);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.fillStyle = "#172033";
  ctx.font = "12px Arial";
  labels.forEach((label, index) => {
    const x = 34 + index * ((w - 60) / (values.length - 1));
    ctx.fillText(label, x - 10, h - 12);
  });
}

function update() {
  const selected = document.getElementById("region").value;
  const rows = selected === "all" ? salesData : salesData.filter(row => row.region === selected);
  const totalSales = rows.reduce((sum, row) => sum + row.sales, 0);
  const orders = rows.reduce((sum, row) => sum + row.orders, 0);
  const productTotals = groupBy(rows, "product", "sales");
  const topProduct = Object.entries(productTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
  document.getElementById("totalSales").textContent = money(totalSales);
  document.getElementById("orders").textContent = orders;
  document.getElementById("avgOrder").textContent = money(totalSales / Math.max(orders, 1));
  document.getElementById("topProduct").textContent = topProduct;

  drawBar(document.getElementById("monthlyChart"), rows.map(row => row.month), rows.map(row => row.sales), value => `$${Math.round(value / 1000)}k`);
  const category = groupBy(rows, "category", "sales");
  drawBar(document.getElementById("categoryChart"), Object.keys(category), Object.values(category), value => `$${Math.round(value / 1000)}k`);
  const region = groupBy(rows, "region", "sales");
  drawBar(document.getElementById("regionChart"), Object.keys(region), Object.values(region), value => `$${Math.round(value / 1000)}k`);
  const product = groupBy(rows, "product", "units");
  drawBar(document.getElementById("productChart"), Object.keys(product), Object.values(product));
  drawLine(document.getElementById("profitChart"), rows.map(row => row.month), rows.map(row => row.profit));
}

document.getElementById("region").addEventListener("change", update);
window.addEventListener("resize", update);
update();
