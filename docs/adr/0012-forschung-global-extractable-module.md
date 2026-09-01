# ADR 0012 — Forschung als globales, extrahierbares Modul (nicht tenant-scoped)

## Status
Accepted (2026-08-30)

## Kontext

Das **Forschung**-Modul (`/forschung`) macht den TM- & TM-Sidhi-Forschungskorpus (~461 Studien aus dem jährlich extern gepflegten Spreadsheet der Global Mother Divine Organization) durchsuchbar und bündelt kuratierte **Collections** mit herunterladbaren PDFs.

Die etablierten Konventionen der Plattform ziehen dieses Modul in drei Punkten in eine bestimmte Richtung — und in allen drei würde die konventionelle Wahl hier falsch sein:

1. **Tenant-Scoping.** Alle operativen Daten sind tenant-scoped (`veranstaltungen`, `anmeldungen`, `info_anmeldungen`, … — siehe ADR 0005). Der Forschungskorpus ist jedoch **bewegungsweit und für alle Zentren identisch** — es gibt keine „Münchner Studien". Eine `tenant`-Spalte wäre reine Zeremonie und würde 461 Zeilen pro Zentrum duplizieren.
2. **Locale-Set.** Die Marketing-Site unterstützt DE/EN/FR/ES (siehe CONTEXT → Sprachen). Das Forschungsmodul bedient aber Menschen, die **keine Landingpage-Kunden** sind (z. B. kroatische Lehrer/Forscher). Sein Publikum — und damit sein Sprachbedarf — ist von dem der Site entkoppelt.
3. **Content-Ort.** Grundsatz „Content lives in CMS, layout lives in code". Collections sind aber **redaktionelle, entwicklergeschriebene Artefakte** (Studienauswahl + Klartext-Sätze, verfasst von Bennet + AI), geringe Änderungsrate, profitieren von Review/Versionshistorie — kein Kollegen-editierter Event-Content.

Zusätzlich soll das Modul **später sauber in ein eigenes Codebase extrahierbar** sein, falls es über den Rahmen der Landingpage hinauswächst (u. a. Einbettung in das nationale WordPress von meditation.de).

## Entscheidung

Forschung wird als **globales, nicht tenant-scopedes, extrahierbares Modul** gebaut. Konkret:

1. **Nicht tenant-scoped.** Die `studies`-Tabelle (und die Collection-Definitionen) tragen **keine** `tenant`-Spalte. Jedes Zentrum zeigt denselben Korpus. Forschungs-Queries laufen ohne `WHERE tenant = …`.
2. **Eigenes Locale-Set.** Forschung verwaltet seine eigenen Sprachen, **entkoppelt** von der Site. Neue Forschungs-Locales (z. B. **Croatian**, später) werden **nur** im Forschungsmodul ergänzt — ohne Änderung am site-weiten Language-Switcher oder am Routing.
3. **Collections im Repo.** Collections werden als versionsverwaltete Dateien im Repo verfasst (`src/forschung/collections/*.ts`), nicht im CMS/Admin. DOI-Overrides für nicht automatisch gefundene Links liegen ebenfalls als Repo-Datei vor. Kein Admin-CRUD im MVP.
4. **Dünne Kopplung für Extrahierbarkeit.** Das Modul hält seine Abhängigkeiten zu tenant-/admin-spezifischen Abstraktionen (`getCurrentTenant()`, `checkAdminRequest()`, …) bewusst minimal, damit es als Ganzes herauslösbar bleibt. `/forschung` ist eine eigenständige, iframe-einbettbare Route.

## Konsequenzen

- **Positiv:** eine einzige Datenkopie statt N; Sprachen wachsen dort, wo das Publikum ist, ohne die Site anzufassen; Collections durchlaufen Code-Review und Historie; das Modul kann später als eigenes Produkt/Repo abgespalten und in Fremdsysteme (WordPress) eingebettet werden. Forschung ist zugleich das Studien-Backend, auf das die **Wissenschaft & Forschung**-Section und **Baum des Lebens** Phase 3 ohnehin zielen.
- **Negativ / akzeptiert:** drei bewusste Abweichungen von den Hauskonventionen, die ohne diese ADR überraschen würden. Collections sind für nicht-technische Kolleg:innen nicht editierbar (akzeptiert: es ist redaktioneller Entwickler-Content; ein Admin-UI bleibt eine spätere Option, falls Kolleg:innen selbst Collections anlegen sollen). Ein eigenes Locale-Set bedeutet eine zweite, kleinere i18n-Oberfläche neben next-intl.
- Studientext nutzt die DE-Spalte des Spreadsheets, wo gefüllt; Lücken und weitere Sprachen werden als **jährlicher Batch auf Bennets Claude-Subscription** übersetzt und persistiert — die laufende Site ruft für Forschungstext keine bezahlte API auf (Abweichung von der API-basierten i18n-Pipeline, gerechtfertigt durch die jährliche Kadenz).

## Alternativen

- **Tenant-scoped wie alle operativen Daten** — verworfen: dupliziert einen identischen bewegungsweiten Korpus pro Zentrum ohne Nutzen und erschwert die spätere Extraktion.
- **Site-Locale-Set übernehmen (Croatian erst site-weit)** — verworfen: koppelt den Sprachbedarf eines globalen Forschungspublikums an die Kundenstruktur eines einzelnen Zentrums.
- **Collections im CMS/Admin** — verworfen für MVP: mehr Infrastruktur für redaktionellen, selten geänderten Entwickler-Content; verliert Review/Historie; erschwert Extraktion. Bleibt eine spätere Option.
