export function toggleBrickSelection(
  previous: string[] | null,
  brickId: string,
  allBrickIds: string[],
) {
  const currentSelection =
    previous === null || previous.length === 0 ? allBrickIds : previous;
  const nextSelection = currentSelection.includes(brickId)
    ? currentSelection.filter((id) => id !== brickId)
    : [...currentSelection, brickId];

  return allBrickIds.length &&
    allBrickIds.every((id) => nextSelection.includes(id))
    ? null
    : nextSelection;
}

export function toggleAllBrickSelection(
  _previous: string[] | null,
  allBrickIds: string[],
) {
  return allBrickIds.length ? null : [];
}
