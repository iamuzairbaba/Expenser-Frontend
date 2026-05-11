// Maps merchant/description keywords to category names
const MERCHANT_MAP = [
  { keywords: ["uber", "lyft", "ola", "rapido", "taxi", "cab", "metro", "bus", "train", "flight", "airline", "airways"], category: "Travel" },
  { keywords: ["kfc", "mcdonald", "burger", "pizza", "domino", "subway", "zomato", "swiggy", "restaurant", "cafe", "coffee", "starbucks", "food", "dining", "eat"], category: "Food" },
  { keywords: ["amazon", "flipkart", "myntra", "ajio", "shopping", "mall", "store", "market", "buy", "purchase"], category: "Shopping" },
  { keywords: ["netflix", "spotify", "prime", "hulu", "disney", "youtube", "hotstar", "entertainment", "movie", "cinema", "theatre"], category: "Entertainment" },
  { keywords: ["electricity", "water", "gas", "internet", "wifi", "broadband", "phone", "mobile", "bill", "utility"], category: "Bills" },
  { keywords: ["hospital", "doctor", "pharmacy", "medicine", "clinic", "health", "gym", "fitness", "yoga"], category: "Health" },
  { keywords: ["rent", "mortgage", "housing", "apartment", "flat", "maintenance"], category: "Rent" },
  { keywords: ["salary", "payroll", "wage", "stipend", "income"], category: "Salary" },
  { keywords: ["freelance", "client", "project", "consulting", "contract"], category: "Freelance" },
  { keywords: ["dividend", "interest", "investment", "stock", "mutual fund", "sip"], category: "Investment" },
];

export function autoDetectCategory(text = "") {
  const lower = text.toLowerCase();
  for (const rule of MERCHANT_MAP) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return rule.category;
    }
  }
  return null;
}

// Mock receipt OCR parser
export function parseReceiptMock(filename = "") {
  const lower = filename.toLowerCase();
  const detected = autoDetectCategory(lower);

  // Simulate extracted data
  const amounts = [120, 250, 499, 89, 1200, 350, 75, 999, 45, 180];
  const merchants = ["Amazon", "Zomato", "Uber", "Netflix", "Electricity Board", "Pharmacy", "Starbucks", "Gym"];

  const amount = amounts[Math.floor(Math.random() * amounts.length)];
  const merchant = merchants[Math.floor(Math.random() * merchants.length)];
  const today = new Date().toISOString().slice(0, 10);

  return {
    amount,
    merchant,
    date: today,
    category: detected || autoDetectCategory(merchant),
    confidence: Math.floor(Math.random() * 20) + 75, // 75-95%
  };
}
