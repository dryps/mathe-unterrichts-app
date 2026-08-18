import assert from "node:assert/strict";import test from "node:test";import { inversePair,inversePairs,snapPeople } from "../src/inverse-assignment-math.js";
test("feste Arbeitsmenge liefert die verbindlichen Wertepaare",()=>{assert.deepEqual(inversePair(4),{people:4,hours:12,product:48});assert.deepEqual(inversePair(8),{people:8,hours:6,product:48});});
test("alle Erkundungspaare behalten exakt das Produkt 48",()=>{for(const pair of inversePairs())assert.equal(pair.people*pair.hours,48);assert.deepEqual(inversePairs().map(({people})=>people),[2,3,4,6,8,12]);});
test("diskreter Regler rastet auf erlaubte Personenzahlen",()=>{assert.equal(snapPeople(0),2);assert.equal(snapPeople(2),4);assert.equal(snapPeople(4),8);assert.equal(snapPeople(99),12);assert.equal(snapPeople(Number.NaN),4);});
