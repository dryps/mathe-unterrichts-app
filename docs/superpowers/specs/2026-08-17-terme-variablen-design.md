# Terme und Variablen – Design

## Ziel

Das neue Standalone-Aha-Modul beantwortet die Leitfrage „Wie kann sich x ändern, obwohl der Term derselbe bleibt?“ für das zukünftige Kapitel 3 „Rechnen mit Termen“. Es vermittelt genau eine Erkenntnis: Ein Term beschreibt eine feste Struktur beziehungsweise Rechenvorschrift; der Wert von `x` und dadurch der Termwert können sich ändern, während `2x + 3` derselbe Term bleibt.

Das Modul ist keine Einsetz-Übung. Es bietet weder freie Koeffizienten noch eine veränderliche Konstante und verwendet keine Gegenstandsmetapher, Waage oder Zahlengerade.

## Isolation und Dateigrenze

Die Umsetzung erfolgt ausschließlich im separaten Clone `mathe-unterrichts-app-terme-variablen` auf `agent/terme-variablen-aha`, ausgehend von `origin/main` bei `76ec0ccd39d8022e6ecda50f8ddc52237d38c04f`.

Alle Laufzeit- und Testdateien sind neu und modulbezogen. Startseite, Kapitelraster, Service Worker, Cache-Version, Manifest, README, Paketkonfiguration, Pages-Dateien, Smoke-Ressourcen und andere Termmodule bleiben unverändert. Daraus folgt bewusst: Das Modul ist direkt aufrufbar, aber noch nicht über die Startseite oder den Offline-Cache integriert.

## Oberfläche

Die Darstellung verwendet semantisches HTML und CSS statt Canvas oder einer realistischen Metapher. Zwei längliche, identische `x`-Bausteine und drei kleine, quadratische Einer-Bausteine bilden `2x + 3` dauerhaft ab. Die Anzahl der Bausteine ist statisch im Markup verankert; nur die Wertbeschriftung der beiden `x`-Bausteine ändert sich.

Die Formel `2x + 3` bleibt in allen Zuständen sichtbar und erhält eine visuell konstante Hervorhebung. Ein semantischer, nativer Bereichsregler verändert im Endzustand ausschließlich `x` ganzzahlig von 0 bis 5. Er unterstützt Touch, Maus und Tastatur ohne eigene Pointer-Arithmetik. Die einzigen weiteren Bedienelemente sind `Weiter`, `Zurücksetzen` und der spätere Rücklink `← Rechnen mit Termen` mit dem zukünftigen Anker `./#rechnen-mit-termen`.

Die Gestaltung ist vollständig unter einer modulbezogenen CSS-Namenswelt gekapselt. Regeln für 760 px, 520 px, Querformat mit geringer Höhe und Klassenraumbildschirme ab 1500 px schützen Hochformat, Querformat, kleine Breite und Großbild. Kein Element darf eine horizontale Seitenbreite erzwingen.

## Zustandsfolge

Die Zustandsmaschine kennt genau sechs didaktische Ansichten:

1. `irritation`: Große Formel und offene Frage, aber noch kein Wert für `x` und keine Auflösung.
2. `structure`: Zwei `x`-Bausteine und drei Einer-Bausteine werden als feste Struktur sichtbar.
3. `assigned`: `x = 1`; beide `x`-Bausteine zeigen 1, die Rechnung zeigt `2 · 1 + 3 = 5` und zusätzlich eindeutig `1 + 1 + 3 = 5`.
4. `changing`: Eine ruhige, präsentative Folge führt `x` von 1 über 2 zu 3. Währenddessen sind Weiter und freie Eingabe gesperrt; Reset bleibt aktiv. Reset bricht die Folge vollständig ab und kehrt zu `irritation` zurück. Bereits geplante Timer- oder Animationsereignisse dürfen danach keinen späteren Zustand wiederherstellen. Die Berechnung stammt weiterhin ausschließlich aus reinen Funktionen. Bei reduzierter Bewegung wird direkt der stabile Endwert 3 gezeigt.
5. `comparison`: Drei kompakte Zeilen zeigen gleichzeitig die Fälle `x = 1`, `x = 2` und `x = 3`; in jeder Zeile wird derselbe Ausdruck `2x + 3` identisch hervorgehoben.
6. `exploration`: Der Bereichsregler wird freigeschaltet. `x`, beide `x`-Bausteine, die eingesetzte Rechnung und der Termwert reagieren gemeinsam. Die drei Einer bleiben unverändert.

