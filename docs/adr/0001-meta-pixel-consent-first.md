# ADR 0001 — Meta Pixel: Consent-First mit Custom Banner

## Status
Accepted

## Kontext
Instagram-Anzeigen sollen auf Infoabend-Anmeldungen optimiert werden. Dafür braucht Meta ein Conversion-Signal (`Lead`). Der Meta Pixel setzt Marketing-Cookies im Browser — nach DSGVO/ePrivacy ist dafür eine explizite Einwilligung vor dem Laden des Pixels erforderlich.

## Optionen abgewogen

| Option | DSGVO | Aufwand | Qualität des Signals |
|---|---|---|---|
| A) Pixel immer laden, kein Banner | ✗ illegal | minimal | hoch |
| B) Custom Consent-Banner, Pixel nur nach Opt-in | ✓ | gering | gut (opt-in users = engaged) |
| C) Nur Conversions API (server-side) | ✓ | hoch | hoch, kein Cookie-Problem |

## Entscheidung
**Option B** — Custom Bottom-Bar-Banner, Pixel lädt nur nach Opt-in.

Begründung:
- Option A ist für eine öffentlich beworbene DE-Site zu riskant (Abmahnungen).
- Option C ist deutlich komplexer und für die aktuelle Phase unverhältnismäßig.
- Opt-in-User liefern Meta bessere Signale als geklaute Daten.
- Custom Banner statt CMP-Library, weil das Design sonst sofort bricht.

## Konsequenzen
- Consent-State in `localStorage` unter Key `tm_cookie_consent` (`accepted` | `declined`).
- Pixel-Init erfolgt komplett client-seitig in `cookie-banner.tsx` via dynamischem Script-Tag.
- Pixel nicht geladen auf Admin-Seiten (konsistent mit Vercel Analytics).
- Events: `PageView` (nach Consent), `ViewContent` (Formular öffnen), `Lead` (erfolgreiche Anmeldung).
