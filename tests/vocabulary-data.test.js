'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const units = require('../js/vocabulary-data.js');

const EXPECTED = {
  '1A': ['explore','knock','maybe','pass','speed','strange','technology','thin'],
  '1B': ['finally','lost','natural','piece','purpose','report','sink','strike'],
  '2A': ['argue','athlete','exactly','record','tradition','unhealthy','various','work out'],
  '2B': ['breathe','contain','dish','fit','health','hungry','painful','plant'],
  '3A': ['amazing','career','decide','follow','get married','history','hurt','lucky'],
  '3B': ['cost','enough','free','pay','project','several','situation','spend'],
  '4A': ['agree','condition','death','dream','instead','item','reach','return'],
  '4B': ['battery','carry on','fix','metal','pilot','plan','pull','totally'],
  '5A': ['dangerous','dirty','expert','ground','illness','kill','list','touch'],
  '5B': ['alone','catch','compare','direction','possible','space','step','vehicle'],
  '6A': ['challenge','classmate','invitation','member','news','presentation','save','speech'],
  '6B': ['along','difference','electrical','famous','forest','leaf','lock','within'],
  '7A': ['last','memory','period','prepare','problem','result','useful','worried'],
  '7B': ['believe','impossible','mind','mistake','personal','straight','therefore','trick'],
  '8A': ['adult','careful','enter','freeze','on your own','parent','skin','weigh'],
  '8B': ['behavior','fear','in fact','joke','laugh','place','relationship','sense of humor'],
  '9A': ['birth','central','complete','during','finish','promise','together','tourist'],
  '9B': ['design','incredible','invent','lift','light','remain','solution','wide'],
  '10A': ['at least','blame','financial','float','forecast','large','power','temperature'],
  '10B': ['actually','deliver','drop','explode','increase','local','unusual','warning'],
  '11A': ['disappear','further','imagine','in detail','nearby','owner','perfect','store'],
  '11B': ['climb','cover','definitely','hunt','meanwhile','rise','toward','way'],
  '12A': ['act','daily','factory','operate','rough','sign','simple','uncomfortable'],
  '12B': ['electricity','get dressed','mirror','pick up','program','recently','turn','voice']
};

test('contains every RE0 unit and source term in course order', () => {
  assert.deepEqual(units.map((unit) => unit.id), Object.keys(EXPECTED));
  assert.equal(units.reduce((sum, unit) => sum + unit.words.length, 0), 192);
  for (const unit of units) {
    assert.deepEqual(unit.words.map((word) => word.term), EXPECTED[unit.id]);
    assert.equal(new Set(unit.words.map((word) => word.term)).size, 8);
  }
});

test('provides 576 distinct valid cloze examples', () => {
  const allExamples=[];
  for (const unit of units) {
    for (const word of unit.words) {
      assert.match(word.cefr, /^(A1|A2|B1|B2)$/);
      assert.equal(word.examples.length, 3, `${unit.id} ${word.term}`);
      assert.equal(new Set(word.examples).size, 3, `${unit.id} ${word.term}`);
      for (const sentence of word.examples) {
        assert.equal((sentence.match(/___/g) || []).length, 1, sentence);
        assert.ok(sentence.length >= 10 && sentence.length <= 100, sentence);
        allExamples.push(`${unit.id}:${word.term}:${sentence}`);
      }
    }
  }
  assert.equal(allExamples.length, 576);
  assert.equal(new Set(allExamples).size, 576);
});

test('completed examples begin with a capital letter', () => {
  for (const unit of units) {
    for (const word of unit.words) {
      for (const sentence of word.examples) {
        const completed=sentence.replace('___',word.term);
        assert.match(completed,/^[A-Z]/,`${unit.id} ${word.term}: ${completed}`);
      }
    }
  }
});