Mehrfachtipps dürfen keine Zustände überspringen oder eine zweite laufende Folge starten. Reset bleibt auch während der Präsentationsfolge aktiv, beendet sie kontrolliert, verwirft alle ausstehenden Sequenzereignisse und stellt Zustand 1 mit noch nicht zugewiesenem `x` wieder her.

Im letzten Zustand steht deutlich sichtbar die verbindliche Abschlusserkenntnis: **„2x + 3 bleibt derselbe Term. Wenn x sich ändert, ändert sich sein Wert.“**

## Reine Mathematik und Datenfluss

`src/terms-variables-math.js` exportiert die Konstanten Koeffizient 2, Konstante 3 und Bereich 0 bis 5 sowie reine Funktionen zum Begrenzen und Einrasten von `x`, zum Berechnen des Termwerts und zum Formatieren der eingesetzten Rechnung. Für `x = 0…5` entstehen exakt die Werte `3, 5, 7, 9, 11, 13`.

`src/terms-variables-state.js` besitzt keine DOM-, Zeit- oder Animationsabhängigkeit. Es steuert Ansichten, Eingabesperren, den aktuellen Wert und ein Ansichtsmodell. `src/terms-variables-app.js` verbindet Zustand und DOM, setzt Texte und Sichtbarkeit und steuert ausschließlich die zeitliche Präsentation in Zustand 4. Jede Darstellung wird aus dem aktuellen Zustand neu abgeleitet; die Animation ist niemals Berechnungsgrundlage.

## Zugänglichkeit

Der Statusbereich nutzt `aria-live="polite"`. Der Bereichsregler hat sichtbare Beschriftung, Grenzen, aktuellen Wert und eine verständliche Wertbeschreibung mit Termwert. Ausgeblendete Inhalte sind für Bedienung und Accessibility-Baum nicht aktiv. Fokusmarkierungen bleiben deutlich sichtbar. `prefers-reduced-motion` überspringt die zeitliche Folge, ohne Inhalt oder Zustand zu verlieren.

## Tests und Abnahme

Die Implementierung folgt Red–Green–Refactor. Fokussierte Tests prüfen:

- alle sechs Ansichten und ihre Reihenfolge;
- Eingabesperren, Mehrfachtipps und Reset;
- reine Mathematik für alle sechs zulässigen `x`-Werte;
- unveränderliche Struktur `2x + 3`;
- immer genau zwei `x`- und drei Einer-Bausteine;
- Touch- und Mausänderungen über das native `input`-Ereignis;
- Tastaturänderungen und Grenzwerte des nativen Reglers;
- responsive Regeln, gekapselte Styles und fehlende externe Laufzeitaufrufe;
- keine ausgeschlossenen Bedienelemente oder veränderlichen Koeffizienten.

Zusätzlich laufen die vollständige bestehende Testsuite, ein fokussierter Zustandsrenderer, `git diff --check` und Browserprüfungen bei 320×568, 390×844, 844×390, 1440×900 und 1920×1080. Bei den Browserprüfungen muss `document.documentElement.scrollWidth <= window.innerWidth` gelten.

## Abschluss

Nach grünen Prüfungen werden nur die neuen Modul-, Test-, Spezifikations- und Planungsdateien in einem fokussierten Commit erfasst und auf `origin/agent/terme-variablen-aha` gepusht. Es gibt keinen PR, Merge oder Deployment. Der vorhandene Projektserver wird anschließend aus dem isolierten Clone an `0.0.0.0` gestartet; gemeldet werden die direkte LAN-URL und die bewusst offenen späteren Integrationsschritte.
