# K6.5 – Modellwahl

## Ziel

Die Lernenden erkennen vor jeder Rechnung, ob zwei Größen proportional oder antiproportional zusammenhängen. Zwei Aufgaben starten absichtlich mit demselben Wertepaar `4 → 12`, reagieren beim Verdoppeln aber gegensätzlich.

## Verbindliche Formulierungen

- Leitfrage: „Warum muss ich vor dem Dreisatz wissen, welches Modell vorliegt?“
- Untertitel: „Proportional oder antiproportional?“
- Proportional: „doppelt → doppelt“
- Antiproportional: „doppelt → halb“
- Aha: „Erst Beziehung verstehen, dann rechnen.“

## Lernweg und Reveal-Gates

1. Irritation: Zwei unbenannte Aufgaben zeigen dasselbe Startpaar `4 → 12`.
2. Situationen: Kinokarten und Arbeitszeit werden als unterschiedliche Beziehungen sichtbar.
3. Verdopplung: `4 → 8` führt links zu `12 → 24`, rechts zu `12 → 6`.
4. Modelltest: Links bleibt der Quotient `3`, rechts das Produkt `48` konstant.
5. Rechenweg: Der proportionale Dreisatz führt über den Wert für 1; antiproportional wird die Gegenrichtung beziehungsweise das konstante Produkt benutzt.
6. Erkundung: Beide Modelle bleiben für dieselbe Eingabe synchron; erst jetzt erscheint der Aha-Satz.

Alle späteren Erkenntnisse sind vor ihrem Gate mit `hidden` auch aus dem Accessibility-Tree entfernt.

## Interaktion, Animation und Barrierefreiheit

- Der diskrete Regler bietet 2, 4, 8 und 12 als gemeinsame Eingaben.
- Situation, Wertepaar, Modellregel und Rechnung werden gemeinsam aktualisiert.
- Der Reglername und `aria-valuetext` nennen die tatsächliche Eingabe statt des internen Index.
- Reveal-Animationen sind gesperrt, tokenisiert, abbrechbar und besitzen einen Timeout-Fallback.
- „Bewegung reduzieren“ führt unmittelbar in denselben stabilen Endzustand.
- Zurücksetzen invalidiert laufende Rückrufe und stellt die Irritation wieder her.

## Integration

- K6.5 wird genau einmal als fünfte Kapitel-6-Karte eingebunden.
- Cache-Version wird auf v36 erhöht; sechs neue Laufzeitdateien werden in Service Worker, Pages- und Smoke-Listen aufgenommen.
- Ein eigener Renderer wird im Paket und im Pages-Workflow verdrahtet.
- Keine Speicherung, keine Fremdaufrufe, keine neue Abhängigkeit.
