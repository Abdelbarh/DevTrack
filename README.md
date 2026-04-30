# DevTrack

**The AI-powered job application tracker built specifically for software developers.**

---

## 📋 Project Description

DevTrack is a web application that helps software developers manage their job search end-to-end. It combines intelligent job description parsing, AI-assisted resume and cover-letter tailoring, GitHub-based profile matching, and pipeline tracking into a single tool.

### Problem

Developers job hunting today face recurring pain points:

- Each application takes 20–45 minutes of manual resume and cover letter tailoring
- It's easy to lose track of which resume version was sent to which company
- Follow-ups slip through the cracks because there's no structured reminder system
- Existing job trackers (Huntr, Teal, Simplify) treat developers the same as any other job seeker — they can't parse technical stacks, read a GitHub profile, or tailor project descriptions

### Solution

DevTrack is purpose-built for software engineering workflows:

- Parses technical job descriptions (stack, seniority, remote policy, salary)
- Scores each job against the user's profile and GitHub
- Generates tailored resumes and cover letters in one click
- Tracks the pipeline with automated follow-up reminders
- Keeps a history of what was sent to whom, so interview prep stays grounded

### Target User

Junior to mid-level software developers (0–5 years experience) actively searching for a new role. Future versions will expand to adjacent roles (data engineering, DevOps, ML).

### Business Model

- **Free tier:** up to 3 tracked applications, no AI tailoring
- **Pro tier:** €12/month, unlimited applications and AI tailoring

---

## 🛠 Technologies

### Frontend
- **React 19** + **TypeScript** (strict mode)
- **Vite** — build tool
- **TailwindCSS** + **shadcn/ui** — styling and components
- **React Router** — routing
- **TanStack Query** — server state management
- **React Hook Form** + **Zod** — forms and validation

### Backend
- **.NET 9** + **C#**
- **ASP.NET Core Minimal APIs**
- **.NET Aspire** — local orchestration, observability, service discovery
- **Entity Framework Core** + **Npgsql** — ORM for PostgreSQL
- **FluentValidation** — request validation

### Database
- **PostgreSQL 16**
- Local: Aspire-managed container
- Production: **Neon** (serverless PostgreSQL)

### External Services
- **Clerk** — authentication (email + GitHub OAuth)
- **Anthropic Claude API** — AI (Haiku for parsing, Sonnet for generation)
- **Stripe** — subscription billing via Checkout and Customer Portal
- **Resend** — transactional and reminder emails

### Hosting & Infrastructure
- **Vercel** — frontend hosting
- **Fly.io** — backend hosting
- **Sentry** — error monitoring
- **PostHog** — product analytics

### Dev Tooling
- **pnpm** — frontend package manager
- **dotnet CLI** — backend tooling
- **Docker Desktop** — containers (via Aspire)
- **ESLint + Prettier** — frontend code quality
- **Vitest** + **Playwright** — testing

---

## 🚀 Project Phases

The project follows a six-phase lifecycle over approximately 8 weeks.

### Phase 1 — Discovery & Requirements *(Week 1)*
Validate assumptions, finalize requirements, set up repository.
- 5+ user interviews with job-hunting developers
- Competitive analysis
- Requirements frozen (see Pflichtenheft below)

### Phase 2 — Architecture & Design *(Week 2)*
Define technical foundation and interface.
- System architecture diagram
- Database schema (EF Core)
- Wireframes for all v1 screens
- "Hello World" deployed to production

### Phase 3 — Core Development *(Weeks 3–5)*
Implement all v1 functional requirements.
- Week 3: Auth, user profile, database, JD parsing
- Week 4: Match scoring, application list, pipeline view
- Week 5: AI resume generation, cover letter generation, PDF export

### Phase 4 — Integration & Hardening *(Week 6)*
Integrate billing, reminders, polish UX.
- Stripe integration (Checkout + webhooks)
- Scheduled follow-up reminders
- E2E tests for critical flows
- Founder dogfoods the product for own job hunt

### Phase 5 — Launch Preparation *(Week 7)*
Prepare for public exposure.
- Landing page + pricing page
- Legal: Terms of Service, Privacy Policy, GDPR compliance
- Analytics and error monitoring configured
- Launch communications drafted

### Phase 6 — Launch & Iteration *(Week 8 and beyond)*
Acquire users, gather feedback, iterate.
- Post to r/cscareerquestions, Hacker News, dev Discords
- Respond to feedback within 24 hours
- Weekly retrospective and metric tracking
- First 50 paying customers targeted within 60 days

---

## 📄 Pflichtenheft (Brief)

