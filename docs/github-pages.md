# GitHub-Pages-Bereitstellung

Die App wird aus dem privaten Repository über einen kontrollierten GitHub-Actions-
Workflow unter der Projektadresse veröffentlicht. Das Repository bleibt privat;
die ausgelieferte Website ist ohne Anmeldung öffentlich erreichbar.

Der Build kopiert ausschließlich die in `scripts/pages-runtime-files.mjs`
freigegebenen statischen Laufzeitdateien nach `dist`. Tests, Testdaten,
Prüfskripte, interne Dokumentation und GitHub-Metadaten sind nicht Bestandteil
des Pages-Artefakts.

`robots.txt` und die Robots-Metaangaben sperren die Indexierung. Diese Sperre ist
kein Zugriffsschutz. Wer die Adresse kennt, kann die Website aufrufen. GitHub
kann beim Abruf technische Verbindungsdaten wie IP-Adressen im Rahmen seines
Plattformbetriebs verarbeiten.

Die App selbst verwendet keine Konten, Cookies, Formulareinsendungen,
Nutzerprofile, Analyse, Werbung, externen APIs, externen Fonts oder externen
Laufzeitbibliotheken. Es werden keine Schüler- oder Nutzerdaten gespeichert.
