export function formatRemaining(endsAt: string, now: number) {
  const end = new Date(endsAt).getTime();

  if (Number.isNaN(end)) {
    return null;
  }

  const seconds = Math.max(0, Math.ceil((end - now) / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) return `${hours} h ${minutes} min`;
  if (minutes > 0) return `${minutes} min ${remainingSeconds} s`;

  return `${remainingSeconds} s`;
}
