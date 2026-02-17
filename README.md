# Badge Designer

A visual badge printing and design tool for event management. Design, preview, and print attendee badges with a drag-and-drop editor.

## Features

- **Visual Drag-and-Drop Editor** — Design badges with an intuitive canvas editor
- **Foldable Ticket Layout** — A4 sheet folded in 4 (210 × 297mm) with 4 printable panels: Front, Back, Inside Left, Inside Right
- **Element Types** — Text, dynamic fields, images, QR codes, and shapes (rectangle, circle, line)
- **Dynamic Fields** — Merge attendee data (name, title, company, email, ticket type, etc.) into badge designs
- **Font Selection** — Choose from 18 web-safe and Google Fonts
- **Inline Text Editing** — Double-click text elements to edit directly on the canvas
- **Panel Backgrounds** — Upload background images for each panel
- **Properties Panel** — Fine-tune position, size, rotation, opacity, colors, borders, and more
- **Layers Panel** — Reorder, lock, and toggle visibility of elements
- **Preview Mode** — See how badges look with sample attendee data
- **Badge Segmentation** — Assign badge designs to specific attendee segments with attribute-based rules
- **Active/Inactive Management** — Control which badge designs are in use
- **Print-Ready Output** — Generate print layouts for batch badge production
- **Persistent Storage** — Badges are saved to localStorage

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [qrcode.react](https://github.com/zpao/qrcode.react)

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000/badge-designer](http://localhost:3000/badge-designer) to access the badge designer.

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── app/
│   ├── badge-designer/
│   │   ├── [id]/edit/    # Badge editor page
│   │   ├── [id]/print/   # Print layout page
│   │   ├── new/          # Create new badge page
│   │   ├── layout.tsx    # Dashboard shell layout
│   │   └── page.tsx      # Badge listing page
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── badge-designer/
│   │   ├── BadgeCanvas.tsx          # Main canvas with drag/drop/resize
│   │   ├── BadgeElementRenderer.tsx # Renders individual elements
│   │   ├── BadgeSettingsPanel.tsx   # Segment & attribute settings
│   │   ├── ElementToolbox.tsx       # Draggable element palette
│   │   ├── LayersPanel.tsx          # Layer ordering & visibility
│   │   ├── PropertiesPanel.tsx      # Element property controls
│   │   └── ResizeHandles.tsx        # Resize handle overlays
│   └── layout/
│       └── DashboardShell.tsx       # App shell with nav & sidebar
├── lib/
│   └── badge-store.ts              # Badge CRUD & localStorage
└── types/
    └── badge.ts                     # TypeScript type definitions
```

## License

MIT
