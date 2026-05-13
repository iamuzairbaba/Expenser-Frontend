// Maps merchant/description keywords to category names
const MERCHANT_MAP = [
  { keywords: ["uber", "lyft", "ola", "rapido", "taxi", "cab", "metro", "bus", "train", "flight", "airline", "airways", "transport"], category: "Travel" },
  { keywords: ["kfc", "mcdonald", "burger", "pizza", "domino", "subway", "zomato", "swiggy", "restaurant", "cafe", "coffee", "starbucks", "food", "dining", "eat", "bistro", "bakery", "diner"], category: "Food" },
  { keywords: ["amazon", "flipkart", "myntra", "ajio", "shopping", "mall", "store", "market", "buy", "purchase", "retail", "shop"], category: "Shopping" },
  { keywords: ["netflix", "spotify", "prime", "hulu", "disney", "youtube", "hotstar", "entertainment", "movie", "cinema", "theatre", "subscription"], category: "Entertainment" },
  { keywords: ["electricity", "water", "gas", "internet", "wifi", "broadband", "phone", "mobile", "bill", "utility", "telecom"], category: "Bills" },
  { keywords: ["hospital", "doctor", "pharmacy", "medicine", "clinic", "health", "gym", "fitness", "yoga", "dental", "medical"], category: "Health" },
  { keywords: ["rent", "mortgage", "housing", "apartment", "flat", "maintenance", "lease"], category: "Rent" },
  { keywords: ["petrol", "diesel", "fuel", "gas station", "pump", "bp ", "shell", "esso", "chevron"], category: "Fuel" },
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
