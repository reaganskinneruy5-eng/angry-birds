'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const rules = require('../js/combat-rules.js');

test('structure damage follows kinetic energy and material weight', () => {
  const slowWood=rules.structureImpactDamage('wood',0.8,0.55,3);
  const fastWood=rules.structureImpactDamage('wood',0.8,0.55,6);
  const fastIce=rules.structureImpactDamage('ice',0.8,0.55,6);
  const fastStone=rules.structureImpactDamage('stone',0.8,0.55,6);
  assert.ok(fastWood>slowWood*3.9);
  assert.ok(fastStone>fastWood);
  assert.ok(fastWood>fastIce);
  assert.equal(rules.structureImpactDamage('stone',2,0.55,1.5),0);
});

test('birds use lively but controlled restitution values', () => {
  const values=['R','Y','B','K','W'].map((type) => rules.birdRestitution(type));
  assert.ok(values.every((value) => value>=0.38 && value<=0.7));
  assert.ok(rules.birdRestitution('B')>rules.birdRestitution('R'));
  assert.ok(rules.birdRestitution('R')>0.5);
});

test('helmet pigs have exactly twice the health of normal small pigs', () => {
  assert.equal(rules.pigHitPoints('s'),60);
  assert.equal(rules.pigHitPoints('h'),120);
  assert.equal(rules.pigHitPoints('h'),rules.pigHitPoints('s')*2);
});

test('three stars require no mistakes and no more than twelve birds', () => {
  assert.equal(rules.starsForResult(0,12),3);
  assert.equal(rules.starsForResult(0,13),2);
  assert.equal(rules.starsForResult(1,10),2);
  assert.equal(rules.starsForResult(2,10),1);
});
