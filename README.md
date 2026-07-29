# Mathe-App für den Unterricht

Eine eigenständige Sammlung kurzer interaktiver Aha-Momente für den Mathematikunterricht.
Die App ergänzt GoodNotes nur dort, wo Bewegung und dynamische Veränderung einen
sichtbaren fachlichen Mehrwert bieten.

Die Startseite „Mathe im Unterricht“ führt über große Karten zum Kapitel
„Dreiecke“. Beide Module besitzen einen einzigen Rückweg zur Kapitelübersicht.

## Erstes Aha-Modul

**Warum bleiben es immer 180°?**  
*Winkelsumme im Dreieck*

Unter `winkelsumme.html` lassen sich die drei Eckpunkte eines großen Dreiecks lassen sich mit Touch, Maus oder Tastatur
verschieben. Innenwinkel, Winkelbögen und die Rechnung
`α + β + γ = 180°` aktualisieren sich unmittelbar.

## Zweites Aha-Modul

**Wann kann überhaupt ein Dreieck entstehen?**

*Dreiecksungleichung*

Unter `dreiecksungleichung.html` lassen sich drei ganzzahlige Seitenlängen von 1 bis
20 mit großen Plus- und Minus-Schaltflächen verändern. Die längste Seite wird
automatisch als Grundseite verwendet. Zwei Zirkelbögen zeigen unmittelbar, ob sie
sich in zwei Punkten schneiden, genau berühren oder nicht erreichen. Parallel
erscheint die konkrete Beziehung der beiden kürzeren Seiten zur längsten Seite.

## Mathematische Regeln

- Die Innenwinkel werden aus den tatsächlichen Punktkoordinaten mit Skalarprodukt
  und Arkuskosinus berechnet.
- Intern bleibt die Berechnung ungerundet.
- Sichtbar erscheinen ganze Gradwerte. Dafür werden zunächst alle drei exakten
  Winkel abgerundet. Die noch bis 180 fehlenden Grad werden in der Reihenfolge der
  größten Nachkommareste verteilt. Dadurch liegt jeder sichtbare Einzelwert weniger
  als 1° vom exakten Wert entfernt und die sichtbare Summe ist immer exakt 180°.
- Jeder Eckpunkt bleibt innerhalb der Zeichenfläche.
- Zwischen zwei Eckpunkten gelten mindestens 150 Einheiten Abstand.
- Dreiecke unter 24.000 Flächeneinheiten sowie Innenwinkel unter 12° werden
  abgewiesen. Beim Ziehen bleibt dann der letzte gültige Zustand erhalten.

## Technik und Datenschutz

- statische Web-App ohne Framework und ohne Laufzeitabhängigkeiten
- Geometriemodul getrennt von DOM- und SVG-Darstellung
- Offline-Cache über einen Service Worker
- keine Anmeldung, Speicherung, Cookies, Analyse oder externe API
- keine Schülerdaten und keine externen Netzwerkaufrufe

## Lokal starten und prüfen

Voraussetzung: Node.js 20 oder neuer.

```bash
npm test
npm run test:smoke
npm start
```

Danach ist die App unter `http://127.0.0.1:4173` erreichbar.

## Bewusste Grenze des Piloten

Die optionale Animation „Winkel zusammenlegen“ ist nicht Teil von V1. Sie bleibt
als mögliche V2-Erweiterung offen, damit das erste Modul im Unterricht fokussiert
und technisch klein bleibt.

