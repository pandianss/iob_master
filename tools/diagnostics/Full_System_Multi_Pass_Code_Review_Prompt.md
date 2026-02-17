# Full-System Multi‑Pass Code Review Prompt (Entire Repository)

You are an expert architecture and reliability agent. Perform a COMPLETE
deep review of the repository located at:

/mnt/data/iob_master_repo

Your task is NOT to summarize --- execute a rigorous, multi‑pass
inspection of every directory, file, and execution path.

------------------------------------------------------------------------

## GLOBAL DIRECTIVE

Operate in deterministic review passes:

1.  Structure & topology pass
2.  Backend execution pass
3.  Governance & middleware pass
4.  Module/service boundary pass
5.  Frontend rendering pass
6.  Build & deployment pass
7.  Performance & safety pass
8.  Orphan file and unused state pass

Do not skip any file. Review sequentially.

------------------------------------------------------------------------

## PASS 1 --- REPOSITORY STRUCTURE

• Walk directory tree lexicographically. • Detect: - orphan
controllers - unused modules - duplicate utilities - shadowed configs •
Validate clear separation between: kernel / governance / modules /
frontend / infra

Required Output:

-   Structural violations
-   Circular dependencies
-   Initialization order risks

------------------------------------------------------------------------

## PASS 2 --- BACKEND EXECUTION FLOW

Trace from entrypoint to deepest execution layers.

Validate:

-   middleware ordering
-   auth before governance
-   error handler last
-   environment validation before imports

Detect:

-   direct domain calls from infrastructure
-   duplicated enforcement logic
-   inconsistent HTTP responses

------------------------------------------------------------------------

## PASS 3 --- GOVERNANCE & POLICY LAYER

Audit ALL policy evaluators and guards.

Check:

-   double evaluation of policies
-   inconsistent quota enforcement
-   state mutation inside middleware
-   observers accessing module services

Refactor Objective:

Single Governance Orchestrator pipeline.

------------------------------------------------------------------------

## PASS 4 --- MODULE + SERVICE BOUNDARIES

For EACH module:

-   ensure services are local to domain
-   prevent cross‑module imports
-   detect global singleton leakage

Flag:

-   services folder acting as hidden dependency hub
-   analytics logic living outside kernel

------------------------------------------------------------------------

## PASS 5 --- FRONTEND RENDER PIPELINE

Trace rendering:

main → providers → router → pages → hooks.

Verify:

-   providers wrap all routes
-   no hook side‑effects on render
-   suspense boundaries exist
-   context singletons removed

Detect causes of:

-   white screen
-   hydration mismatch
-   infinite rerender loops

------------------------------------------------------------------------

## PASS 6 --- LANDING + ROUTING

Check coexistence of:

SPA router static landing assets

Validate build config:

-   base path
-   asset resolution
-   fallback routes

------------------------------------------------------------------------

## PASS 7 --- PERFORMANCE & RESILIENCE

Inspect:

-   event buses
-   async observers
-   websocket lifecycle
-   cron workers

Add:

-   circuit breakers
-   backpressure
-   abort signals
-   observer isolation try/catch

------------------------------------------------------------------------

## PASS 8 --- UNUSED / ORPHAN SCAN

Locate:

-   files never imported
-   dead routes
-   unused state stores
-   abandoned experimental features

Mark candidates for removal.

------------------------------------------------------------------------

## PASS 9 --- TEST COVERAGE GAP ANALYSIS

Detect missing tests for:

-   middleware chain ordering
-   router integration
-   governance conflicts
-   observer failure handling

------------------------------------------------------------------------

## EXECUTION RULES

• Maintain kernel purity. • Do not introduce stylistic refactors. •
Preserve API compatibility. • Avoid speculative redesign.

Output MUST be structured as actionable remediation steps, NOT
commentary.
