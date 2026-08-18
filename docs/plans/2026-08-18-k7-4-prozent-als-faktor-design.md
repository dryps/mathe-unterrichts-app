# K7.4 – Prozent als Faktor

## Ziel

Die Frage „Warum ist 25 % dasselbe wie 0,25?“ wird als sichtbare, schrittweise Transformation beantwortet. Das Modul bleibt lokal, speicherfrei und offline nutzbar.

## Verbindlicher Lernweg

1. Irritation: Nur `25 %` ist sichtbar.
2. Hundertstel: `25 / 100` wird ergänzt.
3. Kürzen: `1 / 4` wird ergänzt.
4. Dezimalfaktor: `0,25` wird ergänzt.
5. Anwenden: `0,25 · 80 = 20` wird ergänzt; gleichzeitig wird geklärt, warum nicht `25 · 80` gerechnet wird.
6. Erkunden: Prozentsatz, Hundertstelbruch, gekürzter Bruch, Dezimalfaktor, Ganzes und Ergebnis ändern sich gemeinsam.

Jeder spätere Schritt bleibt vorher mit echtem `hidden` auch aus dem Accessibility-Baum entfernt. Reveal-Animationen sind gesperrt, tokenisiert, resetfest und bei Reduced Motion unmittelbar stabil.

## Mathematik

Die Erkundung nutzt vier exakt endliche Beispiele:

- `10 % = 10/100 = 1/10 = 0,1`; `0,1 · 60 = 6`
- `25 % = 25/100 = 1/4 = 0,25`; `0,25 · 80 = 20`
- `40 % = 40/100 = 2/5 = 0,4`; `0,4 · 50 = 20`
- `75 % = 75/100 = 3/4 = 0,75`; `0,75 · 40 = 30`

Der sichtbare Dezimalwert nutzt das deutsche Komma. Der zugängliche Name des diskreten Reglers enthält zusätzlich zur technischen Indexposition die vollständige aktuelle Beziehung.

## Aha

„Ein Prozentsatz lässt sich als Dezimalfaktor ausdrücken.“
