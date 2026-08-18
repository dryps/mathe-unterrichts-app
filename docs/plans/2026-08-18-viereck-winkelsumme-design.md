# K5.3 – Winkelsumme im Viereck

## Ziel

Das Modul beantwortet die Frage „Warum sind es im Viereck immer 360°?“ an einem konvexen dynamischen Viereck. Eine Diagonale zerlegt die Figur sichtbar in zwei Dreiecke. Erst danach wird die Rechnung `180° + 180° = 360°` freigegeben. In der Erkundung verändern sich die vier Einzelwinkel, während ihre sichtbare Summe exakt 360° bleibt.

## Lernfolge

1. Unmarkiertes konvexes Viereck als Irritation.
2. Diagonale von A nach C erscheint.
3. Die beiden entstehenden Dreiecke werden getrennt hervorgehoben.
4. `180° + 180° = 360°` wird sichtbar.
5. Erkundung: Ein Regler verformt das Viereck; vier Winkelwerte ändern sich, die Summe bleibt 360°.

Jeder kontrollierte Übergang ist gesperrt, bis seine ruhige 650-ms-Einblendung beendet ist. Bei reduzierter Bewegung endet er sofort. Zurücksetzen verwirft auch noch laufende Callback-Frames.

## Mathematik und Grenzen

- Es werden ausschließlich streng konvexe Vierecke erzeugt.
- Die Innenwinkel werden aus Vektoren berechnet; kein Ergebnis ist hart codiert.
- Eine Größte-Reste-Rundung verteilt Rundungsfehler so, dass die vier sichtbaren Winkel exakt 360° ergeben.
- Beide Teil-Dreiecke werden unabhängig geprüft und ergeben jeweils 180°.
- Das Modul behauptet nichts über selbstüberschneidende oder konkave Vierecke.

## Barrierefreiheit und Datenschutz

Vor dem jeweiligen Gate bleiben Diagonale, Dreiecksfarben, Rechnung, Winkelwerte und Erkundung mit echtem `hidden` außerhalb des Accessibility-Baums. Der SVG-Alternativtext beschreibt immer nur den sichtbaren Stand. Die App arbeitet vollständig lokal, ohne externe Requests, Tracking oder Speicherung.
