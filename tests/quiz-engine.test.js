'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const units = require('../js/vocabulary-data.js');
const Quiz = require('../js/quiz-engine.js');

const unit = units[0];
const rng = () => 0;

test('builds four unique choices from the current unit', () => {
  const learning = Quiz.createLearningState(unit);
  const attempt = Quiz.createAttempt();
  const question = Quiz.buildQuestion(unit, learning, attempt, rng);
  assert.equal(question.choices.length, 4);
  assert.equal(new Set(question.choices).size, 4);
  assert.ok(question.choices.includes(question.term));
  assert.ok(question.choices.every((term) => unit.words.some((word) => word.term === term)));
});

test('prioritizes a term missed in the current attempt over unseen terms', () => {
  const learning = Quiz.createLearningState(unit);
  const attempt = Quiz.createAttempt();
  attempt.wrongTerms.knock = true;
  const question = Quiz.buildQuestion(unit, learning, attempt, rng);
  assert.equal(question.term, 'knock');
});

test('selects an unseen word before practiced words', () => {
  const learning = Quiz.createLearningState(unit);
  for (const word of unit.words) {
    learning[word.term] = {shown:2,correct:1,wrong:0,nextExample:0};
  }
  learning.maybe = {shown:0,correct:0,wrong:0,nextExample:0};
  const question = Quiz.buildQuestion(unit, learning, Quiz.createAttempt(), rng);
  assert.equal(question.term, 'maybe');
});

test('rotates all three examples before repeating', () => {
  const learning = Quiz.createLearningState(unit);
  const attempt = Quiz.createAttempt();
  attempt.wrongTerms.explore = true;
  const seen = [];
  for (let i = 0; i < 4; i++) seen.push(Quiz.buildQuestion(unit, learning, attempt, rng).sentence);
  assert.equal(new Set(seen.slice(0, 3)).size, 3);
  assert.equal(seen[3], seen[0]);
});

test('awards red birds and one special bird on each fourth correct answer', () => {
  const learning = Quiz.createLearningState(unit);
  const attempt = Quiz.createAttempt();
  for (let n = 1; n <= 8; n++) {
    const question = Quiz.buildQuestion(unit, learning, attempt, rng);
    const result = Quiz.submitAnswer(question, question.term, learning, attempt, rng);
    assert.deepEqual(result.awardedBirds, n % 4 === 0 ? ['R','Y'] : ['R']);
  }
});

test('resets streak on a wrong answer and fails on the third wrong answer', () => {
  const learning = Quiz.createLearningState(unit);
  const attempt = Quiz.createAttempt();
  let question = Quiz.buildQuestion(unit, learning, attempt, rng);
  Quiz.submitAnswer(question, question.term, learning, attempt, rng);
  for (let n = 1; n <= 3; n++) {
    question = Quiz.buildQuestion(unit, learning, attempt, rng);
    const wrongChoice = question.choices.find((choice) => choice !== question.term);
    const result = Quiz.submitAnswer(question, wrongChoice, learning, attempt, rng);
    assert.equal(result.correctStreak, 0);
    assert.equal(result.failed, n === 3);
    assert.equal(result.wrongAnswers, n);
    assert.deepEqual(result.awardedBirds, []);
  }
});
