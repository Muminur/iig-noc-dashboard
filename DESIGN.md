# Design System Specification: High-Tech NOC Interface

## 1. Overview & Creative North Star
**The Creative North Star: "The Sentinel Lens"**

This design system is not a static dashboard; it is a high-performance optical instrument. To move beyond the "generic dark mode" aesthetic, we are adopting a philosophy of **The Sentinel Lens**—an interface that feels like a multi-layered glass HUD (Heads-Up Display) projected into a deep, obsidian space.

We break the "template" look by eschewing rigid, boxy containers in favor of **intentional asymmetry** and **tonal depth**. The UI should feel like a living network: fluid, dense with information, yet surgically precise. We leverage high-contrast typography scales and overlapping translucent surfaces to create an editorial-grade technical environment for IIG, BSCPLC.

---

## 2. Colors & Surface Intelligence
The palette is rooted in the "Obsidian & Neon" archetype. We use deep charcoals to represent stability and vibrant cyans to represent the flow of data.

### Core Palette (Material Tokens)
*   **Background (Obsidian):** `#111318` — The infinite void. Use this for the base layer of all views.
*   **Primary (Electric Cyan):** `#c3f5ff` — Used for active data paths and primary interactions.
*   **Secondary (Neon Mint):** `#45fec9` — Used for "System Healthy" statuses and secondary telemetry.
*   **Tertiary (Emergency Amber):** `#ffe7e2` — Reserved for warnings and high-priority data anomalies.
*   **Error (Alert Red):** `#ffb4ab` — Critical system failures only.

### The "No-Line" Rule & Surface Hierarchy
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section off the UI. We define space through atmospheric shifts:
1.  **Nesting Depth:** Use `surface_container_lowest` (#0c0e12) for background utility areas and `surface_container_high` (#282a2e) for active workspace modules.
2.  **The Glass & Gradient Rule:** For floating panels, use a combination of `surface_variant` at 60% opacity with a `backdrop-filter: blur(20px)`. 
3.  **Signature Texture:** Apply a 1px "inner glow" using a linear gradient (Primary at 30% opacity to Transparent) on the top-left edge of containers to simulate light catching the edge of a glass pane.

---

## 3. Typography
The typography is an interplay between the technical precision of **Space Grotesk** and the hyper-legibility of **Inter**.

*   **Display & Headlines (Space Grotesk):** These are our "Command" fonts. Use `display-lg` (3.5rem) for macro-data points (e.g., total network throughput). The wide apertures of Space Grotesk convey a futuristic, architectural authority.
*   **Body & Labels (Inter):** Our "Telemetry" fonts. Inter provides the necessary neutral balance to the expressive headlines. Use `label-sm` (0.6875rem) for high-density data grids and technical timestamps.
*   **The Technical Edge:** For "live" data feeds or terminal outputs, use Inter with `font-feature-settings: "tnum" on, "onum" on` to ensure tabular numbers line up perfectly in monitoring columns.

---

## 4. Elevation & Depth
In this design system, elevation is a product of **Light and Atmosphere**, not shadows.

*   **Tonal Layering:** To lift a component, do not use a drop shadow. Instead, shift the surface token. A card sitting on `surface` (#111318) should be `surface_container_low` (#1a1c20).
*   **Ambient Shadows:** If a module must float (e.g., a critical alert modal), use an ultra-diffused glow: `box-shadow: 0 20px 80px rgba(0, 218, 243, 0.08)`. The shadow must be tinted with the `surface_tint` (#00daf3) color.
*   **The Ghost Border:** If a boundary is required for accessibility, use `outline_variant` at 15% opacity. It should be felt, not seen.
*   **Grid Overlays:** Apply a subtle 24px dot-grid overlay across the `background` layer using `outline_variant` at 5% opacity to reinforce the "engineered" feel of the NOC.

---

## 5. Components

### Buttons & Interaction
*   **Primary Button:** A solid block of `primary_container` (#00e5ff) with `on_primary_container` text. Apply a subtle outer glow on hover using the `primary` token.
*   **Secondary/Ghost:** No fill. A "Ghost Border" (outline-variant at 20%) that transitions to 100% opacity on hover.
*   **Sizing:** All buttons use `md` (0.375rem) roundedness to maintain a sharp, technical profile.

### High-Density Data Modules
*   **Cards:** No dividers. Use `surface_container_highest` for the header area and `surface_container_low` for the body to create a natural visual break.
*   **The "Pulse" Indicator:** For live connections, use a 4px circular dot of `secondary` (#45fec9) with a CSS animation creating a radiating ring (20% opacity) to signify real-time activity.

### Input Fields
*   **Terminal Style:** Inputs should have no background fill—only a bottom border (Ghost Border style). When focused, the border glows `primary` and a 2px vertical "caret" blinks at the end of the label.

### Interactive Charts
*   **Data Lines:** Use 1.5px stroke widths. Fill the area under the line with a gradient transitioning from `primary` (20% opacity) to transparent.

---

## 6. Do's and Don'ts

### Do
*   **DO** use whitespace as a separator. Trust the typography hierarchy to guide the eye.
*   **DO** overlap elements slightly (e.g., a floating legend over a map) to create a sense of multi-layered glass.
*   **DO** use "monospaced-style" tracking for numerical data to ensure readability in fast-moving NOC environments.

### Don't
*   **DON'T** use pure white (#FFFFFF). All "white" text should be `on_surface` (#e2e2e8) to reduce eye strain in dark NOC rooms.
*   **DON'T** use standard 90-degree corners for large containers; use the `DEFAULT` (0.25rem) or `md` (0.375rem) scale to soften the "brutalist" edge just enough for a premium feel.
*   **DON'T** use heavy, opaque solid colors for large surfaces. It kills the "Sentinel Lens" atmospheric depth.