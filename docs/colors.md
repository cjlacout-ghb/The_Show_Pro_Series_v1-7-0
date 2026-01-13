# Design System: Color Palette

The Show Pro Series uses a premium, high-contrast dark theme designed for visibility in sports environments.

## Core Colors

| Role | Color | Hex Code | HSL / Usage |
| :--- | :--- | :--- | :--- |
| **Background** | Deep Midnight | `#0D1117` | `220 30% 8%` - Main background |
| **Foreground** | Off-White | `#F8FAFC` | `210 40% 98%` - Primary text |
| **Primary** | Trophy Gold | `#EAB308` | `45 93% 50%` - Buttons, Highlights, Accents |
| **Card** | Charcoal Blue | `#161B22` | `220 25% 12%` - Component containers |
| **Muted** | Steel Gray | `#64748B` | `215 20.2% 65.1%` - Secondary text |
| **Destructive** | Stadium Red | `#991B1B` | `0 62.8% 30.6%` - Error states, Reset button |

## Token Usage

### Typography
- **Primary Text**: `text-foreground` (#F8FAFC)
- **Secondary Text**: `text-muted-foreground` (#64748B)
- **Highlighted Text**: `text-primary` (#EAB308)

### Components
- **Borders**: `border-border` (`220 25% 25%`)
- **Inputs**: `bg-input` (`220 25% 15%`)
- **Buttons**: `bg-primary` for main actions; `bg-secondary` for back/secondary.

### Specialized
- **Championship Ring**: `ring-primary`
- **Confetti**: Uses a mix of primary and secondary colors dynamically.
- **Standings Highlight**: First place gradient uses primary color overlays.
