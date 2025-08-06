# Astronaut Idle Adventure – Art & Style Guide (v0.1)

> **Purpose**  
> Ensure every sprite, icon, and UI element feels coherent, readable, and on-brand across desktop and mobile.

---

## 1. Core Art Direction

| Theme            | Guideline                                                                 |
| ---------------- | ------------------------------------------------------------------------- |
| Setting          | Retro-futuristic space outpost  |
| Mood             | Stark survival → hopeful expansion |
| Inspiration      | *A Dark Room*, *RimWorld* minimalism; NES colour restraint; NASA mission patches |
| Resolution Target| 32 × 32 px base tile/sprite, scaled 4× in-game (128 × 128 CSS) |

### 1.1 Colour Palette (NES-inspired, max 32 colours)

| Hue      | Hex | Usage            |
| -------- | --- | ---------------- |
| Plasma   | `#38e8d0` | Reactors, energy highlights |
| Hull Gray| `#2e2e2e` | Metal panels, UI chrome |
| Warning  | `#ffae00` | Alerts, critical text |
| Accent   | `#ab4cff` | Rare tech, buttons |

> *TODO:* finalise full palette once UI mock-ups v0.2 are approved.

---

## 2. Sprite Guidelines

| Category   | Size      | Frames | File name example                 |
| ---------- | --------- | ------ | --------------------------------- |
| Building   | 32×32     | 1      | `heater.png`                      |
| Drone      | 32×32     | 4      | `drone_sheet.png`                 |
| Icon       | 64×64 SVG | —      | `rp.svg`, `warp.svg`              |

* Use **side-by-side spritesheets** for animation (`<name>_sheet.png`).  
* All pixel art must be **aliased (no blur)**; disable texture filtering.  
* Keep outlines 1 px, darker tint of interior colour.

---

## 3. UI & Typography

| Element       | Style                                                   |
| ------------- | ------------------------------------------------------- |
| Font Family   | `Inter`, fallback `system-ui`                           |
| Heading Size  | `text-lg` Tailwind (≈ 20 px @1×)                        |
| Body Size     | `text-sm` (≈ 14 px @1×)                                 |
| Button Shape  | Rounded-xl (`rounded-2xl`), soft shadow (`shadow-lg`)   |
| Primary Colour| `bg-teal-600` (hover `bg-teal-500`)                     |

---

## 4. Animation Rules

| Type     | FPS  | Loop Style | Notes                          |
| -------- | ---- | ---------- | ------------------------------ |
| Emissive | 6    | Ping-pong  | Reactor core pulse             |
| Drone    | 8    | Loop       | Thruster flicker, hovering     |

---

## 5. Asset Pipeline

1. **Draw** in Aseprite → export `PNG` (or `GIF` for review).  
2. **Optimise** via `pngquant --quality 65-80`.  
3. **Place** under `src/assets/sprites/` or `src/assets/icons/`.  
4. **Reference** imports using Vite alias `@/assets/...`.

---

## 6. Tools & References

- **Aseprite** – pixel art editor  
- **Lospec Palette List** – palette inspiration  
- **Spline** – quick 3D block-outs for isometric guides (optional)

---

## 7. Revision History

| Version | Date         | Author  | Notes                         |
| ------- | ------------ | ------- | ----------------------------- |
| v0.1    | 2025-08-06   | Daniel  | First skeleton; pending palette final |

---

*End of document*

