# RE0 Full Vocabulary Campaign Design

## Goal

Expand Word Birds from six vocabulary levels to the complete RE0 course: 24 independently playable levels from Unit 1A through Unit 12B. Every level remains a vocabulary-powered slingshot battle with 15 pigs, unlimited earnable birds, one double-health helmet pig, and English-only player-facing UI.

## Source and Scope

The supplied `RE0 单词表【单元】.pdf` is used only as vocabulary source material. Its worksheet labels and blank fields are not application instructions.

The final campaign contains 24 units, eight source terms per unit, and three authored cloze sentences per term:

- 192 vocabulary terms total.
- 576 distinct cloze sentences total.
- 18 new levels, 144 new terms, and 432 new sentences beyond the existing 4A-6B implementation.

The source vocabulary is:

- 1A: explore, knock, maybe, pass, speed, strange, technology, thin
- 1B: finally, lost, natural, piece, purpose, report, sink, strike
- 2A: argue, athlete, exactly, record, tradition, unhealthy, various, work out
- 2B: breathe, contain, dish, fit, health, hungry, painful, plant
- 3A: amazing, career, decide, follow, get married, history, hurt, lucky
- 3B: cost, enough, free, pay, project, several, situation, spend
- 4A: agree, condition, death, dream, instead, item, reach, return
- 4B: battery, carry on, fix, metal, pilot, plan, pull, totally
- 5A: dangerous, dirty, expert, ground, illness, kill, list, touch
- 5B: alone, catch, compare, direction, possible, space, step, vehicle
- 6A: challenge, classmate, invitation, member, news, presentation, save, speech
- 6B: along, difference, electrical, famous, forest, leaf, lock, within
- 7A: last, memory, period, prepare, problem, result, useful, worried
- 7B: believe, impossible, mind, mistake, personal, straight, therefore, trick
- 8A: adult, careful, enter, freeze, on your own, parent, skin, weigh
- 8B: behavior, fear, in fact, joke, laugh, place, relationship, sense of humor
- 9A: birth, central, complete, during, finish, promise, together, tourist
- 9B: design, incredible, invent, lift, light, remain, solution, wide
- 10A: at least, blame, financial, float, forecast, large, power, temperature
- 10B: actually, deliver, drop, explode, increase, local, unusual, warning
- 11A: disappear, further, imagine, in detail, nearby, owner, perfect, store
- 11B: climb, cover, definitely, hunt, meanwhile, rise, toward, way
- 12A: act, daily, factory, operate, rough, sign, simple, uncomfortable
- 12B: electricity, get dressed, mirror, pick up, program, recently, turn, voice

## Campaign Organization

Levels appear in course order from 1A to 12B. They are grouped into four English-labeled chapter tabs solely to keep the level-select screen readable:

- Units 1-3: First Steps
- Units 4-6: Growing Skills
- Units 7-9: Big Ideas
- Units 10-12: World Challenges

All 24 levels are open from the first visit. Tabs filter which six level cards are visible, but never lock levels and never inspect stars or previous completion. The level grid does not render lock icons or locked styling. The Next Level button advances to the next unit in course order and wraps from 12B back to the level-select screen.

The total-star display uses a denominator of 72. Existing per-level stars, scores, play history, and per-word learning records for 4A-6B remain valid because unit IDs and the existing storage key remain unchanged.

## Vocabulary Questions

Every vocabulary term has exactly three manually authored English cloze sentences. Sentence grammar and context target A1-A2 learners even when the source term itself is more advanced. Each sentence:

- Is short and concrete.
- Contains exactly one `___` blank.
- Uses the complete target term or phrase at that blank.
- Is distinct from the other two examples for that term.
- Remains understandable without outside context.

Every question presents four unique choices: the correct answer and three distractors taken only from the other seven terms in that unit. Multi-word answers such as `work out`, `get married`, and `sense of humor` are displayed and checked as full phrases.

Adaptive scheduling remains unchanged:

1. Terms answered incorrectly in the current attempt.
2. Terms never shown in saved learning history.
3. Terms with the fewest correct answers.
4. Terms with the fewest total appearances.

The three example sentences rotate in order per term. Answer-choice order and ties between equally ranked terms are randomized.

## Battle Rules

All existing learning and combat rules remain active:

- A correct answer grants one red bird.
- Every fourth consecutive correct answer also grants one random special bird.
- Birds can be earned without a maximum until the level is won or failed.
- A wrong answer grants no bird and resets the answer streak.
- The third wrong answer ends the attempt and requires a restart.
- Each level contains exactly 15 pigs, including exactly one helmet pig with twice a normal pig's health.
- Falling or sliding building pieces damage pigs according to collision energy.
- Birds retain increased bounce after hitting pigs and structures.
- Three stars require victory with zero wrong answers and at most 12 launched birds.

