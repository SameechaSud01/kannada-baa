/**
 * Living Manuscript token palette (Material 3 tonal naming).
 * Source of truth: DESIGN.md.
 *
 * Surface stack flows light → dark: surface → low → high → highest → dim.
 * Use surface shifts (not borders) to section content (§2 No-Line Rule).
 */
export const Colors = {
  // ── Surface tonal stack (§2, §4) ───────────────────────
  surface:                 '#fbfbe2', // root page background
  surfaceContainerLowest:  '#ffffff', // glassmorphism only (70% opacity + blur)
  surfaceContainerLow:     '#f5f5dc', // secondary content zones, tab bar
  surfaceContainerHigh:    '#eaead1', // selection chips bg, badge containers
  surfaceContainerHighest: '#e4e4cc', // interactive cards
  surfaceDim:              '#dbdcc3', // backdrop for lifted cards, locked state

  // ── Primary — Mysore Red (§2, §5) ──────────────────────
  primary:           '#91001b', // CTA gradient start, active states, focus underline
  primaryContainer:  '#be0027', // CTA gradient end
  onPrimary:         '#ffffff', // text on primary

  // ── Secondary — Turmeric Gold (§5, §6) ─────────────────
  secondary:            '#785900', // mandala fill, dark gold for text on light
  secondaryContainer:   '#fdc003', // secondary actions, success/encouragement
  onSecondaryContainer: '#6c5000', // text on secondary_container
  secondaryFixed:       '#ffdf9e', // selected chip bg, sun-drenched accent surfaces

  // ── Text — warm sandstone (§6) ─────────────────────────
  onSurface: '#1b1d0e', // primary text on light surfaces
  tertiary:  '#464646', // captions, labels, inactive tabs (never pure grey)

  // ── Outline / Ghost Border (§4) ────────────────────────
  outlineVariant: '#e5bdbb', // use at 15% opacity only — felt, not seen

  // ── Error states (MODALS §5) ───────────────────────────
  errorContainerLow: '#f3dada', // pale Mysore red — error-state card bg, toast icon bg
};
