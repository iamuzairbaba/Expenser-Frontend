import { currency } from "../../utils/format";

export function exportReportPdf(reportMeta, widgets, theme, analytics, transactions) {
  const summary = analytics?.summary || {};
  const categories = analytics?.categoryBreakdown || [];
  const items = transactions?.items || [];
  const insights = analytics?.insights || {};

  const savingsRate = summary.income > 0
    ? Math.round(((summary.income - summary.expense) / summary.income) * 100)
    : 0;

  function renderWidget(w) {
    switch (w.type) {
      case "text_title":
        return `<div style="padding:8px 0 16px">
          <h1 style="color:${theme.text};font-size:28px;font-weight:800;letter-spacing:-0.5px;margin:0">${w.config?.text || "Report Title"}</h1>
          ${w.config?.subtitle ? `<p style="color:${theme.muted};font-size:14px;margin:4px 0 0">${w.config.subtitle}</p>` : ""}
        </div>`;

      case "text_note":
        return `<div style="background:${theme.cardBg};border:1px solid ${theme.border};border-left:3px solid ${theme.accent};border-radius:${theme.borderRadius}px;padding:16px;margin-bottom:12px">
          <p style="color:${theme.text};font-size:14px;line-height:1.6;margin:0">${w.config?.text || ""}</p>
        </div>`;

      case "divider":
        return `<hr style="border:none;border-top:1px solid ${theme.border};margin:12px 0">`;

      case "stat_income":
        return statCard("Total Income", currency(summary.income), "#22c55e");
      case "stat_expense":
        return statCard("Total Expenses", currency(summary.expense), "#ef4444");
      case "stat_balance":
        return statCard("Net Balance", currency(summary.balance), theme.accent);
      case "stat_savings":
        return statCard("Savings Rate", `${savingsRate}%`, "#8b5cf6");
      case "stat_score":
        return statCard("Health Score", `${Math.min(100, Math.max(0, 50 + (savingsRate >= 30 ? 25 : savingsRate >= 15 ? 15 : 5)))}/100`, theme.accent);

      case "txn_recent":
        return txnTable("Recent Transactions", items.slice(0, 8));
      case "txn_top":
        return txnTable("Top Expenses", items.filter((t) => t.type === "expense").sort((a, b) => b.amount - a.amount).slice(0, 5));

      case "txn_category":
        return `<div style="background:${theme.cardBg};border:1px solid ${theme.border};border-radius:${theme.borderRadius}px;padding:20px;margin-bottom:12px">
          <h3 style="color:${theme.text};font-size:14px;font-weight:700;margin:0 0 16px">Category Breakdown</h3>
          ${categories.map((c) => {
            const pct = summary.expense > 0 ? Math.round((c.total / summary.expense) * 100) : 0;
            return `<div style="margin-bottom:10px">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                <span style="color:${theme.text};font-size:13px;font-weight:600">${c.category.name}</span>
                <span style="color:${theme.muted};font-size:12px">${currency(c.total)} (${pct}%)</span>
              </div>
              <div style="height:6px;background:${theme.border};border-radius:99px">
                <div style="height:100%;width:${pct}%;background:${c.category.color || theme.accent};border-radius:99px"></div>
              </div>
            </div>`;
          }).join("")}
        </div>`;

      case "insight_box":
        const list = [];
        if (insights.spendingMessage) list.push({ icon: "📊", text: insights.spendingMessage });
        if (summary.income > 0) list.push({ icon: "💰", text: `Saved ${currency(summary.income - summary.expense)} this month (${savingsRate}% savings rate)` });
        if (insights.highestSpendingCategory && insights.highestSpendingCategory !== "No spending yet") {
          list.push({ icon: "🔝", text: `Highest spending: ${insights.highestSpendingCategory}` });
        }
        return `<div style="background:${theme.cardBg};border:1px solid ${theme.border};border-radius:${theme.borderRadius}px;padding:20px;margin-bottom:12px">
          <h3 style="color:${theme.text};font-size:14px;font-weight:700;margin:0 0 12px">Smart Insights</h3>
          ${list.map((i) => `<div style="display:flex;gap:10px;padding:10px;background:${theme.accent}15;border-radius:8px;margin-bottom:8px">
            <span>${i.icon}</span>
            <span style="color:${theme.text};font-size:13px;font-weight:500">${i.text}</span>
          </div>`).join("")}
        </div>`;

      default:
        return "";
    }
  }

  function statCard(label, value, color) {
    return `<div style="background:${theme.cardBg};border:1px solid ${theme.border};border-radius:${theme.borderRadius}px;padding:20px;display:inline-block;min-width:160px;margin:0 8px 8px 0">
      <p style="color:${theme.muted};font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px">${label}</p>
      <p style="color:${color};font-size:24px;font-weight:800;margin:0">${value}</p>
    </div>`;
  }

  function txnTable(title, txns) {
    return `<div style="background:${theme.cardBg};border:1px solid ${theme.border};border-radius:${theme.borderRadius}px;padding:20px;margin-bottom:12px">
      <h3 style="color:${theme.text};font-size:14px;font-weight:700;margin:0 0 16px">${title}</h3>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead><tr style="border-bottom:1px solid ${theme.border}">
          <th style="color:${theme.muted};font-weight:600;text-align:left;padding:6px 0">Date</th>
          <th style="color:${theme.muted};font-weight:600;text-align:left;padding:6px 0">Description</th>
          <th style="color:${theme.muted};font-weight:600;text-align:left;padding:6px 0">Category</th>
          <th style="color:${theme.muted};font-weight:600;text-align:right;padding:6px 0">Amount</th>
        </tr></thead>
        <tbody>${txns.map((t) => `<tr style="border-bottom:1px solid ${theme.border}">
          <td style="color:${theme.muted};padding:8px 0">${new Date(t.date).toLocaleDateString()}</td>
          <td style="color:${theme.text};padding:8px 0;font-weight:500">${t.notes || t.description || "—"}</td>
          <td style="color:${theme.muted};padding:8px 0">${t.category?.name || ""}</td>
          <td style="color:${t.type === "income" ? "#22c55e" : "#ef4444"};padding:8px 0;text-align:right;font-weight:700">${t.type === "income" ? "+" : "-"}${currency(t.amount)}</td>
        </tr>`).join("")}</tbody>
      </table>
    </div>`;
  }

  const win = window.open("", "_blank");
  win.document.write(`<!DOCTYPE html><html><head>
    <title>${reportMeta.title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:${theme.fontFamily};background:${theme.bg};color:${theme.text};padding:40px;min-height:100vh}
      @media print{body{padding:20px}}
    </style>
  </head><body>
    <div style="max-width:900px;margin:0 auto">
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid ${theme.border}">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${theme.accent}"/><stop offset="100%" stop-color="#6366f1"/></linearGradient>
          </defs>
          <rect x="3" y="8" width="34" height="24" rx="7" fill="url(#g1)"/>
          <polyline points="8,27 13,22 18,25 24,18 32,14" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          <circle cx="32" cy="14" r="2.5" fill="#22c55e"/>
        </svg>
        <div>
          <h1 style="font-size:22px;font-weight:800;color:${theme.text}">${reportMeta.title}</h1>
          <p style="color:${theme.muted};font-size:13px;margin-top:2px">Generated ${new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</p>
        </div>
      </div>
      ${widgets.map(renderWidget).join("")}
      <div style="margin-top:40px;padding-top:20px;border-top:1px solid ${theme.border};text-align:center;color:${theme.muted};font-size:12px">
        Generated by Expenser · Smart Finance Management
      </div>
    </div>
  </body></html>`);
  win.document.close();
  setTimeout(() => win.print(), 600);
}
