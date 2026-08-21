# ADR 0011 — Tracking ohne Einwilligung als per-Tenant-Opt-in

## Status
Accepted (2026-08-20)

Ergänzt [ADR 0001](0001-meta-pixel-consent-first.md). Consent-First bleibt der Standard; diese ADR fügt eine bewusst gewählte Ausnahme hinzu und hebt 0001 **nicht** auf.

## Kontext

ADR 0001 legte den Meta Pixel auf **Consent-First** fest: der Pixel lädt ausschließlich nach explizitem Opt-in über den Cookie-Banner. Option A („Pixel immer laden, kein Banner") wurde dort als *„✗ illegal … für eine öffentlich beworbene DE-Site zu riskant (Abmahnungen)"* verworfen.

Es gibt Zentren, die dieses Risiko bewusst eingehen wollen, um das Conversion-Signal für Instagram-/Facebook-Anzeigen zu maximieren (jeder Besucher wird getrackt, nicht nur die Opt-in-Minderheit). Der Betreiber (Bennet) hat das Risiko ausdrücklich zur Kenntnis genommen und will die Möglichkeit pro Tenant freischaltbar machen.

Der **Verantwortliche** im datenschutzrechtlichen Sinne ist pro Tenant unterschiedlich (`tenants.legal_entity`) — die rechtliche Exposition liegt beim jeweiligen Zentrum, nicht zentral.

## Entscheidung

Neue per-Tenant-Spalte **`tenants.track_without_consent`** (boolean, `NOT NULL DEFAULT false`). Ist sie `true`:

1. **Kein Banner.** Der Cookie-Banner rendert nichts; der Meta Pixel lädt beim Seitenaufruf und feuert `PageView`.
2. **Conversion-Events ohne Consent-Gate.** `events.tsx` feuert `ViewContent`/`Lead` ohne `localStorage`-Prüfung — sonst würde das eigentliche Ziel-Signal nie feuern, da nie ein Consent erfasst wird.
3. **Server-CAPI mit voller PII.** `/api/register` und `/api/info-anfrage` senden E-Mail, Name, Telefon, IP, `fbc`/`fbp` an Meta für den Traffic dieses Tenants.
4. **`has_consent` bleibt wahrheitsgemäß `false`.** Die Spalte erfasst, ob der *Nutzer* eingewilligt hat — das hat er nie. Sie wird niemals auf `true` gefälscht. Grund des Trackings ist das Tenant-Flag, nicht ein Consent-Record.
5. **Widerspruch (Opt-out).** Eine Regel steuert alle Client-Punkte:
   `fireTracking = track_without_consent ? (tm_cookie_consent !== "declined") : (tm_cookie_consent === "accepted")`.
   Ein Link „Tracking deaktivieren" auf der Datenschutz-Seite schreibt `tm_cookie_consent = "declined"` und lädt neu; danach lädt der Pixel für diesen Besucher nicht mehr. Das ist die einzige UI, die ein solcher Tenant zeigt — kein seitenweiter Banner.
6. **Ehrliche Datenschutz-Variante.** Der Meta-Pixel-Abschnitt der Datenschutz-Seite wechselt bei gesetztem Flag auf eine „ohne Einwilligung / berechtigtes Interesse (Art. 6 Abs. 1 lit. f DSGVO)"-Fassung inkl. Opt-out-Link. Die Consent-First-Formulierung („ausschließlich nach Ihrer ausdrücklichen Zustimmung") darf für einen solchen Tenant **nie** rendern — sie wäre eine nachweislich falsche Datenschutzerklärung.

### Steuerung

Ausschließlich **Super-Admin** über das `/super-admin`-Tenant-Formular — nie die Tenant-Einstellungen-Tab. Einfache Checkbox wie die übrigen Felder, ohne Bestätigungs-Gate: der einzige Operator ist vertrauenswürdig und kennt das Risiko. Zentren können das Flag nicht selbst setzen.

## Konsequenzen

- Der gefährliche Zustand ist der Nicht-Default `true` → jeder bestehende und neu angelegte Tenant ist automatisch Consent-First. `NULL`/fehlend versagt sicher (Consent-First).
- `SiteShell` reicht `track_without_consent` an `CookieBanner` (kein Render) **und** `StickyCta` weiter. Ohne Letzteres bliebe der Sticky-CTA dauerhaft verborgen, weil er auf ein `cookie-consent-dismissed`-Event wartet, das nie feuert.
- Consent-First-Pfad bleibt Byte-für-Byte unverändert; nur Tenants mit gesetztem Flag verzweigen.

## Akzeptiertes Risiko

Bewusst in Kauf genommen: TTDSG §25 (Einwilligung für nicht-essentielle Cookies), Art. 6 DSGVO (Rechtsgrundlage), Abmahnrisiko für öffentlich beworbene DE-Seiten. Die rechtliche Verantwortung trägt der pro Tenant hinterlegte `Verantwortliche` (`legal_entity`). Entscheidung dokumentiert am 2026-08-20 auf ausdrücklichen Wunsch des Betreibers.