### Scope
DevTrack v1 delivers six core capabilities:
1. Application capture and storage
2. AI-powered JD parsing
3. Match scoring against the user's profile
4. AI-generated tailored resumes
5. AI-generated tailored cover letters
6. Pipeline management with follow-up reminders

### Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-1 | User authentication via email/password and GitHub OAuth (Clerk) |
| FR-2 | User profile management: stack, experience, GitHub URL, resume |
| FR-3 | Create applications by pasting a JD; AI extracts structured fields |
| FR-4 | Compute match score (0–100) with explanation |
| FR-5 | Generate tailored resumes per application; export as PDF |
| FR-6 | Generate tailored cover letters per application |
| FR-7 | Pipeline statuses: Saved, Applied, Screening, Interview, Offer, Rejected, Withdrawn |
| FR-8 | Automated follow-up reminders (7 days post-apply, 3 days post-interview) via email |
| FR-9 | Subscription billing via Stripe; Free (3 apps) vs Pro (€12/month, unlimited) |
| FR-10 | Data export (JSON) and full account deletion for GDPR compliance |

### Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-1 | Page load < 2s on 3G; AI generation < 15s; JD parsing < 5s |
| NFR-2 | Target uptime: 99% monthly |
| NFR-3 | HTTPS only; secrets never exposed to frontend; row-level data isolation |
| NFR-4 | GDPR compliant: access, deletion, portability rights |
| NFR-5 | Mobile responsive (≥ 375px); latest 2 versions of major browsers |
| NFR-6 | TypeScript strict mode; version-controlled DB migrations; documented setup |
| NFR-7 | Scales to 10,000 users without redesign; AI cost per paid user < €2/month |

### Out of Scope for v1
Chrome extension, auto-apply, LeetCode integration, recruiter CRM, mobile native app, multi-language support, team/enterprise features, non-developer roles.

### Acceptance Criteria
v1 is considered complete when:
- All FR-1 through FR-10 are implemented and tested
- All NFR-1 through NFR-7 are met
- Founder has used the tool for 20+ real applications without blockers
- Landing page, legal pages, and payment flow are live
- E2E test covers: signup → profile → add application → generate resume → upgrade → cancel

---

## 📦 Repository Structure

```
DevTrack/
├── Frontend/                        # React 19 + Vite + TypeScript
│   └── src/
│       ├── components/
│       │   ├── applications/        # StatusBadge, AddApplicationDialog
│       │   ├── layout/              # AppLayout, Sidebar, ProtectedLayout
│       │   └── ui/                  # Icon, Input, Label, TagsInput, ...
│       ├── hooks/                   # useApplications, useProfile, useUserSync
│       ├── lib/                     # api.ts, theme.ts, query-client.ts
│       ├── pages/                   # DashboardPage, ApplicationsPage, ApplicationDetailPage,
│       │                            # NewApplicationPage, ProfilePage, SettingsPage
│       └── types/                   # application.ts (TypeScript interfaces)
│
├── Backend/
│   ├── DevTrack.AppHost/            # .NET Aspire orchestrator
│   ├── DevTrack.ServiceDefaults/    # Shared Aspire config (health, telemetry)
│   └── DevTrack.Api/                # ASP.NET Core Minimal API
│       ├── Data/
│       │   ├── AppDbContext.cs      # EF Core context + JSONB converter
│       │   ├── AppDbContextFactory.cs # Design-time factory for dotnet ef
│       │   └── DbSeeder.cs          # Dev seed data (6 applications)
│       ├── DTOs/                    # Request/response shapes
│       ├── Endpoints/               # UsersEndpoints, ApplicationsEndpoints
│       ├── Entities/                # User, UserProfile, Application, ...
│       ├── Migrations/              # EF Core migrations
│       └── Program.cs               # Startup, middleware, route registration
│
├── ARCHITECTURE.md                  # ERD, sequence diagrams, API map
└── README.md
```

---

## 🏃 Running Locally

**Prerequisites:** .NET 9 SDK, Node.js, pnpm, Docker Desktop

```bash
# Start everything (Postgres, API, Frontend)
cd Backend/DevTrack.AppHost
dotnet run
```

Aspire dashboard opens at `https://localhost:17265` — shows all services and logs.

**Seed data:** Set your Clerk user ID in `Backend/DevTrack.Api/appsettings.Development.json`:
```json
"DevTrack": {
  "TestClerkUserId": "user_xxxxxxxxxxxx"
}
```
The seeder runs automatically on startup and inserts 6 sample applications.

---

## 🗺 Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for:
- Entity-Relationship Diagram
- System architecture (Frontend ↔ API ↔ Postgres ↔ Clerk)
- Authenticated request flow (sequence diagram)
- Application status state machine
- Full API endpoint map
- AI stub locations
