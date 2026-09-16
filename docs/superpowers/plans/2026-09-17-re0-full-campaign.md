# RE0 Full Vocabulary Campaign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand Word Birds to all 24 RE0 A/B units, keep every level open, and deliver the verified result to the user's GitHub repository.

**Architecture:** Keep the static, dependency-free browser application and current persistence key. Expand the vocabulary dataset directly, generate deterministic physics layouts from reusable structural recipes, and drive a four-tab campaign selector from exported chapter metadata. Preserve existing quiz and combat interfaces so saved 4A-6B learning data continues to work.

**Tech Stack:** HTML5 Canvas, browser JavaScript (ES5-compatible style), Node.js built-in test runner, Git, GitHub Pages-compatible static files.

**Spec:** `docs/superpowers/specs/2026-09-17-re0-full-campaign-design.md`

## Global Constraints

- All 24 levels are open immediately; no completion- or star-based lock condition may remain.
- Unit order is 1A, 1B, 2A, 2B through 12A, 12B.
- Every unit has exactly eight source terms and every term has exactly three distinct one-blank examples.
- Every level has exactly 15 pigs, exactly one helmet pig, at least 18 blocks, at least two materials, and at least one beam with width 2.2 or greater.
- Existing mechanics remain: unlimited earned birds, three-miss failure, special bird every fourth consecutive correct answer, kinetic building damage, lively bird bounce, and three stars for zero misses with at most 12 launched birds.
- Continue using `re0AngryBirds.progress.v1`; do not erase existing 4A-6B progress.
- Do not add runtime dependencies or a build step.
- Do not commit `.DS_Store` files.
- Push only to `https://github.com/reaganskinneruy5-eng/angry-birds`; never push to `yjj0339/angry-birds-slingshot`.

---

### Task 1: Complete RE0 vocabulary dataset

**Files:**
- Modify: `tests/vocabulary-data.test.js:7-36`
- Modify: `js/vocabulary-data.js:8-69`

**Interfaces:**
- Consumes: the exact unit/term list in the approved spec.
- Produces: browser global and CommonJS export `VOCAB_UNITS`, an ordered array of `{id, title, words}` where each word is `{term, cefr, examples}`.

- [ ] **Step 1: Replace the six-unit expectation with the full source map and total checks**

```js
const EXPECTED = {
  '1A':['explore','knock','maybe','pass','speed','strange','technology','thin'],
  '1B':['finally','lost','natural','piece','purpose','report','sink','strike'],
  '2A':['argue','athlete','exactly','record','tradition','unhealthy','various','work out'],
  '2B':['breathe','contain','dish','fit','health','hungry','painful','plant'],
  '3A':['amazing','career','decide','follow','get married','history','hurt','lucky'],
  '3B':['cost','enough','free','pay','project','several','situation','spend'],
  '4A':['agree','condition','death','dream','instead','item','reach','return'],
  '4B':['battery','carry on','fix','metal','pilot','plan','pull','totally'],
  '5A':['dangerous','dirty','expert','ground','illness','kill','list','touch'],
  '5B':['alone','catch','compare','direction','possible','space','step','vehicle'],
  '6A':['challenge','classmate','invitation','member','news','presentation','save','speech'],
  '6B':['along','difference','electrical','famous','forest','leaf','lock','within'],
  '7A':['last','memory','period','prepare','problem','result','useful','worried'],
  '7B':['believe','impossible','mind','mistake','personal','straight','therefore','trick'],
  '8A':['adult','careful','enter','freeze','on your own','parent','skin','weigh'],
  '8B':['behavior','fear','in fact','joke','laugh','place','relationship','sense of humor'],
  '9A':['birth','central','complete','during','finish','promise','together','tourist'],
  '9B':['design','incredible','invent','lift','light','remain','solution','wide'],
  '10A':['at least','blame','financial','float','forecast','large','power','temperature'],
  '10B':['actually','deliver','drop','explode','increase','local','unusual','warning'],
  '11A':['disappear','further','imagine','in detail','nearby','owner','perfect','store'],
  '11B':['climb','cover','definitely','hunt','meanwhile','rise','toward','way'],
  '12A':['act','daily','factory','operate','rough','sign','simple','uncomfortable'],
  '12B':['electricity','get dressed','mirror','pick up','program','recently','turn','voice']
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
  for (const unit of units) for (const word of unit.words) {
    assert.match(word.cefr, /^(A1|A2|B1|B2)$/);
    assert.equal(word.examples.length, 3, `${unit.id} ${word.term}`);
    assert.equal(new Set(word.examples).size, 3, `${unit.id} ${word.term}`);
    for (const sentence of word.examples) {
      assert.equal((sentence.match(/___/g) || []).length, 1, sentence);
      assert.ok(sentence.length >= 10 && sentence.length <= 100, sentence);
      allExamples.push(`${unit.id}:${word.term}:${sentence}`);
    }
  }
  assert.equal(allExamples.length, 576);
  assert.equal(new Set(allExamples).size, 576);
});
```

