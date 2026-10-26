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

Some things do not revert with the link, because they are markup or script rather than styles: the logo marks, favicons and `theme-color` (now navy `#10394A` and gold `#E4B05C`); the portal / Index H markup (the eyebrow line, the "Explore the indexes" heading and the body classes), which is unstyled and harmless without the layer; the badge wording ("Checked <date>"); the keyboard-only focus ring on the profile heading; and the removal of the unused Google Fonts request.

## Changes made when it was imported

The layer was reviewed before it was merged into the site and then adjusted, each change in its own commit:

- Text colours raised to at least 4.7:1 (`--mute`, `--link`, the portal eyebrow and hero paragraph, the pending card), and control borders back to 3:1 (`--rule-strong #79948D`, used by buttons, inputs, selects and the zoom control).
- A thin light outline on the masthead logo tile, so it holds its edge on the dark masthead.
- Zoom buttons grey out again at the zoom limit; the "Map unavailable" note is rounded like the other map cards.
- The closed filter drawer is parked past its own shadow, which had tinted the left edge of every page.
- The portal cards' letter tiles and the Index H pill are hidden from screen readers; the portal title's tracking is loosened so its letters do not touch.
- The last old-palette blues (chip borders and hover, map background, credit badge hover, location-dot halo) are retinted.

The palette, radii and type are documented in `index-e/README.md` under "Design notes"; `audit-scripts/contrast.js` (not shipped) measures every colour pair.

The proposal itself changed no JavaScript, data, search, filtering or map behaviour. The import added two small script changes of its own, listed above: `shared/shell.js` (the heading focus ring) and `shared/verification-badge.js` (the badge wording), plus one hint sentence in `index-p/js/filterPanel.js`. Record data is untouched.
