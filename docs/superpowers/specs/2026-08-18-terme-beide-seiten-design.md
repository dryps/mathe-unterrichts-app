# K4.2 – Terme auf beiden Seiten: Design

## Ziel

Das Modul ersetzt die missverständliche Vorstellung eines „springenden“ Terms durch die sichtbare Äquivalenzumformung am Beispiel `5x + 3 = 2x + 18`.

## Lernweg

1. Die Ausgangsgleichung zeigt x-Terme auf beiden Seiten.
2. Dieselbe Gruppe `2x` wird links und rechts markiert.
3. Beide Gruppen verschwinden synchron in 900 Millisekunden.
4. Sichtbar bleibt `3x + 3 = 18`.
5. Eine lokale Erkundung variiert die gemeinsame x-Gruppe von `1x` bis `4x`; nach beidseitiger Entfernung bleibt stets dieselbe reduzierte Gleichung.
6. Der Abschluss formuliert wortgetreu: „‚Rüberbringen‘ ist verkürzte Schreibweise einer Äquivalenzumformung.“

## Technischer Vertrag

- Reine Algebra, Zustandsmodell und deterministische Entfernung sind getrennt.
- Laufende RAF- und Timeout-Rückrufe werden beim Reset neutralisiert.
- Reduced Motion beendet die Entfernung direkt.
- Keine Speicherung, Fremdaufrufe, Konten oder Telemetrie.
- Startseite, Cache, Pages, Smoke und Workflow folgen in einem getrennten Integrationscommit.
