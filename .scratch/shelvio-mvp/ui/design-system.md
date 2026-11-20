---
name: Warm Editorial Archival
colors:
  surface: '#fef8f3'
  surface-dim: '#ded9d4'
  surface-bright: '#fef8f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f3ee'
  surface-container: '#f3ede8'
  surface-container-high: '#ede7e2'
  surface-container-highest: '#e7e1dd'
  on-surface: '#1d1b19'
  on-surface-variant: '#414942'
  inverse-surface: '#32302d'
  inverse-on-surface: '#f5f0eb'
  outline: '#727972'
  outline-variant: '#c1c8c0'
  surface-tint: '#3f674d'
  primary: '#012d18'
  on-primary: '#ffffff'
  primary-container: '#1b432c'
  on-primary-container: '#85b092'
  inverse-primary: '#a5d1b1'
  secondary: '#8d4f00'
  on-secondary: '#ffffff'
  secondary-container: '#fda956'
  on-secondary-container: '#713f00'
  tertiary: '#471511'
  on-tertiary: '#ffffff'
  tertiary-container: '#632a24'
  on-tertiary-container: '#e29187'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c0edcc'
  primary-fixed-dim: '#a5d1b1'
  on-primary-fixed: '#002110'
  on-primary-fixed-variant: '#274f37'
  secondary-fixed: '#ffdcc0'
  secondary-fixed-dim: '#ffb875'
  on-secondary-fixed: '#2d1600'
  on-secondary-fixed-variant: '#6b3b00'
  tertiary-fixed: '#ffdad6'
  tertiary-fixed-dim: '#ffb4ab'
  on-tertiary-fixed: '#3a0a08'
  on-tertiary-fixed-variant: '#71352f'
  background: '#fef8f3'
  on-background: '#1d1b19'
  surface-variant: '#e7e1dd'
typography:
  display-lg:
    fontFamily: Newsreader
    fontSize: 2.25rem
    fontWeight: '500'
    lineHeight: 2.75rem
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 1.75rem
    fontWeight: '500'
    lineHeight: 2.25rem
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Newsreader
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.01em
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.9375rem
    fontWeight: '600'
    lineHeight: 1.375rem
    letterSpacing: '0'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.6rem
    letterSpacing: '0'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.375rem
    letterSpacing: '0'
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: 1.25rem
    letterSpacing: '0'
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.8125rem
    fontWeight: '600'
    lineHeight: 1.125rem
    letterSpacing: 0.02em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.6875rem
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.25rem
---

## Brand & Style

This design system embraces an archival, warm minimalist aesthetic tailored for collectors of tactile cultural media—primarily vinyl records, art editions, and printed books. It translates the intimacy of handling physical paper, heavy cloth bookbindings, and matte LP sleeves into a calm digital workspace.

### Design Principles
- **Archival Reverence:** The UI steps back to celebrate physical media covers, photography, and press marks.
- **Quiet Modernity:** Angular Material 3 components are customized away from clinical, cold digital surfaces toward paper-like tactility with warm linen tones and muted sage accents.
- **Editorial Legibility:** Literary serifs establish thoughtful pacing for titles and metadata sections, while an unadorned sans-serif handles tabular data, inventory chips, and catalog numbers.
- **Restraint over Noise:** High contrast is reserved strictly for primary actions and active navigation states. Visual boundaries rely primarily on hairline borders and soft off-white surface steps rather than drop shadows.

## Colors

The palette reproduces organic, natural materials: aged archival paper, forest-green bookbinder buckram, warm brass or amber accents for ratings, and warm charcoal for typographic ink.

### Primary Accents & Hierarchy
- **Primary (`#1b432c`):** Deep Forest Green. Used for active navigation states, primary buttons, owned/verified badges, and primary brand accents. Hover and interaction shifts slightly to lighter pine (`#235438`).
- **Secondary (`#c47a2b`):** Aged Brass / Amber. Reserved for 5-star ratings, critical highlights, and collection status awards.
- **Tertiary (`#8c4a43`):** Terracotta / Madder Red. Reserved for destructive actions, subtle error states, and removal triggers.

### Surface System
- **Background (`#fbf9f5`):** Warm unbleached paper base canvas.
- **Surface (`#ffffff`):** Crisp archival matte card backing.
- **Surface Variant / Containers (`#f6f3eb`):** Subtle tinted paper surface for metadata blocks, nested content groups, and quiet tag chips.
- **Outline / Dividers (`#e4e0d7`):** Hairline borders framing cards, list rows, and structural panels.

### Typography Ink Tones
- **Text Primary (`#2c2a27`):** Deep warm charcoal with softer eye fatigue characteristics than pure black.
- **Text Secondary (`#68645e`):** Muted slate charcoal for labels, timestamps, and secondary metadata descriptions.
- **Text Tertiary (`#8f8a81`):** Subdued stone for placeholders, catalog prefixes, and inactive metadata markers.

## Typography

The type scale combines **Newsreader** for literary gravitas with **Plus Jakarta Sans** for clear, compact UI legibility across high-density metadata tables.

