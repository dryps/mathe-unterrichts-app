# K4.1 – Äquivalenzumformungen: Design

## Ziel

Die digitale Gleichungswaage macht am Beispiel `3x + 5 = 20` sichtbar, warum nur dieselbe zulässige Operation auf beiden Seiten die Lösungsmenge erhält.

## Lernweg

1. Die Ausgangsgleichung ist für `x = 5` im Gleichgewicht.
2. Nur links werden fünf entfernt; die Waage kippt und die Lösungsmenge ändert sich.
3. Die Ausgangsgleichung wird wiederhergestellt.
4. Auf beiden Seiten werden fünf entfernt: `3x = 15`.
5. Beide Seiten werden durch drei geteilt: `x = 5`.
6. Eine lokale Erkundung variiert dieselbe Addition auf beiden Seiten von `−8` bis `+8`.
7. Der Abschluss formuliert wortgetreu: „Zulässige gleiche Operationen auf beiden Seiten erhalten die Lösungsmenge.“

## Technischer Vertrag

- Reine lineare Gleichungslogik, Zustandsmodell und deterministische Tilt-Animation sind getrennt.
- Ein Reset neutralisiert laufende Animationsrückrufe.
- Reduced Motion springt ohne Zwischenanimation in den Zielzustand.
- Keine Speicherung, Fremdaufrufe, Konten oder Telemetrie.
- Die Startseiten-, Offline-, Pages- und Release-Integration erfolgt in einem getrennten Commit.
