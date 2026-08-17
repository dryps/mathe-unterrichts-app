# Terme multiplizieren – Design

## Ziel und Aha-Satz

Das Modul beantwortet die Leitfrage **„Warum ist x · x = x² – und nicht 2x?“**. Es stellt Addition und Multiplikation derselben Variable als zwei verschiedene Strukturen gegenüber:

- `x + x = 2x`: Zwei gleich lange x-Strecken werden additiv aneinandergelegt; die Gesamtlänge beträgt `2x`.
- `x · x = x²`: Zwei Seitenlängen `x` spannen ein Quadrat auf; dessen Fläche beträgt `x²`.

Die finale Aussage lautet: **„2x und x² sind nicht zwei Schreibweisen für dasselbe.“**

## Didaktische Zustandsfolge

1. **Irritation:** `x + x` und `x · x` stehen nebeneinander. Die Frage ist, ob beide Ausdrücke dasselbe bedeuten, weil jeweils zweimal `x` vorkommt.
2. **Addition:** Zwei x-Strecken werden aneinandergelegt. Die Darstellung und Formel zeigen `x + x = 2x` als Gesamtlänge.
3. **Multiplikation:** Eine waagerechte und eine senkrechte Seitenlänge `x` bilden die Seiten eines Quadrats.
4. **Fläche:** Das Quadrat füllt sich ruhig. Die Flächenbeschriftung zeigt `x · x = x²`.
5. **Vergleich:** Additive Gesamtlänge und quadratische Fläche stehen direkt nebeneinander. Länge und Fläche werden weder farblich noch sprachlich als Fehler/Gegenfehler inszeniert, sondern als verschiedene Strukturen.
6. **Erkundung:** Ein nativer Regler verändert `x` ganzzahlig von 1 bis 5. Beide x-Strecken, die Gesamtlänge `2x`, beide Quadratseiten und die Fläche `x²` aktualisieren sich synchron. Nach der ersten echten Änderung erscheint die Schlussaussage.

Für `x = 2` sind beide Zahlenwerte zufällig 4. Das Modul benennt diese Gleichheit ausdrücklich als Zahlenwert-Koinzidenz: Länge und Fläche sowie die Terme `2x` und `x²` bleiben strukturell verschieden.

## Modulvertrag

### Mathematik

- `x` ist im Erkundungszustand eine ganze Zahl von 1 bis 5.
- Die additive Gesamtlänge ist exakt `2 · x`.
- Die quadratische Fläche ist exakt `x · x`.
- Formeln, zugängliche Texte und Visualisierung werden aus demselben normalisierten Wert abgeleitet.
- Pixelmaße dienen ausschließlich der Visualisierung und werden nie als mathematisches Ergebnis verwendet.

### Interaktion und Zustand

- Weiter und Zurücksetzen sind echte Buttons; die freie Veränderung nutzt einen nativen Bereichsregler.
- Während der Flächenanimation sind konkurrierende Eingaben gesperrt. Wiederholte Weiter-Eingaben erzeugen keinen Zustands- oder Timer-Sprung.
- Reset beendet laufende Animationen, setzt den Regler auf `x = 3`, verbirgt die Schlussaussage und stellt die Irritation vollständig wieder her.
- Bei `prefers-reduced-motion` erscheint der korrekte Endzustand ohne Zwischenbewegung.
- Die Oberfläche unterstützt Pointer, Touch, Maus und native Tastatursteuerung; Live-Regionen melden Formeländerungen knapp.

### Darstellung

- Addition erscheint als eindimensionale Länge aus zwei x-Blöcken.
- Multiplikation erscheint als Quadrat mit zwei sichtbaren Seitenmarkierungen `x` und einer Flächenbeschriftung `x²`.
- Die Darstellung bleibt bei ungefähr 320 px, Telefonformat, iPad-Hoch- und Querformat sowie Klassenraumbreite ohne horizontales Überlaufen nutzbar.
- Animationen sind deterministisch, ruhig und rein dekorativ; die Erkenntnis hängt nicht von ihrer Wahrnehmung ab.

## Bewusst ausgeschlossen

- Keine allgemeine Potenzrechnung, Exponentenregeln oder Produkte verschiedener Variablen.
- Keine Gleichungsumformung, Division, Minusklammer oder Distributivgesetz; diese gehören zu späteren Modulen.
- Keine freie Texteingabe, Bewertung, Punktzahl oder Antwortauswahl.
- Keine Speicherung, Konten, Analyse, Tracking, externe Schrift, CDN oder Laufzeitverbindung.
- Keine neue Abhängigkeit.

## Architektur und Prüfstrategie

Reine Module modellieren Mathematik, Zustandsfolge und Animationsframes. Der DOM-Controller rendert ausschließlich daraus und registriert den vorhandenen Service Worker. Struktur-, Interaktions- und Renderer-Tests sichern Texte, Eingabesperren, Reset, den Sonderfall `x = 2`, responsive Verträge und deterministische Zustandsbilder. Erst nach einem vollständigen Standalone-Checkpoint werden Startseite, Navigation, Cache, Offline-Liste, Smoke-/Pages-Prüfungen und Workflow zentral integriert.
