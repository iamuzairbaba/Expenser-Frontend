import { Box, Flex, Icon, Text } from "@chakra-ui/react";
import Chart from "react-apexcharts";
import { FiArrowDownRight, FiArrowUpRight, FiDollarSign, FiTrendingUp, FiZap } from "react-icons/fi";
import { currency } from "../../utils/format";

function StatWidget({ label, value, icon: Ico, accent, theme }) {
  return (
    <Flex
      direction="column"
      gap={2}
      p={5}
      borderRadius={`${theme.borderRadius}px`}
      bg={theme.cardBg}
      border={`1px solid ${theme.border}`}
      boxShadow={theme.shadow}
      style={{ fontFamily: theme.fontFamily }}
    >
      <Flex justify="space-between" align="center">
        <Text style={{ color: theme.muted, fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {label}
        </Text>
        <Box
          w="32px" h="32px"
          borderRadius="8px"
          display="flex" alignItems="center" justifyContent="center"
          style={{ background: `${accent}20` }}
        >
          <Icon as={Ico} style={{ color: accent }} boxSize={4} />
        </Box>
      </Flex>
      <Text style={{ color: theme.text, fontSize: "24px", fontWeight: 800, letterSpacing: "-0.5px", fontVariantNumeric: "tabular-nums" }}>
        {value}
      </Text>
    </Flex>
  );
}

function ChartWidget({ options, series, type, height = 220, theme }) {
  const merged = {
    chart: { background: "transparent", toolbar: { show: false }, fontFamily: theme.fontFamily },
    theme: { mode: theme.bg.includes("fff") || theme.bg.includes("f8f") || theme.bg.includes("f1f") ? "light" : "dark" },
    grid: { borderColor: theme.border, strokeDashArray: 4 },
    xaxis: { labels: { style: { colors: theme.muted, fontSize: "11px" } }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { style: { colors: theme.muted, fontSize: "11px" } } },
    tooltip: { theme: theme.bg.includes("fff") ? "light" : "dark" },
    ...options,
  };
  return <Chart type={type} height={height} options={merged} series={series} />;
}

function InsightItem({ icon, text, bg, color }) {
  return (
    <Flex align="flex-start" gap={3} p={3} borderRadius="8px" style={{ background: bg }}>
      <Text fontSize="lg" flexShrink={0}>{icon}</Text>
      <Text style={{ fontSize: "13px", fontWeight: 500, lineHeight: 1.5 }}>{text}</Text>
    </Flex>
  );
}

export default function WidgetRenderer({ widget, analytics, transactions, theme }) {
  const summary = analytics?.summary || {};
  const categories = analytics?.categoryBreakdown || [];
  const monthly = analytics?.monthlyComparison || [];
  const trend = analytics?.spendingTrend || [];
  const insights = analytics?.insights || {};
  const items = transactions?.items || [];

  const savingsRate = summary.income > 0
    ? Math.round(((summary.income - summary.expense) / summary.income) * 100)
    : 0;

  const healthScore = (() => {
    let s = 50;
    if (summary.income > 0) {
      const r = (summary.income - summary.expense) / summary.income;
      if (r >= 0.3) s += 25; else if (r >= 0.15) s += 15; else if (r >= 0) s += 5; else s -= 15;
    }
    return Math.max(0, Math.min(100, s));
  })();

  const savingsTrend = monthly.map((m) => ({
    month: m.month,
    savings: Math.max(0, (m.income || 0) - (m.expense || 0)),
  }));

  const pieLabels = categories.length ? categories.map((c) => c.category.name) : ["No data"];
  const pieSeries = categories.length ? categories.map((c) => c.total) : [0];
  const pieColors = categories.length ? categories.map((c) => c.category.color) : ["#CBD5E0"];

  const cardStyle = {
    background: theme.cardBg,
    border: `1px solid ${theme.border}`,
    borderRadius: `${theme.borderRadius}px`,
    boxShadow: theme.shadow,
    padding: "20px",
    fontFamily: theme.fontFamily,
  };

  const titleStyle = { color: theme.text, fontWeight: 700, fontSize: "14px", marginBottom: "16px" };
  const mutedStyle = { color: theme.muted, fontSize: "12px" };
  const textStyle = { color: theme.text };

  switch (widget.type) {
    case "stat_income":
      return <StatWidget label="Total Income" value={currency(summary.income)} icon={FiArrowUpRight} accent="#22c55e" theme={theme} />;
    case "stat_expense":
      return <StatWidget label="Total Expenses" value={currency(summary.expense)} icon={FiArrowDownRight} accent="#ef4444" theme={theme} />;
    case "stat_balance":
      return <StatWidget label="Net Balance" value={currency(summary.balance)} icon={FiDollarSign} accent={theme.accent} theme={theme} />;
    case "stat_savings":
      return <StatWidget label="Savings Rate" value={`${savingsRate}%`} icon={FiTrendingUp} accent="#8b5cf6" theme={theme} />;
    case "stat_score":
      return <StatWidget label="Health Score" value={`${healthScore}/100`} icon={FiZap} accent={theme.accent} theme={theme} />;

    case "chart_donut":
      return (
        <div style={cardStyle}>
          <p style={titleStyle}>Expense Breakdown</p>
          <ChartWidget
            type="donut"
            height={240}
            theme={theme}
            options={{
              labels: pieLabels,
              colors: pieColors,
              legend: { position: "bottom", fontSize: "11px", labels: { colors: theme.muted } },
              plotOptions: { pie: { donut: { size: "60%" } } },
              dataLabels: { enabled: false },
              stroke: { width: 0 },
              tooltip: { theme: "dark", y: { formatter: (v) => currency(v) } },
            }}
            series={pieSeries}
          />
        </div>
      );

    case "chart_bar":
      return (
        <div style={cardStyle}>
          <p style={titleStyle}>Income vs Expenses</p>
          <ChartWidget
            type="bar"
            height={220}
            theme={theme}
            options={{
              xaxis: { categories: monthly.map((m) => m.month?.slice(5) || m.month), labels: { style: { colors: theme.muted, fontSize: "11px" } }, axisBorder: { show: false }, axisTicks: { show: false } },
              colors: ["#22c55e", "#ef4444"],
              plotOptions: { bar: { borderRadius: 4, columnWidth: "55%", borderRadiusApplication: "end" } },
              dataLabels: { enabled: false },
              legend: { labels: { colors: theme.muted } },
            }}
            series={[
              { name: "Income", data: monthly.map((m) => m.income || 0) },
              { name: "Expenses", data: monthly.map((m) => m.expense || 0) },
            ]}
          />
        </div>
      );

    case "chart_area":
      return (
        <div style={cardStyle}>
          <p style={titleStyle}>Spending Trend</p>
          <ChartWidget
            type="area"
            height={200}
            theme={theme}
            options={{
              xaxis: { categories: trend.map((t) => t.date?.slice(5) || t.date), labels: { style: { colors: theme.muted, fontSize: "11px" } }, axisBorder: { show: false }, axisTicks: { show: false } },
              colors: ["#ef4444"],
              fill: { type: "gradient", gradient: { opacityFrom: 0.3, opacityTo: 0.02 } },
              stroke: { curve: "smooth", width: 2.5 },
              dataLabels: { enabled: false },
              tooltip: { y: { formatter: (v) => currency(v) } },
            }}
            series={[{ name: "Daily Spending", data: trend.map((t) => t.total || 0) }]}
          />
        </div>
      );

    case "chart_savings":
      return (
        <div style={cardStyle}>
          <p style={titleStyle}>Savings Trend</p>
          <ChartWidget
            type="area"
            height={200}
            theme={theme}
            options={{
              xaxis: { categories: savingsTrend.map((s) => s.month?.slice(5) || s.month), labels: { style: { colors: theme.muted, fontSize: "11px" } }, axisBorder: { show: false }, axisTicks: { show: false } },
              colors: ["#22c55e"],
              fill: { type: "gradient", gradient: { opacityFrom: 0.3, opacityTo: 0.02 } },
              stroke: { curve: "smooth", width: 2.5 },
              dataLabels: { enabled: false },
              tooltip: { y: { formatter: (v) => currency(v) } },
            }}
            series={[{ name: "Savings", data: savingsTrend.map((s) => s.savings) }]}
          />
        </div>
      );

    case "txn_recent":
      return (
        <div style={cardStyle}>
          <p style={titleStyle}>Recent Transactions</p>
          {items.slice(0, 6).length === 0 ? (
            <p style={mutedStyle}>No transactions yet</p>
          ) : (
            items.slice(0, 6).map((t) => (
              <div key={t._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${theme.border}` }}>
                <div>
                  <p style={{ ...textStyle, fontSize: "13px", fontWeight: 600, margin: 0 }}>{t.notes || t.description || "—"}</p>
                  <p style={{ ...mutedStyle, margin: 0 }}>{t.category?.name} · {new Date(t.date).toLocaleDateString()}</p>
                </div>
                <p style={{ color: t.type === "income" ? "#22c55e" : "#ef4444", fontWeight: 700, fontSize: "13px", margin: 0 }}>
                  {t.type === "income" ? "+" : "-"}{currency(t.amount)}
                </p>
              </div>
            ))
          )}
        </div>
      );

    case "txn_top":
      const topExpenses = items.filter((t) => t.type === "expense").sort((a, b) => b.amount - a.amount).slice(0, 5);
      return (
        <div style={cardStyle}>
          <p style={titleStyle}>Top Expenses</p>
          {topExpenses.length === 0 ? <p style={mutedStyle}>No expenses yet</p> : topExpenses.map((t, i) => (
            <div key={t._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${theme.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: theme.accent, fontWeight: 700, fontSize: "12px" }}>#{i + 1}</span>
                <div>
                  <p style={{ ...textStyle, fontSize: "13px", fontWeight: 600, margin: 0 }}>{t.notes || t.description || "—"}</p>
                  <p style={{ ...mutedStyle, margin: 0 }}>{t.category?.name}</p>
                </div>
              </div>
              <p style={{ color: "#ef4444", fontWeight: 700, fontSize: "13px", margin: 0 }}>{currency(t.amount)}</p>
            </div>
          ))}
        </div>
      );

    case "txn_category":
      return (
        <div style={cardStyle}>
          <p style={titleStyle}>Category Breakdown</p>
          {categories.length === 0 ? <p style={mutedStyle}>No data yet</p> : categories.map((c) => {
            const pct = summary.expense > 0 ? Math.round((c.total / summary.expense) * 100) : 0;
            return (
              <div key={c.category._id} style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ ...textStyle, fontSize: "13px", fontWeight: 600 }}>{c.category.name}</span>
                  <span style={{ ...mutedStyle }}>{currency(c.total)} ({pct}%)</span>
                </div>
                <div style={{ height: "6px", background: theme.border, borderRadius: "99px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: c.category.color || theme.accent, borderRadius: "99px", transition: "width 0.5s ease" }} />
                </div>
              </div>
            );
          })}
        </div>
      );

    case "insight_box":
      const insightList = [];
      if (insights.spendingMessage) insightList.push({ icon: "📊", text: insights.spendingMessage });
      if (summary.income > 0) insightList.push({ icon: "💰", text: `Saved ${currency(summary.income - summary.expense)} this month (${savingsRate}% savings rate)` });
      if (insights.highestSpendingCategory && insights.highestSpendingCategory !== "No spending yet") {
        insightList.push({ icon: "🔝", text: `Highest spending: ${insights.highestSpendingCategory} — avg ${currency(insights.averageDailySpending)}/day` });
      }
      return (
        <div style={cardStyle}>
          <p style={titleStyle}>Smart Insights</p>
          {insightList.length === 0 ? (
            <p style={mutedStyle}>Add transactions to unlock insights</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {insightList.map((item, i) => (
                <InsightItem key={i} icon={item.icon} text={item.text} bg={`${theme.accent}15`} color={theme.accent} />
              ))}
            </div>
          )}
        </div>
      );

    case "text_title":
      const titleSize = widget.config?.size === "2xl" ? "28px" : widget.config?.size === "xl" ? "22px" : "18px";
      return (
        <div style={{ padding: "8px 0" }}>
          <p style={{ color: theme.text, fontSize: titleSize, fontWeight: 800, letterSpacing: "-0.5px", margin: 0, fontFamily: theme.fontFamily }}>
            {widget.config?.text || "Report Title"}
          </p>
          {widget.config?.subtitle && (
            <p style={{ color: theme.muted, fontSize: "14px", marginTop: "4px", margin: 0 }}>{widget.config.subtitle}</p>
          )}
        </div>
      );

    case "text_note":
      return (
        <div style={{ ...cardStyle, borderLeft: `3px solid ${theme.accent}` }}>
          <p style={{ color: theme.text, fontSize: "14px", lineHeight: 1.6, margin: 0, fontFamily: theme.fontFamily }}>
            {widget.config?.text || "Add your notes here..."}
          </p>
        </div>
      );

    case "divider":
      return <div style={{ height: "1px", background: theme.border, margin: "8px 0" }} />;

    default:
      return (
        <div style={{ ...cardStyle, textAlign: "center", padding: "32px" }}>
          <p style={mutedStyle}>Unknown widget: {widget.type}</p>
        </div>
      );
  }
}
