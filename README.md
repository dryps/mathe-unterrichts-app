# Mathe-App für den Unterricht

Eine eigenständige Sammlung kurzer interaktiver Aha-Momente für den Mathematikunterricht.
Die App ergänzt GoodNotes nur dort, wo Bewegung und dynamische Veränderung einen
sichtbaren fachlichen Mehrwert bieten.

Die Startseite „Mathe im Unterricht“ ist direkt dem Bereich „Klasse 7“
zugeordnet. Sie führt über große Karten zu den Buchkapiteln „1. Rationale
Zahlen“ und „2. Dreiecke“. Jedes Modul besitzt einen einzigen Rückweg zu seiner
Kapitelübersicht.

## Kapitel 1: Aha-Module

**Warum liegen negative Zahlen links von der Null?**

*Zahlengerade*

Unter `zahlengerade.html` bewegt sich ein Punkt zuerst von 0 nach rechts bis 3,
dann zurück zur Null und schließlich weiter bis −3. Erst danach wird der Punkt
für Touch, Maus und Tastatur freigegeben. Er bleibt exakt auf der horizontalen
Zahlengeraden, rastet auf ganze Zahlen von −3 bis +3 ein und macht so die beiden
entgegengesetzten Richtungen sichtbar.

**Warum ist −8 kleiner als −3?**

*Ordnung*

Unter ordnung.html stehen zunächst nur −8 und −3 als neutraler Denkimpuls
gegenüber. Danach erscheinen die Zahlengerade und die beiden Positionen ruhig
nacheinander. Der sichtbare Vergleich −8 < −3 folgt aus der Lage: −3 liegt
weiter rechts und ist deshalb größer. Im Endzustand rastet ein großer Punkt per
Touch, Maus oder Tastatur auf ganzen Zahlen von −10 bis +3 ein.

**Warum wird beim Betrag das Vorzeichen unwichtig?**

*Abstand zur Null*

Unter `betrag.html` wird `|−4|` schrittweise als Abstand von −4 zur Null
sichtbar. Zuerst zeigt das Vorzeichen nur die Richtung, danach gliedern vier
gleich große Einheiten den Abstand. Der Vergleich mit +4 macht sichtbar, dass
entgegengesetzte Richtungen denselben Abstand besitzen können. Im Endzustand
rastet ein großer Punkt per Touch, Maus oder Tastatur auf ganzen Zahlen von −6
bis +6 ein; Zahl, Abstand und Betragsschreibweise aktualisieren sich gemeinsam.

**Warum ist 3 + (−5) nicht 8?**

*Addition negativer Zahlen*

Unter `addition-negativ.html` wird das äußere Rechenzeichen vom Vorzeichen des
zweiten Summanden getrennt gelesen. Die Zahlengerade zeigt fünf gleiche Schritte
von 3 nach links bis −2. Im Endzustand lässt sich ausschließlich der negative
Summand von −1 bis −6 durch Ziehen des Pfeilendes verändern.

**Warum ist 4 − (−2) dasselbe wie 4 + 2?**

*Subtraktion negativer Zahlen*

Unter `subtraktion-negativ.html` zeigt der zweite Term zunächst zwei Einheiten
nach links. Das äußere Subtraktionszeichen kehrt diesen gleich langen Vektor
ruhig um; danach bewegt sich der Punkt von 4 über 5 nach 6. Im Endzustand lässt
sich ausschließlich der negative Subtrahend von −1 bis −4 durch Ziehen des
violetten Pfeilendes verändern.

**Warum wird aus Minus mal Minus Plus?**

*Multiplikation negativer Zahlen*

Unter `multiplikation-negativ.html` wird das Produktmuster mit dem festen zweiten
Faktor `−2` fortgesetzt. Während der erste Faktor von 3 bis 0 jeweils um 1
kleiner wird, wächst das Produkt von −6 bis 0 jeweils um 2. Dieselbe Fortsetzung
über die Null erklärt `(−1) · (−2) = 2`, `(−2) · (−2) = 4` und
`(−3) · (−2) = 6`. Erst danach erscheint die verkürzte Vorzeichenregel. Im
Endzustand lässt sich ausschließlich der erste Faktor ganzzahlig von −4 bis +4
verändern; der zweite Faktor bleibt fest `−2`.

## Kapitel 2: Erstes Aha-Modul

**Warum bleiben es immer 180°?**  
*Winkelsumme im Dreieck*

Unter `winkelsumme.html` lassen sich die drei Eckpunkte eines großen Dreiecks mit
Touch, Maus oder Tastatur verschieben. Innenwinkel, Winkelbögen und die Rechnung
`α + β + γ = 180°` aktualisieren sich unmittelbar.

## Zweites Aha-Modul

**Wann kann überhaupt ein Dreieck entstehen?**

*Dreiecksungleichung*

Unter `dreiecksungleichung.html` lassen sich drei ganzzahlige Seitenlängen von 1 bis
20 mit großen Plus- und Minus-Schaltflächen verändern. Die längste Seite wird
automatisch als Grundseite verwendet. Zwei Zirkelbögen zeigen unmittelbar, ob sie
sich in zwei Punkten schneiden, genau berühren oder nicht erreichen. Parallel
erscheint die konkrete Beziehung der beiden kürzeren Seiten zur längsten Seite.

