# Pretty Planner

pretty-planner is a planner layout template builder. The current page is a fullscreen desk view where users can choose paper settings and arrange sticky-note style layout blocks on a two-page spread.

## Project Files

The JavaScript is split by feature so each file has one main subject:

- `app.js`, `app-paper.js`, `app-navigation.js`, `app-notebook.js`, and `app-start.js` - App state, paper measurements, navigation, notebook drawing, and startup.
- `ui.js`, `ui-sections.js`, and `ui-settings.js` - Color controls, collapsible sections, menus, and settings.
- `widgets.js`, `widget-layout.js`, `widget-text.js`, `widget-selection.js`, `widget-drag.js`, `widget-create.js`, `widget-clipboard.js`, and `widget-drop.js` - Widget behavior grouped by action.
- `widgets-calendars.js`, `calendar-dates.js`, `calendar-layout.js`, `calendar-render.js`, and `calendar-controls.js` - Calendar previews, dates, sizing, rendering, and controls.
- `storage.js` - Save/load, template serialization, browser storage, and saved-item restoration.
- `controls.js` - Page-turning, page labels, and keyboard-control helpers.

The CSS follows the same visible-feature structure:

- `style.css` - Shared variables and page basics.
- `styles-controls.css`, `styles-notebook.css`, `styles-widgets.css`, `styles-calendars.css`, `styles-selection.css`, `styles-menu.css`, and `styles-print.css` - Component-specific styles.

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
window.prettyPlanner.serializeTemplate();
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
