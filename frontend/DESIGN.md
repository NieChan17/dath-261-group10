---
name: EduPulse
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#4d556b'
  on-tertiary: '#ffffff'
  tertiary-container: '#656d84'
  on-tertiary-container: '#eef0ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.005em
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: '0'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: '0'
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: '0'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.5rem
  space-sm: 1rem
  space-md: 1.5rem
  space-lg: 2rem
  space-xl: 3rem
---

## Brand & Style

This design system embodies an authoritative, modern, and mathematically disciplined educational platform engineered specifically for computer science, artificial intelligence, and software engineering disciplines. The UI projects absolute cognitive clarity, academic rigor, and technological maturity.

The design movement blends **Modern Corporate** with **Precision Utility**:
- **Structured Precision**: A high-density visual organization that prioritizes context preservation, step-by-step logic traces, and uninterrupted deep focus.
- **Academic Grounding**: Clean surfaces, deliberate contrast, and calm tonal shifts eliminate distractions while signaling institutional stability and verified algorithmic truth.
- **RAG-Focused Interactivity**: Distinct spatial treatments delineate generative intelligence, verified syllabus benchmarks, and user discourse.

## Colors

The palette establishes an immediate sense of institutional trust and cognitive balance:

- **Primary (`#2563EB`)**: A decisive royal/cobalt blue used for key calls to action, active navigation states, grounded citation links, and primary progress indicators.
- **Secondary (`#0D9488`)**: A technical teal reserved for verified AI states, successful syntax assertions, telemetry indicators, and interactive terminal badges.
- **Surfaces & Grounds**: Canvas foundation is anchored on `#F8FAFC`, with floating interactive planes set to pure `#FFFFFF`. Subtle secondary nesting surfaces rely on `#F1F5F9`.
- **Text & Hierarchy**: Primary labels and structural text utilize `#0F172A` (yielding an AA/AAA contrast ratio against all light panels), while supporting metadata, line numbers, and citations leverage `#64748B`.
- **Borders & Dividers**: Crisp structure is maintained via `#E2E8F0`, creating fine separation without visual clutter.

## Typography

The type system balances technical crispness with editorial legibility:
- **Headlines (Plus Jakarta Sans)**: Introduces modern geometric clarity, subtle curvature, and structured weight, rendering module headers, concept milestones, and system metrics approachable yet firm.
- **Body & Controls (Inter)**: Delivers neutral, tall x-height utility for dense documentation, RAG dialogue exchanges, citations, and fine data tables.
- **Code & Syntax (JetBrains Mono)**: Utilized strictly for inline syntax references, execution blocks, memory addresses, and grounded context snippets.

## Layout & Spacing

A strict 8-point layout rhythm governs all structural dimensions:
- **Grid Architecture**: Standard 12-column responsive fluid grid on desktop (`max-width: 1440px`), collapsing to 8 columns on tablet, and 4 columns on mobile.
- **Multi-pane Division**: Learning modules utilize a three-column workstation layout: Persistent Curriculum Sidebar (280px fixed), Workspace / Reader (fluid center), and AI Context Drawer (384px docked).
- **Rhythm & Padding**: Component spacing increments strictly by multiples of 8px (`0.5rem`, `1rem`, `1.5rem`, `2rem`, `3rem`). Micro-spacings of 4px are permitted only for status badge internals and icon-to-label inline offsets.

## Elevation & Depth

Depth is established through low-contrast, highly controlled ambient occlusion rather than heavy drop shadows:

- **Level 0 (Base Canvas)**: Background `#F8FAFC` flat surface.
- **Level 1 (Card & Module Resting)**: Pure white `#FFFFFF` surface bounded by a crisp 1px stroke of `#E2E8F0` and an ultra-subtle ambient shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)`.
- **Level 2 (Hover & Active Context)**: Elevated cards, code inspect popovers, and interactive modules: `0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)` with `#CBD5E1` border emphasis.
- **Level 3 (Modals, RAG Drawers & Flyouts)**: High-priority focus layers: `0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`.

## Shapes

The geometric signature is uniform across all interactive and container elements:
- **Canonical Radius**: Exact `15px` (`rounded-2xl` equivalent) applied universally to cards, modal dialogs, contextual chat bubbles, search boxes, and interactive code terminals.
- **Buttons & Control Fields**: Styled strictly with `15px` corners to retain tactile unity with parent containers.
- **Nested Inner Surfaces**: Inner code viewports, tabs, and citation pills inherit a proportional `8px` or `10px` radius to maintain nested concentricity within 15px outer containers.

## Components

### Buttons
- **Primary**: Solid `#2563EB` fill, white `#FFFFFF` text, `15px` radius, 40px height (`space-xs` vertical, `space-sm` horizontal padding). Hover state deepens to `#1D4ED8`. Focus outline: 2px offset with `#93C5FD`.
- **Secondary / Ghost**: White `#FFFFFF` background, 1px `#E2E8F0` border, `#0F172A` text. Hover transitions to `#F8FAFC` with border `#CBD5E1`.
- **Accent (RAG / AI Action)**: `#0D9488` solid fill, white `#FFFFFF` text, paired with subtle sparkle or citation glyphs.

### Inputs & Search
- Container height 44px with a uniform `15px` radius, `#FFFFFF` fill, 1px `#E2E8F0` border.
- Text rendered in `#0F172A` with `#64748B` placeholder text.
- Focus state triggers a 1px border transition to `#2563EB` along with a 3px soft tint ring (`rgba(37, 99, 235, 0.12)`).

### Cards & Learning Containers
- Built on `#FFFFFF` surface, 1px `#E2E8F0` border, `15px` radius, padded at `space-md` (24px).
- Module header cards feature a subtle split: content title at left, mastery telemetry badge at right.

### Chips & Citations
- **Grounded Source Chip**: 26px height, `8px` border radius, `#F1F5F9` background, `#0F172A` text, 1px `#E2E8F0` border. Clicking highlights the corresponding textbook paragraph or lecture timestamp.
- **Status Indicator**: Teal-tinted background (`rgba(13, 148, 136, 0.1)`) with `#0D9488` text for verified retrieval steps.

### Checkboxes & Radios
- Size: 18px × 18px. Radios are circular; checkboxes feature a 4px corner radius.
- Inactive: 1.5px border `#CBD5E1`, `#FFFFFF` interior. Active: `#2563EB` fill with white checkmark glyph.

### RAG Dialogue & Code Viewport
- **Tutor Messages**: Bordered `#FFFFFF` surface with a vertical 3px accent bar on the left edge in `#0D9488`. Grounded references appear as inline numbered pills.
- **Code Execution Blocks**: Dark tone container (`#0F172A`), `15px` radius, monospace font with syntax highlighting, copy button anchored top-right with an 8px radius.