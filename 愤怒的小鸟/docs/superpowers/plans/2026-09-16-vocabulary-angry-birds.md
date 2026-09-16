# RE0 Vocabulary Angry Birds Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a six-level Angry Birds vocabulary game for RE0 units 4A through 6B, with adaptive cloze questions that earn birds, twelve pigs per level, three-error failure, four-answer streak rewards, and synthesized BGM.

**Architecture:** Preserve the existing static browser game and move reusable content/rules into three browser-global/CommonJS modules: vocabulary data, quiz rules, and level data. The inline game controller consumes those modules, owns transient physics/UI state, and persists learning stats and campaign progress to a new local-storage key.

**Tech Stack:** HTML5 Canvas, vanilla JavaScript, Web Audio API, browser localStorage, Node.js built-in test runner (`node:test`), no runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-09-16-vocabulary-angry-birds-design.md`

## Global Constraints

- Ship exactly six levels: 4A, 4B, 5A, 5B, 6A, and 6B.
- Use all 48 supplied vocabulary items, exactly eight per level.
- Author exactly three distinct A1-A2 cloze sentences per word, for 144 questions.
- Every level contains exactly twelve pigs and remains beatable with ordinary red birds.
- A correct answer grants one red bird; every fourth consecutive correct answer also grants one random special bird from Y, B, K, or W.
- The third wrong answer ends the current level attempt.
- The game remains a dependency-free static site with no build step or network requirement.
- Existing touch, mouse, physics, pause, special-bird, and responsive landscape behavior must remain functional.

---

## File Structure

- Create `package.json`: test command and project metadata only.
- Create `js/vocabulary-data.js`: six unit records, 48 words, CEFR metadata, and 144 cloze sentences.
- Create `js/quiz-engine.js`: pure adaptive scheduling, distractor generation, answer evaluation, streak rewards, and three-error failure.
- Create `js/level-data.js`: six physics layouts and level metadata, each with exactly twelve pigs.
- Create `tests/vocabulary-data.test.js`: data completeness and cloze-shape tests.
- Create `tests/quiz-engine.test.js`: adaptive selection and attempt-rule tests.
- Create `tests/level-data.test.js`: six-level, unit-link, material, and pig-count tests.
- Modify `index.html`: load the modules, replace the campaign/UI, integrate the quiz flow into the physics loop, add learning HUD/result states, and add BGM.

---

### Task 1: Vocabulary Dataset and Integrity Tests

**Files:**
- Create: `package.json`
- Create: `tests/vocabulary-data.test.js`
- Create: `js/vocabulary-data.js`

**Interfaces:**
- Produces: `window.VOCAB_UNITS: VocabularyUnit[]` in browsers.
- Produces: `module.exports: VocabularyUnit[]` in Node.
- `VocabularyUnit = { id: string, title: string, words: VocabularyWord[] }`.
- `VocabularyWord = { term: string, cefr: string, examples: string[] }`.

- [ ] **Step 1: Add the Node test command and write the failing dataset tests**

Create `package.json`:

```json
{
  "name": "re0-vocabulary-angry-birds",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "test": "node --test tests/*.test.js"
  }
}
```

Create `tests/vocabulary-data.test.js`:

```js
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
```

- [ ] **Step 2: Run the dataset tests and confirm the feature is missing**

Run: `node --test tests/vocabulary-data.test.js`

Expected: FAIL with `Cannot find module '../js/vocabulary-data.js'`.

- [ ] **Step 3: Add all 48 words and all 144 authored sentences**

Create `js/vocabulary-data.js` as a UMD-style data module. Use the following complete canonical content inside the returned array:

```js
(function(root, factory){
  var data = factory();
  if (typeof module === 'object' && module.exports) module.exports = data;
  if (root) root.VOCAB_UNITS = data;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(){
  'use strict';
  return [
    {id:'4A',title:'Unit 4A',words:[
      {term:'agree',cefr:'A2',examples:['I ___ with your good idea.','We ___ that the blue bag is better.','My parents ___ to let me go.']},
      {term:'condition',cefr:'B1',examples:['The old bike is in good ___.','You can go out on one ___.','Cold weather is a hard ___ for the plants.']},
      {term:'death',cefr:'B1',examples:["The ___ of his dog made him sad.",'This medicine can stop early ___.','The story ends with the king’s ___.']},
      {term:'dream',cefr:'A2',examples:['My ___ is to fly a plane.','She had a funny ___ last night.','His big ___ is to travel the world.']},
      {term:'instead',cefr:'A2',examples:['I chose tea ___ of coffee.','We stayed home ___ of going out.','Take the bus ___; it is faster.']},
      {term:'item',cefr:'B1',examples:['Each ___ on the list costs two dollars.','This red hat is my favorite ___.','Please put every ___ in the box.']},
      {term:'reach',cefr:'B1',examples:['We can ___ the station by noon.','The child cannot ___ the high shelf.','Call me when you ___ home.']},
      {term:'return',cefr:'A1',examples:['Please ___ the book on Friday.','They will ___ home after lunch.','I need to ___ this shirt to the shop.']}
    ]},
    {id:'4B',title:'Unit 4B',words:[
      {term:'battery',cefr:'A2',examples:['My phone ___ is almost empty.','This toy needs a new ___.','Charge the ___ before the trip.']},
      {term:'carry on',cefr:'B1',examples:['Please ___ with your work.','It began to rain, but we ___ walking.','She was tired, yet she chose to ___.']},
      {term:'fix',cefr:'B1',examples:['Can you ___ my broken bike?','Dad will ___ the kitchen light.','We need to ___ this small problem.']},
      {term:'metal',cefr:'B1',examples:['The spoon is made of ___.','This ___ box is very strong.','The old bridge uses a lot of ___.']},
      {term:'pilot',cefr:'A2',examples:['The ___ flies the plane.','She wants to be a ___ one day.','Our ___ spoke before the flight.']},
      {term:'plan',cefr:'A2',examples:['We made a ___ for the weekend.','My ___ is to study after dinner.','Tell me your ___ for tomorrow.']},
      {term:'pull',cefr:'A2',examples:['___ the door to open it.','Please ___ the rope toward you.','The horse can ___ the cart.']},
      {term:'totally',cefr:'B1',examples:['I ___ forgot his name.','The two pictures are ___ different.','The road was ___ empty at night.']}
    ]},
    {id:'5A',title:'Unit 5A',words:[
      {term:'dangerous',cefr:'A2',examples:['It is ___ to swim here.','That broken wire is ___.','Driving too fast can be ___.']},
      {term:'dirty',cefr:'A2',examples:['Your shoes are very ___.','Wash the ___ plates, please.','The dog came home wet and ___.']},
      {term:'expert',cefr:'B1',examples:['Ask an ___ to repair the machine.','She is an ___ on birds.','The computer ___ found the problem.']},
      {term:'ground',cefr:'B1',examples:['The ball fell to the ___.','We sat on the soft ___.','There was snow all over the ___.']},
      {term:'illness',cefr:'B1',examples:['He missed school because of an ___.','The doctor studies this ___.','Good food can help prevent ___.']},
      {term:'kill',cefr:'A2',examples:['This spray can ___ small insects.','A lack of water may ___ the plant.','Do not ___ the spider; take it outside.']},
      {term:'list',cefr:'A2',examples:['Write the food on a ___.','Her name is first on the ___.','I made a shopping ___ this morning.']},
      {term:'touch',cefr:'B1',examples:['Do not ___ the hot pan.','You can ___ the screen to begin.','The branches almost ___ the window.']}
    ]},
    {id:'5B',title:'Unit 5B',words:[
      {term:'alone',cefr:'A2',examples:['I do not like walking ___ at night.','She lives ___ in a small house.','The child finished the puzzle ___.']},
      {term:'catch',cefr:'A1',examples:['Can you ___ the red ball?','We ran to ___ the last bus.','The cat wants to ___ the mouse.']},
      {term:'compare',cefr:'B1',examples:['Let us ___ the two pictures.','You can ___ prices before you buy.','The class will ___ city and country life.']},
      {term:'direction',cefr:'B1',examples:['Which ___ is the station?','The wind changed ___.','Please point me in the right ___.']},
      {term:'possible',cefr:'A1',examples:['Is it ___ to finish today?','Come as early as ___.','We tried every ___ way home.']},
      {term:'space',cefr:'A2',examples:['There is no ___ in the car.','Leave some ___ between the chairs.','The box takes up too much ___.']},
      {term:'step',cefr:'B1',examples:['Take one ___ back.','The first ___ is to open the box.','Be careful on the last ___.']},
      {term:'vehicle',cefr:'B1',examples:['A bus is a large ___.','This ___ can travel on snow.','Park your ___ beside the road.']}
    ]},
    {id:'6A',title:'Unit 6A',words:[
      {term:'challenge',cefr:'B1',examples:['This hard game is a fun ___.','Climbing the hill was a big ___.','Learning ten words is today’s ___.']},
      {term:'classmate',cefr:'A2',examples:['My ___ sits next to me.','I studied with a ___ after school.','A new ___ joined our class today.']},
      {term:'invitation',cefr:'A2',examples:['I got an ___ to her party.','Thank you for the dinner ___.','The ___ says the party starts at six.']},
      {term:'member',cefr:'A2',examples:['She is a ___ of the school band.','Every team ___ has a blue shirt.','My brother became a club ___.']},
      {term:'news',cefr:'B1',examples:['I have some good ___ for you.','We watched the evening ___ together.','The ___ about the storm was on TV.']},
      {term:'presentation',cefr:'B1',examples:['Mia gave a short ___ in class.','I used pictures in my ___.','His ___ was about sea animals.']},
      {term:'save',cefr:'A2',examples:['I want to ___ money for a bike.','Press this button to ___ your work.','The firefighter came to ___ the cat.']},
      {term:'speech',cefr:'B1',examples:['The teacher gave a short ___.','I wrote a ___ for the school event.','Her ___ made everyone smile.']}
    ]},
    {id:'6B',title:'Unit 6B',words:[
      {term:'along',cefr:'B1',examples:['We walked ___ the river.','Trees grow ___ both sides of the road.','Come ___ with us to the park.']},
      {term:'difference',cefr:'A2',examples:['Can you see the ___ between them?','One small ___ is the color.','There is a big ___ in price.']},
      {term:'electrical',cefr:'B1',examples:['Do not touch the ___ wire.','The shop sells ___ goods.','An ___ problem stopped the train.']},
      {term:'famous',cefr:'A1',examples:['The city is ___ for its food.','She is a ___ singer.','We visited a ___ old bridge.']},
      {term:'forest',cefr:'A2',examples:['Many animals live in the ___.','We walked through a green ___.','A fire started in the dry ___.']},
      {term:'leaf',cefr:'B1',examples:['A yellow ___ fell from the tree.','There is a bug on this ___.','The child drew a green ___.']},
      {term:'lock',cefr:'B1',examples:['Please ___ the door at night.','Use this key to ___ the box.','Do not forget to ___ your bike.']},
      {term:'within',cefr:'B1',examples:['Please finish the work ___ one hour.','The shop is ___ walking distance.','Keep the dog ___ the garden walls.']}
    ]}
  ];
});
```

Preserve this wording unless a test or browser review identifies an actual ambiguity. Each sentence uses exactly one literal `___`; apostrophes must remain valid JavaScript string content.

- [ ] **Step 4: Run the focused data tests**

Run: `node --test tests/vocabulary-data.test.js`

Expected: PASS, 2 tests passed.

- [ ] **Step 5: Commit the complete vocabulary dataset**

```bash
git add package.json js/vocabulary-data.js tests/vocabulary-data.test.js
git commit -m "feat: add RE0 vocabulary question dataset"
```

---

### Task 2: Adaptive Quiz Engine

**Files:**
- Create: `tests/quiz-engine.test.js`
- Create: `js/quiz-engine.js`

**Interfaces:**
- Consumes: `VocabularyUnit` from `js/vocabulary-data.js`.
- Produces: `createLearningState(unit): Record<string, WordStats>`.
- Produces: `createAttempt(): { wrongAnswers, correctStreak, wrongTerms }`.
- Produces: `buildQuestion(unit, learning, attempt, rng): Question`.
- Produces: `submitAnswer(question, selected, learning, attempt, rng): AnswerResult`.
- `WordStats = { shown: number, correct: number, wrong: number, nextExample: number }`.
- `Question = { unitId: string, term: string, sentence: string, completedSentence: string, choices: string[] }`.
- `AnswerResult = { correct: boolean, failed: boolean, awardedBirds: string[], correctStreak: number, wrongAnswers: number }`.

- [ ] **Step 1: Write failing tests for scheduling, distractors, rotation, rewards, and failure**

Create `tests/quiz-engine.test.js` with deterministic `rng = () => 0` and these behaviors:

```js
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
  attempt.wrongTerms.condition = true;
  const question = Quiz.buildQuestion(unit, learning, attempt, rng);
  assert.equal(question.term, 'condition');
});

