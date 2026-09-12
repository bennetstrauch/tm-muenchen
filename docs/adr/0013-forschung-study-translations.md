# ADR 0013 — Forschung-Studientext: `study_translations`-Tabelle + Offline-Übersetzungs-Batch

## Status
Accepted (2026-09-12)

## Kontext

Der Forschungskorpus (`studies`, ADR 0012) ist die **englische** Quelle: Sheet 1 („All Research") liefert die strukturierten Spalten und den englischen Abstract. Das deutsche Sheet („Alle Forschung") übersetzt zwar die **strukturierten** Spalten (Topic, Specialty, Specific Results, Field), sein **Abstract (Spalte H) ist jedoch weiterhin englisch**. Deutsche Abstracts sowie sämtlicher FR/ES-Studientext existieren in der Quelle nicht.

Das MVP soll die Bibliothek **zuerst auf Deutsch** kohärent machen (die sichtbarste Stelle ist die Kartenüberschrift = Specific Results) und später FR/ES ergänzen — ohne dass die laufende Site je eine Übersetzungs-API aufruft (ADR 0012). Zwei Fragen sind zu entscheiden: **wo** übersetzter Studientext liegt und **wie** er entsteht.

Die bisherige Konvention (`abstract_de`, `citation_raw_de` als Spalten neben den englischen) skaliert schlecht: jede weitere Sprache (FR, ES, später **Kroatisch**) und jedes weitere Feld (`specific_results`, `title`, `specialty` …) verlangt eine neue Spalte und damit eine Schemaänderung — im Widerspruch zu ADR 0012 („neue Forschungs-Locale ohne strukturelle Änderung").

## Entscheidung

1. **`study_translations`-Tabelle statt Pro-Sprache-Spalten.** Übersetzter **Anzeigetext** liegt in einer schmalen Tabelle `study_translations(study_id, locale, field, value)` (nicht tenant-scoped, wie `studies`). Die `studies`-Zeile bleibt die **kanonisch englische** Source of Record; jede andere Sprache — inklusive Deutsch — ist ein Overlay. Eine neue Locale ist ein Satz neuer Zeilen, **keine** Schemaänderung.
2. **Taxonomie-Schlüssel bleiben englisch.** `topic` und `specialty` bleiben auf der `studies`-Zeile die kanonischen englischen **Filter-Schlüssel**; ihre Übersetzung ist reiner **Anzeigetext** (Topic über ein festes 4-Wert-Label-Set, Specialty über `study_translations`). `filterStudies`/`specialtiesForTopic` bleiben locale-unabhängig.
3. **Gratis-Deutsch aus dem Sheet wandert in die Tabelle.** Der Import schreibt das deutsche Strukturtext-Material des DE-Sheets als `locale='de'`-Zeilen in `study_translations` — er überschreibt **nicht** die englischen Basisspalten.
4. **Read-Path überlagert bei Bedarf.** `getStudies(locale)` legt vorhandene Übersetzungen über die englische Basis; fehlt ein Feld, greift der englische Fallback mit „translation pending"-Kennzeichnung.
5. **Übersetzungs-Batch offline, persistiert, nie zur Laufzeit.** Fehlender Text (DE-Abstracts zuerst, FR/ES später) entsteht in einem **Build-/Autorenzeit-Batch**: maschineller Erstentwurf (z. B. DeepL) + Claude-Nachschliff unter Wiederverwendung von `src/i18n/translation-glossary.json`/`translation-locks.json`. Das Ergebnis wird als **committete JSON** (`data/forschung/translations/{locale}.json`, analog `data/forschung/doi-cache.json`) abgelegt und vom Import in `study_translations` upgesertet. Die laufende Site liest ausschließlich persistierten Text.

## Konsequenzen

- **Positiv:** neue Locale = Daten, kein Schema; englische Quelle bleibt unangetastet; ein einziger Read-Path für alle Sprachen; Batch-Übersetzungen durchlaufen Code-Review/Historie und sind reproduzierbar; keine Laufzeit-API-Kosten; das Modul bleibt extrahierbar. Das „Gratis-Deutsch" des Sheets macht die Bibliothek sofort weitgehend deutsch (Überschriften/Filter), bevor überhaupt übersetzt wird.
- **Negativ / akzeptiert:** `getStudies(locale)` braucht einen Join/Overlay statt eines flachen `select *`; Übersetzungen sind gegenüber `studies` per Konvention (nicht per FK, da nicht tenant-scoped und import-getrieben) referenzintegr; die committeten Translation-JSONs können groß werden (458 Studien × Felder × Locales) — akzeptiert wie bei `doi-cache.json`.

## Alternativen

- **Pro-Sprache-Spalten weiterführen (`abstract_fr`, `specific_results_es`, …)** — verworfen: jede Locale/jedes Feld ist eine Schemaänderung; widerspricht „Locale ohne strukturelle Änderung" (ADR 0012).
- **Deutsch in die Basisspalten schreiben** — verworfen: zerstört die englische Source of Record und den einheitlichen Locale-Overlay; EN würde zum Sonderfall.
- **Laufzeit-Übersetzung (API/CI-Pipeline wie die Marketing-Site)** — verworfen durch ADR 0012: laufende Kosten und Latenz für einen jährlich stabilen Korpus.