- [ ] **Step 2: Run the data test and verify the expected red state**

Run: `node --test tests/vocabulary-data.test.js`

Expected: FAIL because `VOCAB_UNITS` still begins at 4A and contains only 48 terms and 144 examples.

- [ ] **Step 3: Expand `VOCAB_UNITS` to 24 complete units**

Keep the current UMD wrapper unchanged. Insert units 1A-3B before 4A and units 7A-12B after 6B. For every exact term in `EXPECTED`, author three short A1-A2-context sentences using this concrete record shape:

```js
{id:'1A',title:'Unit 1A',words:[
  {term:'explore',cefr:'A2',examples:['We will ___ the old town today.','The children want to ___ the cave.','Use this map to ___ the island.']},
  {term:'knock',cefr:'A2',examples:['Please ___ before you enter.','I heard someone ___ on the door.','Do not ___ the glass off the table.']},
  {term:'maybe',cefr:'A1',examples:['___ we can go after lunch.','It will ___ rain this evening.','She is ___ at home today.']},
  {term:'pass',cefr:'A2',examples:['Please ___ me the blue cup.','You must study to ___ the test.','We ___ the park on our way home.']},
  {term:'speed',cefr:'A2',examples:['The car moved at high ___.','Please keep your ___ low here.','Wind can change the boat’s ___.']},
  {term:'strange',cefr:'A2',examples:['I heard a ___ sound outside.','This fruit has a ___ shape.','A ___ man stood by the gate.']},
  {term:'technology',cefr:'A2',examples:['New ___ helps us talk online.','The school uses ___ in class.','This phone is useful ___.']},
  {term:'thin',cefr:'A2',examples:['The ice is too ___ to walk on.','Cut the bread into ___ pieces.','He wore a ___ coat in spring.']}
]}
```

Apply the same explicit object contract to every remaining term listed in `EXPECTED`. Preserve the existing 4A-6B records exactly unless a validation failure proves a correction is needed. Use straight or typographic apostrophes consistently within valid JavaScript string delimiters.

- [ ] **Step 4: Run vocabulary and quiz tests**

Run: `node --test tests/vocabulary-data.test.js tests/quiz-engine.test.js`

Expected: PASS, with 24 units, 192 terms, 576 examples, and same-unit four-choice quiz behavior.

- [ ] **Step 5: Commit the completed curriculum data**

```bash
git add js/vocabulary-data.js tests/vocabulary-data.test.js
git commit -m "feat: add complete RE0 vocabulary curriculum"
```

---

### Task 2: Generate 24 deterministic battle layouts and chapter metadata

**Files:**
- Modify: `tests/level-data.test.js:8-45`
- Modify: `js/level-data.js:8-143`

**Interfaces:**
- Consumes: `VOCAB_UNITS` order through tests; existing renderer item schema `{k:'b'|'p'|'t'}`.
- Produces: `VOCAB_LEVELS = {chapters, levels, pigRadius}`, with each level containing `{id, unitId, name, theme, chapter, items}`.

- [ ] **Step 1: Add full-course layout and chapter tests**

