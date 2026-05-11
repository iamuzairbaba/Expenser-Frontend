export const currency = (value = 0) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

export const todayInput = () => new Date().toISOString().slice(0, 10);

export const currentMonth = () => new Date().toISOString().slice(0, 7);

export const toInputDate = (date) => new Date(date || Date.now()).toISOString().slice(0, 10);

export const shortDate = (date) =>
  new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export const fullDate = (date) =>
  new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

export const percent = (value) => `${Math.round(Number(value || 0))}%`;
