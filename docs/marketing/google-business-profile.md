# Google Business Profile – Optimierungs-Checkliste (pro lokalem Center)

> **Optional & empfohlen, nicht verpflichtend.** Diese Checkliste ist eine Ressource für jedes **lokale** Center (feste Adresse, Präsenz vor Ort). Der nationale `deutschland`-Tenant hat keinen einzelnen Standort und braucht **kein** Profil. Jedes Center pflegt sein eigenes Profil selbst – es ist keine Voraussetzung für den Betrieb der Website.
>
> **Automatisch schon erledigt:** Die Website liefert für jeden Tenant automatisch das passende `LocalBusiness`-JSON-LD, `sitemap.xml` und `robots.txt` (aus der `tenants`-Zeile). Diese Checkliste ergänzt das externe Google-Profil, das **nicht** im Code liegt und von Hand in Google gepflegt wird.

**Ziel:** Das Google-Business-Profil so ausbauen, dass es bei lokalen Suchen ("Meditation lernen [Stadt]", "Meditation Kurs [Stadt]", "TM [Stadt]") im Google-Maps-Kasten (Local Pack) *über* den bezahlten Anzeigen und der nationalen Website erscheint. Einmalige Arbeit, danach jahrelang wirksam.

> **Wichtigste Regel – NAP-Konsistenz:** **N**ame, **A**dresse, **P**hone müssen *überall exakt gleich* geschrieben sein (Profil, Website-Impressum, LocalBusiness-JSON-LD). Google gleicht diese ab. Schon "Str." vs "Straße" kann schaden.
>
> Werte pro Center (aus der `tenants`-Zeile: `legal_entity`, `legal_address`, `contact_phone`, `contact_email`, `hostname`):
> - **Name:** `[legal_entity]` — Beispiel München: Transzendentale Meditation München e.V.
> - **Adresse:** `[legal_address]` — Beispiel München: Guldeinstraße 47, 80639 München
> - **Telefon / E-Mail:** `[contact_phone]` / `[contact_email]`
> - **Website:** `https://[hostname]` — Beispiel München: https://tm-muenchen.de

---

## 1. Profil vollständig ausfüllen (jedes Feld zählt)

