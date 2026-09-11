# MASTER PROJECT CONTEXT

## GetSaved Portal — Lending Core

> **Purpose:** This document is the persistent project context for the GetSaved Portal and its Lending Core.
> **Important:** This is documentation, not a terminal script. Do not execute the contents of this file.

---

# 1. PROJECT IDENTITY

**Project name:** `GetSaved-portal`

**Current primary branch:**

```text
feature/lending-core
```

**Local project path:**

```text
/Users/macbookair/Desktop/GetSaved-portal
```

**Project purpose:**

Build a modern lending platform / lending core for GetSaved that can eventually support:

* User authentication
* Borrower profiles
* Loan applications
* Loan products
* Loan qualification
* Loan offers
* Loan underwriting workflows
* Loan status tracking
* Documents
* Payments
* Notifications
* Administrative workflows
* Internal lending operations
* Future AI-assisted lending workflows

The application should be built as a real production-oriented system rather than a simple demo.

---

# 2. CURRENT TECHNOLOGY STACK

## Frontend / Application

* Next.js `16.3.4`
* React `19`
* TypeScript
* Tailwind CSS

## Backend / Database

* Supabase
* Supabase Authentication
* Supabase PostgreSQL database

## Payments

* Stripe

## Package Manager

* npm

## Development Environment

* macOS
* Node.js
* Local development through Next.js

---

# 3. IMPORTANT PROJECT RULE

Do not make large uncontrolled changes to the application.

Development should happen incrementally:

1. Understand the current implementation.
2. Identify the exact file(s) involved.
3. Make the smallest appropriate change.
4. Run the relevant checks.
5. Test the feature.
6. Fix errors before moving forward.
7. Commit stable milestones.

Never assume that an existing file should be replaced simply because a cleaner implementation is possible.

---

# 4. GIT STATUS

Current working branch:

```text
feature/lending-core
```

This branch is intended for the Lending Core work.

Before major changes, check:

```bash
git status
```

Before committing:

```bash
git diff
```

The goal is to keep the working tree understandable and avoid mixing unrelated changes.

---

# 5. DEVELOPMENT PHILOSOPHY

The project should prioritize:

* Correctness
* Security
* Maintainability
* Clear separation of concerns
* Type safety
* Good UX
* Reliable database design
* Proper authorization
* Production readiness

Avoid:

* Hardcoded production secrets
* Client-side exposure of private credentials
* Duplicate business logic
* Unnecessary dependencies
* Destructive database changes without verification
* Copying large amounts of code without understanding the existing architecture

---

# 6. ENVIRONMENT VARIABLES

Environment variables must remain outside source control.

Typical categories include:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

Exact variable names must always be confirmed against the current project before changing code.

Never place secret keys directly inside:

* React components
* Client-side JavaScript
* Git-tracked source files
* Public documentation

---

# 7. SUPABASE

Supabase is the primary backend platform.

Expected responsibilities:

* Authentication
* PostgreSQL database
* Row Level Security
* User data
* Lending data
* Document metadata
* Application state
* Potential file storage

Security principle:

> Database authorization must not depend solely on the frontend.

Supabase Row Level Security should be used where appropriate.

---

# 8. AUTHENTICATION

Authentication should be handled through Supabase Auth.

Potential user roles include:

```text
borrower
loan_officer
underwriter
admin
```

The exact role implementation must follow the existing database/schema rather than being invented independently.

Authorization should be checked on the server for protected operations.

---

# 9. LENDING CORE — HIGH-LEVEL MODEL

The Lending Core should eventually revolve around these major concepts:

```text
User
  ↓
Borrower Profile
  ↓
Loan Application
  ↓
Loan Product
  ↓
Qualification
  ↓
Underwriting
  ↓
Loan Offer
  ↓
Approval / Denial
  ↓
Closing
  ↓
Servicing / Payments
```

Not every loan will necessarily use every stage.

---

# 10. BORROWER

A borrower represents the customer requesting financing.

Potential borrower information:

* Identity information
* Contact information
* Address
* Employment
* Income
* Assets
* Liabilities
* Credit-related information
* Loan history
* Application history
* Documents

Sensitive information should be minimized and protected.

---

# 11. LOAN APPLICATION

A loan application represents a borrower's request for financing.

Potential fields:

```text
id
borrower_id
loan_product_id
requested_amount
purpose
term
status
created_at
updated_at
```

Possible application statuses:

```text
draft
submitted
in_review
needs_information
underwriting
approved
conditionally_approved
denied
withdrawn
closed
```

The exact statuses should be finalized according to the actual business requirements.

---

# 12. LOAN PRODUCTS

Loan products define the types of financing available.

Potential attributes:

```text
name
description
minimum_amount
maximum_amount
term_options
interest_rate
fees
eligibility_rules
active
```

Examples could eventually include:

* Personal loans
* Business loans
* Real-estate-related financing
* Other products defined by GetSaved

Do not hardcode loan products into UI components if they belong in the database.

---

# 13. LOAN QUALIFICATION

Qualification determines whether an application appears eligible for a loan product.

Possible inputs:

