/**
 * Rounds monetary amounts to 2 decimal places to avoid floating point anomalies.
 */
export const roundMoney = (val) => {
  if (val === null || val === undefined || isNaN(val)) return 0;
  return Math.round((Number(val) + Number.EPSILON) * 100) / 100;
};

/**
 * Formats a number to Indian Rupee (INR) currency string.
 * Example: 125000 -> ₹1,25,000
 */
export const formatINR = (val) => {
  const rounded = roundMoney(val);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(rounded);
};

/**
 * Normalizes Indian phone numbers to clean 10-digit format.
 * Strips +91, 0 prefix, spaces, dashes, parentheses.
 */
export const normalizePhone = (phone) => {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  return digits;
};

/**
 * Validates a 10-digit Indian mobile number.
 */
export const validatePhone = (phone) => {
  if (!phone) return false;
  const digits = normalizePhone(phone);
  return digits.length === 10 && /^[6-9]\d{9}$/.test(digits);
};

/**
 * Normalizes vehicle registration numbers to standard uppercase alphanumeric format.
 * Example: "gj 05 ab 1234" -> "GJ05AB1234"
 */
export const normalizeRegNumber = (reg) => {
  if (!reg) return '';
  return String(reg).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
};
