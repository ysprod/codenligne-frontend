import { config } from "@/lib/config";

export function isUrl(s: string) {
  return s.startsWith('http') || s.startsWith('/');
}

export const formatDate = (date: string | Date | undefined | null) => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!d || isNaN((d as Date).getTime?.() ?? NaN)) return '';
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export function cx(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(" ");
}

export function rubriqueLabel(r: { titre?: unknown; nom?: unknown } | null | undefined): string {
  return String(r?.titre ?? r?.nom ?? "Rubrique");
}
 
export function cleanText(s: unknown) {
  return String(s ?? "").replace(/\s+/g, " ").trim();
}

export function getId(x: { _id?: unknown; id?: unknown } | null | undefined): string {
  return String(x?._id ?? x?.id ?? "");
}

export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function clampText(s: string, max = 120) {
  return clamp(s, max);
}


export const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};


/** @deprecated Use safeTrim instead */
export function safeText(v: unknown) {
  return safeTrim(v);
}

export function formatDateFR(dateStr?: string | null) {
  const s = safeText(dateStr);
  if (!s) return "";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(d);
}

export function formatDateFRNew(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function safeTrim(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export function wordCount(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}

export function buildUrl(pathname: string, params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).length > 0) sp.set(k, String(v));
  });

  // anti-cache / force refresh soft
  sp.set('r', String(Date.now()));

  const qs = sp.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export function formatDateFRTiret(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  } catch {
    return "—";
  }
}

export function stripMarkdown(md: string) {
  return (md || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/[#>*_~\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function estimateReadingTime(md: string) {
  const txt = stripMarkdown(md);
  const words = txt ? txt.split(" ").length : 0;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min`;
}

export function slugify(input: string) {
  return (input || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export type TocItem = { id: string; text: string; level: 2 | 3 };

export function buildTocFromMarkdown(md: string): TocItem[] {
  const lines = (md || "").split("\n");
  const items: TocItem[] = [];
  const used = new Map<string, number>();

  for (const line of lines) {
    const m2 = line.match(/^##\s+(.+)$/);
    const m3 = line.match(/^###\s+(.+)$/);
    const text = (m2?.[1] || m3?.[1] || "").trim();
    const level = m2 ? 2 : m3 ? 3 : null;
    if (!level || !text) continue;

    let id = slugify(text);
    const count = used.get(id) ?? 0;
    used.set(id, count + 1);
    if (count > 0) id = `${id}-${count + 1}`;

    items.push({ id, text, level });
  }

  return items.slice(0, 18);
}


export function fmtDuration(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m <= 0) return `${r}s`;
  return `${m}m ${String(r).padStart(2, '0')}s`;
}


export function createReviewId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function normalizeReviewRating(value: number) {
  return Math.max(1, Math.min(5, Math.round(value)));
}

export function toMediaUrl(pathLike?: string | null) {
  if (!pathLike) return null;
  if (/^https?:\/\//i.test(pathLike)) return pathLike;
  const normalized = pathLike.replaceAll("\\", "/").replace(/^\/+/, "");
  const baseUrl = config.api.baseURL.replace(/\/+$/, "");
  return `${baseUrl}/${normalized}`;
}

export function toYouTubeEmbedUrl(rawUrl?: string | null) {
  if (!rawUrl) return null;

  try {
    const url = new URL(rawUrl);
    const host = url.hostname.toLowerCase();

    if (host.includes("youtu.be")) {
      const id = url.pathname.replace(/^\//, "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (host.includes("youtube.com")) {
      const id = url.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  } catch {
    return null;
  }

  return null;
}

export function extractYouTubeId(rawUrl?: string | null) {
  if (!rawUrl) return null;

  try {
    const url = new URL(rawUrl);
    const host = url.hostname.toLowerCase();

    if (host.includes("youtu.be")) {
      return url.pathname.replace(/^\//, "") || null;
    }

    if (host.includes("youtube.com")) {
      return url.searchParams.get("v");
    }
  } catch {
    return null;
  }

  return null;
}

export function toYouTubeThumbnailUrl(rawUrl?: string | null) {
  const id = extractYouTubeId(rawUrl);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export function getPageNumbers(page: number, total: number) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set<number>();
  set.add(1);
  set.add(total);
  [page - 1, page, page + 1].forEach((p) => {
    if (p >= 1 && p <= total) set.add(p);
  });

  const arr = Array.from(set).sort((a, b) => a - b);

  const out: number[] = [];
  for (let i = 0; i < arr.length; i++) {
    const cur = arr[i];
    const prev = arr[i - 1];
    if (i > 0 && prev && cur - prev > 1) out.push(0);
    out.push(cur);
  }
  return out;
}

export function makeExcerpt(content: string, max = 160) {
  return content.length <= max ? content : content.slice(0, max).trimEnd() + '…';
}

export function clamp(s: string, max = 140) {
  const t = cleanText(s);
  return t.length > max ? t.slice(0, max - 1) + "…" : t;
}

export function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}