test('rotates all three examples before repeating', () => {
  const learning = Quiz.createLearningState(unit);
  const attempt = Quiz.createAttempt();
  attempt.wrongTerms.agree = true;
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
    assert.deepEqual(result.awardedBirds, n % 4 === 0 ? ['R', 'Y'] : ['R']);
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
  }
});
```

Also add a test that sets one term to `{shown: 0, correct: 0}` and all others to `{shown: 2, correct: 1}`, then expects the unseen term to be selected.

- [ ] **Step 2: Run the quiz tests and confirm the engine is missing**

Run: `node --test tests/quiz-engine.test.js`

Expected: FAIL with `Cannot find module '../js/quiz-engine.js'`.

- [ ] **Step 3: Implement the minimal pure quiz engine**

Create `js/quiz-engine.js` with the required API. Use this priority tuple for each word and choose the lexicographically lowest tuple, randomizing only exact ties:

```js
function priority(word, learning, attempt) {
  var stats = learning[word.term];
  return [
    attempt.wrongTerms[word.term] ? 0 : 1,
    stats.shown === 0 ? 0 : 1,
    stats.correct,
    stats.shown
  ];
}
```

`buildQuestion` increments `shown`, reads `examples[nextExample]`, advances `nextExample` modulo three, creates three distractors from the other seven terms, shuffles all four choices with the supplied RNG, and returns both the cloze and completed sentence.

`submitAnswer` must implement this exact transition, with `answerResult` returning a plain serializable object:

```js
function answerResult(correct,failed,awardedBirds,attempt){
  return {
    correct:correct,
    failed:failed,
    awardedBirds:awardedBirds,
    correctStreak:attempt.correctStreak,
    wrongAnswers:attempt.wrongAnswers
  };
}

