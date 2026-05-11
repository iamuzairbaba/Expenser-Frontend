import { currency } from "./format";

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCsv(transactions) {
  const rows = [["Date", "Type", "Category", "Amount", "Description", "Merchant", "Tags"]];
  transactions.forEach((item) => {
    rows.push([
      new Date(item.date).toLocaleDateString(),
      item.type,
      item.category?.name || "",
      item.amount,
      item.notes || item.description || "",
      item.merchant || "",
      Array.isArray(item.tags) ? item.tags.join("; ") : item.tags || "",
    ]);
  });
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  downloadBlob(csv, `expenser-${new Date().toISOString().slice(0, 10)}.csv`, "text/csv");
}

export function exportExcel(transactions) {
  const rows = transactions
    .map(
      (item) =>
        `<tr>
          <td>${new Date(item.date).toLocaleDateString()}</td>
          <td>${item.type}</td>
          <td>${item.category?.name || ""}</td>
          <td>${item.amount}</td>
          <td>${item.notes || item.description || ""}</td>
          <td>${item.merchant || ""}</td>
        </tr>`
    )
    .join("");
  const html = `<table><thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Amount</th><th>Description</th><th>Merchant</th></tr></thead><tbody>${rows}</tbody></table>`;
  downloadBlob(html, `expenser-${new Date().toISOString().slice(0, 10)}.xlsx`, "application/vnd.ms-excel");
}

export function exportPdf(summary, transactions, insights) {
  const rows = transactions
    .map(
      (item) =>
        `<tr>
          <td>${new Date(item.date).toLocaleDateString()}</td>
          <td><span class="${item.type}">${item.type}</span></td>
          <td>${item.category?.name || ""}</td>
          <td style="text-align:right;font-weight:600;color:${item.type === "income" ? "#16a34a" : "#dc2626"}">${item.type === "income" ? "+" : "-"}${currency(item.amount)}</td>
          <td>${item.notes || item.description || ""}</td>
        </tr>`
    )
    .join("");

  const savingsRate = summary?.income > 0
    ? Math.round(((summary.income - summary.expense) / summary.income) * 100)
    : 0;

  const win = window.open("", "_blank");
  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Expenser Financial Report</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #0f172a; background: #fff; }
          .header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #f1f5f9; }
          .logo-svg { width: 48px; height: 48px; }
          .brand { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
          .brand span { color: #0ea5e9; }
          .subtitle { color: #64748b; font-size: 13px; margin-top: 2px; }
          .date { margin-left: auto; color: #64748b; font-size: 13px; }
          .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
          .card { border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; }
          .card-label { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
          .card-value { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
          .income { color: #16a34a; }
          .expense { color: #dc2626; }
          .balance { color: #0ea5e9; }
          .savings { color: #7c3aed; }
          .section-title { font-size: 16px; font-weight: 700; margin-bottom: 16px; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background: #f8fafc; padding: 10px 12px; text-align: left; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; border-bottom: 1px solid #e2e8f0; }
          td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
          tr:last-child td { border-bottom: none; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center; color: #94a3b8; font-size: 12px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <svg class="logo-svg" viewBox="0 0 40 40" fill="none">
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0ea5e9"/><stop offset="100%" stop-color="#6366f1"/></linearGradient>
              <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#22c55e"/><stop offset="100%" stop-color="#0ea5e9"/></linearGradient>
            </defs>
            <rect x="3" y="8" width="34" height="24" rx="7" fill="url(#g1)"/>
            <polyline points="8,27 13,22 18,25 24,18 32,14" stroke="url(#g2)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <circle cx="32" cy="14" r="2.5" fill="#22c55e"/>
          </svg>
          <div>
            <div class="brand">Expen<span>ser</span></div>
            <div class="subtitle">Financial Report</div>
          </div>
          <div class="date">Generated: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
        </div>

        <div class="summary">
          <div class="card">
            <div class="card-label">Total Income</div>
            <div class="card-value income">${currency(summary?.income)}</div>
          </div>
          <div class="card">
            <div class="card-label">Total Expenses</div>
            <div class="card-value expense">${currency(summary?.expense)}</div>
          </div>
          <div class="card">
            <div class="card-label">Net Balance</div>
            <div class="card-value balance">${currency(summary?.balance)}</div>
          </div>
          <div class="card">
            <div class="card-label">Savings Rate</div>
            <div class="card-value savings">${savingsRate}%</div>
          </div>
        </div>

        <div class="section-title">Transactions (${transactions.length})</div>
        <table>
          <thead>
            <tr><th>Date</th><th>Type</th><th>Category</th><th style="text-align:right">Amount</th><th>Description</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <div class="footer">
          Generated by Expenser · Smart Finance Management · ${new Date().getFullYear()}
        </div>
      </body>
    </html>
  `);
  win.document.close();
  setTimeout(() => win.print(), 500);
}
