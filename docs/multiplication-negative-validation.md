# Validierung: Multiplikation negativer Zahlen

## Fachlicher Kern

Das Modul erklärt das positive Produkt nicht mit einer bloßen Merkregel, sondern
durch die Fortsetzung eines bekannten Musters bei festem zweiten Faktor `−2`:

1. `3 · (−2) = −6`, `2 · (−2) = −4`, `1 · (−2) = −2`, `0 · (−2) = 0`.
2. Wird der erste Faktor um 1 kleiner, wächst das Produkt exakt um 2.
3. Das Muster läuft mit `0 → 2` über die Null weiter.
4. Deshalb folgen `(−1) · (−2) = 2`, `(−2) · (−2) = 4` und `(−3) · (−2) = 6`.

Die reine Mathematik deckt alle ersten Faktoren von −4 bis +4 ab. Der zweite
Faktor ist unveränderlich `−2`; Pixelpositionen und Animationen beeinflussen
kein Produkt.

## Zustands- und Eingabeschutz

Automatisierte Tests prüfen Irritation, bekannte Produkte, `+2`-Muster,
Nullübergang, Bestätigung, freie Erkundung und Abschluss. Jede Einblendung sperrt
Weiter, Reset und Faktorbewegung; schnelle Mehrfachtipps starten keinen zweiten
Übergang. Reduced Motion erzeugt direkt denselben mathematischen Endzustand.

Touch und Maus verwenden denselben Pointer-Event-Pfad. Die vertikale
Pointerkoordinate wird ignoriert. Der einzige Regler rastet auf ganze Werte von
−4 bis +4 ein und unterstützt `ArrowLeft` und `ArrowRight`.

## Integration

Kapitel 1 besitzt sechs gleich breite Karten: Hochformat `2+2+2`, Querformat
`3+3`. Kapitel 2 bleibt unverändert. Das Modul ist in Pages-Freigabeliste,
Smoke-Test, Offline-Neustart und Cache `mathe-unterrichts-app-v16` aufgenommen.
Der Pages-Workflow führt zusätzlich `npm run test:multiplication-visual` aus.

## Manuelle Abnahme

- Im ersten Zustand dürfen weder Muster, Zahlengerade noch Merkregel sichtbar sein.
- Die bekannten Produkte müssen als `−6 → −4 → −2 → 0` erscheinen.
- Jeder sichtbare Produktschritt muss exakt mit `+2` bezeichnet sein.
- Der Übergang `0 → 2` muss vor den weiteren negativen Faktoren hervorgehoben werden.
- Erst nach dem Verständnis darf `negativ · negativ → positiv` sekundär erscheinen.
- Im freien Zustand darf ausschließlich der erste Faktor −4 bis +4 veränderbar sein.
- Touch, Maus und Tastatur müssen dieselben ganzzahligen Produkte erzeugen.
- Hochformat, Querformat, kleine Breite und Klassenraumbildschirm dürfen keine
  abgeschnittenen Formeln oder horizontalen Überläufe zeigen.
