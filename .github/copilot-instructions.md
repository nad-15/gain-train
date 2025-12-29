# Copilot / Agent Instructions — gain-train

Purpose: short, actionable guidance so an AI coding agent can be immediately productive in this repository.

Overview
- This is a small single-page static web app (no build system). Entry: [index.html](index.html).
- UI and app logic live in [src/js/main.js](src/js/main.js). Styling is in [src/css/styles.css](src/css/styles.css).
- Persistence uses `localStorage` only — keys: `workouts`, `templates`, `customWorkoutTypes` (see `storage` object in `main.js`).

Architecture & data flow (quick)
- Browser UI → DOM handlers (onclicks / modal flows in `index.html`) invoke functions in [src/js/main.js](src/js/main.js).
- Core in-memory state is the `storage` singleton inside [src/js/main.js](src/js/main.js). Changing `storage.currentWorkout` then calls `autoSave()` which writes into `storage.workouts` and `localStorage`.
- Templates and custom workout types are read from/written to `storage.templates` and `storage.customWorkoutTypes`.

Key files / patterns to reference
- [index.html](index.html): page structure and modal markup, many elements rely on `id` attributes (e.g., `calendarGrid`, `exerciseList`, `templateSelectorModal`).
- [src/js/main.js](src/js/main.js): single large file with app logic. Look for `storage`, `startWorkout()`, `renderCalendar()`, `renderExercises()`, `autoSave()` to understand flows.
- [src/css/styles.css](src/css/styles.css): app styling and color classes for workout types (e.g., `.workout-btn.push`, `.workout-btn.pull`).
- [README.md](README.md): minimal project description.

Project-specific conventions
- No bundler: changes are effective by editing files and reloading the page. Prefer simple edits (avoid adding a build step unless explicitly requested).
- Workout types are canonical strings: `push`, `pull`, `legs`, `upper`, `lower`, `whole`, `rest`. `defaultTemplates` in `main.js` maps those to exercise lists.
- Custom workout types include an `id` field; code searches by `id` (see `storage.customWorkoutTypes.find(t => t.id === type)`).
- DOM wiring: many handlers are attached via `onclick` attributes in HTML and dynamic `element.onclick` in JS — search for inline handlers when tracing behavior.

Developer workflows / debugging tips
- Run locally: open `index.html` in a browser or use a static server (e.g., VS Code Live Server or `python -m http.server`).
- Inspect state: open DevTools → Console; view `localStorage` or evaluate `storage` from the console (the global `storage` object exists when `main.js` runs).
- Keys to inspect in `localStorage`: `workouts`, `templates`, `customWorkoutTypes`.
- To reproduce flows: in UI click Nav → Calendar → select a date → use the template selector to start a workout; observe `storage.currentWorkout` and `workouts` updates.

What an agent should change vs avoid
- Safe changes: UI text fixes, small feature additions in `main.js`, new CSS rules in `src/css/styles.css`.
- Avoid: introducing complex build tooling or module systems without an explicit task; this repo expects direct file edits.

Examples (copied from repo code)
- Starting a workout: `startWorkout(type, date, templateData)` (see [src/js/main.js](src/js/main.js)).
- Persisting: `storage.saveWorkouts()` stores `storage._workouts` to `localStorage` under key `workouts`.

If you need more
- If you want tests/a build step or to split `main.js` into modules, ask first — provide a migration plan and minimal CI changes.

End of agent notes — please review and tell me any missing details to add.
