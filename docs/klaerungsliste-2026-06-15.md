# Klärungsliste — 2026-06-15

## Kontakte

| Thema | Ansprechpartner |
|---|---|
| TMW API (Write-Access, Endpoints) | **Benjamin** |
| meditation.de WordPress, Domain, DNS | **Christof** |
| Nationales Tenant / Subdomain-Strategie | Christof (+ Eckart wenn offen) |

---

## 1. Benjamin — TMW API Write-Access

- Gibt es einen POST-Endpoint für Infoabend-Anmeldungen? Z.B. `POST /api/lectures/{id}/participants`?
- Wie sieht der Request-Body aus? (Felder: name, email, phone — was erwartet TMW?)
- Kann ich einen API-Key mit Schreibrecht bekommen (aktuell nur Read-Access)?
- **Gilt Write-Access für BEIDE Infoabend-Typen?**
  - Vor-Ort-Infoabende (haben `pk` in `center.lectures[]`)
  - Online-Infoabende / Webinare (haben `webinar_link` gesetzt — aktuell vom System übersprungen)
  - Werden Online-Anmeldungen über denselben Endpoint geschrieben oder einen anderen?

---

## 2. Christof — meditation.de Domain & DNS

### E-Mail-Sending (Resend-Sender-Domain)
TMW schickt bei Infoabend-Anmeldungen automatisch Bestätigung, Erinnerung und Leiter-Benachrichtigung — wir brauchen Resend nur noch für Veranstaltungen (interne Center-Events, nicht TMW-verwaltet).

Dafür brauchen wir eine einzige verifizierte Sender-Domain in Resend für alle Centers.

- Eckart schlägt eine Subdomain von `meditation.de` vor (z.B. `events.meditation.de`) — kann Christof diese anlegen und die Resend-Verifikationseinträge (SPF, DKIM, DMARC-Records) dort setzen?

### Nationaler Tenant
- **Entschieden: `info.meditation.de`** — Freigabe von Eckart, DNS-Eintrag (A-Record → Vercel) bei Christof
- Wer bekommt den Admin-Login für den nationalen Tenant? (Christof selbst, oder jemand anderes von der nationalen Org?)
- TMW Center-ID für nationale Infovorträge: **226**

---

## 3. Freiburg-Onboarding (nach obigen Klärungen)

- TMW Center-IDs für Freiburg bestätigen: `npx tsx scripts/find-tmw-center.ts Freiburg`
- DNS bei United Domains — A-Record und CNAME sind gesetzt, warten auf Propagation + Vercel-Bestätigung
- Resend Sender-Domain: hängt von Entscheidung unter Punkt 2 ab
