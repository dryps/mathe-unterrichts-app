# K6.2 – Proportionale Zuordnungen

## Ziel

Die Lernenden vergleichen zwei Beziehungen, deren Werte beide wachsen. Eine Heftpreis-Zuordnung `y = 2x` ist proportional; eine Taxipreis-Zuordnung `y = 2x + 3` wächst ebenfalls, ist wegen des Grundpreises aber nicht proportional.

## Kontrollierter Lernweg

1. Irritation: Beide Beziehungen wachsen; die Leitfrage bleibt offen.
2. Werte: Situationen, Wertpaare und Tabellen werden nebeneinander sichtbar.
3. Quotient: Nur beim Heftpreis bleibt `y : x = 2` konstant.
4. Ursprung: Nur der proportionale Graph geht durch `(0 | 0)`; der Taxipreis startet bei `(0 | 3)`.
5. Skalierung: Verdoppeln von `x` verdoppelt nur beim Heftpreis `y`.
6. Erkundung: Ein gemeinsamer Regler synchronisiert Situation, Tabellenzeile, Wertepaar und Graphpunkt beider Beziehungen. Erst hier erscheint der exakte Aha-Satz.

## Fachliche Invarianten

- Heftpreis: `y = 2x`, konstanter Quotient `2`, Ursprung enthalten, Verdopplung skaliert exakt.
- Taxipreis: `y = 2x + 3`, positiver Grundwert `3`, Quotient nicht konstant, Verdopplung des Inputs verdoppelt den Output nicht.
- Gemeinsames Steigen ist in beiden Fällen sichtbar und wird nicht mit Proportionalität gleichgesetzt.

## Bedienung und Zugänglichkeit

- Vor jedem Gate bleiben spätere Begründungen wirklich `hidden`.
- Weiter-Schritte sind während der kurzen Reveal-Animation gesperrt; Reset invalidiert alte Rückrufe; Reduced Motion endet sofort stabil.
- Der gemeinsame Regler ist erst in der Erkundung aktiv.
- Beide Graphen erhalten dynamische, wertgenaue zugängliche Namen.
- Die Darstellung bleibt lokal, ohne Speicherung und ohne Fremdaufrufe.
