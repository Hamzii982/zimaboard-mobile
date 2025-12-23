// utils/timeAgo.ts
export function timeAgo(dateString: string): string {
  const now = new Date().getTime();
  const date = new Date(dateString).getTime();

  const diffSeconds = Math.floor((now - date) / 1000);

  if (diffSeconds < 60) return "jetzt";

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `vor ${diffMinutes} minuten`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `vor ${diffHours} std.`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `vor ${diffDays} tage`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `vor ${diffWeeks} woche`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `vor ${diffMonths} monate`;

  const diffYears = Math.floor(diffDays / 365);
  return `vor ${diffYears} jahre`;
}
