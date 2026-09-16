'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const units = require('../js/vocabulary-data.js');
const levelData = require('../js/level-data.js');

test('defines one level for each requested unit', () => {
  assert.deepEqual(levelData.levels.map((level) => level.unitId), units.map((unit) => unit.id));
});

test('places exactly fifteen pigs in every level', () => {
  for (const level of levelData.levels) {
    const pigs = level.items.filter((item) => item.k === 'p');
    assert.equal(pigs.length, 15, level.unitId);
    assert.ok(pigs.every((pig) => pig.x <= 20), `${level.unitId} has an off-camera pig`);
  }
});

test('uses layered mixed-material structures in every level', () => {
  for (const level of levelData.levels) {
    const blocks = level.items.filter((item) => item.k === 'b');
    const materials = new Set(blocks.map((block) => block.m));
    assert.ok(blocks.length >= 16, `${level.unitId} needs at least 16 structural blocks`);
    assert.ok(materials.size >= 2, `${level.unitId} needs at least two building materials`);
  }
});

test('uses only physics item and material types supported by the renderer', () => {
  for (const level of levelData.levels) {
    assert.ok(['grass','ice','dusk','stone','night'].includes(level.theme));
    for (const item of level.items) {
      assert.ok(['b','p','t'].includes(item.k));
      if (item.k === 'b') assert.ok(['wood','ice','stone'].includes(item.m));
    }
  }
});
