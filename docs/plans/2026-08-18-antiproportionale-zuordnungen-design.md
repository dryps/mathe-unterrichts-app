# K6.4 – Antiproportionale Zuordnungen

## Ziel

Das Modul macht an einer festen Arbeitsmenge sichtbar, warum eine Verdopplung der Personenzahl die benötigte Zeit halbiert. Tabelle, Hyperbel und konstantes Produkt zeigen stets denselben Zustand.

## Verbindlicher Inhalt

- Frage: „Warum wird bei antiproportional aus „doppelt“ plötzlich „halb“?“
- Untertitel: „Antiproportionale Zuordnungen“
- Ausgang: 4 Personen → 12 Stunden
- Vergleich: 8 Personen → 6 Stunden
- Konstante Arbeitsmenge: 48 Personenstunden
- Aha: „Wenn das Produkt konstant bleibt, muss die andere Größe entsprechend sinken.“

## Lernweg

1. Irritation: Nur die feste Arbeitsmenge und 4 Personen → 12 Stunden sind sichtbar.
2. Verdoppeln: 8 Personen und die halbierte Zeit 6 Stunden erscheinen gemeinsam.
3. Tabelle: Repräsentative Wertepaarzeilen werden sichtbar.
4. Graph: Hyperbel und der zum aktuellen Wertepaar gehörende Punkt erscheinen.
5. Produkt: 4 · 12 = 8 · 6 = 48 wird als Invariante offengelegt.
6. Erkundung: Ein diskreter Regler wählt 2, 3, 4, 6, 8 oder 12 Personen. Tabelle, Graphpunkt, Situation und Produkt aktualisieren sich synchron.
7. Aha: Die exakte Schlussformulierung erscheint erst mit der Erkundung.

## Technische Grenzen

- Reine lokale HTML/CSS/ES-Module ohne Abhängigkeiten, Speicherung oder Fremdaufrufe.
- Fachlogik, Zustand, Animation und DOM-Controller bleiben getrennt.
- Reveal-Gates verwenden echtes `hidden` und semantische Alternativtexte.
- Übergänge sind tokenisiert, zurücksetzbar und bei Reduced Motion sofort abgeschlossen.
- Responsive Prüfung für 320, 390, 768, 1024 und 1920 Pixel.

