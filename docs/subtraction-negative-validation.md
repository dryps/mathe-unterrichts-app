# Validierung: Subtraktion negativer Zahlen

## Fachlicher Kern

Das Modul zeigt ausschließlich die Richtungsumkehr des zweiten Terms:

1. `−2` besitzt Betrag 2 und zeigt nach links.
2. Das äußere Subtraktionszeichen kehrt diesen Vektor bei unveränderter Länge um.
3. Die effektive Bewegung führt von 4 über 5 nach 6.
4. Damit sind `4 − (−2) = 6`, `4 + 2 = 6` und `4 − (−2) = 4 + 2` gleichzeitig sichtbar.

Die reine Mathematik erlaubt nur −1 bis −4 und berechnet alle Ergebnisse unabhängig von DOM, SVG und Animation.

## Zustands- und Eingabeschutz

Automatisierte Tests prüfen Irritation, Startpunkt, Linksvektor, getrennte Hervorhebung von Rechenzeichen und Vorzeichen, längenkonstante 1,2-Sekunden-Umkehrung, Rechtsbewegung, Ergebnis, freie Erkundung und Abschluss. Während beider Animationen sind Weiter, Reset und Ziehen gesperrt. Touch, Maus und Tastatur verwenden denselben ganzzahligen Einrastpfad; die vertikale Pointerkoordinate wird ignoriert.

## Integration

Kapitel 1 besitzt fünf gleich breite Karten: Hochformat 2+2+1, Querformat 3+2. Kapitel 2 behält sein vorhandenes Raster. Das Modul ist in die explizite Pages-Freigabeliste, den Smoke-Test, den Offline-Neustart und Cache `mathe-unterrichts-app-v15` aufgenommen. Der Pages-Workflow führt zusätzlich `npm run test:subtraction-visual` aus.

## Manuelle Abnahme

- Im ersten Zustand darf keine Zahlengerade sichtbar sein.
- Beim dritten Weiter-Tipp muss der violette Linksvektor ruhig um 180° drehen, ohne seine Länge zu ändern.
- Danach muss der Punkt exakt `4 → 5 → 6` durchlaufen.
- Im freien Zustand müssen Linksvektor, Rechtsvektor, Ergebnispunkt und alle drei Gleichungen gemeinsam sichtbar bleiben.
- Ziehen des violetten Endpunkts muss ausschließlich −1, −2, −3 oder −4 erzeugen.
- Hochformat, Querformat, kleine Breite und Klassenraumbildschirm dürfen weder Überlauf noch unterschiedlich breite Kapitelkarten zeigen.
