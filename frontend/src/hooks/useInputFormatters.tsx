// /hooks/useInputFormatters.ts

// ========== Date of Birth ==========
export const formatDOB = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    const limited = cleaned.slice(0, 8);
  
    const month = limited.slice(0, 2);
    const day = limited.slice(2, 4);
    const year = limited.slice(4, 8);
  
    if (limited.length < 3) {
      return month;
    } else if (limited.length < 5) {
      return `${month}/${day}`;
    } else {
      return `${month}/${day}/${year}`;
    }
  };
  
  export const isValidDate = (dob: string) => {
    const [month, day, year] = dob.split('/').map(Number);
    if (!month || !day || !year) return false;
  
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  };
  
  // ========== Email ==========
  export const isValidEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  
  // ========== Zip Code ==========
  export const formatZipCode = (text: string) => {
    return text.replace(/[^0-9]/g, '').slice(0, 5); // Only 5 digits allowed
  };
  
  export const isValidZipCode = (zip: string) => {
    return /^\d{5}$/.test(zip);
  };
  
  // ========== Phone Number ==========
  export const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 10); // Limit to 10 digits
  
    const areaCode = cleaned.slice(0, 3);
    const centralOffice = cleaned.slice(3, 6);
    const lineNumber = cleaned.slice(6, 10);
  
    if (cleaned.length < 4) {
      return areaCode;
    } else if (cleaned.length < 7) {
      return `(${areaCode}) ${centralOffice}`;
    } else {
      return `(${areaCode}) ${centralOffice}-${lineNumber}`;
    }
  };
  
  export const isValidPhoneNumber = (phone: string) => {
    return /^\(\d{3}\)\s\d{3}-\d{4}$/.test(phone);
  };
  