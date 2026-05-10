import { currency } from "./format";

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportCsv(transactions) {
  const rows = [["Date", "Type", "Category", "Amount", "Notes"]];
  transactions.forEach((item) => {
    rows.push([
      new Date(item.date).toLocaleDateString(),
      item.type,
      item.category?.name || "",
      item.amount,
      item.notes || item.description || "",
    ]);
  });
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  downloadBlob(csv, "expenser-transactions.csv", "text/csv");
}

export function exportExcel(transactions) {
  const rows = transactions
    .map(
      (item) =>
        `<tr><td>${new Date(item.date).toLocaleDateString()}</td><td>${item.type}</td><td>${
          item.category?.name || ""
        }</td><td>${item.amount}</td><td>${item.notes || item.description || ""}</td></tr>`
    )
    .join("");
  const html = `<table><thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Amount</th><th>Notes</th></tr></thead><tbody>${rows}</tbody></table>`;
  downloadBlob(html, "expenser-transactions.xlsx", "application/vnd.ms-excel");
}

export function exportPdf(summary, transactions) {
  const rows = transactions
    .map(
      (item) =>
        `<tr><td>${new Date(item.date).toLocaleDateString()}</td><td>${item.type}</td><td>${
          item.category?.name || ""
        }</td><td>${currency(item.amount)}</td><td>${item.notes || item.description || ""}</td></tr>`
    )
    .join("");
  const win = window.open("", "_blank");
  win.document.write(`
    <html>
      <head>
        <title>Expenser Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; color: #111827; }
          h1 { color: #2563eb; }
          .summary { display: flex; gap: 16px; margin: 20px 0; }
          .card { border: 1px solid #e5e7eb; padding: 16px; border-radius: 8px; flex: 1; }
          table { width: 100%; border-collapse: collapse; margin-top: 24px; }
          th, td { border-bottom: 1px solid #e5e7eb; padding: 10px; text-align: left; }
        </style>
      </head>
      <body>
        <h1>Expenser Report</h1>
        <div class="summary">
          <div class="card"><strong>Income</strong><br/>${currency(summary?.income)}</div>
          <div class="card"><strong>Expenses</strong><br/>${currency(summary?.expense)}</div>
          <div class="card"><strong>Balance</strong><br/>${currency(summary?.balance)}</div>
        </div>
        <h2>Transactions</h2>
        <table><thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Amount</th><th>Notes</th></tr></thead><tbody>${rows}</tbody></table>
      </body>
    </html>
  `);
  win.document.close();
  win.print();
}