* Requested amount
* Income
* Debt
* Employment
* Credit information
* Loan purpose
* Property information where applicable
* Other product-specific requirements

Qualification logic should be centralized.

Avoid duplicating qualification calculations across multiple React components.

---

# 14. UNDERWRITING

Underwriting is the deeper evaluation of an application.

Potential workflow:

```text
Application submitted
        ↓
Initial validation
        ↓
Document collection
        ↓
Financial review
        ↓
Risk assessment
        ↓
Underwriter review
        ↓
Decision
```

Potential outcomes:

```text
approved
conditionally_approved
denied
needs_more_information
```

Any real underwriting rules must be explicitly defined before implementation.

---

# 15. LOAN OFFERS

An approved application may generate a loan offer.

Potential offer information:

```text
loan_amount
interest_rate
term
monthly_payment
fees
expiration_date
conditions
status
```

Potential offer states:

```text
draft
issued
accepted
rejected
expired
withdrawn
```

Financial calculations must be deterministic and tested.

---

# 16. FINANCIAL CALCULATIONS

Any loan-payment calculations should be implemented in a dedicated utility/service rather than scattered across UI code.

Examples:

* Principal
* Interest
* APR-related calculations where applicable
* Monthly payment
* Total interest
* Amortization
* Fees

Financial calculations require automated tests before being treated as production-ready.

---

# 17. DOCUMENTS

The lending workflow may require documents such as:

* Identification
* Income verification
* Bank statements
* Tax documents
* Property documents
* Other underwriting documentation

The application should store document metadata separately from the actual file where appropriate.

Potential metadata:

```text
id
application_id
document_type
storage_path
status
uploaded_by
created_at
```

Sensitive documents must never be exposed publicly.

---

# 18. LOAN STATUS

The borrower-facing interface should make the loan/application status easy to understand.

Example:

```text
Application Started
      ↓
Submitted
      ↓
Under Review
      ↓
Additional Information Needed
      ↓
Underwriting
      ↓
Approved
      ↓
Closing
      ↓
Funded
```

The UI should display human-friendly labels rather than exposing raw database status values unnecessarily.

---

# 19. ADMIN / INTERNAL OPERATIONS

Internal users may eventually need:

* Application queue
* Borrower search
* Application review
* Document review
* Underwriting actions
* Approval/denial actions
* Loan offer management
* Audit history
* User management

Internal operations must be protected by proper authorization.

---

# 20. AUDITABILITY

Important lending actions should eventually be auditable.

Examples:

* Application submitted
* Status changed
* Document uploaded
* Document reviewed
* Offer generated
* Offer accepted
* Application approved
* Application denied
* User/admin action

A future audit-log structure may include:

```text
id
actor_id
action
entity_type
entity_id
metadata
created_at
```

Exact implementation should be decided when the audit system is built.

---

# 21. API / SERVER ARCHITECTURE

Business-sensitive operations should run server-side.

Examples:

* Creating loan applications
* Changing loan status
* Calculating sensitive lending decisions
* Creating Stripe payment objects
* Using Supabase service-role functionality
* Administrative actions

Never expose privileged server credentials to the browser.

---

# 22. STRIPE

Stripe is intended for payment functionality.

Potential future responsibilities:

* Payment methods
* Customer records
* Payment processing
* Loan-related fees
* Payment status
* Webhooks

Stripe secret keys must only be used server-side.

Webhook processing should verify Stripe signatures.

---

# 23. UI / UX PRINCIPLES

The application should feel like a serious financial platform.

Priorities:

* Clean layout
* Clear forms
* Strong visual hierarchy
* Responsive design
* Accessible controls
* Clear validation messages
* Clear loan status
* Minimal unnecessary friction

Avoid building overly complicated UI before the underlying workflow is stable.

---

# 24. ERROR HANDLING

Errors should be handled deliberately.

User-facing errors should be:

* Clear
* Human-readable
* Non-sensitive

Developer logs should contain enough information to troubleshoot without leaking secrets or unnecessary personal information.

Avoid displaying raw database/API errors directly to borrowers.

---

# 25. TYPESCRIPT

TypeScript should be used consistently.

Avoid:

```ts
any
```

unless there is a documented reason.

Prefer:

* Explicit types
* Database-generated types where available
* Shared domain types
* Typed API responses
* Typed form data

---

# 26. DATABASE DESIGN PRINCIPLES

Database changes should be treated carefully.

Before creating or modifying tables:

1. Inspect the existing schema.
2. Check existing relationships.
3. Check existing RLS policies.
4. Check existing migrations.
5. Avoid duplicate tables.
6. Use migrations for schema changes.
7. Test affected queries.

Never assume the database is empty.

---

# 27. ROW LEVEL SECURITY

RLS is a critical security layer.

Examples of intended principles:

Borrowers should generally only access their own records.

Internal staff should access records according to their authorized role.

Administrative/service operations should not be exposed to ordinary users.

Every new sensitive table should be reviewed for:

```text
SELECT
INSERT
UPDATE
DELETE
```

permissions.

---

# 28. ROUTING

Next.js App Router is being used.

