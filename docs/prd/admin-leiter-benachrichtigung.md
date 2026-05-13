# Admin: Leiter-Benachrichtigung & Magic Link

## Problem Statement

Wenn sich jemand für eine Veranstaltung anmeldet, erfahren die Veranstaltungsleiter davon nur, wenn sie aktiv das Admin-Panel aufrufen. Es gibt keine automatische Benachrichtigung. Außerdem müssen Leiter sich einloggen, um Anmeldungen zu sehen — ein unnötiger Schritt für nicht-technische Kollegen. Zusätzlich enthalten die Formularfelder im Admin-Panel irreführende Platzhaltertexte (z.B. "Bennet, Malena", "Guldeinstraße 47"), die wie bereits eingetragene Werte wirken und beim Erstellen von Events zu Verwirrung führen.

## Solution

1. **Placeholder-Fix**: Alle Platzhaltertexte aus den Admin-Formularfeldern entfernen — Felder erscheinen leer bis der Nutzer tippt.
2. **Leiter-Benachrichtigung**: Bei jeder neuen Veranstaltungs-Anmeldung wird automatisch eine E-Mail an alle Leiter der Veranstaltung geschickt mit den Anmeldedaten und einem direkten Link zur Anmeldungsliste.
3. **Magic Link**: Der Link in der Benachrichtigungs-E-Mail öffnet das Admin-Panel direkt auf dem Anmeldungen-Tab für genau diese Veranstaltung — ohne Login. Andere Admin-Tabs verlangen weiterhin normale Anmeldung.

## User Stories

1. Als Veranstaltungsleiter möchte ich sofort per E-Mail benachrichtigt werden, wenn sich jemand für meine Veranstaltung anmeldet, damit ich immer den aktuellen Stand kenne.
2. Als Veranstaltungsleiter möchte ich in der Benachrichtigungs-E-Mail den vollen Namen, die E-Mail-Adresse und die Telefonnummer der angemeldeten Person sehen, damit ich bei Bedarf Kontakt aufnehmen kann.
3. Als Veranstaltungsleiter möchte ich mit einem Klick auf den Link in der E-Mail direkt zu allen Anmeldungen meiner Veranstaltung gelangen, ohne mich einloggen zu müssen.
4. Als Veranstaltungsleiter möchte ich, dass der Link nur für meine Veranstaltung Zugriff gewährt, damit keine anderen Daten einsehbar sind.
5. Als Veranstaltungsleiter möchte ich, dass der Link nach 30 Tagen nach der Veranstaltung abläuft, damit kompromittierte Links keinen dauerhaften Schaden anrichten können.
6. Als Veranstaltungsleiter möchte ich persönlich mit meinem Vornamen in der E-Mail angesprochen werden, damit die Benachrichtigung menschlich wirkt.
7. Als Veranstaltungsleiter möchte ich in der E-Mail das Datum und die Uhrzeit der Veranstaltung sehen, damit ich sofort den Kontext kenne.
8. Als Admin möchte ich beim Erstellen einer Veranstaltung keine irreführenden Platzhaltertexte in den Formularfeldern sehen, damit klar ist, dass die Felder noch leer sind.
9. Als Admin möchte ich beim Bearbeiten einer Vorlage ebenfalls keine Platzhaltertexte sehen.
10. Als Entwickler möchte ich, dass abgelaufene oder ungültige Magic Links einen Login-Prompt anzeigen, damit der Zugriff sicher geregelt ist.
11. Als Veranstaltungsleiter möchte ich, dass bei mehreren Leitern einer Veranstaltung jeder seine eigene Benachrichtigung erhält.
12. Als System möchte ich, dass ein Leiter, dessen Name nicht in der TMW-Lehrerliste gefunden wird, die Benachrichtigung still überspringt (non-fatal), damit die Anmeldungsverarbeitung nicht fehlschlägt.
13. Als Veranstaltungsleiter möchte ich über den Magic Link direkt auf den Anmeldungen-Tab meiner Veranstaltung weitergeleitet werden, ohne erst navigieren zu müssen.
14. Als Admin mit vollem Zugriff möchte ich alle anderen Admin-Tabs (Veranstaltungen, Vorlagen, Info-Anmeldungen) weiterhin mit normalem Login nutzen, auch wenn ich über einen Magic Link eingestiegen bin.

## Implementation Decisions

### Modules

**`lib/admin-token` (neu — deep module)**
- `generateToken(eventId: string, eventDate: string): string` — HMAC-SHA256 signierter Token mit Payload `{ eventId, exp: eventDate + 30 Tage }`. Secret aus Env-Variable `ADMIN_TOKEN_SECRET`.
- `verifyToken(token: string, eventId: string): { valid: true } | { valid: false, reason: 'expired' | 'invalid' }` — pure function, keine Side Effects.
- Kein Datenbank-Eintrag nötig — stateless.

