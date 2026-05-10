const data = [
  { product: "Atlas CRM", segment: "Business", revenue: 142000, growth: 18, margin: 31 },
  { product: "Pulse Analytics", segment: "Enterprise", revenue: 224000, growth: 27, margin: 38 },
  { product: "Nova Desk", segment: "Consumer", revenue: 86000, growth: 9, margin: 22 },
  { product: "Vertex Cloud", segment: "Enterprise", revenue: 310000, growth: 21, margin: 34 },
  { product: "Bright Forms", segment: "Business", revenue: 74000, growth: -3, margin: 18 },
  { product: "Swift Pay", segment: "Consumer", revenue: 118000, growth: 14, margin: 29 },
  { product: "Signal Support", segment: "Business", revenue: 96000, growth: 7, margin: 25 },
  { product: "Core Security", segment: "Enterprise", revenue: 188000, growth: 32, margin: 41 },
  { product: "Market Lens", segment: "Business", revenue: 132000, growth: 16, margin: 27 },
  { product: "Shop Grid", segment: "Consumer", revenue: 105000, growth: 11, margin: 24 }
];

const searchEl = document.getElementById("search");
const segmentEl = document.getElementById("segment");
const sortEl = document.getElementById("sort");
const tableBody = document.getElementById("tableBody");
const compareAEl = document.getElementById("compareA");
const compareBEl = document.getElementById("compareB");
const compareResultEl = document.getElementById("compareResult");
const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function filteredRows() {
  const query = searchEl.value.toLowerCase();
  return data
    .filter(row => segmentEl.value === "all" || row.segment === segmentEl.value)
    .filter(row => row.product.toLowerCase().includes(query) || row.segment.toLowerCase().includes(query))
    .sort((a, b) => b[sortEl.value] - a[sortEl.value]);
}

function risk(row) {
  if (row.growth < 0 || row.margin < 20) return "high";
  if (row.growth < 10 || row.margin < 26) return "medium";
  return "low";
}

function drawBars(rows) {
  const canvas = document.getElementById("barChart");
  const ctx = canvas.getContext("2d");
  const width = canvas.width = canvas.offsetWidth * devicePixelRatio;
  const height = canvas.height = canvas.offsetHeight * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
  const w = width / devicePixelRatio;
  const h = height / devicePixelRatio;
  ctx.clearRect(0, 0, w, h);
  if (!rows.length) {
    drawEmptyState(ctx, w, h);
    return;
  }
  const max = Math.max(...rows.map(row => row.revenue), 1);
  rows.forEach((row, index) => {
    const y = 16 + index * 25;
    const barWidth = (row.revenue / max) * (w - 170);
    ctx.fillStyle = "#0f766e";
    ctx.fillRect(130, y, barWidth, 15);
    ctx.fillStyle = "#172033";
    ctx.font = "12px Arial";
    ctx.fillText(row.product.slice(0, 17), 4, y + 12);
    ctx.fillText(`$${Math.round(row.revenue / 1000)}k`, 136 + barWidth, y + 12);
  });
}