Routes should be organized around domain functionality.

Potential areas:

```text
/auth
/dashboard
/applications
/loans
/documents
/payments
/admin
```

These are architectural examples, not instructions to create every route immediately.

---

# 29. COMPONENT ARCHITECTURE

Components should be reusable where appropriate.

Avoid putting:

* Database queries
* Secret operations
* Complex financial calculations
* Authorization logic

directly into large UI components.

Prefer separation such as:

```text
UI
 ↓
Server action / API
 ↓
Service / business logic
 ↓
Database
```

where complexity warrants it.

---

# 30. TESTING

Testing should be introduced around critical functionality.

Highest priority:

* Loan calculations
* Qualification logic
* Application state transitions
* Authorization
* RLS
* Payment logic
* Webhook handling

A feature should not be considered complete merely because the page visually works.

---

# 31. DEVELOPMENT COMMANDS

These are examples of normal development commands.

Start development server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

Check Git state:

```bash
git status
```

View changes:

```bash
git diff
```

**Important:** Only run commands when specifically instructed during the implementation workflow.

---

# 32. CURRENT PROJECT WORKSTREAM

Primary active workstream:

```text
LENDING CORE
```

The project is being developed incrementally.

The objective is to establish a reliable lending foundation before adding advanced automation or AI features.

---

# 33. FUTURE AI / AUTOMATION

AI capabilities may eventually be integrated into the platform.

Potential capabilities:

* Application assistance
* Borrower support
* Document classification
* Lead classification
* Loan workflow assistance
* Internal staff assistance
* Automated communications
* Risk-support tooling

AI must not be allowed to bypass authorization or security controls.

Any automated lending decision must be carefully designed and reviewed before production use.

---

# 34. RELATED AUTOMATION VISION

A broader project vision includes automated lead and deal workflows.

Potential future system:

```text
Lead
 ↓
AI qualification
 ↓
HOT / WARM / COLD
 ↓
Automated follow-up
 ↓
Human handoff
 ↓
Deal / loan workflow
```

This is a future capability and should not interfere with the core lending architecture unless explicitly requested.

---

# 35. VOICE AI LAB

There is a separate Voice AI Lab project.

It is intentionally **paused** unless explicitly resumed.

Do not mix Voice AI Lab implementation into GetSaved Lending Core work unless requested.

The Voice AI Lab involved:

* Next.js
* ElevenLabs
* Voice transformation
* Text-to-speech
* Twilio
* Automated calling concepts

This project context should remain separate from the GetSaved codebase unless a future integration is intentionally designed.

---

# 36. SECURITY RULES

Never commit:

```text
.env
.env.local
API keys
private keys
service-role keys
Stripe secret keys
Twilio auth tokens
ElevenLabs API keys
passwords
```

If a secret is accidentally exposed:

1. Stop using it.
2. Rotate/revoke it.
3. Replace the environment variable.
4. Check Git history if necessary.
5. Continue only after the secret is secured.

---

# 37. PRODUCTION READINESS

Before production deployment, review:

* Authentication
* Authorization
* RLS
* Environment variables
* Database migrations
* Error handling
* Logging
* Rate limiting
* Payment security
* Webhooks
* Document security
* Data privacy
* Backup/recovery
* Monitoring
* Testing

A local development success is not automatically production readiness.

---

# 38. CHANGE MANAGEMENT

When implementing a new feature:

```text
REQUEST
   ↓
INSPECT EXISTING CODE
   ↓
PLAN
   ↓
IMPLEMENT
   ↓
RUN CHECKS
   ↓
TEST
   ↓
FIX
   ↓
VERIFY
   ↓
COMMIT
```

Do not skip the inspection phase.

---

# 39. WORKING AGREEMENT

When working on this project, the assistant should:

* Keep the current architecture in mind.
* Avoid unnecessary rewrites.
* Explain what is being changed.
* Give commands one step at a time when practical.
* Never tell the user to blindly execute a huge list of commands.
* Identify exactly which files need modification.
* Preserve working functionality.
* Verify changes before moving to the next feature.
* Call out assumptions.
* Ask for project files/code when the actual implementation cannot be safely inferred.

---

# 40. MASTER RULE

This document is the **project context**, not the implementation itself.

Nothing in this document should be interpreted as:

> "Run all 40 sections."

Instead, it describes how the project is organized and how development should proceed.

When a new task is requested, determine the smallest correct implementation step and execute that step first.

---

# 41. CURRENT STATUS

At the time this document was created:

```text
Project:        GetSaved-portal
Branch:         feature/lending-core
Primary focus:  Lending Core
Context file:   MASTER_PROJECT_CONTEXT.md
Voice AI Lab:   Paused
```

The next development action should always be determined from the **actual current codebase**, not from assumptions in this document.

---

# 42. CONTEXT MAINTENANCE

Update this file when a major architectural decision is made.

Examples:

* New database architecture
* New authentication model
* New loan workflow
* New major integration
* New production dependency
* Major security decision
* Major completed milestone
* Important known limitation

Do not update this file for every tiny code change.

---

## END OF MASTER PROJECT CONTEXT
