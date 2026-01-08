# Secular Forum Hub - Frontend Documentation

This is the frontend shell for the Secular Forum Hub, built with Next.js 14, Tailwind CSS, and shadcn/ui.

## Project Structure

```bash
/app                  # Next.js App Router
  layout.tsx          # Root layout with Sidebar and Header
  page.tsx            # Home dashboard
  /snapshot           # Snapshot module
  /delta              # Delta module
  /historical         # Historical module
  /explorer           # Explorer module
/components
  /ui                 # Shared UI primitives (shadcn/ui)
  /layout             # Application shell components
  /charts             # Chart wrapper components
/lib
  utils.ts            # Utility functions
```

## Theming

The application uses a financial color palette defined in `tailwind.config.ts`.
- **Primary**: Deep Navy (`#1a1f36`) - used for backgrounds and primary actions.
- **Accent**: Blue (`#3b82f6`) - used for highlights and active states.
- **Success/Warning**: Green (`#10b981`) and Amber (`#f59e0b`) - used for status and trends.

To modify the theme, edit the `extend.colors` section in `tailwind.config.ts` or the CSS variables in `app/globals.css`.

## Components

### UI Primitives
Standard components from shadcn/ui are available in `components/ui`.
- **Button**: Variants support `default`, `secondary`, `ghost`, `outline`.
- **Card**: Used for containers and modules.
- **StatCard**: specialized card for displaying KPIs with trend indicators.
  ```tsx
  <StatCard 
    title="Total Outlooks" 
    value="150" 
    change={{ value: 5, direction: "up" }} 
  />
  ```

### Charts
Chart shells are located in `components/charts`. These currently render placeholders but are typed to accept standard data props.
- `TreemapChart`
- `SankeyChart`
- `LineChart`
- `BarChart`
- `DonutChart`

## Development

Run the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

## Adding New Components

1. If standard, copy from shadcn/ui.
2. If custom, add to `components/ui` or specific feature folder.
3. Ensure dark mode compatibility by using `hsl(var(--param))` variables where possible.