function drawScatter(rows) {
  const canvas = document.getElementById("scatterChart");
  const ctx = canvas.getContext("2d");
  const width = canvas.width = canvas.offsetWidth * devicePixelRatio;
  const height = canvas.height = canvas.offsetHeight * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
  const w = width / devicePixelRatio;
  const h = height / devicePixelRatio;
  ctx.clearRect(0, 0, w, h);
  if (!rows.length) {
    drawEmptyState(ctx, w, h);
    return;
  }
  ctx.strokeStyle = "#cbd5e1";
  ctx.beginPath();
  ctx.moveTo(36, 12);
  ctx.lineTo(36, h - 32);
  ctx.lineTo(w - 12, h - 32);
  ctx.stroke();
  rows.forEach(row => {
    const x = 36 + ((row.growth + 5) / 40) * (w - 56);
    const y = h - 32 - (row.margin / 45) * (h - 48);
    ctx.fillStyle = risk(row) === "low" ? "#16a34a" : risk(row) === "medium" ? "#f59e0b" : "#dc2626";
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawEmptyState(ctx, width, height) {
  ctx.fillStyle = "#64748b";
  ctx.font = "14px Arial";
  ctx.textAlign = "center";
  ctx.fillText("No matching data", width / 2, height / 2);
  ctx.textAlign = "left";
}

function setupComparison() {
  const options = data.map(row => `<option value="${escapeHtml(row.product)}">${escapeHtml(row.product)}</option>`).join("");
  compareAEl.innerHTML = options;
  compareBEl.innerHTML = options;
  compareAEl.value = "Vertex Cloud";
  compareBEl.value = "Core Security";
  updateComparison();
}

function metricDifference(first, second, key, suffix = "") {
  const diff = first[key] - second[key];
  const sign = diff > 0 ? "+" : "";
  return `${sign}${suffix === "$" ? formatter.format(diff) : `${diff}${suffix}`}`;
}

function updateComparison() {
  const first = data.find(row => row.product === compareAEl.value);
  const second = data.find(row => row.product === compareBEl.value);
  if (!first || !second) return;

  compareResultEl.innerHTML = `
    <div>
      <small>Revenue Difference</small>
      <strong>${metricDifference(first, second, "revenue", "$")}</strong>
    </div>
    <div>
      <small>Growth Difference</small>
      <strong>${metricDifference(first, second, "growth", "%")}</strong>
    </div>
    <div>
      <small>Margin Difference</small>
      <strong>${metricDifference(first, second, "margin", "%")}</strong>
    </div>
  `;
}

function render() {
  const rows = filteredRows();
  const total = rows.reduce((sum, row) => sum + row.revenue, 0);
  const avgMargin = rows.reduce((sum, row) => sum + row.margin, 0) / Math.max(rows.length, 1);
  const bestGrowth = [...rows].sort((a, b) => b.growth - a.growth)[0];
  const forecast = total * (1 + (rows.reduce((sum, row) => sum + row.growth, 0) / Math.max(rows.length, 1)) / 100);

  document.getElementById("totalRevenue").textContent = formatter.format(total);
  document.getElementById("avgMargin").textContent = `${avgMargin.toFixed(1)}%`;
  document.getElementById("bestGrowth").textContent = bestGrowth ? bestGrowth.product : "-";
  document.getElementById("forecast").textContent = formatter.format(forecast);
  document.getElementById("rowsShown").textContent = rows.length;
  document.getElementById("insight").textContent = bestGrowth
    ? `${bestGrowth.product} leads growth at ${bestGrowth.growth}%.`
    : "No rows match the current filters.";

  tableBody.innerHTML = rows.length ? rows.map(row => {
    const level = risk(row);
    return `<tr>
      <td>${escapeHtml(row.product)}</td>
      <td>${escapeHtml(row.segment)}</td>
      <td>${formatter.format(row.revenue)}</td>
      <td>${row.growth}%</td>
      <td>${row.margin}%</td>
      <td><span class="risk ${level}">${level}</span></td>
    </tr>`;
  }).join("") : `<tr><td class="empty-row" colspan="6">No rows match the current filters.</td></tr>`;

  drawBars(rows);
  drawScatter(rows);
}

function exportCsv() {
  const rows = filteredRows();
  const header = "Product,Segment,Revenue,Growth,Margin,Risk";
  const body = rows.map(row => [row.product, row.segment, row.revenue, row.growth, row.margin, risk(row)].join(","));
  const blob = new Blob([[header, ...body].join("\n")], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "analytics-export.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

searchEl.addEventListener("input", render);
[segmentEl, sortEl].forEach(el => el.addEventListener("change", render));
[compareAEl, compareBEl].forEach(el => el.addEventListener("change", updateComparison));
document.getElementById("exportCsv").addEventListener("click", exportCsv);
window.addEventListener("resize", render);
setupComparison();
render();
