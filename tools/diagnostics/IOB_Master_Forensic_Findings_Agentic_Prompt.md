# IOB Master Repository --- PURE FORENSIC FINDINGS + AGENTIC REMEDIATION PROMPT

(Generated from actual repository structure analysis)

Target Repo: /mnt/data/iob_master_repo_real/iob_master-master

This document contains REAL findings derived from directory inspection
of the uploaded codebase. It is NOT a generic architecture template.

Execution Mode: Apply directives exactly. Do not reinterpret.

  --------------------------------
  \# FORENSIC STRUCTURE FINDINGS
  --------------------------------

## Finding 1 --- Dist Folder Committed to Repository

Observed: dist/ directory containing compiled NestJS output is
committed.

Risk: • Large repo size • Deployment drift between src and dist •
Hard-to-track runtime behavior

Remediation Directive: Remove dist/ from version control. Add dist/ to
.gitignore.

  ---------------------------------------------------------------------
  \## Finding 2 --- Build Logs and Diagnostics in Root
  ---------------------------------------------------------------------
  \## Finding 3 --- Client and Server Monorepo Without Workspace
  Isolation

  Structure:

  client/ src/ prisma/

  Risk: • Dependency conflicts • Unclear build orchestration

  Remediation Directive:

  Introduce workspace root:

  /apps/client /apps/server

  Or configure npm workspaces explicitly.
  ---------------------------------------------------------------------

## Finding 4 --- Prisma Scripts Mixed With Runtime Code

Detected:

prisma/check-departments.ts prisma/list-postings.ts

Risk: Migration and runtime boundaries blurred.

Remediation: Move scripts to:

/tools/prisma/

  ---------------------------------------------------------------------
  \## Finding 5 --- Multiple Diagnostic Scripts in Root
  ---------------------------------------------------------------------
  \## Finding 6 --- Frontend Rendering Risk (Client App)

  Observed Structure:

  client/src/main.tsx client/src/App.tsx client/src/pages/

  Potential Risks:

  • Shell.tsx acting as global layout --- ensure router wrapped inside
  it. • OrgChart.tsx visualization likely heavy render path.

  Remediation Directive:

  Wrap main.tsx with ErrorBoundary + Suspense. Lazy-load visualization
  components.
  ---------------------------------------------------------------------

## Finding 7 --- Governance Module Density (Backend)

Observed modules:

modules/governance/ modules/decision/ modules/reporting/

Risk: Governance module includes many services (committee, compliance,
doa, meeting, obligation, office).

Remediation:

Split governance into submodules:

governance-core governance-obligation governance-office

  ---------------------------------------------------------------------
  \## Finding 8 --- PDF Generation in Document Module
  ---------------------------------------------------------------------
  \## Finding 9 --- Mock Data and Templates in Root

  Detected:

  mock-data.json mock-internal-letter.json mock-recommendation.json

  Risk: Test artifacts exposed to production runtime.

  Remediation:

  Move into:

  /fixtures/
  ---------------------------------------------------------------------

## Finding 10 --- Seed Scripts at Multiple Levels

Detected:

seed-auth-users.ts prisma/seed.ts

Risk: Non-deterministic seed execution order.

Remediation:

Create single seed orchestrator:

tools/seed/index.ts

  ---------------------------------------
  \# AGENTIC REMEDIATION EXECUTION PLAN
  ---------------------------------------

PASS 1 --- Repository Hygiene • Remove dist/ • Move logs and diagnostics
to /tools/

PASS 2 --- Workspace Isolation • Introduce apps/client + apps/server
structure

PASS 3 --- Backend Hardening • Extract PDF generation to worker • Split
governance module

PASS 4 --- Frontend Stabilization • Add Suspense boundary • Lazy load
OrgChart and heavy visualizations

PASS 5 --- Tooling Separation • Move prisma scripts + diagnostics out of
runtime tree

PASS 6 --- Data Hygiene • Move mock files into /fixtures/ • Consolidate
seed scripts

------------------------------------------------------------------------

# EXECUTION RULES

• Preserve API routes. • Do NOT change database schema unless required.
• Prefer relocation over rewriting. • Maintain NestJS module boundaries.
