# Perfect Planner

Perfect Planner is a planner layout template builder. The current page is a fullscreen desk view where users can choose paper settings and arrange sticky-note style layout blocks on a two-page spread.

## Project Files

- `index.html` - Main app page.
- `style.css` - Base styling for layout, typography, and planner UI.
- `script.js` - Drag, drop, duplicate, delete, resize, and template serialization behavior.

## Getting Started

Open `index.html` in a browser to view the planner template builder.

## Template Data

The frontend exposes a backend-ready layout snapshot at:

```js
window.perfectPlanner.serializeTemplate()
```

The returned object uses grid-cell coordinates for notes placed on a page.

Current page settings are included in the serialized template:

- paper size: Letter, Half Letter, A4, or A5
- paper color: white, vanilla, beige, or black
- grid: 1/4 inch or 1/2 cm
- guide visibility for halves, thirds, and fourths
- calculated grid columns and rows for the selected paper and grid

Items placed off the notebook are stored as normalized desk-frame coordinates so future backend logic can decide whether to save, ignore, or treat them as workspace-only objects.

## Next Steps

- Add save/load controls that call the future backend.
- Add named templates and user ownership.
- Add printable planner export from saved template data.