```js
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

test('keeps every pig and structure inside supported bounds', () => {
  for (const level of levelData.levels) {
    const pigs=level.items.filter((item) => item.k==='p');
    const blocks=level.items.filter((item) => item.k==='b');
    assert.equal(pigs.length,15,level.unitId);
    assert.equal(pigs.filter((pig) => pig.s==='h').length,1,level.unitId);
    assert.ok(pigs.every((pig) => pig.x>=4.2 && pig.x<=20),level.unitId);
    assert.ok(blocks.length>=18,level.unitId);
    assert.ok(new Set(blocks.map((block) => block.m)).size>=2,level.unitId);
    assert.ok(blocks.some((block) => block.w>=2.2),level.unitId);
    assert.ok(level.items.every((item) => Number.isFinite(item.x) && Number.isFinite(item.y)),level.unitId);
  }
});
```

- [ ] **Step 2: Run the level-data test and verify the expected red state**

Run: `node --test tests/level-data.test.js`

Expected: FAIL because chapter metadata is absent and only six levels exist.

- [ ] **Step 3: Refactor construction into reusable deterministic recipes**

Add structural helpers with these interfaces:

```js
function tower(a,x,materials,stories,y){
  var top=y||0;
  for(var story=0;story<stories;story++) top=hut(a,x,materials[story%materials.length],top);
  return top;
}
function brace(a,x,y,w,mat){
  a.push(block(x,y,w,TOP,mat));
}
function addPig(a,x,surface,size){
  a.push(pig(x,pigY(surface,size),size));
}
function level(id,name,theme,chapter,items){
  return {id:id,unitId:id,name:name,theme:theme,chapter:chapter,items:items};
}
```

Use four deterministic recipe families, each receiving a configuration object and returning an item array. The shared implementation below guarantees 18 tower blocks, linked beams, and 15 pig slots before family-specific braces and TNT are added:

```js
function buildRecipe(config,style){
  var a=[],tops=[],unit=PH+TOP;
  config.centers.forEach(function(x,index){
    tops.push(tower(a,x,config.materials.slice(index).concat(config.materials),2,0));
  });
  brace(a,(config.centers[0]+config.centers[1])/2,style.linkY,
    config.centers[1]-config.centers[0]+0.5,config.materials[style.linkMaterial]);
  brace(a,(config.centers[1]+config.centers[2])/2,style.linkY,
    config.centers[2]-config.centers[1]+0.5,config.materials[(style.linkMaterial+1)%3]);
  var slots=[];
  config.centers.forEach(function(x,index){
    slots.push([x,0,'s'],[x,unit,index===1?'m':'s'],[x,tops[index],index===2?'m':'s']);
  });
  config.groundPigs.forEach(function(x,index){
    slots.push([x,0,index%3===1?'m':'s']);
  });
  slots.forEach(function(slot,index){
    addPig(a,slot[0],slot[1],index===config.helmetSlot?'h':slot[2]);
  });
  config.tntX.forEach(function(x){a.push(tnt(x,0.3));});
  return a;
}
function openVillage(config){
  return buildRecipe(config,{linkY:0.12,linkMaterial:0});
}
function linkedTowers(config){
  return buildRecipe(config,{linkY:PH+TOP+0.12,linkMaterial:1});
}
function chainBridge(config){
  return buildRecipe(config,{linkY:(PH+TOP)*2+0.12,linkMaterial:2});
}
function layeredFort(config){
  var a=buildRecipe(config,{linkY:(PH+TOP)*2+0.12,linkMaterial:0});
  brace(a,12.5,(PH+TOP)*2+0.48,6.2,config.materials[2]);
  return a;
}
```

Each function must build its complete item list from existing `block`, `pig`, `tnt`, `pigY`, `hut`, `bridge`, `tower`, `brace`, and `addPig` helpers. It must apply the configuration's exact materials, x positions, TNT positions, and helmet slot without random numbers.

- [ ] **Step 4: Define chapter metadata and the 24 named configurations**

