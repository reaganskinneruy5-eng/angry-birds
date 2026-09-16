'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const units = require('../js/vocabulary-data.js');

const EXPECTED = {
  '4A': ['agree','condition','death','dream','instead','item','reach','return'],
  '4B': ['battery','carry on','fix','metal','pilot','plan','pull','totally'],
  '5A': ['dangerous','dirty','expert','ground','illness','kill','list','touch'],
  '5B': ['alone','catch','compare','direction','possible','space','step','vehicle'],
  '6A': ['challenge','classmate','invitation','member','news','presentation','save','speech'],
  '6B': ['along','difference','electrical','famous','forest','leaf','lock','within']
};

test('contains exactly the six requested units and eight source words per unit', () => {
  assert.deepEqual(units.map((unit) => unit.id), Object.keys(EXPECTED));
  for (const unit of units) {
    assert.deepEqual(unit.words.map((word) => word.term), EXPECTED[unit.id]);
    assert.equal(new Set(unit.words.map((word) => word.term)).size, 8);
  }
});

test('provides three distinct cloze sentences for every word', () => {
  for (const unit of units) {
    for (const word of unit.words) {
      assert.match(word.cefr, /^(A1|A2|B1|B2)$/);
      assert.equal(word.examples.length, 3, `${unit.id} ${word.term}`);
      assert.equal(new Set(word.examples).size, 3, `${unit.id} ${word.term}`);
      for (const sentence of word.examples) {
        assert.equal((sentence.match(/___/g) || []).length, 1, sentence);
        assert.ok(sentence.length >= 10 && sentence.length <= 100, sentence);
      }
    }
  }
});
