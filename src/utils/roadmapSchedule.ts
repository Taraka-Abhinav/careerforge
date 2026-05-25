export interface PhaseWeekSlot {
  weekStart: number;
  weekEnd: number;
  durationLabel: string;
}

/** Convert onboarding timeline (e.g. "6 Months") to total calendar weeks. */
export function parseTimelineToWeeks(timeline: string): number {
  const match = timeline.match(/(\d+)\s*Month/i);
  if (!match) return 26;
  const months = parseInt(match[1], 10);
  return Math.max(8, Math.round(months * 4.33));
}

/** Split total weeks across N learning phases plus one capstone block at the end. */
export function allocateWeeksAcrossPhases(totalWeeks: number, mainPhaseCount: number): PhaseWeekSlot[] {
  const capstoneWeeks = Math.max(2, Math.round(totalWeeks * 0.12));
  const learningWeeks = Math.max(mainPhaseCount, totalWeeks - capstoneWeeks);
  const base = Math.floor(learningWeeks / mainPhaseCount);
  let remainder = learningWeeks % mainPhaseCount;

  const slots: PhaseWeekSlot[] = [];
  let cursor = 1;

  for (let i = 0; i < mainPhaseCount; i++) {
    const len = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
    const weekStart = cursor;
    const weekEnd = cursor + len - 1;
    slots.push({
      weekStart,
      weekEnd,
      durationLabel: weekStart === weekEnd ? `Week ${weekStart}` : `Weeks ${weekStart}–${weekEnd}`,
    });
    cursor = weekEnd + 1;
  }

  const capStart = cursor;
  const capEnd = totalWeeks;
  slots.push({
    weekStart: capStart,
    weekEnd: capEnd,
    durationLabel: capStart === capEnd ? `Week ${capStart}` : `Weeks ${capStart}–${capEnd}`,
  });

  return slots;
}

export function formatPhaseStudyLoad(hoursPerWeek: number, weekStart: number, weekEnd: number): string {
  const weeks = weekEnd - weekStart + 1;
  const totalHours = hoursPerWeek * weeks;
  return `${hoursPerWeek}h/week · ${weeks} week${weeks === 1 ? '' : 's'} · ~${totalHours}h in this phase`;
}
