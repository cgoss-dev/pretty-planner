# Pretty Planner
pretty-planner is a planner layout template builder. The current page is a fullscreen desk view where users can choose paper settings and arrange sticky-note style layout blocks on a two-page spread.

## Project Files
- `index.html` - Main app page.
- `style.css` - Base styling for layout, typography, and planner UI.
- `app.js` - App state, planner measurements, view controls, keyboard controls, and startup wiring.
- `controls.js` - Page-turning, page labels, and control-panel helper modules.
- `storage.js` - Save/load, template serialization, browser storage, and saved-item restoration.
- `ui.js` - Shared UI controls, color panels, custom selects, and panel state.
- `widgets.js` - Widget creation, selection, text editing, drag/drop, resize, grouping, and clipboard actions.
- `widgets-calendars.js` - Calendar widget previews, date helpers, rendering, sizing, and calendar controls.

## Commenting And Pseudocode
Use comments to explain intent, data shape, and non-obvious constraints. Let the code explain simple assignments.

- Start large files with `// NOTE:` section headers that say what the region owns.
- Before a dense function, write a short checklist of what it does in order.
- Inside a function, comment only the branches where a future reader would ask "why?"
- Prefer domain words from the app: `book`, `spread`, `page`, `grid`, `desk`, `widget`, `template`.
- Keep save/load comments paired. If serialization writes a shape, restoration should explain how that shape is used.
- Avoid comments that repeat code, such as "set the value" or "loop through items."

Example:

```js
// NOTE: Converts a live widget into storage data.
// 1. Capture shared style and text settings.
// 2. Add calendar-only settings when the widget needs them.
// 3. Store page widgets in grid units and desk widgets as normalized frames.
function serializePlannerItem(item) {
     // ...
}
```

## Getting Started
Open `index.html` in a browser to view the planner template builder.

## Template Data
The fronted exposes a backend-ready layout snapshot at:
```js
window.prettyPlanner.serializeTemplate()
```
The returned object uses grid-cell coordinates for notes placed on a page.
Current page settings are included in the serialized template:
- paper sizes:
     - Letter or Half Letter (with 1/4in grid)
     - A4 or A5 (1/2cm grid)
- paper color: white, vanilla, beige, or black
- guides: halves, thirds, and fourths
- calculated grid columns and rows for the selected paper and grid
Items placed off the notebook are stored as normalized desk-frame coordinates so future backend logic can decide whether to save, ignore, or treat them as workspace-only objects.

## Next Steps
- Add save/load controls that call the future backend.
- Add named templates and user ownership.
- Add printable planner export from saved template data.
