# Tasks: Workflow Foundation

**Input**: Design documents from `specs/001-workflow-foundation/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Project initialization and dependency installation

- [x] T001 Install commitlint dependencies: `bun add -d @commitlint/cli @commitlint/config-conventional`
- [x] T002 Install Husky and lint-staged: `bun add -d husky lint-staged prettier`
- [x] T003 Initialize Husky: `bunx husky init`
- [x] T004 [P] Create `.lintstagedrc.json` at repository root

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core configuration that MUST be complete before any user story testing

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create `commitlint.config.js` at repository root with conventional commit rules
- [x] T006 Create `.husky/pre-commit` hook (lint + typecheck)
- [x] T007 Create `.husky/commit-msg` hook (commitlint)
- [x] T008 Make hooks executable: `chmod +x .husky/pre-commit .husky/commit-msg`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Conventional Commits (Priority: P1)

**Goal**: Commit messages automatically validated against conventional commit standards

**Independent Test**: Create a commit with invalid message format, verify commitlint rejects it

### Implementation for User Story 1

- [x] T009 [US1] Configure commit type enum in `commitlint.config.js`
- [x] T010 [US1] Configure scope enum for spec directories in `commitlint.config.js`
- [x] T011 [US1] Configure subject-case rule (lowercase) in `commitlint.config.js`
- [x] T012 [US1] Configure subject-max-length rule (72 chars) in `commitlint.config.js`
- [x] T013 [US1] Test invalid message rejection: `echo "bad message" | npx commitlint`
- [x] T014 [US1] Test valid message acceptance: `echo "feat: test" | npx commitlint`

**Checkpoint**: User Story 1 complete - conventional commits enforced

---

## Phase 4: User Story 2 - Changelog Management (Priority: P1)

**Goal**: CHANGELOG.md automatically updated when PRs merge via release-please-action

**Independent Test**: Merge a PR with type "feat", verify CHANGELOG.md contains the entry under "Added" section

### Implementation for User Story 2

- [x] T015 [US2] Create `.github/workflows/release-please.yml` workflow file
- [x] T016 [US2] Configure release-please-action with `release-type: node`
- [x] T017 [US2] Configure changelog-types mapping in workflow
- [x] T018 [US2] Create `release-please-config.json` (optional advanced config)
- [x] T019 [US2] Create `.release-please-manifest.json` with initial version 0.1.0
- [x] T020 [US2] Set workflow permissions (`contents: write`, `pull-requests: write`)

**Checkpoint**: User Story 2 complete - changelog automation configured

---

## Phase 5: User Story 3 - Semantic Versioning (Priority: P2)

**Goal**: Version numbers automatically determined by commit types via release-please

**Independent Test**: Verify release-please bumps version correctly for feat/fix/breaking commits

### Implementation for User Story 3

- [x] T021 [US3] Configure version bump logic via release-please (automatic)
- [x] T022 [US3] Add major/minor version tagging in release-please.yml (optional)
- [x] T023 [US3] Verify package.json version is updated on release PR merge

**Checkpoint**: User Story 3 complete - semantic versioning automated

---

## Phase 6: User Story 4 - Husky Hooks (Priority: P1)

**Goal**: Pre-commit and commit-msg hooks validate code quality and commit format

**Independent Test**: Attempt to commit with linting errors, verify pre-commit hook blocks the commit

### Implementation for User Story 4

- [x] T024 [US4] Configure pre-commit hook to run `bunx lint-staged`
- [x] T025 [US4] Configure pre-commit hook to run `bun typecheck`
- [x] T026 [US4] Configure commit-msg hook to run `bunx commitlint --edit $1`
- [x] T027 [US4] Test lint blocking with intentional lint error
- [x] T028 [US4] Test typecheck blocking with intentional type error
- [x] T029 [US4] Test successful commit flow with valid code and message

**Checkpoint**: User Story 4 complete - hooks block invalid commits

---

## Phase 7: User Story 5 - Agent Instructions (Priority: P2)

**Goal**: AI agents have clear instructions for handling commit failures autonomously

**Independent Test**: Trigger a commitlint failure, verify agent follows documented retry strategy

### Already Complete

- [x] T030 [US5] `.kilocode/rules/commit.md` exists with format requirements
- [x] T031 [US5] Failure scenarios documented (hooks, lint, merge conflicts)
- [x] T032 [US5] Retry strategies documented for each failure type

### Additional Tasks

- [x] T033 [US5] Update commit.md with release-please workflow notes
- [x] T034 [US5] Add release PR handling instructions to commit.md

**Checkpoint**: User Story 5 complete - agent can autonomously recover from failures

---

## Phase 8: User Story 6 - Issue Templates (Priority: P1)

**Goal**: Standardized issue templates produce Spec Kit parseable format

**Independent Test**: Create an issue using task template, verify frontmatter is parseable

### Already Complete

- [x] T035 [US6] `.github/ISSUE_TEMPLATE/bug_report.md` exists
- [x] T036 [US6] `.github/ISSUE_TEMPLATE/feature_request.md` exists
- [x] T037 [US6] `.github/ISSUE_TEMPLATE/task.md` exists with frontmatter

**Checkpoint**: User Story 6 complete - issue templates ready

---

## Phase 9: User Story 7 - PR Template (Priority: P1)

**Goal**: PRs include checklist referencing specs and changelog

**Independent Test**: Create a PR, verify template includes spec reference checklist

### Already Complete

- [x] T038 [US7] `.github/pull_request_template.md` exists
- [x] T039 [US7] Template includes spec directory reference field
- [x] T040 [US7] Template includes changelog entry verification checkbox
- [x] T041 [US7] Template includes spec-task sync status checkbox

**Checkpoint**: User Story 7 complete - PR template ready

---

## Phase 10: User Story 8 - README.md (Priority: P1)

**Goal**: Comprehensive README.md with project description and badges

**Independent Test**: View README.md on GitHub, verify badges render correctly

### Implementation for User Story 8

- [x] T042 [US8] Create `README.md` at project root
- [x] T043 [US8] Add badge section: Build Status, License (AGPL-3.0-or-later), Version
- [x] T044 [US8] Add technology badges: TypeScript, Next.js
- [x] T045 [US8] Add workflow tool badges: SemVer, Conventional Commits, Keep a Changelog, Husky, commitlint
- [x] T046 [US8] Add Description section from `.kilocode/rules/memory-bank/brief.md`
- [x] T047 [US8] Add Features section from `.kilocode/rules/memory-bank/product.md`
- [x] T048 [US8] Add Quick Start section with installation and usage
- [x] T049 [US8] Add Installation section with `bun install`
- [x] T050 [US8] Add Usage section with dev server instructions
- [x] T051 [US8] Add Contributing section with commit workflow reference
- [x] T052 [US8] Add License section referencing LICENSE file

**Checkpoint**: User Story 8 complete - README.md with all required content

---

## Phase 11: User Story 9 - LICENSE (Priority: P1)

**Goal**: Clear LICENSE file with AGPL-3.0-or-later

**Independent Test**: View LICENSE file, verify it contains AGPL-3.0-or-later license text

### Implementation for User Story 9

- [x] T053 [US9] Create `LICENSE` file at project root
- [x] T054 [US9] Add full AGPL-3.0-or-later license text
- [x] T055 [US9] Verify license is detected by automated tools

**Checkpoint**: User Story 9 complete - LICENSE file ready

---

## Phase 12: User Story 10 - CHANGELOG.md (Priority: P1)

**Goal**: Initial CHANGELOG.md with version 0.1.0

**Independent Test**: View CHANGELOG.md, verify it follows Keep a Changelog format with initial version

### Implementation for User Story 10

- [x] T056 [US10] Create `CHANGELOG.md` at project root
- [x] T057 [US10] Add Keep a Changelog header
- [x] T058 [US10] Add initial version 0.1.0 section
- [x] T059 [US10] Add Unreleased section placeholder

**Checkpoint**: User Story 10 complete - CHANGELOG.md ready for automation

---

## Phase 13: Validation & Integration

**Purpose**: Verify all components work together

- [x] T060 Test commit workflow: `git add . && git commit -m "test: validation"`
- [x] T061 Test invalid message rejection: `git commit -m "bad message"`
- [x] T062 Test lint blocking: commit file with lint errors
- [x] T063 Test typecheck blocking: commit file with type errors
- [x] T064 Verify release-please workflow triggers on main push
- [x] T065 Run quickstart.md validation steps
- [x] T066 Complete checklist.md verification

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-12)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 first)
- **Validation (Phase 13)**: Depends on all user stories being complete

### Parallel Opportunities

Within each user story phase, tasks marked [P] can run in parallel:

- T001, T002, T003, T004 (Setup - can be parallelized)
- T009-T012 (commitlint rules - can be parallelized)
- T042-T052 (README sections - can be parallelized)

### Already Complete Tasks

The following were completed before this task file was generated:

- Issue templates (T035-T037)
- PR template (T038-T041)
- Agent instructions (T030-T032)

---

## Task Summary

| Phase | User Story   | Priority | Tasks     | Status   |
| ----- | ------------ | -------- | --------- | -------- |
| 1     | Setup        | -        | T001-T004 | Complete |
| 2     | Foundational | -        | T005-T008 | Complete |
| 3     | US-1         | P1       | T009-T014 | Complete |
| 4     | US-2         | P1       | T015-T020 | Complete |
| 5     | US-3         | P2       | T021-T023 | Complete |
| 6     | US-4         | P1       | T024-T029 | Complete |
| 7     | US-5         | P2       | T030-T034 | Complete |
| 8     | US-6         | P1       | T035-T037 | Complete |
| 9     | US-7         | P1       | T038-T041 | Complete |
| 10    | US-8         | P1       | T042-T052 | Complete |
| 11    | US-9         | P1       | T053-T055 | Complete |
| 12    | US-10        | P1       | T056-T059 | Complete |
| 13    | Validation   | -        | T060-T066 | Complete |

**Total Tasks**: 66
**Complete**: 66 (100%)
**Pending**: 0 (0%)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Refer to quickstart.md for detailed testing procedures

**Version**: 1.0.0 | **Last Updated**: 2026-02-14
