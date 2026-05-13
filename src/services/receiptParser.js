/**
 * receiptParser.js
 * Pure regex + heuristic extraction from raw OCR text.
 * No external dependencies.
 */

// ─── Amount extraction ────────────────────────────────────────────────────────

const TOTAL_PATTERNS = [
  // "Total: $12.50", "TOTAL AMOUNT 1,234.56", "Grand Total 99.00"
  /(?:grand\s+total|total\s+amount|total\s+due|amount\s+due|total\s+payable|net\s+total|total)[:\s*]+(?:[£$€₹¥₩]?\s*)(\d{1,6}[.,]\d{2})/i,
  /(?:total)[:\s]+(?:[£$€₹¥₩]?\s*)(\d{1,6}[.,]\d{2})/i,
  // Currency symbol followed by amount on a "total" line
  /(?:total)[^\n]*[£$€₹¥₩]\s*(\d{1,6}[.,]\d{2})/i,
];

const SUBTOTAL_PATTERNS = [
  /(?:sub\s*total|subtotal)[:\s]+(?:[£$€₹¥₩]?\s*)(\d{1,6}[.,]\d{2})/i,
];

const TAX_PATTERNS = [
  /(?:tax|gst|vat|hst|pst|cgst|sgst|igst)[:\s]+(?:[£$€₹¥₩]?\s*)(\d{1,6}[.,]\d{2})/i,
];

// ─── Date extraction ──────────────────────────────────────────────────────────

const DATE_PATTERNS = [
  // ISO: 2024-01-15
  /\b(\d{4}[-/]\d{2}[-/]\d{2})\b/,
  // DD/MM/YYYY or MM/DD/YYYY
  /\b(\d{1,2}[/\-.][\d]{1,2}[/\-.][\d]{2,4})\b/,
  // "Jan 15, 2024" or "15 Jan 2024"
  /\b(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{2,4})\b/i,
  /\b((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2},?\s+\d{2,4})\b/i,
];

// ─── Merchant extraction ──────────────────────────────────────────────────────

// Lines that are likely NOT the merchant name
const NOISE_LINES = /^(receipt|invoice|tax invoice|bill|order|date|time|total|subtotal|amount|thank|welcome|please|visit|www\.|http|tel:|phone|address|city|state|zip|pos |terminal|cashier|server|table|ref|txn|transaction|payment|cash|card|visa|master|amex|upi|neft|imps|\d{10,})/i;

function extractMerchant(lines) {
  // Try first 5 non-empty, non-noise lines — merchant is usually at the top
  const candidates = lines
    .slice(0, 8)
    .map((l) => l.trim())
    .filter((l) => l.length > 2 && l.length < 60 && !NOISE_LINES.test(l) && !/^\d+$/.test(l));

  return candidates[0] || "";
}

// ─── Invoice / transaction ID ─────────────────────────────────────────────────

