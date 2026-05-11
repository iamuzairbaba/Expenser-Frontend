// ─── Widget catalogue ────────────────────────────────────────────────────────

export const WIDGET_TYPES = {
  // Summary
  STAT_INCOME:   { type: "stat_income",   label: "Total Income",    icon: "💰", group: "Summary" },
  STAT_EXPENSE:  { type: "stat_expense",  label: "Total Expenses",  icon: "💸", group: "Summary" },
  STAT_BALANCE:  { type: "stat_balance",  label: "Net Balance",     icon: "⚖️",  group: "Summary" },
  STAT_SAVINGS:  { type: "stat_savings",  label: "Savings Rate",    icon: "📈", group: "Summary" },
  STAT_SCORE:    { type: "stat_score",    label: "Health Score",    icon: "🏆", group: "Summary" },
  // Charts
  CHART_DONUT:   { type: "chart_donut",   label: "Category Donut",  icon: "🍩", group: "Charts" },
  CHART_BAR:     { type: "chart_bar",     label: "Income vs Expense", icon: "📊", group: "Charts" },
  CHART_AREA:    { type: "chart_area",    label: "Spending Trend",  icon: "📉", group: "Charts" },
  CHART_SAVINGS: { type: "chart_savings", label: "Savings Trend",   icon: "📈", group: "Charts" },
  // Transactions
  TXN_RECENT:    { type: "txn_recent",    label: "Recent Transactions", icon: "🧾", group: "Transactions" },
  TXN_TOP:       { type: "txn_top",       label: "Top Expenses",    icon: "🔝", group: "Transactions" },
  TXN_CATEGORY:  { type: "txn_category",  label: "Category Breakdown", icon: "🗂️", group: "Transactions" },
  // Insights
  INSIGHT_BOX:   { type: "insight_box",   label: "Smart Insights",  icon: "💡", group: "Insights" },
  // Custom
  TEXT_TITLE:    { type: "text_title",    label: "Title Block",     icon: "🔤", group: "Custom" },
  TEXT_NOTE:     { type: "text_note",     label: "Notes / Comments", icon: "📝", group: "Custom" },
  DIVIDER:       { type: "divider",       label: "Divider",         icon: "➖", group: "Custom" },
};

export const WIDGET_GROUPS = ["Summary", "Charts", "Transactions", "Insights", "Custom"];

// ─── Theme presets ────────────────────────────────────────────────────────────

export const THEMES = {
  modern: {
    name: "Modern Fintech",
    bg: "#0b1120",
    cardBg: "#111827",
    accent: "#0ea5e9",
    text: "#f1f5f9",
    muted: "#94a3b8",
    border: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    shadow: "0 4px 24px rgba(0,0,0,0.4)",
    fontFamily: "Inter, sans-serif",
  },
  dark: {
    name: "Dark Professional",
    bg: "#09090b",
    cardBg: "#18181b",
    accent: "#6366f1",
    text: "#fafafa",
    muted: "#a1a1aa",
    border: "rgba(255,255,255,0.06)",
    borderRadius: 8,
    shadow: "0 2px 16px rgba(0,0,0,0.6)",
    fontFamily: "Inter, sans-serif",
  },
  minimal: {
    name: "Minimal White",
    bg: "#ffffff",
    cardBg: "#f8fafc",
    accent: "#0ea5e9",
    text: "#0f172a",
    muted: "#64748b",
    border: "#e2e8f0",
    borderRadius: 12,
    shadow: "0 1px 8px rgba(0,0,0,0.06)",
    fontFamily: "Inter, sans-serif",
  },
  glass: {
    name: "Glassmorphism",
    bg: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)",
    cardBg: "rgba(255,255,255,0.08)",
    accent: "#a78bfa",
    text: "#f8fafc",
    muted: "#cbd5e1",
    border: "rgba(255,255,255,0.15)",
    borderRadius: 18,
    shadow: "0 8px 32px rgba(0,0,0,0.3)",
    fontFamily: "Inter, sans-serif",
  },
  corporate: {
    name: "Corporate Report",
    bg: "#f1f5f9",
    cardBg: "#ffffff",
    accent: "#1e40af",
    text: "#1e293b",
    muted: "#475569",
    border: "#cbd5e1",
    borderRadius: 6,
    shadow: "0 1px 4px rgba(0,0,0,0.08)",
    fontFamily: "Georgia, serif",
  },
};

// ─── Report templates ─────────────────────────────────────────────────────────

export const TEMPLATES = [
  {
    id: "monthly",
    name: "Monthly Finance Report",
    description: "Complete monthly overview with charts and insights",
    icon: "📅",
    theme: "modern",
    widgets: [
      { id: "w1", type: "text_title",   config: { text: "Monthly Financial Report", size: "2xl" } },
      { id: "w2", type: "stat_income",  config: {} },
      { id: "w3", type: "stat_expense", config: {} },
      { id: "w4", type: "stat_balance", config: {} },
      { id: "w5", type: "stat_savings", config: {} },
      { id: "w6", type: "chart_donut",  config: {} },
      { id: "w7", type: "chart_bar",    config: {} },
      { id: "w8", type: "insight_box",  config: {} },
      { id: "w9", type: "txn_recent",   config: {} },
    ],
  },
  {
    id: "budget",
    name: "Budget Analysis",
    description: "Budget vs actual spending breakdown",
    icon: "💰",
    theme: "corporate",
    widgets: [
      { id: "w1", type: "text_title",    config: { text: "Budget Analysis Report", size: "2xl" } },
      { id: "w2", type: "stat_income",   config: {} },
      { id: "w3", type: "stat_expense",  config: {} },
      { id: "w4", type: "txn_category",  config: {} },
      { id: "w5", type: "chart_donut",   config: {} },
      { id: "w6", type: "insight_box",   config: {} },
    ],
  },
  {
    id: "savings",
    name: "Savings Performance",
    description: "Track savings goals and trends",
    icon: "🏦",
    theme: "dark",
    widgets: [
      { id: "w1", type: "text_title",    config: { text: "Savings Performance", size: "2xl" } },
      { id: "w2", type: "stat_savings",  config: {} },
      { id: "w3", type: "stat_balance",  config: {} },
      { id: "w4", type: "stat_score",    config: {} },
      { id: "w5", type: "chart_savings", config: {} },
      { id: "w6", type: "chart_area",    config: {} },
    ],
  },
  {
    id: "executive",
    name: "Executive Summary",
    description: "High-level financial overview",
    icon: "📋",
    theme: "minimal",
    widgets: [
      { id: "w1", type: "text_title",   config: { text: "Executive Summary", size: "2xl" } },
      { id: "w2", type: "stat_income",  config: {} },
      { id: "w3", type: "stat_expense", config: {} },
      { id: "w4", type: "stat_balance", config: {} },
      { id: "w5", type: "stat_savings", config: {} },
      { id: "w6", type: "stat_score",   config: {} },
      { id: "w7", type: "chart_bar",    config: {} },
      { id: "w8", type: "insight_box",  config: {} },
    ],
  },
  {
    id: "minimal",
    name: "Minimal Clean Report",
    description: "Simple, clean financial snapshot",
    icon: "✨",
    theme: "glass",
    widgets: [
      { id: "w1", type: "text_title",   config: { text: "Financial Snapshot", size: "2xl" } },
      { id: "w2", type: "stat_income",  config: {} },
      { id: "w3", type: "stat_expense", config: {} },
      { id: "w4", type: "stat_balance", config: {} },
      { id: "w5", type: "chart_donut",  config: {} },
    ],
  },
];