- [ ] **Primäre Kategorie:** „Meditationszentrum" (engl. *Meditation center*). Das ist das wichtigste Ranking-Signal.
- [ ] **Weitere Kategorien:** „Meditationskurs", „Bildungseinrichtung für Erwachsene", ggf. „Yogakurs"/„Wellnesszentrum" nur wenn zutreffend.
- [ ] **Adresse:** Guldeinstraße 47, 80639 München – exakt wie oben.
- [ ] **Einzugsgebiet (Service Area):** München + relevante Stadtteile hinzufügen (auch wenn ihr eine feste Adresse habt – hilft bei „in der Nähe"-Suchen).
- [ ] **Öffnungszeiten:** realistische Zeiten eintragen (nicht „24h"). Lieber „nach Vereinbarung" über Sonderzeiten kommunizieren.
- [ ] **Telefon** und **Website** (→ https://tm-muenchen.de) hinterlegen.
- [ ] **Terminlink / „Termin buchen":** Link direkt auf die Anmelde-Sektion setzen: `https://tm-muenchen.de/#anmeldung`.
- [ ] **Kurzbeschreibung** (750 Zeichen, keywordreich – Vorlage unten).
- [ ] **Eröffnungsdatum** des Centers eintragen (Signal für Etabliertheit).
- [ ] **Attribute:** „Online-Termine", „barrierefrei" etc. – was zutrifft.

### Vorlage Kurzbeschreibung (kopieren & anpassen)

> Im **TM-Center München** lernst du die **Transzendentale Meditation** – eine einfache, mühelose Technik, die ohne Konzentration oder Gedanken-Stoppen funktioniert und seit Jahrzehnten wissenschaftlich erforscht ist. In einem **kostenlosen Infoabend** (online oder vor Ort in München, Guldeinstraße) erfährst du, wie TM bei Stress, Schlafproblemen und innerer Unruhe hilft und wie du sie in wenigen Tagen erlernst. Persönlich unterrichtet von zertifizierten TM-Lehrern. Jetzt unverbindlich zum Infoabend anmelden: tm-muenchen.de

## 2. Fotos (Vertrauen + Ranking)

- [ ] **Logo** und **Titelbild** setzen.
- [ ] **10+ echte Fotos:** Außenansicht Guldeinstraße (damit Leute das Haus finden), Innenräume/Meditationsraum, Lehrer, ein Infoabend/Gruppe. Google bevorzugt Profile mit echten, aktuellen Fotos.
- [ ] Fotos gelegentlich (1×/Quartal) ergänzen – aktives Profil rankt besser.

## 3. Reviews – der eigentliche Ranking-Hebel

Ihr habt bereits **~10 Bewertungen** – guter Start. Ziel: einmalig auf **20+** bringen, dann locker halten.

- [ ] **Kurzen Bewertungs-Link holen:** im Profil → „Bewertungen" → „Mehr Rezensionen erhalten" → kurzen Link kopieren (Form `g.page/r/…`).
- [ ] **Einmalige Anfrage** an zufriedene Münchner Meditierende schicken (WhatsApp-Community, E-Mail-Verteiler, persönlich nach Folgetreffen).
- [ ] **Auf JEDE Bewertung antworten** (auch die alten) – kurz, persönlich, dankend. Signalisiert Google ein aktives Profil und wirkt auf neue Besucher.
- [ ] Nach neuen TM-Kursen: Teilnehmer am letzten Folgetreffen freundlich um eine Bewertung bitten (bester Zeitpunkt – frische Begeisterung).

### Vorlage Bewertungs-Anfrage (WhatsApp/E-Mail)

> Liebe/r [Name],
> schön, dass du mit TM angefangen hast 🙏 Wenn dir dein Start bei uns im Center gefallen hat, würdest du uns mit einer kurzen Google-Bewertung riesig helfen – so finden andere Menschen in München leichter zu TM. Dauert nur 1 Minute:
> 👉 [Bewertungs-Link]
> Herzlichen Dank & liebe Grüße, dein TM-Team München

## Später (notiert, noch nicht gebaut)

- **Live-Sternebewertung auf der Website** ("★ 4,9 · 12 Bewertungen"): benötigt die Google **Places API** (kleine Kosten pro Abruf + Regeln zu Caching/Anzeige). Erst sinnvoll, wenn genügend Bewertungen da sind. Bis dahin nur der Link zum Profil (siehe unten).

## 4. Google Posts (optional, minimal)

- [ ] 1–2 „Beiträge" anlegen (z. B. nächster Infoabend). Google bevorzugt Profile, die *irgendeine* Aktivität zeigen. Kein Zwang zur Regelmäßigkeit – lieber einmalig sauber als Dauer-Treadmill.

## 5. Abschluss – Website ↔ Profil verknüpfen

- [ ] Sobald der **LocalBusiness-JSON-LD-Block** auf tm-muenchen.de live ist (siehe Dev-Task), prüfen, dass Name/Adresse/Telefon dort **1:1** mit dem Profil übereinstimmen. Diese Verknüpfung ist das, was Website und Maps-Pin füreinander verstärkt.

---

### Reihenfolge (ein Wochenende)
1. Profil-Felder + Kategorien (§1) → 30 Min
2. Fotos hochladen (§2) → 30 Min
3. Beschreibung + Terminlink (§1) → 15 Min
4. Bewertungs-Link holen + Anfrage rausschicken (§3) → 30 Min
5. Auf bestehende Reviews antworten (§3) → 30 Min
6. (Dev, separat) On-Page-SEO deployen → Verknüpfung prüfen (§5)
