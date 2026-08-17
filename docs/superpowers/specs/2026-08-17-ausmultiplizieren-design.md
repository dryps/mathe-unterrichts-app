# K3.6 Ausmultiplizieren – Design

## Ziel

Die Frage „Warum muss beim Ausmultiplizieren jeder Term in der Klammer getroffen werden?“ wird an `3(x + 2)` beantwortet. Der Faktor `3` vervielfacht nicht nur den ersten sichtbaren Term, sondern das gesamte Klammerpaket.

## Bühne und Lernweg

1. Irritation: `3(x + 2)` und die offene Frage, was die 3 vervielfacht.
2. Paket: Ein gerahmtes Paket enthält genau einen x-Baustein und zwei Einer.
3. Faktor: Die 3 wird als „drei vollständige Kopien“ gedeutet.
4. Kopieren: Drei identische Pakete erscheinen ruhig nacheinander; Weiter ist gesperrt, Reset bleibt aktiv.
5. Drei Kopien: Jedes Paket enthält weiterhin `x + 2`.
6. Bündeln: Die drei x-Bausteine und alle sechs Einer werden nach Typ zusammengeführt.
7. Ergebnis: `3(x + 2) = 3x + 6`.
8. Erkundung: Ein nativer ganzzahliger Faktorregler von 2 bis 5 verändert Kopien und Ergebnis gemeinsam. Eine echte Änderung zeigt den Schluss.

## Invarianten

- Faktor `n` erzeugt exakt `n` vollständige Pakete.
- Jedes Paket enthält exakt einen x-Baustein und zwei Einer.
- Das Ergebnis enthält exakt `n` x-Bausteine und `2n` Einer.
- `n(x + 2) = nx + 2n` für jeden erlaubten Faktor 2 bis 5.
- Kein Term wird ausgelassen; es wird nichts durch bloße Pixelposition bewiesen.

## Interaktion und Sicherheit

- Weiter, Zurücksetzen, Rücklink und genau ein nativer Regler.
- Mehrfachtipps und Reglereingaben überspringen die Kopieranimation nicht.
- Reset neutralisiert RAF und Timeout auch bei verspäteten Rückrufen.
- Reduced Motion beendet die Kopierphase direkt und korrekt.
- Keine Speicherung, Konten, Analyse, Fremdaufrufe oder neuen Abhängigkeiten.

## Responsive und offline

- Kein horizontaler Überlauf bei Smartphone, iPad Hoch-/Querformat und Klassenraumbildschirm.
- Alle sechs Laufzeitdateien werden erst im Integrationscommit in Startseite, Cache, Pages und Smoke aufgenommen.
- Produktcache steigt bei Integration exakt von v22 auf v23.
