export const currency = (value = 0) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value || 0));

export const todayInput = () => new Date().toISOString().slice(0, 10);

export const currentMonth = () => new Date().toISOString().slice(0, 7);

export const toInputDate = (date) => new Date(date || Date.now()).toISOString().slice(0, 10);