```js
var chapters=[
  {id:1,name:'First Steps',desc:'Open structures and clear targets · Units 1-3',units:['1A','1B','2A','2B','3A','3B']},
  {id:2,name:'Growing Skills',desc:'Mixed materials and linked towers · Units 4-6',units:['4A','4B','5A','5B','6A','6B']},
  {id:3,name:'Big Ideas',desc:'Layered bridges and chain reactions · Units 7-9',units:['7A','7B','8A','8B','9A','9B']},
  {id:4,name:'World Challenges',desc:'Dense forts and advanced demolition · Units 10-12',units:['10A','10B','11A','11B','12A','12B']}
];
var levelConfigs=[
  {id:'1A',name:'Explorer Village',theme:'grass',chapter:1,recipe:'open'},
  {id:'1B',name:'Nature Crossing',theme:'grass',chapter:1,recipe:'open'},
  {id:'2A',name:'Athlete Arena',theme:'grass',chapter:1,recipe:'open'},
  {id:'2B',name:'Healthy Garden',theme:'ice',chapter:1,recipe:'open'},
  {id:'3A',name:'Lucky History Hall',theme:'grass',chapter:1,recipe:'open'},
  {id:'3B',name:'Project Market',theme:'dusk',chapter:1,recipe:'open'},
  {id:'4A',name:'Agreement Village',theme:'grass',chapter:2,recipe:'towers'},
  {id:'4B',name:'Metal Workshop',theme:'stone',chapter:2,recipe:'towers'},
  {id:'5A',name:'Hazard Yard',theme:'dusk',chapter:2,recipe:'towers'},
  {id:'5B',name:'Direction Bridges',theme:'ice',chapter:2,recipe:'towers'},
  {id:'6A',name:'Speech Festival Fort',theme:'dusk',chapter:2,recipe:'towers'},
  {id:'6B',name:'Forest Stronghold',theme:'night',chapter:2,recipe:'towers'},
  {id:'7A',name:'Memory Causeway',theme:'ice',chapter:3,recipe:'bridge'},
  {id:'7B',name:'Mind Trick Keep',theme:'dusk',chapter:3,recipe:'bridge'},
  {id:'8A',name:'Frozen Crossing',theme:'ice',chapter:3,recipe:'bridge'},
  {id:'8B',name:'Laughing Gallery',theme:'grass',chapter:3,recipe:'bridge'},
  {id:'9A',name:'Tourist Center',theme:'stone',chapter:3,recipe:'bridge'},
  {id:'9B',name:'Inventor Liftworks',theme:'night',chapter:3,recipe:'bridge'},
  {id:'10A',name:'Forecast Power Plant',theme:'dusk',chapter:4,recipe:'fort'},
  {id:'10B',name:'Warning Depot',theme:'stone',chapter:4,recipe:'fort'},
  {id:'11A',name:'Hidden Storehouse',theme:'night',chapter:4,recipe:'fort'},
  {id:'11B',name:'Hunter Heights',theme:'stone',chapter:4,recipe:'fort'},
  {id:'12A',name:'Rough Factory',theme:'dusk',chapter:4,recipe:'fort'},
  {id:'12B',name:'Electric Mirror Citadel',theme:'night',chapter:4,recipe:'fort'}
];
```

Give every configuration explicit material arrays, structural x positions, helmet slot, variant number, and TNT positions. Map `recipe` to the matching builder and assert the returned data through tests, not runtime randomness. Preserve the existing 4A-6B visual identities while routing them through the common return format.

- [ ] **Step 5: Run layout unit tests**

Run: `node --test tests/level-data.test.js`

Expected: PASS for 24 ordered levels, four chapters, 15 pigs, one helmet, and all structural invariants.

- [ ] **Step 6: Commit the full level set**

```bash
git add js/level-data.js tests/level-data.test.js
git commit -m "feat: add 24 RE0 battle layouts"
```

---

### Task 3: Make the four-chapter campaign fully open

**Files:**
- Modify: `tests/game-integration.test.js:8-198`
- Modify: `index.html:65-79,217-267,1454-1461,2270-2350,2417-2431`

