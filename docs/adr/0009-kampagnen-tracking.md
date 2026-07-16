# ADR 0009 — Kampagnen-Tracking: Client-Erfassung, Server-Assemblierung, Consent-Gating

## Status
Accepted

## Kontext
Anmeldungen über unsere Landingpage erscheinen im TM-Webcenter (TMW) unter *Quelle* nur mit dem nackten Hostnamen (`info.meditation.de`) — die nationalen meditation.de-Seiten übergeben dort die **komplette Landing-URL** inkl. `/schlaf`, `_ad=fb`, `fbclid`, `utm_*`. Dadurch kann das Center einzelne Anmeldungen nicht der Anzeige/Unterseite zuordnen.

Zusätzlich meldet Meta deutlich weniger Leads als real ankommen (Beispiel 10.–13.07.: Meta 5, TMW 11). Unser CAPI-`Lead`-Event sendet gehashte E-Mail/Telefon + IP/User-Agent, aber **nicht** `fbc` (Klick-ID aus `fbclid`) und `fbp` (Pixel-Cookie) — die stärksten Match-Signale. Ohne sie kann Meta die meisten Conversions nicht dem Anzeigen-Klick zuordnen.

Ursache beider Probleme: Die Ad-Klick-Parameter werden auf der Landingpage nie erfasst und nie an TMW/Meta weitergereicht.

## Entscheidungen

### 1. `source` = volle Landing-URL (statt Hostname)
TMW `source` und Supabase `info_anmeldungen.source` erhalten `https://{host}{path}?{query}` — Parität mit den nationalen Seiten. Kein zusätzliches Schema, keine strukturierten Spalten (YAGNI — `new URL(source).searchParams` parst bei Bedarf).

### 2. Erstkontakt-Erfassung client-seitig, in `sessionStorage`
Ein gemeinsamer Client-Helper (`lib/attribution.ts`) erfasst `fbclid`/`utm_*`/`_ad` + Pfad beim ersten Laden → `sessionStorage` (First-Touch, pro Besuch). Der Client ist die **einzige** Stelle mit Zugriff auf Query-String und `_fbc`/`_fbp`-Cookies. Genutzt von beiden Formularen (`events.tsx`, `individual-appointment.tsx`).

Warum `sessionStorage` statt `localStorage`: übersteht In-Page-Navigation/Locale-Wechsel, aber **nicht** über Sessions hinweg — ein Wiederbesucher wird nach Wochen nicht fälschlich der alten Anzeige zugeschrieben.

### 3. Client liefert Zutaten, Server assembliert & validiert
Der Client ist untrusted. Er sendet nur *Pfad + Parameter + fbc/fbp* im Body; der Server:
- **pinnt den Host** (nie client-kontrolliert),
- **allowlistet** Query-Keys (`fbclid, utm_source, utm_medium, utm_campaign, utm_content, utm_term, utm_id, _ad`),
- validiert den Pfad (führender `/`, kein Schema, kein `//`, keine Steuerzeichen),
- längenbegrenzt `source` (~512 Zeichen) und entfernt `\r\n\t`,
- format-validiert `fbc`/`fbp` (`fb.1.<ts>.<token>`) vor Versand an Meta.

Damit kann kein manipulierter Client einem Empfänger (TMW, Supabase, unser Admin, Meta) schaden: kein URL-Spoofing, keine Injection (JSON-escaped + HTML/Steuerzeichen gestrippt), kein DB-Bloat, keine Log-Poisoning.

### 4. Consent-Gating — Cookie-Verweigerer werden nicht rekonstruiert
`fbc`/`fbp` + PII gehen an Meta **nur bei akzeptiertem Cookie-Banner**. Die technisch mögliche Rekonstruktion von `fbc` aus dem `fbclid` in der URL für Verweigerer wird **bewusst nicht** gemacht: TTDSG §25 (Geräte-Zugriff) wäre zwar umgangen, aber die Übermittlung einer Klick-ID an Meta zur Werbe-Attribution braucht nach DSGVO Art. 6 eine Einwilligung — berechtigtes Interesse trägt hier nicht. Konsistent mit ADR 0001.

Die volle `source`-URL (keine PII, kein Meta) wird unabhängig vom Consent an TMW/Supabase geschrieben.

## Optionen abgewogen

| Frage | Gewählt | Verworfen |
|---|---|---|
| Attributions-Speicherung | volle URL in `source` | strukturierte Spalten (premature) |
| Persistenz | `sessionStorage` (First-Touch) | `localStorage` (Fehlzuordnung Wiederbesuch), nur `location.search` (bricht bei Navigation) |
| Vertrauen in Client | Zutaten + Server-Validierung | verbatim forwarden (Spoofing/Injection) |
| Verweigerer | nicht attribuieren | `fbclid`→`fbc` immer senden (rechtlich unsauber) |

## Konsequenzen
- Gilt für **Infoabend** (`/api/register`) und **Info-Anfrage** (`/api/info-anfrage`); letztere erhält erstmals ein CAPI-`Lead`-Event (Browser-Pixel + CAPI dedupliziert über gemeinsame `event_id`). **Nicht** für Veranstaltungen (`/api/register-event`).
- `host`/`referer`-Rätselraten im Server entfällt.
- Meta-Match steigt v. a. für die einwilligende Mehrheit; die Verweigerer-Lücke bleibt bewusst offen.
- Datenschutz-Seite: CAPI/Server-seitige Conversions inkl. `fbc`/`fbp` im Meta-Abschnitt ergänzen.
