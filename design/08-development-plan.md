# 08 Development Plan

Terminology note: this document follows `design/09-glossary.md`. In English planning sections, `case/story` maps to “案件”, `chapter` maps to “章节”, `phase` is used for project phases, and `stage` is reserved for internal state-machine status.

## 1. Plan Overview

This document defines the development plan for the demo version of the micro-horror reasoning web game. The project goal in the current phase is not to build a full commercial product, but to complete a stable, immersive, and presentable desktop web demo.

The demo must let players:

- enter quickly
- interact through a fake ChatGPT-style conversation interface
- discover hidden clues
- solve at least one password/reasoning gate
- reconstruct a disappearance event within 10-15 minutes

The plan emphasizes limited scope, clear division of labor, and fast iteration.

## 2. Development Objective

### 2.1 Current Phase Objective

Complete a playable single-case demo that includes:

- a desktop-first ChatGPT-like page
- dialogue-driven progression
- scripted fake AI responses
- clue discovery and password solving
- final truth reveal

### 2.2 Demo Success Criteria

The demo is considered complete if:

- the page can be opened and played in a browser
- the first interaction starts within 5 seconds
- the player can finish one full case
- the main logic does not break under common user input
- the team can use it in presentation or course defense

## 3. Scope Definition

### 3.1 In-Scope

- One complete case
- Desktop web UI
- Chat-based interaction
- Predetermined AI-like output
- Basic clue system
- Basic password or decoding puzzle
- Fake system messages and disguised progress cues

### 3.2 Out of Scope

- Multiplayer mode
- Real-time communication
- Actual AI API integration
- Cloud save
- Login/account system
- Mobile version
- Multi-case content expansion
- Complex level editor

Keeping these items out of scope is necessary to protect delivery quality.

## 4. Development Strategy

### 4.1 General Strategy

Adopt a content-first and demo-first strategy.

Priority order:

1. Lock the game concept and story structure
2. Define the interaction flow and puzzle logic
3. Implement the dialogue engine and main UI
4. Fill the content and refine immersion
5. Test, trim, and polish the demo

### 4.2 Why This Strategy

This project depends heavily on text content and controlled player flow. If the team starts from visual polish or advanced features too early, the playable core may remain incomplete. Therefore, the first deliverable should always be the shortest path to a full beginning-middle-end experience.

## 5. Work Breakdown Structure

### 5.1 Phase 1: Requirement Lock

Goal:

- Align the team on what the demo is and is not.

Tasks:

- Confirm target platform is desktop web.
- Confirm there is only one case.
- Confirm there is no real AI access.
- Confirm the game loop is 10-15 minutes.
- Confirm the final demo feature list.

Outputs:

- finalized product description
- finalized technical design
- finalized content scope

### 5.2 Phase 2: Narrative and Puzzle Design

Goal:

- Build the full playable story skeleton before coding.

Tasks:

- Define the disappearance case premise.
- Define the player's initial misunderstanding.
- Design the clue path and stage transitions.
- Design the password/decryption mechanism.
- Write the final truth reconstruction.

Outputs:

- story outline
- dialogue outline
- clue list
- puzzle logic
- fail-state and hint logic

### 5.3 Phase 3: UI and Interaction Prototype

Goal:

- Recreate a convincing ChatGPT-like interface and test the basic flow.

Tasks:

- Build page layout.
- Implement chat history area.
- Implement input box and submit interaction.
- Implement fake system notices.
- Insert placeholder content to test pacing.

Outputs:

- clickable prototype or first front-end skeleton

### 5.4 Phase 4: Core Logic Development

Goal:

- Make the demo fully playable.

Tasks:

- Implement stage-based dialogue engine.
- Implement input matching rules.
- Implement puzzle success/failure handling.
- Implement hidden clue reveal logic.
- Implement stage transitions and ending trigger.

Outputs:

- playable internal build

### 5.5 Phase 5: Content Integration

Goal:

- Replace placeholders with final script content and refine immersion.

Tasks:

- Fill AI-like normal responses.
- Fill suspicious and corrupted responses.
- Write clue texts and system notices.
- Add multiple fallback prompts.
- Adjust tone for micro-horror consistency.

Outputs:

- content-complete demo build

### 5.6 Phase 6: Testing and Polish

Goal:

- Ensure the demo is understandable, stable, and presentable.

Tasks:

- Run internal playtests.
- Check whether players can solve the puzzle.
- Fix dead ends and unclear wording.
- Refine UI details.
- Remove non-essential unfinished ideas.

Outputs:

- presentation-ready demo

## 6. Recommended Team Division

The following division is suitable for a small course project team. One person may handle more than one role if the team is small.

### 6.1 Product / Coordinator

Responsibilities:

- keep scope under control
- organize milestones
- coordinate between writing, design, and coding
- review whether the demo still matches the original concept

### 6.2 Narrative Designer

Responsibilities:

- write the disappearance case
- define the story rhythm
- design clue reveal order
- write endings and hint text

### 6.3 Puzzle Designer

Responsibilities:

- define the reasoning chain
- design password logic
- ensure puzzle fairness
- make sure clues support the intended conclusion

### 6.4 UI / Visual Designer