if (selected === question.term) {
  stats.correct += 1;
  attempt.correctStreak += 1;
  delete attempt.wrongTerms[question.term];
  var birds = ['R'];
  if (attempt.correctStreak % 4 === 0) {
    birds.push(['Y','B','K','W'][Math.floor(rng() * 4)]);
  }
  return answerResult(true, false, birds, attempt);
}
stats.wrong += 1;
attempt.wrongAnswers += 1;
attempt.correctStreak = 0;
attempt.wrongTerms[question.term] = true;
return answerResult(false, attempt.wrongAnswers >= 3, [], attempt);
```

Expose the API as `window.VocabularyQuiz` and `module.exports` with the same UMD pattern as the data module.

- [ ] **Step 4: Run the focused quiz tests**

Run: `node --test tests/quiz-engine.test.js`

Expected: PASS for all scheduling and answer-rule tests.

- [ ] **Step 5: Run the full suite and commit**

Run: `npm test`

Expected: PASS with zero failures.

```bash
git add js/quiz-engine.js tests/quiz-engine.test.js
git commit -m "feat: add adaptive vocabulary quiz engine"
```

---

### Task 3: Six Twelve-Pig Level Layouts

**Files:**
- Create: `tests/level-data.test.js`
- Create: `js/level-data.js`

**Interfaces:**
- Consumes: `VOCAB_UNITS` only for unit-id validation in tests; runtime level data is standalone.
- Produces: `window.VOCAB_LEVELS = { levels, pigRadius }`.
- Produces: the same object via `module.exports` in Node.
- Each level is `{ id, unitId, name, theme, items }`.
- Each item uses the existing shapes: block `{k:'b',...}`, pig `{k:'p',...}`, TNT `{k:'t',...}`.

- [ ] **Step 1: Write failing level-content tests**

Create `tests/level-data.test.js`:

```js
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const units = require('../js/vocabulary-data.js');
const levelData = require('../js/level-data.js');