**Interfaces:**
- Consumes: `VOCAB_LEVELS.chapters` and `VOCAB_LEVELS.levels[*].chapter`.
- Produces: `LEVELS.eps`, `Game.startLevel(index)`, `Game.next()`, and `UI.showSelect()` behavior with all-open chapter-filtered cards.

- [ ] **Step 1: Update integration expectations and add all-open campaign tests**

Update the first-level expectation from 4A to 1A and iterate over all 24 levels in structural stability checks. Add:

```js
test('a fresh profile can start the final unit without clearing earlier levels', () => {
  const app=loadGame();
  app.context.Game.startLevel(23);
  assert.equal(app.context.Game.getQuizView().unitId,'12B');
  assert.equal(app.context.Game.dbg().pigsAlive,15);
});

test('level select exposes four chapter tabs and six open cards per chapter', () => {
  const app=loadGame();
  app.context.UI.showSelect();
  assert.equal(app.elements.episodeTabs.children.length,4);
  assert.equal(app.elements.levelGrid.children.length,6);
  assert.ok(app.elements.levelGrid.children.every((card) => !card.className.includes('locked')));
  app.elements.episodeTabs.children[3].onclick();
  assert.equal(app.elements.levelGrid.children.length,6);
  app.elements.levelGrid.children[5].onclick();
  assert.equal(app.context.Game.getQuizView().unitId,'12B');
});

test('full campaign reports 72 available stars', () => {
  const app=loadGame();
  app.context.UI.showSelect();
  assert.equal(app.elements.totalStars.textContent,'★ 0 / 72');
});
```

Adjust the fake DOM so assigning `innerHTML=''` clears `children`. Implement `innerHTML` as an accessor backed by a private string inside `makeElement`, clearing the child array only when assigned an empty string.

- [ ] **Step 2: Run the integration test and verify the expected red state**

Run: `node --test tests/game-integration.test.js`

Expected: FAIL because level zero is still 4A, final index 23 does not exist, episode tabs are hidden, and card locks depend on stars.

- [ ] **Step 3: Wire chapter metadata into `LEVELS`**

```js
LEVELS={
  eps:VOCAB_LEVELS.chapters,
  levels:VOCAB_LEVELS.levels.map(function(level,index){
    return {id:level.id,unitId:level.unitId,name:level.name,theme:level.theme,
      ep:level.chapter,items:level.items,index:index};
  }),
  PIG_R:VOCAB_LEVELS.pigRadius
};
```

Remove `isUnlocked`. Make `Game.next()` start `curLvIdx + 1` whenever it exists; after 12B, return to level select.

- [ ] **Step 4: Render open chapter tabs and chapter-filtered cards**

Track `activeChapter=1` inside `UI`. `showSelect()` creates one `.etab` per `LEVELS.eps`, activates its click handler, displays its `desc`, and calls `renderGrid(activeChapter)`. The grid filters by `l.ep===activeChapter` but keeps the original global index for `Game.startLevel(idx)`.

Cards always use `className='lcard'`; remove lock checks, lock icons, lock styling, and guarded click handlers. Set selection copy to `24 vocabulary units · 8 words and 15 pigs per level` and keep the star denominator derived as `LEVELS.levels.length*3`.

Update the title footer to:

```html
<div id="titleFoot">24 UNITS · ANSWER TO EARN BIRDS · ALL LEVELS OPEN</div>
```

- [ ] **Step 5: Count completed units safely in history**

```js
var done=LEVELS.levels.filter(function(level){
  return (prog.stars[level.id]||0)>0;
}).length;
```

This ignores stale keys while preserving valid 4A-6B stars and learning records.

- [ ] **Step 6: Run integration and full automated suites**

Run: `node --test tests/game-integration.test.js`

Expected: PASS, including opening 12B on a clean profile and navigating all four tabs.

Run: `npm test`

Expected: PASS with no failures or warnings.

- [ ] **Step 7: Commit the all-open campaign UI**

```bash
git add index.html tests/game-integration.test.js
git commit -m "feat: open all 24 vocabulary levels"
```