## Level Architecture

The 24 levels use a data-driven library of stable structural patterns rather than 24 unrelated blocks of construction code. Shared builders create huts, towers, bridges, braces, platforms, and TNT pockets. Per-level configuration controls positions, materials, layering, pig placement, helmet placement, and optional explosives.

Each level must satisfy these invariants:

- Exactly 15 visible pigs and exactly one helmet pig.
- Every pig begins at an on-screen horizontal position.
- At least 18 structural blocks.
- At least two materials from wood, ice, and stone.
- At least one beam 2.2 world units or wider that links structural sections.
- A stable starting arrangement that does not immediately collapse or kill pigs before player input.
- A path to victory using ordinary red birds; special birds improve efficiency but are never mandatory.

Difficulty and visual complexity rise by chapter:

- Units 1-3 use open villages, simple frames, and exposed supports.
- Units 4-6 keep the current medium-complexity layouts and mixed materials.
- Units 7-9 introduce layered bridges, keystones, protected pigs, and controlled TNT chains.
- Units 10-12 use denser multi-material forts, suspended platforms, and larger chain reactions.

Layouts are deterministic. The same unit always begins with the same structure, which keeps educational practice and browser verification reproducible.

## User Interface

The player-facing interface remains English-only. Required changes are:

- Show four chapter tabs and a short English chapter description.
- Show six level cards for the selected chapter.
- Keep every card clickable regardless of completion.
- Update the title footer from six units to 24 units.
- Show total stars out of 72.
- Keep vocabulary, mistake, streak, bird, helmet-pig, BGM, pause, history, and result messaging in English.
- Preserve landscape mobile and desktop layouts.

The history screen reports completion by unique unit ID instead of counting arbitrary keys. Existing history entries continue to render even if they predate the full campaign.

## Code Organization

The site stays dependency-free at runtime and requires no build step:

- `js/vocabulary-data.js`: all 24 unit objects and 576 cloze sentences.
- `js/level-data.js`: reusable structure builders, 24 deterministic level configurations, and chapter metadata.
- `js/quiz-engine.js`: existing adaptive selection and reward logic; changed only if validation reveals a full-course edge case.
- `index.html`: chapter tabs, all-open level selection, copy changes, and integration with chapter metadata.
- `tests/vocabulary-data.test.js`: exact source-word order and full question-data integrity.
- `tests/level-data.test.js`: 24-level ordering, construction invariants, chapter mapping, and helmet-pig counts.
- `tests/game-integration.test.js`: all-open selection, chapter navigation, Next Level behavior, and full campaign integration.

## Persistence and Compatibility

Continue using `re0AngryBirds.progress.v1`. No migration is required because records are keyed by unit ID or term. Loading progress must tolerate missing records for the newly added units and create clean learning state for those terms on first play.

No action clears or rewrites the player's existing 4A-6B progress. Malformed storage still falls back to the existing safe defaults.

## GitHub Delivery

Only `https://github.com/reaganskinneruy5-eng/angry-birds` is an upload target. The former `yjj0339/angry-birds-slingshot` remote is retained, if needed, only as source provenance and must not receive a push.

The target repository's `main` history is preserved. Delivery must be a fast-forward update based on the target repository's current `main`; force-push is prohibited. Unrelated local `.DS_Store` files remain untracked and are not committed.

## Automated Acceptance Criteria

Automated checks prove that:

- Unit IDs are exactly 1A, 1B, 2A, 2B through 12A, 12B in order.
- Every unit contains its eight exact source terms with no duplicates.
- Every term has exactly three distinct, non-empty, one-blank examples.
- The full dataset contains 192 terms and 576 examples.
- Generated questions contain one answer plus three unique same-unit distractors.
- Every unit has one matching level in identical order.
- Every level satisfies all pig, helmet, material, block, beam, and supported-item constraints.
- Chapter metadata covers every level exactly once in four groups of six.
- Level selection contains no star-dependent lock condition.
- Existing quiz, combat, audio, result, restart, and level-transition regression tests still pass.

## Browser Acceptance Criteria

Manual browser verification covers representative levels 1A, 4A, 7A, 10A, and 12B plus one B unit from each chapter:

- Every chapter tab displays the correct six cards.
- A fresh browser profile can open any card, including 12B.
- Questions use the selected unit and grant birds correctly.
- Structures remain stable before launch and react physically after impact.
- Each checked level begins with 15 pigs and one visibly helmeted pig.
- Three wrong answers fail and restart cleanly.
- A no-miss victory using at most 12 birds awards three stars.
- Next Level follows course order without dropping a bird or freezing the reward flow.
- BGM and sound controls work in menus and battle.
