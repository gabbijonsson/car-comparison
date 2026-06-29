/** Service events at months interval-1, 2*interval-1, … alternating small then big. */
export function computeServiceEvents(
  intervalMonths: number,
  smallSek: number,
  bigSek: number,
  totalMonths = 120,
): Map<number, number> {
  const events = new Map<number, number>()
  let eventIndex = 0

  for (let month = intervalMonths - 1; month < totalMonths; month += intervalMonths) {
    const isBig = eventIndex % 2 === 1
    events.set(month, Math.round(isBig ? bigSek : smallSek))
    eventIndex++
  }

  return events
}
