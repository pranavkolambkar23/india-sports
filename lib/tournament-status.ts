/**
 * Utility to compute a tournament's real-time status
 * based on its start/end dates, instead of trusting the stored DB value.
 */
export function computeTournamentStatus(
  startDate: Date | string,
  endDate: Date | string | null
): "COMPLETED" | "LIVE" | "UPCOMING" {
  const now = new Date();
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : start;

  if (now > end) return "COMPLETED";
  if (now >= start && now <= end) return "LIVE";
  return "UPCOMING";
}
