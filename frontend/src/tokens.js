// Design tokens — copied exactly from the Claude Design handoff README.
export const colors = {
  accent: "#5b5bd6",
  accentHover: "#4d4dc7",
  accentRing: "#eeeefc",
  accentChip: "#f1f1fb",

  appBg: "#f6f7f9",
  boardBg: "#f3f3fb",
  columnBg: "#ebecf2",
  cardBg: "#ffffff",

  borderLight: "#e9eaee",
  borderInput: "#dcdfe5",
  borderSubtle: "#e4e6eb",

  textStrong: "#1c1f26",
  textMuted: "#6b7280",
  textFaint: "#9aa1ad",
  textLabel: "#414755",

  danger: "#e5484d",
  dangerStrong: "#c0353a",
  dangerBg: "#fdecec",
  success: "#2e9e5b",
};

export const fontMono =
  'ui-monospace, SFMono-Regular, Menlo, monospace';
export const fontBody =
  '"Helvetica Neue", Helvetica, Arial, sans-serif';

// Board accent hues, indexed by `id % 6` — matches the handoff exactly.
const ACCENT_HUES = [277, 222, 158, 28, 340, 198];
export function boardAccent(id) {
  return `oklch(0.6 0.17 ${ACCENT_HUES[id % ACCENT_HUES.length]})`;
}

export function relativeTime(iso) {
  const t = new Date(iso).getTime();
  if (isNaN(t)) return "";
  const diff = (Date.now() - t) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  if (diff < 604800) return Math.floor(diff / 86400) + "d ago";
  return new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