Responsibilities:

- replicate the ChatGPT-like desktop layout
- define visual hierarchy
- design disguised game indicators
- tune the horror feeling through restraint and subtle abnormality

### 6.5 Front-End Developer

Responsibilities:

- build the interface
- implement the dialogue engine
- implement game state logic
- integrate content
- package the demo

### 6.6 Tester / Content Reviewer

Responsibilities:

- check playability
- identify unclear clues
- test unexpected input
- verify that the story remains coherent

## 7. Priority Plan

### 7.1 P0 Must Finish

- One complete desktop demo page
- Chat input and output loop
- One fully playable case
- One password or decoding puzzle
- One final reveal
- Stable core state transitions

### 7.2 P1 Should Finish If Time Allows

- Better fake system message layer
- More fallback dialogue responses
- More refined hidden clue interactions
- Better visual polish and animation timing

### 7.3 P2 Do Later

- Full progress save
- Multi-case support
- Mobile adaptation
- UGC editor
- More complex fake tools or panels

## 8. Milestone Plan

The exact dates can be filled in by the team. A suggested milestone structure is below.

### Milestone 1: Concept Lock

Target:

- finalize the case premise and feature scope

Completion criteria:

- team agrees on demo content and no longer expands scope casually

### Milestone 2: Playable Skeleton

Target:

- finish page layout and basic dialogue submission

Completion criteria:

- a player can open the page, type text, and receive scripted responses

### Milestone 3: Core Puzzle Playable

Target:

- integrate clue flow and password gate

Completion criteria:

- a tester can reach the final chapter by solving the intended logic

### Milestone 4: Content Complete

Target:

- finish final dialogue copy and immersive details

Completion criteria:

- the full narrative can be played from start to finish without placeholders

### Milestone 5: Demo Freeze

Target:

- stop adding features and prepare for showcase

Completion criteria:

- bug fixes only, no scope changes

## 9. Suggested Timeline

If the team has around 1-2 weeks for the demo, a practical schedule is:

### Day 1-2

- lock scope
- finish story outline
- finish puzzle logic

### Day 3-4

- build UI skeleton
- implement dialogue engine

### Day 5-6

- integrate first playable script
- add password puzzle
- connect clue flow

### Day 7-8

- expand dialogue content
- improve fake system immersion
- revise clue visibility

### Day 9-10

- internal playtest
- fix blockers
- polish presentation

If the schedule is longer, use the extra time for writing quality and usability testing instead of adding large new systems.

## 10. Content Production Plan

Because this project does not use a real AI API, text content is a major production asset.

### 10.1 Content Categories to Write

- normal assistant-like opening responses
- suspicious transitional responses
- clue-bearing responses
- wrong-answer fallback responses
- success feedback responses
- fake system notices
- ending reveal text

### 10.2 Writing Principles

- early messages must sound plausible
- anomalies should escalate gradually
- critical clues should be repeatable in different forms
- wrong inputs should still feel in-character
- the final reveal must clearly reward the player's reasoning

### 10.3 Minimum Writing Requirement for Demo

Recommended minimum:

- 1 complete case outline
- 20-40 assistant response blocks
- 1 main password gate
- 5-8 meaningful clue fragments
- 3-5 fallback redirection responses

## 11. Testing Plan

### 11.1 Functional Testing

Check:

- input submission works
- messages render correctly
- stage switching works
- puzzle success and failure both respond correctly
- ending can be reached normally

### 11.2 Usability Testing

Check:

- can new players understand what to do
- does the fake AI feel convincing at first
- do players notice clues without needing external explanation
- does the puzzle feel satisfying instead of random

### 11.3 Presentation Testing

Check:

- does it run smoothly on the demo device
- does browser scaling affect layout
- is text readable on a projector or large screen
- is the opening experience fast enough

## 12. Risk Management

### 12.1 Risk: Scope Expansion

Problem:

- the team may keep adding extra features like saving, mobile UI, or multiplayer.

Response:

- freeze non-demo features immediately
- treat them as future work only

### 12.2 Risk: Story and Code Become Misaligned

Problem:

- writing and implementation may evolve separately.

Response:

- maintain one shared script source
- review story changes before integration

### 12.3 Risk: Players Cannot Solve the Puzzle

Problem:

- clues may be too hidden or too ambiguous.

Response:

- run at least 2-3 internal playtests
- add layered hints where necessary

### 12.4 Risk: The Fake AI Illusion Breaks Too Early

Problem:

- responses may feel too obviously scripted.

Response:

- write strong opening content
- add believable fallback responses
- avoid repetitive answer patterns

## 13. Deliverables List

At the end of this phase, the team should ideally have:

- product description document
- technical design document
- development plan document
- one playable desktop web demo
- one packaged build or deployable web link
- one short presentation/demo script

## 14. Final Execution Principle

The guiding rule for this project is:

"Complete one short, immersive, and convincing demo before attempting to build a large system."

That means:

- prioritize complete experience over many features
- prioritize believable text over complicated engineering
- prioritize narrative control over fake openness
- prioritize stable demo delivery over future scalability

If the team follows this principle, the project will be much more likely to produce a strong course-demo result.