### Role Distribution
- **Headlines & Item Titles:** Newsreader at Medium (500) and SemiBold (600) weights delivers a sophisticated catalog experience reminiscent of gallery guides and fine press monographs.
- **Section Headers & Field Keys:** Plus Jakarta Sans with uppercase tracking (`label-md`) is applied to archival field keys such as `WYTWÓRNIA PŁYTOWA` or `NUMER KATALOGOWY`, ensuring quick vertical eye scanning.
- **Body & Data Values:** Plus Jakarta Sans at regular and medium weights provides clean, warm rendering for album details, notes, and technical press specs.

## Layout & Spacing

The layout adopts an editorial asymmetric structure composed of an anchored persistent navigation rail or sidebar, paired with a content workspace organized across a structured 12-column grid.

### Grid & Breakpoints
- **Desktop (>= 1200px):** 260px fixed archival sidebar on the left. The remaining main canvas features a 12-column layout with 24px gutters (`1.5rem`) and 32px canvas margins (`2rem`). Media detail pages balance a 4-column display asset block on the left with an 8-column structured metadata block on the right.
- **Tablet (768px - 1199px):** Collapsible sidebar rail (72px or drawer modal). Content shifts to a single column or stacked 2-column layout with 20px margins.
- **Mobile (< 768px):** Single column flow with bottom navigation bar or hamburger drawer. Margins reduce to 16px (`1rem`), and gutters scale to 12px.

### Spatial Rhythm
Internal card padding is calibrated to `1.25rem` or `1.5rem` (`space-lg`), allowing dense collection metadata to breathe without feeling sparse. Micro-spacing between labels and values stays tight at `0.25rem` (`space-xs`) to maintain visual cohesion.

## Elevation & Depth

This design system deliberately eschews deep, artificial digital drop shadows in favor of paper-like physical layering:

- **Flat Archival Plane:** Base canvas sits at `#fbf9f5`. Content cards exist at `#ffffff` or tinted `#f6f3eb`.
- **Hairline Framing:** Visual separation is established via continuous `1px solid #e4e0d7` borders around cards, section partitions, and search inputs.
- **Media Artifact Elevation:** Physical media covers (vinyl jacket art, book sleeves) feature a subtle ambient contact shadow: `0 4px 12px rgba(44, 42, 39, 0.08), 0 1px 3px rgba(44, 42, 39, 0.04)`. This simulates the depth of an LP resting on a flat archival desk.
- **Floating Modals & Flyouts:** Drawers and menus utilize a gentle elevated surface backed by `0 8px 24px rgba(44, 42, 39, 0.09)` with a tinted border.

## Shapes

The design uses a balanced rounded corner geometry (`0.5rem` / `8px` baseline) reflecting the slightly rounded edges of cardboard vinyl gatefolds and trimmed book pages.

- **Standard Cards & Modals:** `8px` corner radius with `1px` crisp hairline borders.
- **Pills & Chips:** Fully pill-shaped (`9999px`) for contextual tags, format indicators (`VINYL 12"`), and status markers.
- **Action Buttons:** `6px` to `8px` radius, maintaining clean architectural alignment with adjacent form inputs.
- **Media Cover Frames:** `4px` to `6px` radius to prevent clipping physical artwork corner details.

## Components

### Buttons
- **Primary Action (`mat-flat-button`):** Background `#1b432c`, text `#ffffff`. Padding: `0.625rem 1.25rem`. Sharp icon pairings (e.g. `+ Dodaj`).
- **Tonal / Secondary (`mat-stroked-button`):** Subtle cream/neutral background `#f0ede6`, text `#2c2a27`, border `#e4e0d7`. Hover elevates to `#e9e5dc`.
- **Destructive Action:** Soft tinted red background (`#fdf2f2`), text `#8c4a43`, with no heavy shadows.

### Chips & Badges
- **Status Chips (e.g., "Mam", "Przesłuchany"):** Pill-shaped with soft sage green tint (`#e2ece4`), deep forest green text (`#1b432c`), accompanied by micro checkmark icons.
- **Media Badges (e.g., "VINYL 12''"):** Deep forest green or dark charcoal overlay badge with contrasting white text and optical disc glyph.
- **Taxonomy Chips (Genres, Tags):** Low-contrast neutral container (`#f6f3eb` or `#ede9e1`), warm charcoal text, borderless for an unobtrusive listing.
- **Hashtags (`#ulubione`):** Light blush/rose neutral background (`#fbf1ee`), muted terracotta text (`#8c4a43`).

### Ratings & Stars
- Rendered in amber-brass (`#c47a2b`), compact 16px glyphs followed by numeric indicator in bold sans-serif text.

### Navigation Sidebar
- Vertical list of collection nodes. Active node is highlighted with a rounded rectangular forest green fill (`#1b432c`) and crisp white text. Inactive nodes use warm charcoal icons and text with transparent backgrounds.

### Search & Form Inputs
- Rounded rectangular field (`8px`), filled with white (`#ffffff`) or light paper tint (`#fbf9f5`), wrapped in a 1px border (`#e4e0d7`). Focused state transitions border to `#1b432c` with a soft 2px outline glow (`rgba(27, 67, 44, 0.15)`).