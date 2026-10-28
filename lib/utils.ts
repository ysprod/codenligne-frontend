// User details utilities
export function safeString(v: unknown) {
  if (v === null || v === undefined) return "—";
  const s = String(v);
  return s.length ? s : "—";
}

export function getInitial(name?: string | null) {
  return (name?.trim()?.[0] || "U").toUpperCase();
}

export function joinList(arr?: unknown[]) {
  if (!Array.isArray(arr) || arr.length === 0) return "—";
  return arr.map((x) => String(x)).join(", ");
}

function flattenValues(values: readonly unknown[]): unknown[] {
  return values.flatMap((value) => (Array.isArray(value) ? flattenValues(value) : [value]));
}

// Utility to concatenate class names conditionally (like clsx/twMerge)
export function cn(...args: unknown[]): string {
  return flattenValues(args)
    .filter(Boolean)
    .join(' ');
}