test('defines one level for each requested unit', () => {
  assert.deepEqual(levelData.levels.map((level) => level.unitId), units.map((unit) => unit.id));
});

test('places exactly twelve pigs in every level', () => {
  for (const level of levelData.levels) {
    const pigs = level.items.filter((item) => item.k === 'p');
    assert.equal(pigs.length, 12, level.unitId);
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
```

- [ ] **Step 2: Run the level tests and confirm the level module is missing**

Run: `node --test tests/level-data.test.js`

Expected: FAIL with `Cannot find module '../js/level-data.js'`.

- [ ] **Step 3: Implement six explicit layouts**

Create `js/level-data.js` with a UMD wrapper and these helpers:

```js
var PH=1.55, PW=0.24, TOP=0.24;
var pigRadius={s:0.35,m:0.45,l:0.6,h:0.45};
function block(x,y,w,h,mat){return {k:'b',x:x,y:y,w:w,h:h,m:mat};}
function pig(x,y,size){return {k:'p',x:x,y:y,s:size||'s'};}
function tnt(x,y){return {k:'t',x:x,y:y,w:0.6,h:0.6};}
function pigY(surface,size){return surface+pigRadius[size||'s'];}
function hut(a,x,mat,y){
  y=y||0;
  a.push(block(x-0.7,y+PH/2,PW,PH,mat));
  a.push(block(x+0.7,y+PH/2,PW,PH,mat));
  a.push(block(x,y+PH+TOP/2,1.75,TOP,mat));
  return y+PH+TOP;
}
function bridge(a,left,right,mat,y){
  y=y||0;
  a.push(block(left,y+PH/2,PW,PH,mat));
  a.push(block(right,y+PH/2,PW,PH,mat));
  a.push(block((left+right)/2,y+PH+TOP/2,right-left+0.45,TOP,mat));
  return y+PH+TOP;
}
function level(id,name,theme,items){return {id:id,unitId:id,name:name,theme:theme,items:items};}
```

Implement the builders with these exact structural anchors and pig placements; browser verification may adjust block dimensions but must not change the twelve-pig count:

```js
function build4AOpenVillage(){
  var a=[];
  [7.5,11,14.5,18].forEach(function(x){
    var top=hut(a,x,'wood',0);
    a.push(pig(x,pigY(0,'s'),'s'),pig(x,pigY(top,'s'),'s'));
  });
  a.push(pig(6,pigY(0,'s'),'s'),pig(9.25,pigY(0,'m'),'m'),
    pig(12.75,pigY(0,'s'),'s'),pig(16.25,pigY(0,'m'),'m'));
  return level('4A','同意村庄','grass',a);
}

function build4BWorkshopTowers(){
  var a=[];
  var t1=hut(a,8,'wood',0); hut(a,8,'stone',t1);
  var t2=hut(a,13,'stone',0); hut(a,13,'wood',t2);
  var t3=hut(a,18,'wood',0); hut(a,18,'stone',t3);
  a.push(
    pig(8,pigY(0,'s'),'s'),pig(8,pigY(t1,'m'),'m'),pig(8,pigY(t1*2,'s'),'s'),
    pig(13,pigY(0,'m'),'m'),pig(13,pigY(t2,'s'),'s'),pig(13,pigY(t2*2,'s'),'s'),
    pig(18,pigY(0,'s'),'s'),pig(18,pigY(t3,'m'),'m'),pig(18,pigY(t3*2,'s'),'s'),
    pig(6,pigY(0,'s'),'s'),pig(10.5,pigY(0,'s'),'s'),pig(15.5,pigY(0,'s'),'s')
  );
  return level('4B','机械工坊','stone',a);
}

function build5AHazardYard(){
  var a=[];
  var left=hut(a,7.5,'wood',0), mid=hut(a,12.5,'ice',0), right=hut(a,17.5,'wood',0);
  bridge(a,9.4,10.8,'ice',0); bridge(a,14.4,15.8,'wood',0);
  a.push(tnt(10.1,0.3),tnt(15.1,0.3));
  a.push(
    pig(7.5,pigY(0,'s'),'s'),pig(7.5,pigY(left,'m'),'m'),
    pig(12.5,pigY(0,'s'),'s'),pig(12.5,pigY(mid,'m'),'m'),
    pig(17.5,pigY(0,'s'),'s'),pig(17.5,pigY(right,'m'),'m'),
    pig(10.1,pigY(PH+TOP,'s'),'s'),pig(15.1,pigY(PH+TOP,'s'),'s'),
    pig(6,pigY(0,'s'),'s'),pig(9,pigY(0,'s'),'s'),
    pig(14,pigY(0,'s'),'s'),pig(19.2,pigY(0,'s'),'s')
  );
  return level('5A','危险工地','dusk',a);
}

function build5BWidePlatforms(){
  var a=[];
  var p1=bridge(a,6.4,9.2,'wood',0);
  var p2=bridge(a,10.4,13.6,'ice',0);
  var p3=bridge(a,14.8,18.8,'wood',0);
  a.push(block(8.5,p1+0.7,PW,1.4,'ice'),block(12,p2+0.7,PW,1.4,'wood'),block(17,p3+0.7,PW,1.4,'ice'));
  a.push(
    pig(7,pigY(0,'s'),'s'),pig(8.6,pigY(0,'m'),'m'),pig(7.8,pigY(p1,'s'),'s'),
    pig(10.9,pigY(0,'s'),'s'),pig(13.1,pigY(0,'s'),'s'),pig(12,pigY(p2,'m'),'m'),
    pig(15.5,pigY(0,'s'),'s'),pig(18.1,pigY(0,'m'),'m'),pig(17,pigY(p3,'s'),'s'),
    pig(6,pigY(0,'s'),'s'),pig(14.2,pigY(0,'s'),'s'),pig(19.6,pigY(0,'s'),'s')
  );
  return level('5B','方向长廊','ice',a);
}

function build6AFestivalFort(){
  var a=[];
  var l1=hut(a,7.5,'wood',0); hut(a,7.5,'ice',l1);
  var l2=hut(a,12.5,'stone',0); hut(a,12.5,'wood',l2);
  var l3=hut(a,17.5,'ice',0); hut(a,17.5,'wood',l3);
  a.push(tnt(10,0.3),tnt(15,0.3));
  a.push(
    pig(7.5,pigY(0,'s'),'s'),pig(7.5,pigY(l1,'s'),'s'),pig(7.5,pigY(l1*2,'m'),'m'),
    pig(12.5,pigY(0,'m'),'m'),pig(12.5,pigY(l2,'s'),'s'),pig(12.5,pigY(l2*2,'m'),'m'),
    pig(17.5,pigY(0,'s'),'s'),pig(17.5,pigY(l3,'s'),'s'),pig(17.5,pigY(l3*2,'m'),'m'),
    pig(6,pigY(0,'s'),'s'),pig(10,pigY(0.6,'s'),'s'),pig(15,pigY(0.6,'s'),'s')
  );
  return level('6A','演讲庆典','dusk',a);
}

function build6BForestStronghold(){
  var a=[];
  var left=hut(a,7,'wood',0); hut(a,7,'stone',left);
  var center=bridge(a,9.5,14.5,'stone',0); hut(a,12,'ice',center);
  var right=hut(a,18,'stone',0); hut(a,18,'wood',right);
  a.push(block(9.5,center+0.85,PW,1.7,'wood'),block(14.5,center+0.85,PW,1.7,'wood'));
  a.push(
    pig(7,pigY(0,'s'),'s'),pig(7,pigY(left,'m'),'m'),pig(7,pigY(left*2,'s'),'s'),
    pig(10.5,pigY(0,'s'),'s'),pig(12,pigY(0,'l'),'l'),pig(13.5,pigY(0,'s'),'s'),
    pig(12,pigY(center,'m'),'m'),pig(12,pigY(center+PH+TOP,'s'),'s'),
    pig(18,pigY(0,'m'),'m'),pig(18,pigY(right,'s'),'s'),pig(18,pigY(right*2,'h'),'h'),
    pig(19.7,pigY(0,'s'),'s')
  );
  return level('6B','森林要塞','night',a);
}

var definitions=[build4AOpenVillage(),build4BWorkshopTowers(),build5AHazardYard(),
  build5BWidePlatforms(),build6AFestivalFort(),build6BForestStronghold()];
```

Return `{levels:definitions,pigRadius:pigRadius}` from the factory. Keep the furthest pig at x=19.7 so the existing camera can frame the whole battlefield.

- [ ] **Step 4: Run level and full content tests**

Run: `node --test tests/level-data.test.js tests/vocabulary-data.test.js`

Expected: PASS with exactly six levels and twelve pigs per level.

- [ ] **Step 5: Commit the level layouts**

```bash
git add js/level-data.js tests/level-data.test.js
git commit -m "feat: add six vocabulary battle layouts"
```

---

### Task 4: Integrate Quiz Purchases, Attempt Failure, and Learning Progress

**Files:**
- Modify: `index.html:20-214` (HUD, question sheet, result copy, instructions, script loading)
- Modify: `index.html:1045-1361` (replace original campaign data with imported level data)
- Modify: `index.html:1362-1852` (game state, persistence, bird queue, question loop, scoring, failure)
- Modify: `index.html:2105-2314` (public controller methods, level select, quiz UI, event handlers)
- Create: `tests/html-integration.test.js`

**Interfaces:**
- Consumes: `window.VOCAB_UNITS`, `window.VocabularyQuiz`, and `window.VOCAB_LEVELS`.
- Adds: `Game.answerQuestion(selectedTerm)`, `Game.continueAfterAnswer()`, and `Game.getQuizView()`.
- Adds: `UI.showQuestion(view)`, `UI.showQuestionFeedback(result, completedSentence)`, and `UI.hideQuestion()`.
- Persists under `re0AngryBirds.progress.v1`.

- [ ] **Step 1: Write failing static integration tests**

Create `tests/html-integration.test.js`:

```js
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const html = fs.readFileSync('index.html', 'utf8');

test('loads learning modules before the game controller', () => {
  const data = html.indexOf('js/vocabulary-data.js');
  const quiz = html.indexOf('js/quiz-engine.js');
  const levels = html.indexOf('js/level-data.js');
  const controller = html.indexOf("'use strict';", levels);
  assert.ok(data >= 0 && data < quiz && quiz < levels && levels < controller);
});

test('contains required learning HUD and question controls', () => {
  for (const id of ['pigCount','mistakeCount','streakCount','birdCount','questionSheet','questionSentence','questionChoices','questionFeedback','btnQuestionContinue']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
});

test('uses the new progress key and removes original campaign copy', () => {
  assert.match(html, /re0AngryBirds\.progress\.v1/);
  assert.doesNotMatch(html, /42 个关卡|4 章 × 42 关|abLegend\.progress\.v1/);
});
```

- [ ] **Step 2: Run the integration test and verify expected failure**

Run: `node --test tests/html-integration.test.js`

Expected: FAIL because module scripts, quiz controls, and the new progress key do not exist yet.

- [ ] **Step 3: Add the learning UI and module loading**

Add a compact HUD below the score:

```html
<div id="learningHud">
  <span>🐷 <b id="pigCount">12</b></span>
  <span>失误 <b id="mistakeCount">♡♡♡</b></span>
  <span>连对 <b id="streakCount">0</b></span>
  <span>小鸟 <b id="birdCount">0</b></span>
</div>
```

Add a modal question sheet containing `questionUnit`, `questionSentence`, `questionChoices`, `questionFeedback`, and `btnQuestionContinue`. Give each answer button at least a 44-pixel touch target, use a two-column landscape layout that collapses to one column on narrow screens, and keep the modal above all gameplay layers.

Immediately before the existing inline game script, add:

```html
<script src="js/vocabulary-data.js"></script>
<script src="js/quiz-engine.js"></script>
<script src="js/level-data.js"></script>
```

- [ ] **Step 4: Replace the original campaign and migrate game state**

Replace the inline 42-level `LEVELS` factory with an adapter over `VOCAB_LEVELS`. Build `LEVELS.eps` as one entry per unit or simplify selection to a single six-card grid. Each level must retain `id`, `unitId`, `name`, `theme`, `items`, and `pigRadius` access needed by `buildLevel`.

Change the bird and quiz state to:

```js
var birds=[], queueIdx=0;
var learning={}, attempt=null, currentQuestion=null, questionOpen=false;
var STORAGE_KEY='re0AngryBirds.progress.v1';
```

In `buildLevel(idx)`, initialize `attempt=VocabularyQuiz.createAttempt()`, resolve the matching vocabulary unit, load or normalize its saved word stats, start with an empty bird queue, and call `requestQuestion()` only after the level is visible. Remove the initial `loadBird()` call.

- [ ] **Step 5: Implement the earn-and-launch loop**

Add these transitions:

```js
function requestQuestion(){
  if(gameEnded || pigsAlive===0) return;
  currentQuestion=VocabularyQuiz.buildQuestion(curUnit,learning[curUnit.id],attempt,Math.random);
  questionOpen=true;
  paused=true;
  UI.showQuestion(currentQuestion);
  saveProgress();
}

function awardBirds(types){
  types.forEach(function(type){ birds.push({type:type,state:'queue'}); });
}

function continueAfterAnswer(){
  UI.hideQuestion();
  questionOpen=false;
  if(gameEnded)return;
  if(queueIdx < birds.length){ paused=false; if(!activeBird)loadBird(); }
  else requestQuestion();
}
```

`answerQuestion(selectedTerm)` calls `VocabularyQuiz.submitAnswer`, saves learning stats, paints correct/incorrect feedback, awards returned birds, updates the HUD, and calls `finishLevel(false, 'mistakes')` immediately when `result.failed` is true.

When a launched bird finishes and the queue is empty while pigs remain, replace the old end timer/failure branch with `requestQuestion()`. Do not fail because the dynamic bird queue is empty.

- [ ] **Step 6: Update victory, stars, history, and restart behavior**

Remove the remaining-bird score bonus. Compute stars exactly as:

```js
var stars = 1;
if(attempt.wrongAnswers<=1 && usedBird<=12) stars=2;
if(attempt.wrongAnswers===0 && usedBird<=8) stars=3;
```

Extend history records with `unitId`, `wrongAnswers`, and `correctAnswers`. Pass a failure reason to `UI.showResult`; show `答错 3 次，本关失败` for vocabulary failure and hide the next-level button. Restart must rebuild physics and clear only attempt-local streak/mistake/queue state.

- [ ] **Step 7: Replace campaign selection and instructions**

Render six cards labeled 4A through 6B. Keep sequential unlocking: 4A is initially open and each later unit unlocks when the previous unit has at least one star. Show per-level mastery as `已练习 x/8` by counting words with `shown > 0`. Update the title/footer and instructions to describe earning birds, four-answer rewards, twelve pigs, and failure after three wrong answers.

- [ ] **Step 8: Run the integration and full automated suite**

Run: `npm test`

Expected: PASS with zero failures.

- [ ] **Step 9: Commit the integrated learning loop**

```bash
git add index.html tests/html-integration.test.js
git commit -m "feat: integrate vocabulary purchases into gameplay"
```

---

### Task 5: Synthesized Background Music

**Files:**
- Modify: `index.html:218-275` (Web Audio controller)
- Modify: `index.html:2107-2122` (screen-state music changes)
- Modify: `index.html:2222-2233` (mute behavior)
- Modify: `tests/html-integration.test.js`

**Interfaces:**
- Extends `SFX` with `startMusic(mode)`, `stopMusic()`, and existing `setMuted(muted)` synchronization.
- `mode` is `'menu'` or `'play'`.

- [ ] **Step 1: Add failing static tests for music controls**

Append to `tests/html-integration.test.js`:

```js
test('defines synthesized menu and play BGM without external audio files', () => {
  assert.match(html, /startMusic:function/);
  assert.match(html, /stopMusic:function/);
  assert.match(html, /startMusic\('menu'\)/);
  assert.match(html, /startMusic\('play'\)/);
  assert.doesNotMatch(html, /<audio\b|\.mp3|\.ogg|\.wav/);
});
```

- [ ] **Step 2: Run the music test and verify it fails**

Run: `node --test tests/html-integration.test.js`

Expected: FAIL because BGM controls are absent.

- [ ] **Step 3: Implement a cancellable Web Audio loop**

Add `musicMode`, `musicTimer`, and `musicStep` to `SFX`. Schedule short oscillator notes every 220-300 ms using a small major-pentatonic pattern for menus and a slightly faster lower pattern for play. Route music through a dedicated gain node below the effects volume. `startMusic(mode)` must clear the prior timer, call `ensure()` only after a user gesture, and avoid starting a duplicate loop. `stopMusic()` clears the timer. `setMuted(true)` stops the loop; `setMuted(false)` resumes the last requested mode.

Start menu music from the existing Start button gesture and switch to play music after `Game.startLevel`. Switch back to menu music in `showTitle` and `showSelect` only after audio has already been unlocked.

- [ ] **Step 4: Run the full suite**

Run: `npm test`

Expected: PASS with zero failures.

- [ ] **Step 5: Commit BGM behavior**

```bash
git add index.html tests/html-integration.test.js
git commit -m "feat: add synthesized background music"
```

---

### Task 6: Browser Verification and Final Polish

**Files:**
- Modify: `index.html` only if browser verification exposes defects.
- Modify: existing tests first for every behavior defect discovered.

**Interfaces:**
- No new public interfaces; this task verifies the complete user journey.

- [ ] **Step 1: Run automated tests from a clean process**

Run: `npm test`

Expected: all tests pass with zero failures, warnings, or skipped tests.

- [ ] **Step 2: Start a local static server**

Run: `python3 -m http.server 4173`

Expected: server listens on `http://127.0.0.1:4173/`.

- [ ] **Step 3: Verify the core learning flow in a desktop browser**

Using the in-app browser, verify:

1. The title opens the six-card unit selection screen.
2. Starting 4A immediately opens a 4A cloze question.
3. A correct choice adds one red bird and permits launching it.
4. After the bird settles with pigs remaining and no queued bird, a new question opens.
5. Four consecutive correct answers add a red bird plus one visible special bird.
6. A wrong choice resets the streak and records one lost heart.
7. The third wrong choice opens the failure result and Retry rebuilds a fresh 12-pig attempt.
8. The debug view reports exactly twelve live pigs at each of the six level starts.

- [ ] **Step 4: Verify responsive and audio behavior**

Verify at one desktop landscape size and one narrow/mobile landscape size:

- Question text and all four answer controls are visible without overlap.
- Each answer button is easily tappable.
- HUD counters do not cover the pause, restart, history, home, or sound buttons.
- Menu and play music start only after interaction.
- Muting stops both BGM and effects; unmuting resumes the appropriate track.
- Mouse drag, touch/pointer drag, special abilities, pause, restart, and level selection still work.

- [ ] **Step 5: Fix defects through red-green cycles**

For each defect, add or tighten the closest automated test first, run it to see the expected failure, make the smallest code correction, then rerun the focused test and `npm test`. For visual-only defects, record the exact viewport and interaction used, make the smallest CSS correction, and repeat the same browser check.

- [ ] **Step 6: Run final repository checks**

Run:

```bash
npm test
git diff --check
git status --short
```

Expected: tests pass; no whitespace errors; status contains only intentional changes or is clean after commits.

- [ ] **Step 7: Commit final verified polish if needed**

```bash
git add index.html js tests package.json
git commit -m "fix: polish vocabulary campaign flow"
```
