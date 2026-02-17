# Foldable Ticket: 4-Panel A4 Layout

## Overview
Convert the foldable ticket from a 2-panel (front/back) model to a **4-panel** model representing an A4 sheet (210x297mm) folded in half both ways, displayed as a flat 2x2 grid with a rotate control.

## Physical Model
- **Full sheet**: A4 = 210mm x 297mm
- **Folded**: Creates 4 panels, each ~105mm x 148.5mm
- **Panel names**: Front, Back, Inside-Left, Inside-Right

## Changes Required

### 1. Types (`src/types/badge.ts`)
- Change `side` type from `'front' | 'back'` to `'front' | 'back' | 'inside-left' | 'inside-right'`
- Add `BadgeSide` type alias for reuse
- Update `BadgeEditorState.activeSide` to match
- Update foldable-ticket dimensions: `badgeWidth: 210, badgeHeight: 297` (full A4) and add `panelWidth: 105, panelHeight: 148.5`

### 2. Badge Store (`src/lib/badge-store.ts`)
- Update `createDefaultElement` to accept the new side type

### 3. BadgeCanvas (`src/components/badge-designer/BadgeCanvas.tsx`)
- **Foldable layout**: Render a 2x2 grid of panels instead of 2 stacked halves
  - Top-left: Front | Top-right: Back
  - Bottom-left: Inside-Left | Bottom-right: Inside-Right
  - Fold lines: horizontal center + vertical center (dashed with scissors)
- **Auto-scale**: Compute baseScale from full A4 dimensions (210x297) fitting into the container
- **Active panel**: Full opacity; other 3 dimmed at 40%
- **Click inactive panel**: Switch to that panel
- **Rotate control**: A rotation state (0°, 90°, 180°, 270°) applied via CSS transform to the entire A4 sheet, with a rotate button in the canvas
- **Props**: Change `activeSide` and `onSwitchSide` types to accept the 4 panel names

### 4. Editor Page (`src/app/badge-designer/[id]/edit/page.tsx`)
- **Panel selector**: Replace Front/Back toggle with a 4-button selector (Front, Back, Inside-Left, Inside-Right)
- **Rotate button**: Add a rotate button in the toolbar (or floating on the canvas)
- **State**: `activeSide` becomes the new union type, `rotation` state for the A4 sheet
- **Layers panel**: Filter by current active panel

### 5. Print Page (`src/app/badge-designer/[id]/print/page.tsx`)
- Render full A4 with all 4 panels in the correct 2x2 layout
- Fold lines for both axes
- Each panel's elements positioned within its quarter

### 6. Layers Panel (`src/components/badge-designer/LayersPanel.tsx`)
- Update `activeSide` prop type to match new union type

## Panel Layout (Flat A4, Unfolded)

```
┌─────────────┬─────────────┐
│             │             │
│   FRONT     │    BACK     │
│  (105x148)  │  (105x148)  │
│             │             │
├─ ─ ─ fold ─ ─ ─ ─ ─ ─ ─ ─┤
│             │             │
│ INSIDE-LEFT │ INSIDE-RIGHT│
│  (105x148)  │  (105x148)  │
│             │             │
└─────────────┴─────────────┘
       210mm x 297mm
```

## Migration
- Existing badges with `side: 'front'` or `side: 'back'` will continue to work (they'll appear in the Front and Back panels)
- No data loss — just expanded panel options
