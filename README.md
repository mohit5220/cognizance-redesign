# Cognizance — IIT Roorkee | Frontend Recreation

An independent React recreation inspired by the visual language and sections visible in the supplied Cognizance website screen recording. This is a learning project, not the official Cognizance website and not affiliated with IIT Roorkee.

## Two recreated components

1. **Particle hero:** Canvas-rendered particle clouds, subtle pointer parallax, animated headline/CTA entrance, responsive navigation, and reduced-motion support.
2. **Event explorer:** Search, category filters, animated card layout, image-backed cards, and pointer-driven 3D tilt.

The event names and descriptions in this demo are illustrative placeholders. Replace them with verified event information before publishing. Images load from Unsplash and Google Fonts load from Google Fonts, so those assets require an internet connection.

## Run locally

Requirements: Node.js 18+ and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). To test a production build:

```bash
npm run build
npm run preview
```

## Project structure

```text
cognizance-redesign/
├── index.html
├── package.json
├── README.md
└── src/
    ├── main.jsx
    ├── ParticleField.jsx
    ├── EventExplorer.jsx
    └── styles.css
```

## How the code works

### `main.jsx`
- `Navbar` renders navigation links from an array, so the menu is easy to update.
- `Hero` composes the canvas background, title, and calls to action.
- `About` and `App` provide the page structure.
- Framer Motion's `initial`, `animate`, and `transition` props control the entrance animations.

### `ParticleField.jsx`
- A `<canvas>` is used because drawing hundreds of tiny particles is more efficient than creating hundreds of DOM elements.
- `useRef` stores the canvas element. `useEffect` sets up the drawing loop and browser event listeners.
- Each particle has a sphere index, angle, radius, size, opacity, and drift value. Polar coordinates (`cos(angle)`, `sin(angle)`) distribute particles around two cloud centres.
- Pointer position adds a small offset to the particle coordinates for parallax.
- The effect cleans up its animation frame and listeners when the component unmounts. It also respects `prefers-reduced-motion`.

### `EventExplorer.jsx`
- `active` stores the selected category; `query` stores the search text.
- `useMemo` derives `visibleEvents` from those two values. It does not mutate the original event array.
- `AnimatePresence` and `motion.article` animate cards entering and leaving the grid.
- Each card calculates pointer position relative to its own bounding box, then converts that position into small X/Y rotations. `onMouseLeave` resets the tilt.
- The event data is kept in one array so content can be replaced without rewriting the UI.

### `styles.css`
- CSS custom properties hold the accent colour and border colour.
- Grid and flexbox handle the desktop layout; media queries adapt it for tablet and mobile.
- The reduced-motion media query reduces transitions for users who request less motion.

## Git and GitHub

Create an empty **public** repository on GitHub named `cognizance-redesign`, then run these commands from this folder:

```bash
git init
git add .
git commit -m "Build Cognizance hero and event explorer"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cognizance-redesign.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username. Do not commit `node_modules` (npm creates it locally after installation).

## Before submission

- Verify the live site's current text, dates, event names, and assets; this recreation uses placeholders where exact content was not legible in the recording.
- Test the mobile menu, filters, search, and reduced-motion mode.
- Be able to explain the canvas particle loop, React state, `useMemo`, and card tilt logic.
- Keep this clearly labelled as an independent recreation; do not imply it is the official festival site.

## Persistent scroll-morph particle scene

The canvas is mounted once at the application root and stays fixed behind every section. A single indexed set of 4,200 particles morphs continuously from a filled spaceship silhouette to a **fully filled five-point star**, then to a globe as the visitor scrolls. Ambient background stars remain visible throughout the page. The star is sampled throughout its polygon interior, not merely along its edges.

### Tune the scroll stages
Open `src/ParticleField.jsx` and adjust:
- `smoothstep(0.12, 0.43, scrollEase)` for the spaceship-to-star transition.
- `smoothstep(0.54, 0.88, scrollEase)` for the star-to-Earth transition.
- `PARTICLE_COUNT` to increase/decrease detail (higher counts cost more CPU).

The effect is a procedural recreation; it does not use Cognizance's original proprietary particle model.


## Particle scene update
The persistent particle canvas now uses a denser 10,500-point foreground cloud and 1,150 viewport-wide ambient stars on desktop. The same indexed points morph through a detailed plan-view spacecraft silhouette, a fully filled five-point star, and a spherical Earth treatment as the page scrolls. The effect is a procedural recreation, not the original festival site's proprietary 3D asset.
