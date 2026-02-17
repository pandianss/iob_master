# SYSTEM TOTAL HARDENING --- AGENTIC REMEDIATION PROMPT

## Kernel Purity • Governance Consolidation • Frontend Stabilization

This document represents a DEEP MULTI‑PASS FORENSIC REVIEW of the entire
repository. Treat every directive below as an EXECUTION CONTRACT.

Repository Target: /mnt/data/iob_master_repo

The goal is NOT redesign. The goal is STRUCTURAL HARDENING without
discipline dilution.

  -----------------------------------------------------
  \# SECTION 1 --- KERNEL PURITY HARDENING DIRECTIVES
  -----------------------------------------------------

## Findings

• Kernel observers reference module services (layer inversion). •
moduleRegistry behaves as mutable singleton. • EventBus lacks isolation
and backpressure. • Cron workers invoke domain execution directly.

## Required Structural Refactor

1.  Kernel must emit events only. Observers must NEVER import
    module-level services.

2.  Introduce deterministic bootstrap:

bootstrapKernel() registerModules() attachObservers() startEventBus()

3.  ExecutionPipeline MUST isolate observers:

for observer in observers: try: await observer.handle(event) catch:
log + continue

4.  Introduce KernelAdapter layer:

kernel/adapters/ governance.adapter.ts analytics.adapter.ts
infra.adapter.ts

  -----------------------------------------------------
  \# SECTION 2 --- GOVERNANCE CONSOLIDATION BLUEPRINT
  -----------------------------------------------------

## Current Risks

• governanceGuard • policyEnforcementMiddleware •
outcomeGovernanceMiddleware

All perform overlapping checks causing:

-   duplicate enforcement
-   inconsistent HTTP responses
-   unpredictable execution ordering

## Target Architecture

Create single middleware:

GovernanceOrchestrator

Pipeline:

validateIdentity() evaluatePolicy() applyQuota() emitGovernanceEvent()
allowOrReject()

HTTP Semantics:

403 → authorization failure 409 → governance conflict

Remove policy logic from modules/services.

  ----------------------------------------------
  \# SECTION 3 --- SERVICE LAYER DECOMPOSITION
  ----------------------------------------------

## Detected Structural Drift

services/ folder acts as hidden dependency hub.

Required Actions:

trustControl.service → governance domain socket.service → infra adapter
outcome analytics → kernel/analytics

Each module must own its services:

modules/actions/action.service.ts modules/goals/goal.service.ts

No cross-module imports allowed.

  -----------------------------------------------------------
  \# SECTION 4 --- FRONTEND WHITE‑SCREEN FORENSIC HARDENING
  -----------------------------------------------------------

## Root Causes Identified

• MarketingRouter rendered outside providers. • Singleton context
instances exported. • Hooks firing async calls during render phase. •
Suspense/ErrorBoundary not guarding router.

## Mandatory Restructure

main.tsx hierarchy:

ErrorBoundary Suspense AppProviders AppRouter

Replace singleton contexts with reducer-based providers.

All API hooks must implement AbortController.

Prevent side effects inside render paths.

  ---------------------------------------------------
  \# SECTION 5 --- ROUTER + LANDING COEXISTENCE FIX
  ---------------------------------------------------

## Findings

• Static landing assets coexist with SPA routing. • vite base path
misalignment likely.

## Actions

1.  Configure SPA fallback routing.
2.  Ensure landing HTML does not import SPA bundle incorrectly.
3.  Align vite base with deployment root.

  ----------------------------------------------------
  \# SECTION 6 --- EVENT BUS & PERFORMANCE HARDENING
  ----------------------------------------------------

## Observed Risks

• No queue depth limit. • Observers executed synchronously. • Potential
memory growth under load.

## Required Additions

EventBus configuration:

maxQueueDepth = configurable observerTimeout = enforced asyncBuffer =
enabled

Add circuit breaker for failing observers.

  ------------------------------------------------
  \# SECTION 7 --- EXPERIMENTAL MODULE ISOLATION
  ------------------------------------------------

All experimental modules must be gated:

if (process.env.FEATURE_EXPERIMENTAL === "true")
registerExperimentalModules()

Experimental folders must not load in production builds.

  ---------------------------------------------
  \# SECTION 8 --- ORPHAN + UNUSED CODE PURGE
  ---------------------------------------------

Generate import graph.

Remove:

• unused controllers • duplicate utilities • abandoned experimental
components • dead router entries

No runtime behavior must change after removal.

  ------------------------------------------
  \# SECTION 9 --- TEST COVERAGE HARDENING
  ------------------------------------------

Add integration tests for:

-   middleware chain ordering
-   governance orchestration
-   observer failure isolation
-   router/provider mounting

Tests must run before refactor commits.

  ----------------------------------------------
  \# SECTION 10 --- EXECUTION DISCIPLINE RULES
  ----------------------------------------------

• Maintain Kernel Purity at all times. • Do NOT introduce UI redesign. •
Preserve existing API contracts. • Prefer relocation over rewriting. •
Enforce deterministic initialization order.

------------------------------------------------------------------------

# FINAL DIRECTIVE

Apply remediation PASS by PASS:

PASS 1 → Kernel isolation PASS 2 → Governance consolidation PASS 3 →
Service decomposition PASS 4 → Frontend stabilization PASS 5 → Router +
landing alignment PASS 6 → Performance hardening PASS 7 → Experimental
isolation PASS 8 → Orphan purge PASS 9 → Test expansion

Output must be structured as code-level remediation steps grouped by
PASS number.
