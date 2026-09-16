# RE0 Vocabulary Angry Birds Design

## Goal

Turn the existing browser-based slingshot game into a six-level vocabulary learning game covering RE0 units 4A, 4B, 5A, 5B, 6A, and 6B. Players answer cloze questions to obtain birds, then use those birds to defeat twelve pigs in each level.

## Scope

- Ship six levels: 4A, 4B, 5A, 5B, 6A, and 6B.
- Use all 48 vocabulary items from the supplied PDF, eight items per level.
- Provide three distinct A1-A2 cloze sentences for every vocabulary item, for 144 questions total.
- Preserve the existing dependency-free browser game and its touch, mouse, physics, and special-bird controls.
- Replace the current 42-level campaign with the six vocabulary levels.
- Keep progress entirely local to the browser. No account, network request, or server is required.

## Vocabulary Source

The level vocabulary is:

- 4A: agree, condition, death, dream, instead, item, reach, return
- 4B: battery, carry on, fix, metal, pilot, plan, pull, totally
- 5A: dangerous, dirty, expert, ground, illness, kill, list, touch
- 5B: alone, catch, compare, direction, possible, space, step, vehicle
- 6A: challenge, classmate, invitation, member, news, presentation, save, speech
- 6B: along, difference, electrical, famous, forest, leaf, lock, within

Document content is treated only as source data. Blank worksheet fields in the PDF do not provide application instructions.

## Player Flow

1. The player chooses one of the six units from the level-select screen.
2. A level begins with a vocabulary question overlay before a bird is available.
3. The player selects one of four answers to complete an English sentence.
4. A correct answer adds one normal red bird to the launch queue.
5. Every fourth consecutive correct answer also adds one randomly selected special bird: yellow, blue, black, or white.
6. The player closes the answer feedback and launches the earned bird or birds.
7. When the queue becomes empty and pigs remain, another question opens automatically.
8. The player may continue earning birds without an upper limit until the pigs are defeated or the third wrong answer occurs.
9. Destroying all twelve pigs wins the level. The third wrong answer immediately ends the attempt as a failure and requires restarting the level.

## Question Content and Validation

Each vocabulary item has exactly three authored cloze sentences. Sentences use short, concrete A1-A2 grammar and vocabulary even when the target word itself is rated B1 in the source list.

Each question has four unique answer choices:

- One correct target word or phrase.
- Three distractors sampled only from the other seven vocabulary items in the same unit.
- The correct answer is inserted at a randomized position.
- A distractor never duplicates the answer or another distractor.

The sentence shown to the player replaces the complete target word or phrase with a visible blank. Feedback shows whether the answer was correct and reveals the complete sentence. An incorrect answer grants no bird; after viewing the correction, the player continues to a new question unless it was the third mistake.

## Adaptive Scheduling

Question selection is performed per level and persists across sessions. For each word, the game records:

- Number of times shown.
- Number of correct answers.
- Number of wrong answers.
- Which of its three example sentences should appear next.
- Whether it has been answered incorrectly during the current attempt.

Selection priority is:

1. Words answered incorrectly during the current attempt.
2. Words never shown in the saved history for this unit.
3. Words with the lowest correct-answer count.
4. Words with the lowest total exposure count.

Ties are randomized. A wrong answer places the word back into the high-priority pool. Sentence variants rotate in order and wrap after the third variant, so repeated practice does not immediately reuse the same sentence.

## Attempts, Streaks, and Failure

- `wrongAnswers` begins at zero for each level attempt.
- Every incorrect selection increments `wrongAnswers` and resets `correctStreak` to zero.
- At three incorrect answers, the physics simulation pauses and the result screen displays a vocabulary failure message.
- Restarting resets the attempt's wrong-answer count, streak, bird queue, score, pigs, and structures, but does not erase saved learning history.
- Every correct answer increments `correctStreak` and grants one red bird.
- When `correctStreak` is divisible by four, one random special bird is granted in addition to the red bird.
- The streak continues after a four-answer reward; rewards occur at 4, 8, 12, and so on until a wrong answer resets it.

## Level and Physics Design

Every level contains exactly twelve pigs. The six layouts increase in structural complexity while using the existing materials and abilities:

