# 07 Technical Design

Terminology note: this document follows `design/09-glossary.md`. In English technical sections, `case/story` maps to “案件”, `chapter` maps to “章节”, and `stage/phase` is reserved for internal state-machine status.

## 1. Document Purpose

This document defines the technical design for the demo version of a lightweight web-based micro-horror reasoning game. The game is disguised as a ChatGPT-like web page. The player believes they are interacting with a normal AI assistant, but the conversation gradually exposes inconsistencies, hidden prompts, passwords, and narrative fragments. By decoding these elements, the player reconstructs a disappearance case within 10-15 minutes.

This phase focuses on a playable desktop web demo. The design prioritizes fast entry, strong immersion, controlled scope, and reliable implementation over feature completeness.

## 2. Product and Technical Goals

### 2.1 Core Experience Goals

- Enter the game and begin interaction within 5 seconds.
- Reproduce the visual and interaction rhythm of the ChatGPT desktop web client.
- Use the dialogue box as the primary gameplay interface.
- Let the player feel a gradual shift from "normal AI chat" to "something is wrong".
- Deliver a complete closed-loop experience in 10-15 minutes.
- Make reasoning satisfying through information association, contradiction discovery, and password decoding instead of obscure external knowledge.

### 2.2 Demo Scope Goals

The demo must include:

- One complete playable case.
- One main conversation thread with branching states.
- Predetermined AI responses, without connecting to any real AI API.
- Password decoding and hidden clue discovery.
- Basic fake system UI elements that support immersion.
- Desktop-first layout.

The demo will not include:

- Multiplayer collaboration.
- Real-time communication.
- Cloud sync.
- Login/account system.
- Mobile adaptation.
- Complex user-generated content tools.

## 3. Platform and Deployment

### 3.1 Target Platform

- Primary platform: desktop web browser.
- Recommended browsers: Chrome, Edge.
- Minimum environment: modern browser supporting ES modules, CSS grid/flex, local state management.

### 3.2 Deployment Strategy

For the demo phase, deployment should remain lightweight:

- Static front-end deployment is preferred.
- Can be hosted on Vercel, Netlify, GitHub Pages, or a school demo server.
- No required backend dependency.

This keeps the project easy to demo, easy to submit, and easy to maintain.

## 4. System Architecture

### 4.1 Architecture Choice

Use a front-end only architecture with local data-driven content.

Suggested structure:

- Presentation layer: fake ChatGPT-like UI.
- Game engine layer: state machine controlling dialogue progress and puzzle unlocks.
- Content layer: JSON or TypeScript configuration storing script, clues, passwords, choices, and triggers.
- Utility layer: parser, local progress state, keyword matching, and hidden clue reveal logic.

### 4.2 Why This Architecture

- No backend is required for demo delivery.
- Script-heavy content is easier to iterate.
- Dialogue and puzzle logic can be modified without rewriting UI.
- Future expansion to multiple cases becomes easier.

## 5. Recommended Tech Stack

### 5.1 Front-End Framework

Recommended:

- `React + Vite + TypeScript`

Reasons:

- Fast development for demo.
- Suitable for component-based imitation of ChatGPT UI.
- Easy state control for conversation-driven gameplay.
- TypeScript helps keep script data and trigger logic consistent.

### 5.2 Styling

Recommended:

- CSS Modules or plain scoped CSS
- Optional utility support: Tailwind CSS if the team is already familiar with it

For the demo, consistency matters more than complexity. If the team wants minimal setup, plain CSS with a design token file is enough.

### 5.3 State Management

Recommended:

- React `useState` + `useReducer` for local state

No external state library is required for the demo.

### 5.4 Data Format

Recommended:

- Store case content in JSON-like configuration files or TypeScript objects.

This allows:

- Easy writing of large amounts of scripted AI text.
- Clear separation between code and story content.
- Easier future case extension.

## 6. Functional Design

### 6.1 Main Functional Modules

The demo should contain the following modules:

1. Shell UI module
2. Conversation engine
3. Input parsing module
4. Puzzle and password module
5. Hidden clue module
6. Narrative state module
7. Fake system feedback module

### 6.2 Shell UI Module

This module recreates the ChatGPT desktop web interface.

Key visible areas:

- Left sidebar
- Main conversation area
- Top bar
- Input box
- Fake system indicators

Design requirements:

- Layout should resemble a real AI chat product.
- Initial screen should look usable immediately.
- Non-game UI elements should support the illusion rather than distract.

Possible disguised game-specific elements:

- Progress indicator disguised as context usage.
- Hidden clue count disguised as tool or attachment status.
- Stage shift disguised as model response mode or memory update.

