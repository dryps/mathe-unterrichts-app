# Modulprüfung: Dreiecksungleichung

Prüfdatum: 29. Juli 2026

## Funktionsumfang

- drei ganzzahlige Seitenlängen von 1 bis 20
- große Plus- und Minus-Schaltflächen
- gültiger Ausgangs- und Resetwert `5, 6, 8`
- automatische Bestimmung der längsten und der beiden kürzeren Seiten
- konkrete Anzeige mit `>`, `=` oder `<`
- feste Grundseite als jeweils längste Seite
- zwei Zirkelbögen mit Radien der beiden kürzeren Seiten
- zwei spiegelbildliche Schnittpunkte im gültigen Zustand
- ein Berührpunkt und eine gerade Linie im Grenzfall
- getrennte Bögen im unmöglichen Zustand

Das Modul liegt unter `dreiecksungleichung.html`. Winkelsumme und
Dreiecksungleichung verwenden getrennte Geometrie-, Darstellungs- und
Stylesheetdateien.

## Automatische Prüfungen

- 39 von 39 Node-Tests bestanden
- 11 von 11 lokale Laufzeitressourcen erreichbar
- JavaScript-Syntaxprüfungen bestanden
- geprüft: gültiges ungleichseitiges und gleichseitiges Dreieck
- geprüft: gestreckter Grenzfall und unmögliche Kombination
- geprüft: Wechsel der längsten Seite
- geprüft: Minimal- und Maximalwerte
- geprüft: schnelle Mehrfachänderungen und Plus-/Minus-Grenzen
- geprüft: zwei korrekte spiegelbildliche Kreisschnittpunkte
- geprüft: tangentialer Berührpunkt und fehlender Schnittpunkt
- geprüft: direkte Status-, Gleichungs- und Resetreaktion
- geprüft: vollständige Regression der 18 Winkelsummen-Tests
- geprüft: keine Speicherung, Analyse oder externen Laufzeit-URLs

## Visuelle Konstruktionsprüfung

Das Skript `npm run test:visual` rendert alle drei Zustände aus derselben
Geometriefunktion wie die Anwendung in eine lokale SVG-Datei unter
`test-results/`. Die Ausgabe wurde visuell kontrolliert:

- gültig: beide Bögen schneiden sich oben und unten; das obere Dreieck ist
  hervorgehoben, die spiegelbildliche Lösung bleibt dezent sichtbar
- Grenzfall: beide Bögen berühren sich genau einmal; die drei Punkte erscheinen
  auf einer hervorgehobenen Geraden
- unmöglich: zwischen den einander zugewandten Bögen bleibt eine sichtbare Lücke

## Responsive und Offline

Die Oberfläche enthält getrennte Regeln für:

- iPad Hochformat bis 900 Pixel Breite
- iPad Querformat bei geringer Bildschirmhöhe
- Klassenraumbildschirme mit zweispaltiger Großdarstellung
- kleine Breiten bis 520 Pixel

Schaltflächen bleiben mindestens 56 Pixel hoch; Rasterelemente dürfen auf kleine
Breiten schrumpfen, ohne horizontale Mindestbreiten zu erzwingen.

Der Service Worker verwendet einen neuen Cache `mathe-unterrichts-app-v2` und
enthält alle Laufzeitdateien beider Module. Ressourcenprüfung und statische
Offline-Regression sind bestanden.

Ein echter lokaler Chromium-Lauf war in der Arbeitsumgebung nicht möglich:
Es ist kein Browser installiert, der zulässige Browserdownload ist durch die
Netzrichtlinie gesperrt und der isolierte Cloud-Browser darf weder lokale noch
eingebettete Seiten öffnen. Daher bleiben die reale Safari-Prüfung auf dem iPad,
der vollständige Offline-Neustart im physischen Browser und die echte
Klassenraumübertragung bewusst als fachliche Abnahme offen.

## Datenschutz

- keine Anmeldung
- keine Speicherung, Cookies oder Schülerdaten
- keine Analyse und kein Tracking
- keine externe API
- keine externen Laufzeitabhängigkeiten oder Netzwerkaufrufe
- keine Veröffentlichung
