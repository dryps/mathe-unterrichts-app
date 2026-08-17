# Aha-Modul „Subtraktion negativer Zahlen“ – Design

## Ziel und Grenze

Kapitel 1 erhält genau ein fünftes Aha-Modul zur Frage „Warum ist 4 − (−2) dasselbe wie 4 + 2?“. Das Modul erklärt ausschließlich, dass Subtrahieren die Richtung des zweiten Terms umkehrt. Es führt weder eine allgemeine Vorzeichenregel noch weitere Aufgaben, Eingabefelder, Speicherung oder neue Navigation ein.

## Gewählter Ansatz

Das Modul wird als eigenständiges Schwester-Modul zu `addition-negativ.html` umgesetzt. Es übernimmt die vorhandene Produktstruktur, die gemeinsame Ganzzahl-Zahlengeradenskala und die Trennung von Mathematik, Zustand, Animation und DOM. Das bestehende Additionsmodul und Kapitel 2 bleiben unverändert.

Die Zahlengerade reicht von 0 bis 8. Der Startwert 4 liegt in der Mitte. Der zugelassene negative Subtrahend reicht von −1 bis −4, sodass sowohl der ursprüngliche Linksvektor als auch die umgekehrte Rechtsbewegung vollständig und ohne Vergrößerung sichtbar bleiben.

## Mathematisches Modell

`src/subtraction-negative-geometry.js` berechnet unabhängig von SVG und Animation:

- festen Startwert 4;
- negativen Subtrahenden −1 bis −4;
- Betrag und ursprüngliche Richtung `left`;
- durch Subtraktion invertierte Richtung `right`;
- unveränderte Schrittzahl;
- Ergebnis `4 - subtrahend`;
- deterministische Zwischenwerte und SVG-Koordinaten.

Die Pointerposition steuert ausschließlich den negativen Subtrahenden. Vertikale Pointerkoordinaten fließen nicht in die Mathematik ein.

## Zustände und Bewegung

Die interne Zustandsfolge lautet:

1. `prompt`: nur `4 − (−2) = ?` und die Irritationsfrage;
2. `start`: Zahlengerade und Startpunkt 4;
3. `negative`: ausschließlich der zweite Term und sein Zwei-Schritte-Linksvektor hervorgehoben;
4. `reversing`: zusätzlich äußeres Subtraktionszeichen hervorgehoben, Eingaben gesperrt;
5. `moving`: umgekehrter Rechtsvektor und Punktbewegung `4 → 5 → 6`, Eingaben gesperrt;
6. `result`: drei Gleichungen und Ergebnissatz;
7. `free`: Ziehen des linken Vektorendes für −1 bis −4;
8. `conclusion`: nach der ersten Änderung die große Abschlusserkenntnis.

Die Umkehranimation dreht den Vektor in 1,2 Sekunden um 180° um den Startpunkt. Seine Länge und Schrittzahl bleiben in jedem Frame konstant. Danach beginnt automatisch die getrennte Punktbewegung. Verspätete Frames und ein Sicherheits-Timer enden in demselben deterministischen Zustand; reduzierte Bewegung springt direkt zu den mathematisch korrekten Endzuständen.

## Darstellung und Bedienung

Der Startpunkt verwendet das vorhandene positive Blau, der negative Term und ursprüngliche Linksvektor Violett, das äußere Subtraktionszeichen und die Umkehrung einen ruhigen warmen Akzent. Rechenzeichen und Vorzeichen sind getrennte SVG-Textelemente und getrennt hervorhebbar.

Im freien Zustand bleiben gleichzeitig sichtbar:

- der ursprüngliche negative Linksvektor;
- der durch Subtraktion umgekehrte Rechtsvektor;
- der Ergebnispunkt;
- `4 − (−n) = 4 + n = 4+n`.

Bedienbar sind nur Weiter, Zurücksetzen, der Rücklink und im Endzustand das Vektorende. Touch, Maus und vorhandene Pfeiltastensteuerung verwenden denselben ganzzahligen Einrastpfad.

## Integration

Die Kapitelübersicht erhält eine fünfte gleich breite Karte. Kapitel 1 verwendet im Hochformat ein zentriertes 2+2+1-Raster und im Querformat ein zentriertes 3+2-Raster; Kapitel 2 behält seine Regeln unverändert.

Das Modul wird in Service Worker, Pages-Freigabeliste, Smoke-Test, Offline-Neustart, direkten Modulpfaden und visuellem Zustandsrenderer ergänzt. Der Cache steigt nach Konvention genau einmal von `mathe-unterrichts-app-v14` auf `mathe-unterrichts-app-v15`. Das Manifest benötigt keine Änderung.

## Tests und Abnahme

Die Umsetzung folgt Red–Green–Refactor. Neue Tests schützen Mathematik, Zustandsfolge, längenkonstante Umkehrung, deterministische Bewegung, Eingabesperre, Touch/Maus/Tastatur, Einrasten, Darstellung, Kartenraster, Offline-Cache und Pages-Artefakt. Danach laufen die vollständige bestehende Suite, alle Zustandsrenderer, Smoke-Test, Pages-Build/-Prüfung und eine lokale Browserkontrolle in Hoch- und Querformat.