### 6.3 Conversation Engine

This is the core gameplay system.

Responsibilities:

- Render message history.
- Output predetermined AI messages.
- Trigger different responses based on player input.
- Advance game stages.
- Inject suspicious or abnormal content gradually.

Interaction model:

- The player types naturally in the input box.
- The system does not need real natural language understanding.
- Player input is matched against configured keywords, answer sets, or stage-specific intents.

Matching strategy:

- Exact answer matching for passwords and key conclusions.
- Keyword matching for intent recognition.
- Fallback responses for unrelated or off-track input.

This keeps implementation simple while preserving the illusion of flexible conversation.

### 6.4 Input Parsing Module

Because no AI API is used, the system needs a controlled parser.

Recommended parsing layers:

1. Normalize user text
2. Match against stage-specific rules
3. Determine whether the input is:
   - normal chat
   - clue request
   - password attempt
   - reasoning conclusion
   - invalid/off-topic input
4. Return the configured AI response and state change

Input normalization examples:

- trim spaces
- lowercase English letters
- normalize punctuation
- map synonymous phrases to the same intent

This supports richer writing while keeping logic stable.

### 6.5 Puzzle and Password Module

The demo includes at least one password-based interaction.

Design goals:

- Password should come from information already exposed in chat history or embedded clue texts.
- The player should feel they discovered the answer rather than guessed it.
- The solution should be inferable from contradictions, dates, names, or repeated fragments.

Possible puzzle forms:

- Date reconstruction
- File access code
- Message decryption by letter substitution
- Hidden acrostic in multiple replies
- Contradictory timeline leading to a numeric code

Technical implementation:

- Each puzzle has `unlockCondition`, `expectedAnswers`, `failureResponses`, `successEffects`.
- Success can unlock:
  - a hidden chat record
  - a deleted note
  - a system warning
  - a final narrative fragment

### 6.6 Hidden Clue Module

The game's micro-horror and异质感 depend on hidden clues.

Clue types can include:

- Slightly corrupted AI output
- Suspicious metadata in fake system messages
- Click-to-expand "irrelevant" footnotes
- Strange icons that become meaningful later
- Repeated wording that encodes a clue

Technical handling:

- Some clues are purely textual and unlocked by stage.
- Some clues are clickable markers in the interface.
- Some clues appear only after specific input.

The hidden clue system should not overwhelm the player. It should reward attention, not punish normal play.

### 6.7 Narrative State Module

The story progresses through explicit stages.

Recommended demo stages:

1. Normal assistant interaction
2. Mild inconsistency appears
3. Suspicion deepens through clues
4. Password or access challenge
5. Hidden truth reconstruction
6. Final reveal

Each stage stores:

- stage id
- unlocked messages
- available clue interactions
- accepted intents
- expected key answers
- fail-safe fallback hints

This state-driven design prevents narrative breakage.

### 6.8 Fake System Feedback Module

To reinforce immersion, the UI should include system-like feedback elements.

Examples:

- "Conversation memory updated"
- "Context limit approaching"
- "Archived response available"
- "Tool output partially unavailable"

These messages serve two purposes:

- mimic real product behavior
- hide or frame actual gameplay hints

## 7. Core Gameplay Flow

### 7.1 Entry Flow

- User opens the page.
- A familiar ChatGPT-like interface is shown immediately.
- The input box is active.
- One starter assistant message invites harmless interaction.
- Within 5 seconds the user can type and receive a response.

### 7.2 Suspicion Building Flow

- Early responses feel normal and helpful.
- Subtle anomalies appear:
  - repeated names
  - response fragments unrelated to the prompt
  - fake system notices
  - strange references to a missing person

The player starts testing the system.

### 7.3 Investigation Flow

- The player asks about suspicious content.
- The dialogue system gradually yields clue-bearing responses.
- The player notices patterns, contradictions, and hidden references.
- The interface reveals additional pseudo-features that contain clues.

### 7.4 Resolution Flow

- The player enters a correct password or conclusion.
- Final data fragments unlock.
- The disappearance case is reconstructed.
- A closing narrative confirms the truth and completes the demo loop.

## 8. Content Structure Design

### 8.1 Content-Driven Script Format

To support large volumes of handcrafted text, script content should be modular.

Suggested structure:

```ts
type DialogueNode = {
  id: string;
  stage: string;
  triggerType: "keyword" | "exact" | "default" | "system";
  triggerValues?: string[];
  response: string[];
  effects?: GameEffect[];
  nextStage?: string;
};
```

Suggested additional structures:

