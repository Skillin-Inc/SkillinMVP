// /hooks/useInputFormatters.ts

// ========== Date of Birth ==========
export function formatDateOfBirth(text: string): string {
  const numeric = text.replace(/\D/g, "");

  if (numeric.length <= 2) {
    return numeric;
  } else if (numeric.length <= 4) {
    return `${numeric.slice(0, 2)}/${numeric.slice(2)}`;
  } else {
    return `${numeric.slice(0, 2)}/${numeric.slice(2, 4)}/${numeric.slice(4, 8)}`;
  }
}

export function isValidDate(dateOfBirth: string): boolean {
  const [month, day, year] = dateOfBirth.split("/").map(Number);
  if (!month || !day || !year) return false;

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > new Date().getFullYear()) return false;

  return true;
}

// ========== Email ==========
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ========== Phone Number ==========
export function formatPhoneNumber(text: string): string {
  const cleaned = text.replace(/[^0-9]/g, "");
  const limited = cleaned.slice(0, 10);

  if (limited.length < 4) {
    return limited;
  } else if (limited.length < 7) {
    return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
  } else {
    return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
  }
}

export function isValidPhoneNumber(phone: string): boolean {
  return /^\(\d{3}\)\s\d{3}-\d{4}$/.test(phone);
}
