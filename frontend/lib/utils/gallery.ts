/** Mount full-size photos only around the visible slide (including loop edges). */
export function nearbySlide(index: number, selected: number, count: number) {
  const distance = Math.abs(index - selected);
  return distance <= 1 || distance === count - 1;
}
