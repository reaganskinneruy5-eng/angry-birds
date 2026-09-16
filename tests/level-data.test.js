'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const units = require('../js/vocabulary-data.js');
const levelData = require('../js/level-data.js');

const EXPECTED_CHAPTERS = [
  {id:1,name:'First Steps',units:['1A','1B','2A','2B','3A','3B']},
  {id:2,name:'Growing Skills',units:['4A','4B','5A','5B','6A','6B']},
  {id:3,name:'Big Ideas',units:['7A','7B','8A','8B','9A','9B']},
  {id:4,name:'World Challenges',units:['10A','10B','11A','11B','12A','12B']}
];

test('defines four chapters covering all levels exactly once', () => {
  assert.deepEqual(levelData.chapters.map(({id,name,units}) => ({id,name,units})), EXPECTED_CHAPTERS);
  assert.deepEqual(levelData.chapters.flatMap((chapter) => chapter.units), units.map((unit) => unit.id));
});

test('defines one ordered battle for every vocabulary unit', () => {
  assert.deepEqual(levelData.levels.map((level) => level.unitId), units.map((unit) => unit.id));
  assert.equal(levelData.levels.length, 24);
});

test('places exactly fifteen pigs in every level', () => {
  for (const level of levelData.levels) {
    const pigs = level.items.filter((item) => item.k === 'p');
    assert.equal(pigs.length, 15, level.unitId);
    assert.ok(pigs.every((pig) => pig.x >= 4.2 && pig.x <= 20), `${level.unitId} has an off-camera pig`);
  }
});

test('places exactly one helmet pig in every level', () => {
  for (const level of levelData.levels) {
    const helmets = level.items.filter((item) => item.k === 'p' && item.s === 'h');
    assert.equal(helmets.length,1,level.unitId);
  }
});

test('uses layered mixed-material structures in every level', () => {
  for (const level of levelData.levels) {
    const blocks = level.items.filter((item) => item.k === 'b');
    const materials = new Set(blocks.map((block) => block.m));
    assert.ok(blocks.length >= 18, `${level.unitId} needs at least 18 structural blocks`);
    assert.ok(materials.size >= 2, `${level.unitId} needs at least two building materials`);
    assert.ok(blocks.some((block) => block.w >= 2.2), `${level.unitId} needs a linking beam`);
  }
});

test('uses only physics item and material types supported by the renderer', () => {
  for (const level of levelData.levels) {
    assert.ok(Number.isInteger(level.chapter) && level.chapter >= 1 && level.chapter <= 4);
    assert.ok(['grass','ice','dusk','stone','night'].includes(level.theme));
    for (const item of level.items) {
      assert.ok(Number.isFinite(item.x) && Number.isFinite(item.y), level.unitId);
      assert.ok(['b','p','t'].includes(item.k));
      if (item.k === 'b') assert.ok(['wood','ice','stone'].includes(item.m));
    }
  }
});
