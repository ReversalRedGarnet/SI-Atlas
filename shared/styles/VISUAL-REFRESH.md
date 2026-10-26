# SI Atlas visual refresh

This update introduces a reversible visual layer named `shared/styles/atlas-visual.css`.

## Design direction

**Pacific civic atlas:** deep ocean navy, lagoon teal, warm neutrals, and restrained gold accents. The intent is to make the interface feel more like a deliberate public-information product while keeping the data, source transparency, and usability front and centre.

## What changed

- Shared design tokens, typography, controls, badges, panels, map overlays, and modal surfaces.
- A redesigned landing page with a branded hero, clearer index navigation, and responsive index cards.
- A more cohesive treatment for the Education and Policing index shells and record panels.
- A styled Health placeholder and a matching 404 colour treatment.
- No new image/font dependency was added; the stylesheet uses local CSS and system-font fallbacks.

## Reverting the visual layer

Remove the `atlas-visual.css` stylesheet link from `index.html`, `index-e/index.html`, `index-p/index.html`, and `index-h/index.html`. This restores the prior page styling without changing app logic. The 404 colour/radius adjustments are inline in `404.html` and can be reverted separately if desired.

The search, filtering, record data, map behaviour, and application JavaScript were not intentionally changed.
