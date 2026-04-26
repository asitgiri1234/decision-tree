# Daily Reflection Tree

A deterministic, decision-tree based reflection tool built with React. The app guides users through a structured evening reflection flow using fixed-choice questions, predefined routing, and signal-based personality axis tracking — no AI, no randomness, no backend required.

---

## What It Does

The app walks you through three axes of reflection:

1. **Control** — Did you feel in control of your day, or were you driven by external factors?
2. **Contribution** — Did you contribute beyond expectations, or focus on entitlement?
3. **Perspective** — Was your focus inward, or did you consider others and the bigger picture?

Based on your answers, the app computes dominant values for each axis and presents personalized reflection statements and a final summary.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 + Vite 8 |
| Styling | Tailwind CSS 3 |
| Animations | Framer Motion |
| State | Local React state (no database) |
| Data | External JSON file (`src/data/reflection-tree.json`) |

---

## Architecture

### Data-Driven Tree

The entire application flow is defined in a single JSON file:

```
src/data/reflection-tree.json
```

This file contains all nodes: **start**, **question**, **decision**, **reflection**, **bridge**, **summary**, and **end**. Each node type is rendered by a dedicated React component.

### Tree Engine

```
src/engine/treeEngine.js
```

The engine handles:

- **Node lookup** — fast Map-based retrieval by node ID
- **Decision evaluation** — routes based on the previous answer using `if/goTo` rules
- **Signal tracking** — accumulates scores across three axes as the user answers questions
- **Dominant computation** — determines which reflection and summary text to show
- **Flow routing** — computes the next node deterministically for every node type

### Signal System

As the user answers questions, signals are accumulated:

| Axis | Categories |
|------|-----------|
| axis1 | `internal`, `external` |
| axis2 | `contribution`, `entitlement`, `neutral` |
| axis3 | `self`, `team`, `other`, `wide` |

Each question option maps to a signal (e.g., `axis1:internal`). The dominant category per axis drives which reflection node appears and what the summary says.

---

## Node Types

| Type | Behavior |
|------|----------|
| `start` | Welcome screen with a "Begin" button |
| `question` | Displays question text and button options; waits for user input |
| `decision` | Auto-routes based on the previous answer; never shown to the user |
| `reflection` | Shows an insight based on accumulated axis signals; "Continue" button |
| `bridge` | Auto-transitions after 1.8 seconds to the next axis |
| `summary` | Displays computed dominant values across all three axes |
| `end` | Closing screen with a "Reflect Again" restart button |

---

## UX Flow

```
Start
  → Axis 1 Questions (Control)
    → Axis 1 Reflection
      → Bridge
        → Axis 2 Questions (Contribution)
          → Axis 2 Reflection
            → Bridge
              → Axis 3 Questions (Perspective)
                → Axis 3 Reflection
                  → Summary
                    → End
```

---

## UI Features

- **Dark theme** with a clean, centered card layout
- **Progress bar** showing current axis (Control → Contribution → Perspective)
- **Smooth transitions** powered by Framer Motion (`AnimatePresence` with staggered options)
- **Distinct styling per node type**:
  - Questions: slate cards with lettered options
  - Reflections: indigo accent cards
  - Summary: emerald accent cards
  - Bridges: auto-advance with subtle animation
- **Restart button** on the end screen to reset all state and start over

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

Output is generated in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

---

## Project Structure

```
daily-reflection-tree/
├── src/
│   ├── data/
│   │   └── reflection-tree.json      # The full decision tree definition
│   ├── engine/
│   │   └── treeEngine.js             # Traversal, signals, and routing logic
│   ├── components/
│   │   ├── ProgressBar.jsx           # Axis progress indicator
│   │   ├── StartNode.jsx             # Welcome screen
│   │   ├── QuestionNode.jsx          # Fixed-choice question UI
│   │   ├── ReflectionNode.jsx        # Insight display
│   │   ├── BridgeNode.jsx            # Transition screen
│   │   ├── SummaryNode.jsx           # Final computed summary
│   │   └── EndNode.jsx               # Closing + restart
│   ├── App.jsx                       # Main orchestrator with state management
│   ├── main.jsx                      # React entry point
│   └── index.css                     # Tailwind directives + base styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── .gitignore
```

---

## Design Decisions

- **No AI at runtime** — the entire experience is deterministic and driven by the JSON tree
- **No backend** — all state lives in React component state; answers are not persisted
- **External JSON** — the tree can be edited or replaced without touching application code
- **Decision nodes are invisible** — they evaluate instantly in the background, keeping the UX seamless
- **Bridge nodes auto-advance** — they provide a brief pause between axes without requiring user input

---

## License

ISC
