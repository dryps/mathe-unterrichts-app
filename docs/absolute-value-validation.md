# Aha-Modul: Betrag als Abstand zur Null

Prüfdatum: 31. Juli 2026

## Sichtbarer Funktionsumfang

- Leitfrage „Warum wird beim Betrag das Vorzeichen unwichtig?“
- Untertitel „Abstand zur Null“
- anfänglich ausschließlich `|−4| = ?` und „Was misst der Betrag eigentlich?“
- Richtung von 0 nach −4 als Bedeutung des Vorzeichens
- Abstand von −4 zur Null in vier exakt gleich großen Einheiten
- sichtbare Beziehung `|−4| = 4`
- Gegenüberstellung der gleich langen Abstände von −4 und +4
- sichtbare Beziehung `|−4| = |4| = 4`
- großer frei beweglicher Punkt im Endzustand
- ganzzahliges Einrasten auf −6 bis +6
- dynamische Zahl, Abstandsstrecke und Betragsschreibweise
- „Weiter“, „Zurücksetzen“ und Rücklink „← Rationale Zahlen“

Nicht vorhanden sind Rechenaufgaben, Betragsgleichungen, Antwortauswahl,
Bewertung, Sachmodelle, freie Eingaben, Speicherung oder externe Dienste.

## Mathematische Konstruktion

Das SVG-Koordinatensystem besitzt 1400 × 520 Einheiten. Die Zahlengerade liegt
horizontal auf y = 270. Ihre ganzzahligen Positionen reichen von x = 115 für
−6 bis x = 1285 für +6. Der Abstand zweier benachbarter ganzer Zahlen beträgt
exakt 97,5 SVG-Einheiten; die Null liegt exakt bei x = 700.

Die reine Funktion `absoluteValue` berechnet den Betrag als absolute Differenz
zur Null. `distanceSegmentToZero` erzeugt daraus unabhängig von SVG und DOM:

- den eingerasteten ganzzahligen Wert,
- den nichtnegativen Abstand,
- die sortierten Endpunkte der Abstandsstrecke,
- die gerichtete Strecke von 0 zur Zahl,
- sämtliche Grenzen der gleich großen Einheitsabschnitte.

Damit gelten exakt `|−6| = 6`, `|−4| = 4`, `|0| = 0`, `|4| = 4`,
`|6| = 6` und allgemein `|−x| = |x|`. Eine Strecke der Länge null besitzt
identische Endkoordinaten und wird durch einen geraden Linienabschluss nicht
künstlich verlängert.

## Zustandsfolge und Übergänge

1. Irritation ohne Zahlengerade oder Lösung.
2. Gesperrte ruhige Richtungsdarstellung von 0 nach −4.
3. Stabile Erkenntnis „Das Vorzeichen zeigt die Richtung.“
4. Gesperrte Einblendung der vier Abstandseinheiten und `|−4| = 4`.
5. Stabile Erkenntnis „Der Betrag misst den Abstand zur Null.“
6. Gesperrte Gegenüberstellung des gleich langen Abstands von +4.
7. Stabile Erkenntnis zu verschiedenen Richtungen mit gleichem Abstand.
8. Gesperrte Freigabe des beweglichen Punkts.
9. Freies Einrasten von −6 bis +6.
10. Nach der ersten echten Bewegung die Abschlusserkenntnis:
    „Der Betrag sagt, wie weit eine Zahl von der Null entfernt ist – nicht auf
    welcher Seite sie liegt.“

Alle mathematischen Endzustände werden direkt aus Zustand und Geometrie
gerendert. Die Animation verändert ausschließlich Deckkraft und den sichtbaren
Fortschritt des Richtungspfeils. Schnelle Mehrfachtipps und Ziehversuche bleiben
während gesperrter Übergänge wirkungslos.

## Architektur und Wiederverwendung

- `number-line-geometry.js` bleibt die unveränderte gemeinsame Ganzzahlskala.
- `absolute-value-geometry.js` konfiguriert −6 bis +6 und enthält reine Betrags-
  und Abstandsfunktionen.
