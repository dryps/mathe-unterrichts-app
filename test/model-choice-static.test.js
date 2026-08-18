import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
const read=path=>readFile(new URL(path,import.meta.url),"utf8");
const [html,css,app]=await Promise.all([read("../modellwahl.html").catch(()=>""),read("../model-choice.css").catch(()=>""),read("../src/model-choice-app.js").catch(()=>"")]);

test("Frage, Untertitel, Gegenregeln und Aha sind wortgetreu",()=>{assert.match(html,/Warum muss ich vor dem Dreisatz wissen, welches Modell vorliegt\?/);assert.match(html,/Proportional oder antiproportional\?/);assert.match(html,/doppelt → doppelt/);assert.match(html,/doppelt → halb/);assert.match(html,/Erst Beziehung verstehen, dann rechnen\./);});
test("alle Erkenntnisse und der Schluss sind initial echt hidden",()=>{for(const id of ["model-situations","model-double","model-tests","model-routes","model-explore","model-conclusion"])assert.match(html,new RegExp(`id="${id}"[^>]*hidden`));});
test("Controller hält beide Modelle und den echten Reglerwert synchron",()=>{assert.match(app,/modelInput\.setAttribute\("aria-label",model\.sliderAriaLabel\)/);assert.match(app,/modelInput\.setAttribute\("aria-valuetext",model\.sliderValueText\)/);assert.match(app,/proportionalPair\.textContent=model\.proportionalPair/);assert.match(app,/inversePair\.textContent=model\.inversePair/);assert.match(app,/modelInput\.addEventListener\("input"/);});
test("Animation, Reset, Datenschutz und responsive Regeln sind abgesichert",()=>{assert.match(app,/animationToken \+= 1/);assert.match(app,/prefers-reduced-motion: reduce/);assert.match(app,/token!==animationToken/);assert.match(html,/lokal · ohne Speicherung/);assert.match(html,/href="\.\/#zuordnungen"/);assert.doesNotMatch(html+css,/https?:\/\//);assert.match(css,/@media\(max-width:720px\)/);assert.match(css,/prefers-reduced-motion:reduce/);assert.match(css,/\[hidden\]\{display:none!important\}/);});
