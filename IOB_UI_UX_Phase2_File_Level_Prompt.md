# IOB Master UI/UX --- PHASE‑2 ULTRA‑PRACTICAL IMPLEMENTATION PROMPT

## File-Level Agentic Patch Blueprint (Repo-Specific)

This document is a DIRECT EXECUTION PROMPT derived from the actual
client/src code structure of the IOB Master repository.

It converts UI/UX forensic findings into FILE‑LEVEL implementation
steps. No backend redesign. No route removal.

Target Folder: client/src/

  -----------------------------------------------------------
  \# SECTION 1 --- Shell.tsx ROLE‑ADAPTIVE NAVIGATION PATCH
  -----------------------------------------------------------

File: components/layout/Shell.tsx

Objective: Transform flat sidebar into role‑aware grouped navigation.

IMPLEMENT:

1.  Create config file:

config/roleViews.ts

export const ROLE_VIEWS = { ADMIN: { groups:
\["decision","governance","org","intelligence","admin"\] }, RO: {
groups: \["decision","governance","intelligence"\] }, RO_DEPT: { groups:
\["decision","governance"\] }, BRANCH: { groups: \["decision"\] } };

2.  Inside Shell.tsx:

-   Import role from Auth/User context.
-   Filter navigation items based on ROLE_VIEWS.
-   Render collapsible groups:

Decision Flow Governance Organization Intelligence Admin

Do NOT modify routes.

  ---------------------------------------------------
  \# SECTION 2 --- main.tsx RENDER SAFETY HARDENING
  ---------------------------------------------------

File: main.tsx

Wrap router hierarchy:

ErrorBoundary Suspense fallback={`<ShellSkeleton/>`{=html}} AppProviders
RouterProvider

Purpose: Prevent white screen when OrgChart or MIS components fail.

  --------------------------------------------------------
  \# SECTION 3 --- HEAVY VISUALIZATION PERFORMANCE PATCH
  --------------------------------------------------------

File: components/visualizations/OrgChart.tsx

Change import usage across pages:

Replace: import OrgChart from ".../OrgChart";

With:

const OrgChart = lazy(() =\> import("../visualizations/OrgChart"));

Add skeleton loader before render.

Also:

If role === "BRANCH" return null;

  ------------------------------------------------------
  \# SECTION 4 --- MISDashboard.tsx HIERARCHY REFACTOR
  ------------------------------------------------------

File: pages/MISDashboard.tsx

Restructure layout into 3 vertical zones:

ZONE 1 --- Critical Alerts ZONE 2 --- Action Queue ZONE 3 --- Analytics
Tiles (existing charts)

Move heavy analytics below fold. Reduce initial render payload.

  -------------------------------------------------
  \# SECTION 5 --- CREATEDECISION WORKFLOW WIZARD
  -------------------------------------------------

File: pages/CreateDecision.tsx

Add:

contexts/DecisionContext.tsx

Steps:

1.  Draft
2.  Attach Docs
3.  Governance Check
4.  Submit

Use local reducer to track step index.

AgendaManagement.tsx must expose:

```{=html}
<Button>
```
Continue Decision Flow
```{=html}
</Button>
```
  ------------------------------------------------
  \# SECTION 6 --- GOVERNANCE PAGE CONSOLIDATION
  ------------------------------------------------

Create new container:

pages/GovernanceWorkspace.tsx

Tabs:

GovernanceParameters DoARules ParameterMapping

Existing routes render this container internally. No route deletion.

  -------------------------------------------------
  \# SECTION 7 --- INTELLIGENCE HUB CONSOLIDATION
  -------------------------------------------------

Create:

pages/IntelligenceHub.tsx

Tabs:

MISDashboard BusinessSnapshot NegativeParameterMIS

Lazy load tab content.

  -----------------------------------------
  \# SECTION 8 --- FORM CONSISTENCY LAYER
  -----------------------------------------

Create:

components/ui/FormLayout.tsx

Wrap forms inside:

CreateDecision GovernanceParameters Offices StaffRegistry IngestionPage

Features:

sticky footer validation summary uniform spacing

  -------------------------------------
  \# SECTION 9 --- ROLE GUARD ROUTING
  -------------------------------------

Create:

router/RoleGuard.tsx

Usage Example:

`<RoleGuard allow={["ADMIN","RO"]}>`{=html} `<MISDashboard />`{=html}
`</RoleGuard>`{=html}

If unauthorized: navigate(ROLE_VIEWS\[role\].defaultRoute)

  --------------------------------------------------
  \# SECTION 10 --- INGESTION WORKFLOW INTEGRATION
  --------------------------------------------------

File: pages/IngestionPage.tsx

Add entry buttons from:

CreateDecision.tsx GovernanceWorkspace.tsx

CTA: "Import Data"

Maintain standalone route.

  --------------------------
  \# EXECUTION CONSTRAINTS
  --------------------------

• Do not rename existing routes. • Do not modify backend APIs. • Avoid
global styling changes. • Prefer composition over refactor.

Deliver output grouped by file changes.
