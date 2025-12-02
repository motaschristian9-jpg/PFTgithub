/**
 * Formats a number into a currency string based on the user's preference.
 * Uses the browser's built-in Intl.NumberFormat for robust formatting.
 *
 * @param {number} amount - The numeric amount (e.g., 1000)
 * @param {string} currencyCode - The currency code (e.g., 'USD', 'PHP', 'EUR'). Defaults to 'USD'.
 * @returns {string} - Formatted string (e.g., "$1,000.00" or "₱1,000.00")
 */
export const formatCurrency = (amount, currencyCode = "USD") => {
  // Safety check: ensure amount is a number, default to 0 if null/undefined
  const safeAmount = Number(amount) || 0;

  // Fallback for empty currency code
  const code = currencyCode || "USD";

  try {
    // Note: We use "en-US" locale to force standard US-style formatting (comma for thousands, dot for decimal)
    // while letting the currency symbol change based on the 'code' variable.
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeAmount);
  } catch (error) {
    // Fallback if an invalid currency code is passed
    console.warn(`Invalid currency code: ${code}. Falling back to USD.`);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeAmount);
  }
};

/**
 * Returns just the symbol for a given currency code.
 * Uses formatToParts for reliable extraction of the symbol.
 *
 * @param {string} currencyCode
 * @returns {string} - The symbol (e.g., "$", "₱", "€")
 */
export const getCurrencySymbol = (currencyCode = "USD") => {
  const code = currencyCode || "USD";
  try {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      // Use narrowSymbol to prefer '€' over 'EUR' or 'US$' over 'USD'
      currencyDisplay: "narrowSymbol",
    });

    // Use formatToParts to safely locate the currency part
    const parts = formatter.formatToParts(0);
    const symbolPart = parts.find((part) => part.type === "currency");

    // Return the symbol value, or '$' as a final fallback
    return symbolPart ? symbolPart.value : "$";
  } catch (e) {
    return "$";
  }
};