const INVOICE_PATTERNS = [
  /(?:invoice|inv|order|receipt|txn|transaction|ref|reference)\s*[#:no.]*\s*([A-Z0-9-]{4,20})/i,
];

// ─── Payment method ───────────────────────────────────────────────────────────

const PAYMENT_PATTERNS = [
  { pattern: /\b(visa)\b/i, method: "Visa" },
  { pattern: /\b(mastercard|master card)\b/i, method: "Mastercard" },
  { pattern: /\b(amex|american express)\b/i, method: "Amex" },
  { pattern: /\b(upi)\b/i, method: "UPI" },
  { pattern: /\b(cash)\b/i, method: "Cash" },
  { pattern: /\b(debit card|debit)\b/i, method: "Debit Card" },
  { pattern: /\b(credit card|credit)\b/i, method: "Credit Card" },
  { pattern: /\b(neft|imps|rtgs)\b/i, method: "Bank Transfer" },
  { pattern: /\b(paypal)\b/i, method: "PayPal" },
  { pattern: /\b(gpay|google pay|phonepe|paytm)\b/i, method: "Digital Wallet" },
];

// ─── Currency detection ───────────────────────────────────────────────────────

function detectCurrency(text) {
  if (/₹|inr|rs\.?\s*\d/i.test(text)) return "INR";
  if (/£|gbp/i.test(text)) return "GBP";
  if (/€|eur/i.test(text)) return "EUR";
  if (/¥|jpy|cny/i.test(text)) return "JPY";
  if (/\$|usd/i.test(text)) return "USD";
  return "USD";
}

// ─── Normalise amount string ──────────────────────────────────────────────────

function parseAmount(str) {
  if (!str) return null;
  // Handle "1,234.56" and "1.234,56" (European)
  const cleaned = str.replace(/[£$€₹¥₩\s]/g, "");
  // European format: last separator is comma
  if (/,\d{2}$/.test(cleaned)) {
    return parseFloat(cleaned.replace(/\./g, "").replace(",", "."));
  }
  return parseFloat(cleaned.replace(/,/g, ""));
}

// ─── Normalise date string ────────────────────────────────────────────────────

function normaliseDate(raw) {
  if (!raw) return new Date().toISOString().slice(0, 10);
  try {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    // Try DD/MM/YYYY
    const parts = raw.split(/[/\-.]/);
    if (parts.length === 3) {
      const [a, b, c] = parts;
      // If year is last
      const year = c.length === 4 ? c : `20${c}`;
      const month = b.padStart(2, "0");
      const day = a.padStart(2, "0");
      const attempt = new Date(`${year}-${month}-${day}`);
      if (!isNaN(attempt.getTime())) return attempt.toISOString().slice(0, 10);
    }
  } catch {}
  return new Date().toISOString().slice(0, 10);
}

// ─── Main parser ──────────────────────────────────────────────────────────────

export function parseReceiptText(rawText) {
  const text = rawText || "";
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  // Amount
  let amount = null;
  for (const pattern of TOTAL_PATTERNS) {
    const m = text.match(pattern);
    if (m) { amount = parseAmount(m[1]); break; }
  }
  // Fallback: largest currency-prefixed number
  if (!amount) {
    const allAmounts = [...text.matchAll(/[£$€₹¥₩]\s*(\d{1,6}[.,]\d{2})/g)]
      .map((m) => parseAmount(m[1]))
      .filter((v) => v && v > 0);
    if (allAmounts.length) amount = Math.max(...allAmounts);
  }

  // Subtotal
  let subtotal = null;
  for (const p of SUBTOTAL_PATTERNS) {
    const m = text.match(p);
    if (m) { subtotal = parseAmount(m[1]); break; }
  }

  // Tax
  let tax = null;
  for (const p of TAX_PATTERNS) {
    const m = text.match(p);
    if (m) { tax = parseAmount(m[1]); break; }
  }

  // Date
  let rawDate = null;
  for (const p of DATE_PATTERNS) {
    const m = text.match(p);
    if (m) { rawDate = m[1]; break; }
  }
  const date = normaliseDate(rawDate);

  // Merchant
  const merchant = extractMerchant(lines);

  // Invoice number
  let invoiceNumber = null;
  for (const p of INVOICE_PATTERNS) {
    const m = text.match(p);
    if (m) { invoiceNumber = m[1]; break; }
  }

  // Payment method
  let paymentMethod = null;
  for (const { pattern, method } of PAYMENT_PATTERNS) {
    if (pattern.test(text)) { paymentMethod = method; break; }
  }

  // Currency
  const currency = detectCurrency(text);

  // Confidence: based on how many fields were found
  const found = [amount, date !== new Date().toISOString().slice(0, 10), merchant, invoiceNumber].filter(Boolean).length;
  const confidence = Math.round((found / 4) * 100);

  return {
    amount: amount && amount > 0 ? amount : null,
    subtotal,
    tax,
    date,
    merchant,
    invoiceNumber,
    paymentMethod,
    currency,
    confidence,
    rawText: text.slice(0, 2000), // store first 2000 chars
  };
}
