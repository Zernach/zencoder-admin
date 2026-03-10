/** Estimated tooltip dimensions for boundary clamping */
const TOOLTIP_WIDTH = 280;
const TOOLTIP_HEIGHT = 120;
const EDGE_PADDING = 4;
const OFFSET_X = 12;
const OFFSET_Y = 8;

/**
 * Clamp tooltip position so it stays within the chart container.
 * Flips to the other side of the cursor when it would overflow an edge.
 */
export function clampTooltipPosition(
  mouseX: number,
  mouseY: number,
  containerWidth: number,
  containerHeight: number,
): { left: number; top: number } {
  let left = mouseX + OFFSET_X;
  let top = mouseY - OFFSET_Y;

  // Flip to left of cursor if overflowing right edge
  if (left + TOOLTIP_WIDTH > containerWidth - EDGE_PADDING) {
    left = mouseX - TOOLTIP_WIDTH - OFFSET_X;
  }

  // Push up if overflowing bottom edge
  if (top + TOOLTIP_HEIGHT > containerHeight - EDGE_PADDING) {
    top = containerHeight - TOOLTIP_HEIGHT - EDGE_PADDING;
  }

  // Clamp to minimum bounds
  if (left < EDGE_PADDING) left = EDGE_PADDING;
  if (top < EDGE_PADDING) top = EDGE_PADDING;

  return { left, top };
}
