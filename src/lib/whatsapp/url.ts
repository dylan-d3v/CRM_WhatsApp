export function normalizePhoneForWhatsApp(phone: string, phoneE164?: string | null) {
  const raw = (phoneE164 ?? phone).trim();

  if (!raw) {
    return null;
  }

  let digits = raw.replace(/\D/g, "");

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  // Atajo para telefonos locales de Ecuador cuando el usuario no incluye prefijo.
  if (digits.length === 10 && digits.startsWith("0")) {
    digits = `593${digits.slice(1)}`;
  } else if (digits.length === 9) {
    digits = `593${digits}`;
  }

  if (digits.length < 8) {
    return null;
  }

  return digits;
}

export function buildWhatsAppUrl(phoneDigits: string, message: string) {
  const params = new URLSearchParams({ text: message });
  return `https://wa.me/${phoneDigits}?${params.toString()}`;
}