**`lib/tmw-teachers` (neu, extrahiert aus register/route.ts)**
- `lookupTeachersByFirstNames(firstNames: string[]): Promise<TMWTeacher[]>` — fetcht TMW API Center 108, matched Lehrer by Vorname (case-insensitive, erster Teil von `t.name`). Cached mit `revalidate: 3600`. Gibt nur gefundene zurück.

**`lib/email-veranstaltung` (modify)**
- Neue Funktion `buildLeiterNotificationHtml(params: LeiterNotificationParams): string`
- Params: `{ leiterName, registrantName, registrantEmail, registrantPhone, tmLehrer, eventTitle, eventDate, eventTime, eventLocation, magicLink }`
- Template: Anrede "Hallo liebe/r [leiterName]," → Anmeldedaten → Button "Alle Anmeldungen ansehen →" → Signatur "Hochachtungsvoll, Dein TM-München-IT-TEAM 😉"

**`api/register-event/route.ts` (modify)**
- Nach erfolgreicher Anmeldung: `hosts`-String splitten → `lookupTeachersByFirstNames` → für jeden gefundenen Lehrer `generateToken` + `buildLeiterNotificationHtml` → `resend.emails.send`. Non-fatal (catch + console.error wie Sheets-Logging).

**`app/admin/page.tsx` (modify)**
- Liest `token` und `event` aus SearchParams.
- Verifiziert Token via `verifyToken`. Bei gültigem Token: übergibt `tokenEventId` an AdminClient, kein Session-Check für diesen Pfad.
- Bei ungültigem/abgelaufenem Token: normaler Login-Flow.

**`admin-client.tsx` (modify)**
- Neues optionales Prop `tokenEventId?: string`.
- Wenn gesetzt: nur Anmeldungen-Tab sichtbar, Event-Filter vorausgewählt und nicht änderbar, andere Tabs ausgeblendet oder deaktiviert.

**`EventFormFields` in `admin-client.tsx` (modify)**
- Alle `placeholder`-Attribute von Textfeldern entfernen: Leiter, Ort, Preis, Zielgruppe, Online-Link, Kurzbeschreibung, Hinweise, Newsletter-Link-Schlüsselwort.
- `datalist`-Suggestions für Ort bleiben erhalten (das sind Autocomplete-Vorschläge, keine Placeholders).

### Token-URL-Format
`/admin?tab=anmeldungen&event=<eventId>&token=<hmacToken>`

### Sicherheitsmodell
- Token ist event-scoped: ein gestohlener Token gibt nur Lesezugriff auf Anmeldungen eines Events.
- Ablauf: 30 Tage nach `event.date`.
- Andere Tabs (Veranstaltungen, Vorlagen, Info-Anmeldungen): verlangen normalen Session-Login unabhängig vom Token.
- Kein Write-Zugriff über Token-Auth.

## Testing Decisions

**`lib/admin-token`** ist der einzige kandidat für automatisierte Tests — pure functions mit klar definierten Inputs/Outputs:
- `generateToken` + `verifyToken` Roundtrip
- Abgelaufener Token wird korrekt rejected
- Token für falsches eventId wird rejected

Kein Test-Framework ist aktuell im Projekt konfiguriert. Tests sind optional — der Modul ist klein genug zum manuellen Verifizieren.

Alle anderen Module sind Integrationspunkte (E-Mail-Versand, API-Calls, UI-Rendering) die keinen sinnvollen Unit-Test-Layer haben.

## Out of Scope

- Benachrichtigung für **Infoabend**-Anmeldungen (bereits vorhanden in `register/route.ts`)
- Write-Zugriff über Magic Link
- Magic Links für andere Admin-Bereiche als Veranstaltungs-Anmeldungen
- Invalidierung von Magic Links vor Ablauf (kein Revoke-Mechanismus)
- Anpassung der Infoabend-Leiter-Benachrichtigungs-E-Mail an das neue Template

## Further Notes

- TMW-API-Lookup für Lehrer ist bereits in `register/route.ts` implementiert — `lib/tmw-teachers` ist eine saubere Extraktion dieses Musters.
- Das `hosts`-Feld enthält Vornamen wie "Bennet, Malena". Matching erfolgt case-insensitive gegen den ersten Teil des vollen TMW-Namens (`t.name.split(' ')[0]`).
- `ADMIN_TOKEN_SECRET` muss als neue Env-Variable in Vercel gesetzt werden.
- Bei zwei Lehrern mit gleichem Vornamen im Center wird der erste Treffer verwendet — aktuell kein Problem beim TM-München-Center.
