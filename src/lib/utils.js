export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function formatRelativeDays(value) {
  const today = new Date();
  const target = new Date(value);
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));

  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return "today";
  return `${diff}d left`;
}

export function slugify(value) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

export function downloadCsv(filename, rows) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
        .join(","),
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

