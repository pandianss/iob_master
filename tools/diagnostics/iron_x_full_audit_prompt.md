# Iron-X Repository --- Full Multi-Pass Audit Prompt

You are an expert software architecture agent tasked with reviewing and
hardening the Iron‑X codebase. Execute the following remediation
directives EXACTLY as specified. Do not introduce stylistic drift.
Maintain kernel purity, deterministic execution flow, and governance
isolation.

------------------------------------------------------------------------

## PASS 1 --- REPOSITORY TOPOLOGY & DEPENDENCY GRAPH

1.  Enforce strict layering:

    -   Kernel must not import modules or services.
    -   Observers must not reference module-level logic.
    -   Experimental code must not exist inside production routing
        trees.

2.  Relocate or isolate:

    -   Move any root-level controllers into backend/src/modules.
    -   Remove implicit singleton imports that cause initialization
        ordering issues.

3.  Introduce deterministic bootstrap:

        bootstrapKernel()
          registerModules()
          attachObservers()
          initializeEventBus()

------------------------------------------------------------------------

## PASS 2 --- BACKEND EXECUTION PATH

### index.ts

Reorder middleware stack:

1.  config validation
2.  version middleware
3.  auth guard
4.  governance orchestrator
5.  routes
6.  global error handler (LAST)

Eliminate duplicated enforcement calls across governanceGuard,
outcomeGovernanceMiddleware, and policyEnforcementMiddleware.

------------------------------------------------------------------------

### cron.ts

Current behavior: cron → kernel service calls

Required refactor: cron → emit event → ExecutionPipeline consumes.

Infrastructure must not directly invoke kernel logic.

------------------------------------------------------------------------

## PASS 3 --- KERNEL HARDENING

### ExecutionPipeline.ts

Add observer isolation:

    for each observer:
      try { await observer.handle(event) }
      catch(e) { log + continue }

Add circuit breaker if observer latency exceeds threshold.

------------------------------------------------------------------------

### moduleRegistry.ts

Remove global mutable singleton pattern. Create explicit registration
phase invoked during bootstrap.

------------------------------------------------------------------------

### EventBus

Add: - queue depth limit - backpressure handling - async buffering
strategy

------------------------------------------------------------------------

## PASS 4 --- GOVERNANCE LAYER

Create single middleware:

    GovernanceOrchestrator
      -> evaluate policies
      -> apply subscription rules
      -> enforce quotas
      -> emit governance events

Remove duplicated enforcement from scattered middleware files.

Standardize response semantics: 403 = authorization 409 = governance
violation

------------------------------------------------------------------------

## PASS 5 --- MODULE & SERVICE BOUNDARIES

### Services Directory

Decompose shared services:

-   trustControl.service → governance domain
-   socket.service → infra adapters
-   outcome logic → kernel analytics

Move services inside modules when domain-specific.

------------------------------------------------------------------------

### Outcomes Module

Refactor into domain boundary:

    kernel/analytics/outcomes/

Do not keep evaluator and stats inside modules layer.

------------------------------------------------------------------------

### Auth Module

Merge: security.controller sso.controller

into unified auth surface unless regulatory separation is mandatory.

------------------------------------------------------------------------

## PASS 6 --- EXPERIMENTAL CODE

Move `_experimental` tree behind feature flag:

    if (process.env.FEATURE_EXPERIMENTAL === "true")
      registerExperimentalModules()

Experimental modules must never load by default.

------------------------------------------------------------------------

## PASS 7 --- CONFIG VALIDATION

config.validator.ts must run BEFORE any module imports env values.

Move validation to the very first import in index.ts.

------------------------------------------------------------------------

## PASS 8 --- FRONTEND RENDER PIPELINE

### main.tsx

Wrap router in:

    ErrorBoundary
      Suspense
        Providers
          AppRouter

Prevent silent render crashes.

------------------------------------------------------------------------

### Context Architecture

Remove exported singleton context instances. Replace with hook-based
providers using reducers.

------------------------------------------------------------------------

### Router Isolation

Ensure MarketingRouter mounts inside core providers or remove discipline
hooks from marketing pages.

------------------------------------------------------------------------

### Hooks

Add AbortController to all API hooks. Fix missing dependency arrays that
cause infinite rerenders.

------------------------------------------------------------------------

## PASS 9 --- LANDING & BUILD CONFIG

Check vite.config.ts base path. Ensure SPA routing does not conflict
with static /land HTML deployment.

------------------------------------------------------------------------

## PASS 10 --- CI & WORKERS

Split entrypoints:

    app.server.ts
    worker.bootstrap.ts

Worker containers must not start HTTP server stack.

------------------------------------------------------------------------

## PASS 11 --- TESTING EXPANSION

Add tests for:

-   observer failure resilience
-   middleware ordering
-   router integration
-   governance orchestration flow

------------------------------------------------------------------------

## EXECUTION DIRECTIVE

Apply changes incrementally in this order:

1.  Kernel isolation
2.  Middleware consolidation
3.  Service decomposition
4.  Frontend provider restructuring
5.  Experimental module gating
6.  Deployment routing corrections

Do not introduce new features during hardening. Maintain backward API
compatibility.
