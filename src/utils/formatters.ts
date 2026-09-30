export function formatBDT(amount: number): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Math.round(amount || 0));
  return `৳ ${formatted}`;
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

export function formatDateOnly(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export function generateInvoiceNumber(sequence: number): string {
  const year = new Date().getFullYear();
  const padded = String(sequence).padStart(4, '0');
  return `TMS-${year}-${padded}`;
}

export function generateJobNumber(sequence: number): string {
  const year = new Date().getFullYear();
  const padded = String(sequence).padStart(3, '0');
  return `JOB-${year}-${padded}`;
}

export function generateBarcode(): string {
  const num = Math.floor(1000000000 + Math.random() * 9000000000);
  return `TMS${num}`;
}
