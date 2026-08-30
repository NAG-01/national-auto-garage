/**
 * Formats a number to Indian Rupee (INR) currency string.
 * Example: 125000 -> ₹1,25,000
 * Example: 2000.5 -> ₹2,000.50
 */
export const formatINR = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  const num = Number(val);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(num);
};

/**
 * Formats a standard number into Indian numbering format with commas.
 * Example: 125000 -> 1,25,000
 */
export const formatNumber = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return new Intl.NumberFormat('en-IN').format(Number(val));
};

/**
 * Formats an ISO date string to a human-readable Indian date.
 * Example: "2026-08-19T10:00:00Z" -> "19 Aug 2026"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

/**
 * Formats date and time.
 * Example: "19 Aug 2026, 02:30 PM"
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

/**
 * Strips country code (+91, 91, 0) and non-digit characters to return clean 10-digit mobile number.
 * Example: "+91 98765 43210" -> "9876543210"
 * Example: "919876543210" -> "9876543210"
 * Example: "09876543210" -> "9876543210"
 */
export const cleanPhoneDigits = (phone) => {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length > 10) {
    return digits.slice(-10);
  }
  return digits;
};

/**
 * Formats a 10-digit Indian phone number with readable spacing.
 * Example: "9876543210" -> "+91 98765 43210"
 */
export const formatPhone = (phone) => {
  if (!phone) return '—';
  const cleaned = cleanPhoneDigits(phone);
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};

/**
 * Validates a 10-digit Indian mobile number.
 */
export const validatePhone = (phone) => {
  if (!phone) return false;
  const cleaned = cleanPhoneDigits(phone);
  return cleaned.length === 10;
};

/**
 * Formats a vehicle registration number with readable spacing.
 * Example: "GJ05AB1234" -> "GJ 05 AB 1234"
 */
export const formatRegNumber = (reg) => {
  if (!reg) return '—';
  const cleaned = String(reg).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  if (cleaned.length >= 8 && cleaned.length <= 10) {
    // Format: State(2) RTO(1-2) Series(0-3) Number(4)
    const state = cleaned.slice(0, 2);
    const rto = cleaned.slice(2, 4);
    const rest = cleaned.slice(4);
    return `${state} ${rto} ${rest}`.trim();
  }
  return cleaned;
};