---

### Task 4: Verify physics stability, content quality, and browser flows

**Files:**
- Modify if a failing check requires correction: `js/vocabulary-data.js`
- Modify if a failing check requires correction: `js/level-data.js`
- Modify if a failing check requires correction: `index.html`
- Modify if a regression requires coverage: `tests/*.test.js`

**Interfaces:**
- Consumes: the complete static application and all test contracts.
- Produces: a release candidate with reproducible automated and visual evidence.

- [ ] **Step 1: Run the complete automated suite from a clean process**

Run: `npm test`

Expected: every test passes, including all 24 four-second pre-launch stability simulations.

- [ ] **Step 2: Audit all authored examples for learner clarity**

Read each unit in `js/vocabulary-data.js` and verify the completed sentence formed by replacing `___` with the target term is grammatical and unambiguous. Correct content mistakes one at a time by first adding a focused assertion to `tests/vocabulary-data.test.js`, observing it fail, changing the sentence, and rerunning the focused test.

- [ ] **Step 3: Run the site locally and verify representative levels**

Run: `python3 -m http.server 8000`

In the browser, verify 1A, 1B, 4A, 7A, 8B, 10A, 11B, and 12B. For each checked level confirm the correct unit question appears, 15 pigs and one helmet pig are visible, the structure stays still before launch, and a correct answer grants a bird. Also verify chapter tabs, unrestricted 12B access, restart after three misses, the Next Level flow, history, sound, and English-only visible UI.

- [ ] **Step 4: Re-run the full suite after browser corrections**

Run: `npm test`

Expected: PASS with a clean test process and no output indicating uncaught errors.

- [ ] **Step 5: Commit any verification-driven fixes**

```bash
git add js/vocabulary-data.js js/level-data.js index.html tests
git commit -m "fix: polish full RE0 campaign"
```

Skip this commit only when verification produced no file changes.

---

### Task 5: Deliver to the user's GitHub repository without touching the source remote

**Files:**
- Modify: Git remote configuration only; no application files.

**Interfaces:**
- Consumes: verified commits and target `reaganskinneruy5-eng/angry-birds` main branch.
- Produces: a fast-forward update on the target repository's `main` branch.

- [ ] **Step 1: Add and fetch a dedicated target remote**

```bash
git remote add user-origin https://github.com/reaganskinneruy5-eng/angry-birds.git
git fetch user-origin main
```

If `user-origin` already exists, verify its URL with `git remote get-url user-origin` and correct only that named remote. Do not change or push `origin`, which points to `yjj0339`.

- [ ] **Step 2: Preserve target history with a target-based delivery branch**

Create `deliver/re0-full-campaign` from `user-origin/main`. Apply only the full-campaign commits made by Tasks 1-4 plus the approved design and plan commits. Resolve a conflict by preserving the target copy of unrelated files and applying the verified versions only for files named in this plan.

```bash
git switch -c deliver/re0-full-campaign user-origin/main
git cherry-pick 36ccf2d
```

Cherry-pick the plan and implementation commit hashes in chronological order after they exist. Never use `--force`, `--force-with-lease`, or `--allow-unrelated-histories`.

- [ ] **Step 3: Verify the exact delivery tree**

Run: `npm test`

Expected: PASS on the target-based branch.

Run: `git status --short`

Expected: only the pre-existing untracked `.DS_Store` paths may appear; no tracked change remains uncommitted.

Run: `git diff --stat user-origin/main...HEAD`

Expected: changes are limited to the approved docs, vocabulary data, level data, UI, and tests.

- [ ] **Step 4: Push only to the user's target repository**

```bash
git push user-origin HEAD:main
```

Expected: fast-forward success. If authentication is unavailable, stop without altering any remote branch and report the exact sign-in requirement; do not fall back to the `origin` remote.

- [ ] **Step 5: Confirm the remote commit and Pages source**

Run: `git ls-remote user-origin refs/heads/main`

Expected: the returned commit equals local `HEAD`. Open the target repository and its Pages deployment, then smoke-test that 12B opens from a fresh profile.
