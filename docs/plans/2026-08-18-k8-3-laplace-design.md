# K8.3 – Laplace-Wahrscheinlichkeit

## Ziel und Vergleich

Zwei Glücksräder tragen dieselben vier Beschriftungen. Rad A hat vier gleich große 90°-Felder. Rad B hat Felder mit 180°, 72°, 60° und 48°. Für Ergebnis 1 liefert bloßes Zählen bei beiden Rädern `1/4`; bei Rad B nimmt dieses Feld aber die Hälfte des Kreises ein und hat deshalb Wahrscheinlichkeit `1/2`. Auch in der Erkundung stimmt kein Anteil von Rad B zufällig mit dem reinen Zählergebnis `1/4` überein.

## Lernweg

`irritation → count → areas → probability → explore`

1. Beide Räder zeigen dieselben vier Ergebnisse.
2. Reines Zählen erzeugt zweimal `1 von 4`.
3. Die Feldgrößen werden sichtbar: nur Rad A verteilt die Chancen gleich.
4. Die tatsächlichen Wahrscheinlichkeiten `1/4` und `1/2` widerlegen den bloßen Beschriftungsvergleich.
5. In der Erkundung lassen sich alle vier Ergebnisse vergleichen; Rad A bleibt stets bei `1/4`, Rad B folgt mit `1/2`, `1/5`, `1/6` und `2/15` der jeweiligen Feldgröße.

Alle späteren Aussagen sind bis zu ihrem Gate mit `hidden` aus Darstellung und Accessibility Tree entfernt. Der Ergebnisregler verändert beide Räder, beide Rechnungen und alle zugänglichen Namen aus demselben Zustandsmodell.

## Grenzen

Das Modul erklärt ausschließlich die Laplace-Bedingung gleich wahrscheinlicher Elementarereignisse. Es enthält keine Simulation und keine Aussage über relative Häufigkeiten; diese gehören zu K8.4. Keine Speicherung, Übungsplattform oder zweistufigen Zufallsexperimente.