- `absolute-value-state.js` enthält die unabhängige deterministische Folge.
- `absolute-value-animation.js` berechnet ausschließlich visuelle Frames.
- `absolute-value-app.js` verbindet Pointer, Tastatur, SVG und DOM.
- `absolute-value.css` hält Gestaltung und Responsive-Regeln getrennt.

Beide bestehenden Zahlengeradenmodule bleiben in ihren zwölf Laufzeitdateien
bytegleich. Kapitel 2 bleibt in seinen 30 Laufzeitdateien bytegleich.

## Schutzgrenzen und Darstellung

- Minimalwert −6 und Maximalwert +6
- ausschließlich ganzzahlige Werte ohne negativen Nullwert
- Punktzentrum immer exakt auf y = 270
- 120 SVG-Einheiten großes unsichtbares Griffziel
- Pointer Events als gemeinsamer Touch- und Mauspfad
- Pointer Capture während der Bewegung
- vertikale Fingerbewegung ohne Einfluss auf den Wert
- `touch-action: none` gegen Seitenscrollen und Browsergesten
- Eingabesperre während automatischer Übergänge
- Endwerte mit mindestens 55 SVG-Einheiten sichtbarem Außenrand
- Achsenlinie endet mit geradem Abschluss exakt an geschlossenen Pfeilflächen
- Abstandslinie endet ebenfalls gerade an ihren mathematischen Endpunkten
- Safe-Area- und Responsive-Regeln für kleine Breite, Hoch- und Querformat

## Integration und Offlinebetrieb

Kapitel 1 „Rationale Zahlen“ enthält nun genau drei Karten. Kapitel 2 enthält
unverändert sechs Karten. Im iPad-Querformat belegen die drei Kapitel-1-Karten
symmetrisch die drei bestehenden Kartenpositionen; im Hochformat bleibt das
vorhandene Zweispaltenraster erhalten.

Der gemeinsame Offline-Cache trägt Version 12 und enthält alle sechs neuen
Laufzeitdateien. Installation, Bereinigung des vorherigen Caches und ein
automatisierter Neustart ohne Netzwerk sind geprüft.

## Automatische Prüfungen

- 332 von 332 Node-Tests bestanden
- vollständige bisherige Suite mit 294 Tests grün
- 38 neue Betrags-, Zustands-, Interaktions-, Animations- und Strukturtests
- 55 von 55 lokale Laufzeitressourcen erreichbar
- 8 von 8 Betragszustände als SVG gerendert
- insgesamt 49 von 49 Modulzustände gerendert
- alle ganzzahligen Werte von −6 bis +6 geprüft
- Touch-, Maus- und Tastaturpfad geprüft
- schnelle Mehrfachtipps, Eingabesperren, Reset und erneuter Aufbau geprüft
- Kapitel 1 mit drei Karten und Kapitel 2 mit sechs Karten geprüft
- automatisierter Offline-Neustart ohne Netzwerk geprüft
- keine Speicherung, Schülerdaten, Analyse oder externen Laufzeitaufrufe
- keine neue Laufzeitabhängigkeit

Die Cloud-Browserumgebung konnte die lokale, nicht veröffentlichte Adresse
nicht öffnen. Es wurde deshalb kein automatisierter Browser-Klickdurchlauf
behauptet. DOM-, Pointer-, SVG-, Responsive-, Ressourcen- und Offlineprüfungen
liefen vollständig direkt gegen die Arbeitskopie.

## Offene reale iPad-Abnahme

Auf einem physischen iPad bleiben zu beurteilen:

- Wirkung der anfänglichen Irritation
- Verständlichkeit von Richtung und Abstand als getrennte Schritte
- Lesbarkeit der vier Einheiten und beider Betragsbeziehungen
- Fingergefühl des Einrastens im Hoch- und Querformat
- Lesbarkeit im Klassenraum
- Home-Bildschirm-Start und realer Flugmodus-Neustart
- Klassenraumübertragung

Es gibt keine offene technische Produktentscheidung. Eine private Online-
Vorschau wurde entsprechend dem Auftrag noch nicht erstellt.