```ts
type PuzzleConfig = {
  id: string;
  stage: string;
  expectedAnswers: string[];
  successEffects: GameEffect[];
  failureResponses: string[];
};

type ClueConfig = {
  id: string;
  title: string;
  source: "message" | "icon" | "system_notice" | "metadata";
  unlockStage: string;
  content: string;
};
```

### 8.2 Writing Requirements

Because no real AI is used, text quality is essential.

Content writing should provide:

- natural everyday assistant responses
- gradually distorted replies
- multiple fallback answers
- stage-appropriate hints
- believable fake system notices

The writing volume must be sufficient so the interface does not feel mechanically branching.

## 9. UI/UX Design Principles

### 9.1 Visual Direction

The UI should strongly resemble the ChatGPT desktop web client without copying unnecessary complexity.

Principles:

- clean and minimal
- familiar spacing and message rhythm
- realistic input behavior
- subtle horror through content, not jump scares

### 9.2 Game-Specific Additions

Additional elements should be disguised rather than highlighted.

Examples:

- a small "usage" bar that is actually stage progress
- a muted icon that indicates hidden clue availability
- a pseudo export/history entry that opens a clue panel

### 9.3 Player Guidance

The game should avoid confusion caused by over-simulation.

Support methods:

- starter message suggests example prompts
- fallback AI responses gently redirect the player
- wrong password attempts receive thematic hints
- key clues appear in more than one place

## 10. Demo Content Design Principles

### 10.1 Single-Case Structure

The demo should tell one clear disappearance case.

Preferred structure:

- missing person setup
- fragmented evidence in chat
- one central contradiction
- one core password or access gate
- one final reveal

### 10.2 Puzzle Difficulty

The puzzle should prioritize reasoning pleasure.

Avoid:

- niche factual knowledge
- heavy math
- unclear symbol systems
- trial-and-error brute force

Prefer:

- timeline contradiction
- wording inconsistency
- identity mismatch
- repeated textual motif

## 11. Non-Functional Requirements

### 11.1 Performance

- First screen should render quickly.
- Initial interaction should be available within 5 seconds.
- No heavyweight dependencies should block the initial paint.

### 11.2 Reliability

- The player must always be able to continue after incorrect input.
- There should be no dead-end branch that permanently blocks progress.
- Critical clues should not rely on a single fragile interaction.

### 11.3 Maintainability

- Story content should be separated from rendering logic.
- Dialogue nodes should be easy to edit.
- Puzzle configurations should be readable by non-programmers if possible.

## 12. Data and Persistence Strategy

For this demo phase:

- No cloud storage is needed.
- No login is needed.
- Full progress save is out of scope.

Recommended minimal strategy:

- Keep the active session state in memory only.
- Use lightweight LocalStorage only for unlocked endings and whether the player has reached the final choice checkpoint.
- Do not restore the full chat history in the current demo.

## 13. Risks and Mitigation

### 13.1 Risk: Fake AI Feels Too Rigid

Cause:

- Limited input matching.

Mitigation:

- Add generous keyword sets.
- Write strong fallback responses.
- Use staged prompts that gently guide the player.

### 13.2 Risk: The ChatGPT Imitation Overpowers Gameplay

Cause:

- Too much effort spent on UI mimicry and too little on narrative logic.

Mitigation:

- Prioritize the conversation engine and puzzle clarity first.
- Keep peripheral UI fake but simple.

### 13.3 Risk: Writing Workload Is Too Large

Cause:

- Scripted AI requires many handcrafted responses.

Mitigation:

- Build a reusable response template system.
- Focus the demo on one case and a small number of robust interaction intents.

### 13.4 Risk: Players Get Stuck

Cause:

- Hidden clues may be too subtle.

Mitigation:

- Use layered hints.
- Repeat critical clue logic through multiple channels.
- Ensure wrong attempts push the player back toward useful reasoning.

## 14. Future Extension Directions

Not part of the current demo, but supported by the architecture:

- multiple cases
- full progress save
- mobile adaptation
- dynamic clue board
- user-generated cases
- multi-ending structure

## 15. Final Technical Decision Summary

For the demo version, the recommended technical solution is:

- Build a desktop-first H5 web app.
- Use `React + Vite + TypeScript`.
- Implement a local scripted dialogue engine instead of calling any AI API.
- Store case, clue, and puzzle content in structured configuration files.
- Recreate the ChatGPT-like interface with simplified but convincing UI.
- Use staged state transitions to control narrative progression.
- Deliver one complete 10-15 minute disappearance case with chat-based reasoning, password solving, and hidden clue discovery.