## Drittes Aha-Modul

**Warum wird bei der Dreiecksfläche durch 2 geteilt?**

*Flächeninhalt*

Unter `dreiecksflaeche.html` bleibt die Grundseite `g` fest und horizontal,
während die obere Spitze per Touch, Maus oder Tastatur bewegt werden kann. Die
senkrechte Höhe `h`, ihr Fußpunkt und der rechte Winkel bleiben sichtbar. Über
„Zweites Dreieck ergänzen“ dreht sich eine halbtransparente kongruente Kopie in
1,7 Sekunden ruhig in ihre Zielposition. Danach bilden beide unterscheidbaren
Dreieckshälften exakt ein Parallelogramm und die Beziehungen
`A_Parallelogramm = g · h` sowie `A_Dreieck = (g · h) / 2` erscheinen.

Die mathematische Zielgeometrie wird unabhängig von der Animation berechnet.
Die Spitze bleibt innerhalb eines lesbaren Bereichs oberhalb der Grundseite,
sodass der Höhenfuß immer innerhalb von `g` liegt. Nach der Ergänzung passt sich
das vollständige Parallelogramm unmittelbar an weitere Spitzenbewegungen an.

## Viertes Aha-Modul

**Warum treffen sich die Mittelsenkrechten genau dort?**

*Mittelsenkrechten und Umkreis*

Unter `mittelsenkrechten.html` bewegt sich P ausschließlich auf der ersten
Mittelsenkrechten, sodass `PA = PB` sichtbar bleibt. Danach erscheinen zweite und
dritte Mittelsenkrechte, ihr gemeinsamer Schnittpunkt M mit `MA = MB = MC` und
schließlich der Umkreis. Im Endzustand lassen sich A, B und C bewegen; sämtliche
Mittelpunkte, Mittelsenkrechten, Radiusstrecken und der Kreis folgen unmittelbar.

## Fünftes Aha-Modul

**Warum treffen sich die Winkelhalbierenden genau dort?**

*Winkelhalbierende und Inkreis*

Unter `winkelhalbierende.html` bewegt sich P ausschließlich auf der ersten
inneren Winkelhalbierenden. Seine senkrechten Lotstrecken zu AB und AC bleiben
gleich lang. Danach erscheinen die übrigen Winkelhalbierenden, ihr gemeinsamer
Schnittpunkt I und drei gleich markierte Seitenabstände. Im letzten Schritt zeigt
der Inkreis, dass diese gemeinsame Entfernung sein Radius ist. Erst dann lassen
sich A, B und C bewegen; Winkelhalbierende, I, Lotfüße, Berührpunkte und Inkreis
folgen unmittelbar.

## Sechstes Aha-Modul

**Warum reichen manche Angaben aus – und andere nicht?**

*Eindeutige Dreiecke*

Unter `eindeutige-dreiecke.html` erzeugen zwei Kreisbögen zunächst zwei
spiegelbildliche Lagen mit exakt denselben drei Seiten. Eine starre, ruhige
Bewegung legt die untere Lage deckungsgleich auf die obere. Danach zeigen ein
fester Winkelstrahl und ein Kreis zwei verschiedene Schnittpunkte: Beide
Dreiecke erfüllen dieselbe sichtbare Grundseiten-, Seiten- und Winkelvorgabe,
sind aber nicht kongruent.

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
- Geometriemodule getrennt von DOM- und SVG-Darstellung
- Offline-Cache über einen Service Worker
- keine Anmeldung, Speicherung, Cookies, Analyse oder externe API
- keine Schülerdaten und keine externen Netzwerkaufrufe
- keine Zahlenaufgaben, Eingabefelder oder gespeicherten Modulzustände

## Lokal starten und prüfen

Voraussetzung: Node.js 20 oder neuer.

```bash
npm test
npm run test:smoke
npm run test:circumcircle-visual
npm run test:incircle-visual
npm run test:unique-visual
npm run test:number-line-visual
npm run test:order-visual
npm run test:absolute-visual
npm run test:addition-visual
npm run test:subtraction-visual
npm run test:multiplication-visual
npm start
```

Danach ist die App unter `http://127.0.0.1:4173` erreichbar.

## Dauerhafte iPad-Bereitstellung

Der Workflow `.github/workflows/pages.yml` prüft `main`, erzeugt über
`npm run build:pages` ein explizit freigegebenes statisches Artefakt und
veröffentlicht es über GitHub Pages. Details zu Dateiumfang, Öffentlichkeit,
Suchmaschinensperre und Datenschutz stehen unter `docs/github-pages.md`.

## Bewusste Grenze des Piloten

Die optionale Animation „Winkel zusammenlegen“ ist nicht Teil von V1. Sie bleibt
als mögliche V2-Erweiterung offen, damit das erste Modul im Unterricht fokussiert
und technisch klein bleibt.
