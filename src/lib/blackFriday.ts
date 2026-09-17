// Central config for the Black Friday / Cyber Monday promo (see
// claude/content-and-black-friday-plan.md). The actual discount is enforced
// by a Stripe promotion code named BLACKFRIDAY35 — this file only controls
// when the site's own UI (the homepage banner, the Full Access modal notice)
// shows itself. Dates are evaluated in the visitor's local time; a day or
// two of timezone slop at the edges is fine for a promo window this long.
export const BLACK_FRIDAY = {
  code: 'BLACKFRIDAY35',
  percentOff: 35,
  // Runs Nov 27 through Dec 1, 2026 inclusive. `end` is an exclusive upper
  // bound at the start of Dec 2.
  start: new Date('2026-11-27T00:00:00'),
  end: new Date('2026-12-02T00:00:00'),
}

export function isBlackFridayActive(now: Date = new Date()) {
  return now >= BLACK_FRIDAY.start && now < BLACK_FRIDAY.end
}

export function getCountdown(now: Date = new Date()) {
  const msLeft = Math.max(0, BLACK_FRIDAY.end.getTime() - now.getTime())
  const days = Math.floor(msLeft / 86400000)
  const hours = Math.floor((msLeft % 86400000) / 3600000)
  const minutes = Math.floor((msLeft % 3600000) / 60000)
  return { days, hours, minutes }
}
