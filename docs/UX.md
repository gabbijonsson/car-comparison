# UX patterns

> Swedish UI copy · English routes · Forms in drawers · Dialogs for confirm/destructive only

## Forms → drawers

Use `FormDrawer` (`src/components/layout/FormDrawer.tsx`) for all create/edit flows.

| Viewport | Behavior |
| -------- | -------- |
| `< md` (mobile) | Full-screen sheet, no side inset |
| `≥ md` (desktop) | Right-side panel, max width `xl` |

Do **not** use `Dialog` for forms.

## Dialogs → confirm / destructive only

Use `ConfirmDialog` (`src/components/layout/ConfirmDialog.tsx`) or raw `Dialog` for:

- Permanent delete (after archive)
- Irreversible actions
- Explicit user confirmation

Do **not** use `Dialog` for data entry, settings, or multi-field workflows.

## Navigation

- Route paths: English (`/prospects`, `/compare`, `/settings`)
- Labels: Swedish via `src/lib/i18n/sv.ts`

## Breakpoints (desktop-first)

Defined in `src/styles/app.css`:

| Token | Width | Use |
| ----- | ----- | --- |
| `md` | 768px | Side drawer vs fullscreen |
| `lg` | 1024px | Comparison table layout |
| `xl` | 1280px | Max content width |

Design for desktop first; enhance down to mobile with drawer fullscreen and stacked layouts.