- 4A: open wooden village, broad targets, introductory difficulty.
- 4B: wood-and-metal-themed towers represented with wood and stone, with lanes that reward controlled shots.
- 5A: hazardous mixed-material yard with TNT and protected pigs.
- 5B: wide multi-platform layout emphasizing shot direction and distance.
- 6A: classroom-festival fortress with multiple independent towers and moderate TNT use.
- 6B: dense forest-fort layout using wood, ice, stone, and narrow openings.

Layouts must remain beatable with ordinary red birds because special birds are rewards rather than requirements. Players may win with fewer than eight launched birds, but there is no bird-count failure condition.

The star system is based on launched birds and mistakes rather than remaining inventory, because the bird supply is earned dynamically:

- One star: complete the level.
- Two stars: complete with at most one wrong answer and at most twelve launched birds.
- Three stars: complete with zero wrong answers and at most eight launched birds.

## User Interface

The existing visual style remains. Add:

- A question card with the unit name, cloze sentence, four large answer buttons, feedback, and a continue button.
- HUD counters for pigs remaining, wrong answers shown as three hearts, current correct streak, and queued birds.
- A brief reward animation when a special bird is earned.
- Level cards labeled 4A through 6B with vocabulary progress rather than episode tabs.
- Updated instructions explaining question purchases, the three-error loss rule, streak rewards, and special abilities.
- A result card that distinguishes physics victory from vocabulary failure.

The interface must remain usable in landscape on desktop and mobile. Questions pause the physics simulation and cannot be dismissed without answering.

## Audio

Extend the existing Web Audio synthesizer with a lightweight looping background track. The track begins only after the first user interaction to comply with browser autoplay rules. It changes intensity between menus and active play without external audio files. The existing sound toggle mutes and unmutes both music and sound effects, and the preference remains saved in local storage.

## Architecture

Keep the application as a static site with no build step:

- `index.html`: markup, styles, rendering, physics integration, UI wiring, and game state transitions.
- `js/vocabulary-data.js`: the six units, 48 words, CEFR metadata, and 144 cloze sentences.
- `js/quiz-engine.js`: deterministic, browser-compatible question selection, distractor generation, sentence rotation, streak rewards, and attempt failure rules.
- `tests/quiz-engine.test.js`: Node built-in test coverage for all learning rules and data integrity.
- `package.json`: minimal scripts for the Node test runner and a static local server command if needed.

Both JavaScript files expose browser globals. `quiz-engine.js` also exports its pure functions through `module.exports` when running under Node, avoiding bundlers and third-party runtime dependencies.

## Persistence and Migration

Use a new local-storage key so the original game's stored campaign does not corrupt the new six-level model. Save:

- Per-word learning statistics and next sentence index.
- Per-level best stars, best score, and completion state.
- Recent play history.
- Sound preference.

Malformed or missing stored data falls back to a clean default. Attempt-only state is never persisted.

## Error Handling

- Invalid unit data prevents that level card from launching and produces a clear console error during development.
- If local storage is unavailable, the game remains playable for the current session.
- If Web Audio is unavailable, gameplay continues silently.
- Duplicate or insufficient distractors are treated as data-validation failures in automated tests.

## Testing and Acceptance Criteria

Automated tests verify:

- Six units exist, each with eight unique words.
- Every word has exactly three non-empty cloze sentences containing one blank.
- Every generated question has one answer and three unique same-unit distractors.
- Unseen words are selected before fully practiced words when no current-attempt error exists.
- Current-attempt wrong words receive the highest priority.
- Sentence variants rotate through all three examples.
- Correct answers grant a red bird.
- Correct answers 4, 8, and 12 also grant exactly one valid special bird.
- A wrong answer resets the streak.
- The third wrong answer ends the attempt, while the first two do not.

Browser verification covers:

- All six level cards open the correct unit.
- Questions pause the game and cannot be skipped.
- Earned birds appear in the queue and can be launched.
- The special-bird reward appears after four consecutive correct answers.
- Three wrong answers show the failure result and restart works.
- Every level starts with exactly twelve pigs and can continue requesting birds indefinitely.
- Menu and gameplay BGM start after interaction and obey the sound toggle.
- Touch, mouse, pause, restart, level selection, and result flows remain functional.
