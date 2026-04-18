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
  previous: string[] | null,
  allBrickIds: string[],
) {
  if (!allBrickIds.length) {
    return [];
  }

  // If all are currently selected (null means all selected), deselect all
  if (previous === null) {
    return [];
  }

  // If all bricks are individually selected, deselect all
  if (
    previous.length === allBrickIds.length &&
    allBrickIds.every((id) => previous.includes(id))
  ) {
    return [];
  }

  // Otherwise select all
  return null;
}
