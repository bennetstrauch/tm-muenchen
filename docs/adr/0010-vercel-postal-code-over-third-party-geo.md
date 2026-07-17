# ADR 0010 — IP-basierte PLZ: Vercel-Header statt Drittanbieter-Geolocation

## Status
Accepted

## Kontext
Jede Infoabend-Buchung (`/api/register`) und Info-Anfrage (`/api/info-anfrage`) übergibt TMW eine `zip_code`, damit die nationale Organisation grob weiß, woher ein Lead kommt. Der Besucher tippt sie nie — sie wird server-seitig aus der IP abgeleitet.

Die alte Implementierung leitete `zip_code` aus dem Vercel-Header `x-vercel-ip-city` über eine hartcodierte 15-Städte→PLZ-Tabelle ab. Zwei strukturelle Mängel: (1) Ein Städtename ergibt bestenfalls eine einzige *Innenstadt*-PLZ (jeder Münchner → `80331`), nicht die tatsächliche PLZ. (2) Jede kleinere Stadt (Germering, Dachau, Freising — genau das Vorort-Zielpublikum) fehlt in der Tabelle → `""`. TMW erhielt für nahezu alle Anmeldungen entweder `80331` oder leer.

Vercels Edge liefert die PLZ inzwischen direkt: `x-vercel-ip-postal-code` ("The postal code close to the user's location"), auf allen Plänen, neben dem bereits genutzten `x-vercel-ip-city`.

## Entscheidungen

### 1. `x-vercel-ip-postal-code` als primäre Quelle
Vercels Edge macht die IP→PLZ-Auflösung selbst. Kein PLZ-Datensatz, kein Drittanbieter-API, kein neuer Datenverarbeiter, 0 €. `cityToPlz` bleibt nur als Fallback, falls Vercel eine Stadt, aber keine PLZ sendet.

### 2. Bewusst KEINE Drittanbieter-Geolocation (ipapi.co, MaxMind o. ä.)
Ein Drittanbieter-API läge accuracy-technisch nicht wesentlich höher (IP-Geolocation ist grundsätzlich stadt-genau), würde aber die **IP jedes deutschen Besuchers an einen — meist US-amerikanischen — Dienst übermitteln**. Das braucht nach DSGVO eine Rechtsgrundlage + AVV und schafft einen Drittlandtransfer, für einen minimalen Genauigkeitsgewinn. Die IP bleibt mit dem Vercel-Header genau dort, wo sie ohnehin schon liegt (Vercel als bestehender Verarbeiter/Host). Konsistent mit dem Consent-/Datensparsamkeits-Ansatz aus ADR 0001 und ADR 0009.

### 3. Kein Country-Gate — jede echte PLZ wird weitergereicht
Ein früher erwogener „nur DE"-Filter wurde verworfen: Die Annahme, TMW lehne ausländische Codes ab, ist **falsch**. Der TMW-Vertrag für `zip_code` ist lediglich *max 12 Zeichen* ohne Länder- oder Formatprüfung; das offizielle API-Beispiel nutzt sogar den österreichischen Code `1010`/Wien (`docs/TMW_Endpoints.md`). `resolveGeo` reicht daher die echte `x-vercel-ip-postal-code` unabhängig vom Land weiter — Österreich & Grenzregionen inklusive. Eine vereinzelte Fremd-PLZ (z. B. per VPN) ist harmlose Metadaten neben `city` und `source`. `cityToPlz` (deutsch-only) bleibt reiner Fallback.

### 4. Ein Helper, PLZ persistiert
Die gesamte Logik lebt in `resolveGeo(headers)` (`lib/geo.ts`) — beide Routen kollabieren auf eine Zeile. Die aufgelöste `zip_code` wird zusätzlich in `info_anmeldungen` und `info_anfragen` gespeichert (nicht im Admin angezeigt), damit die Datenqualität nachträglich überprüfbar ist — vorher gab es dafür keinen Messpunkt.

## Optionen abgewogen

| Frage | Gewählt | Verworfen |
|---|---|---|
| PLZ-Quelle | `x-vercel-ip-postal-code` | Drittanbieter-API (DSGVO/Drittland, Kosten), eigener PLZ-Zentroid-Datensatz (Ballast, kein Mehrwert) |
| Alte Städte-Tabelle | Fallback | primär (grob) / gelöscht (Sicherheitsnetz weggeworfen) |
| Ausland | echte PLZ weiterreichen (TMW: max 12 Zeichen) | „nur DE"-Gate (verwarf gültige AT-Codes, falsche Annahme) |

## Konsequenzen
- Gilt für **Infoabend** (`/api/register`) und **Info-Anfrage** (`/api/info-anfrage`).
- Datenqualität steigt von "immer Innenstadt oder leer" auf echte, streuende PLZ — messbar über die neuen `zip_code`-Spalten.
- Kein neuer Datenverarbeiter, keine DSGVO-Erweiterung, 0 €.
- Wer künftig „mehr Genauigkeit" via Drittanbieter-API einbauen will, reaktiviert damit ein Compliance-Problem — deshalb diese ADR.
- Migration `20260717_geo_zip_code.sql` muss in Prod ausgeführt werden, sonst verwirft der Insert das Feld stillschweigend.
