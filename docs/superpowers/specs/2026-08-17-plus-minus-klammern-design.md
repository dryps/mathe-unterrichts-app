# K3.5 – Plus- und Minusklammern

## Modulvertrag

- **Aha-Frage:** Warum ändern sich bei einer Minusklammer alle Vorzeichen?
- **Untertitel:** Plus- und Minusklammern
- **Kernerkenntnis:** Das Minus wirkt auf das gesamte Paket.
- **Kernbeispiel:** `−(x − 3) = −x + 3`
- **Strukturerklärung:** Das äußere Minus ist der Faktor `−1`; er multipliziert sowohl `+x` als auch `−3`.

## Zustandsfolge

1. **Irritation:** `+(x − 3)` und `−(x − 3)` stehen einander gegenüber.
2. **Paket:** Die Klammer wird als untrennbares Paket aus `+x` und `−3` sichtbar.
3. **Plusklammer:** `+1` wirkt auf beide Paketbestandteile; `x − 3` bleibt unverändert.
4. **Minuswirkung:** Eine kurze deterministische Animation führt `−1` gleichzeitig zu beiden Bestandteilen; Weiter ist gesperrt, Reset bleibt aktiv.
5. **Minusklammer:** Beide Vorzeichen sind sichtbar gewechselt; `−x + 3` erscheint erst jetzt.
6. **Vergleich:** `+1` erhält beide Vorzeichen, `−1` kehrt beide um.
7. **Freie Erkundung:** Ein nativer Regler schaltet den äußeren Faktor zwischen `−1` und `+1`. Nach echter Änderung erscheint die Abschlusskarte.

## Mathematische Invarianten

- Die Klammer enthält stets genau die beiden Terme `+x` und `−3`.
- Für den äußeren Faktor `+1` gilt `+1 · (x − 3) = x − 3`.
- Für den äußeren Faktor `−1` gilt `−1 · (x − 3) = −x + 3`.
- Der äußere Faktor wird auf jeden Term im Paket angewandt; kein Vorzeichen wird ausgelassen.
- Die Darstellung unterscheidet Rechenoperation, Vorzeichen und Klammerstruktur.

## Interaktion, Animation und Bühne

- Dominante Paketkarte mit zwei algebraischen Bausteinen.
- Bedienung: Weiter, Zurücksetzen, nativer Zweistufenregler `−1/+1`, Rücklink.
- Mehrfachtipps überspringen die Minuswirkung nicht.
- Reset beendet RAF und Timer und neutralisiert verspätete Rückrufe.
- Reduced Motion führt unmittelbar in denselben korrekten Endzustand.

## Nicht-Funktionen

- kein bloßes Auswendiglernen einer Vorzeichenregel vor der sichtbaren Wirkung
- kein Ausmultiplizieren allgemeiner Faktoren; das gehört zu K3.6
- keine Gleichungslösung, Aufgabenserie, Bewertung oder Punkte
- keine Speicherung, Konten, Analyse, Fremdaufrufe oder neue Abhängigkeiten

## Responsive und offline

- Kein horizontaler Überlauf bei 320×700, 390×844, 768×1024, 1024×768 und 1920×1080.
- Alle Modulressourcen werden explizit in Pages-, Smoke- und Offline-Listen aufgenommen.
- Der Cache steigt bei Integration genau von der bestätigten Version `v21` auf `v22`.

