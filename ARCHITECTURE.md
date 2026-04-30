# DevTrack — Architecture & Diagrams

---

## 1. Entity-Relationship Diagram

```mermaid
erDiagram
    Users {
        uuid    Id        PK
        string  ClerkId   UK
        string  Email
        datetime CreatedAt
        datetime UpdatedAt
    }

    UserProfiles {
        uuid    Id               PK
        uuid    UserId           FK
        jsonb   Stack
        int     YearsOfExperience
        string  GitHubUrl
        text    ResumeText
        string  CvFileUrl
        datetime CvUploadedAt
        datetime CreatedAt
        datetime UpdatedAt
    }

    Applications {
        uuid    Id                PK
        uuid    UserId            FK
        text    JobDescriptionRaw
        string  CompanyName
        string  JobTitle
        jsonb   ParsedData
        int     MatchScore
        text    MatchExplanation
        string  Status
        datetime AppliedAt
        datetime CreatedAt
        datetime UpdatedAt
    }

    ApplicationDocuments {
        uuid    Id            PK
        uuid    ApplicationId FK
        string  Type
        text    Content
        datetime CreatedAt
        datetime UpdatedAt
    }

    ApplicationStatusHistories {
        uuid    Id            PK
        uuid    ApplicationId FK
        string  FromStatus
        string  ToStatus
        datetime ChangedAt
        string  Note
    }

    Reminders {
        uuid    Id            PK
        uuid    ApplicationId FK
        string  Type
        datetime ScheduledFor
        datetime SentAt
        string  Status
        datetime CreatedAt
    }

    Users            ||--||  UserProfiles              : "has one"
    Users            ||--o{  Applications              : "owns"
    Applications     ||--o{  ApplicationDocuments      : "has"
    Applications     ||--o{  ApplicationStatusHistories: "tracks"
    Applications     ||--o{  Reminders                 : "schedules"
```

---

## 2. ParsedData — JSONB Structure

`ParsedData` is not a separate table. It is a single JSONB column inside `Applications`.

```mermaid
graph TD
    A[Applications row] --> B["ParsedData (JSONB column)"]
    B --> C[stack: string array]
    B --> D[seniorityLevel: string]
    B --> E[remotePolicy: string]
    B --> F[salaryMin: decimal]
    B --> G[salaryMax: decimal]
    B --> H[salaryCurrency: string]
    B --> I[location: string]
    B --> J[postedAt: datetime]
```

---

## 3. System Architecture

```mermaid
graph TB
    subgraph Browser
        FE["Frontend\nReact 19 + Vite\n(localhost:5173)"]
    end

    subgraph Aspire["Aspire AppHost (orchestrator)"]
        API["DevTrack.Api\n.NET 9 Minimal API\n(localhost:7272)"]
        DB["PostgreSQL\n(Docker container)"]
    end

    subgraph External
        Clerk["Clerk\nAuth provider\n(JWT issuer)"]
    end

    FE -->|"Bearer JWT"| API
    FE -->|"sign in / sign up"| Clerk
    Clerk -->|"publishable key"| FE
    API -->|"validate JWT"| Clerk
    API -->|"EF Core"| DB
    Aspire -->|"manages"| API
    Aspire -->|"manages"| DB
```

---

## 4. Request Flow (Authenticated API Call)

```mermaid
sequenceDiagram
    participant B as Browser
    participant C as Clerk
    participant A as DevTrack.Api
    participant D as PostgreSQL

    B->>C: getToken()
    C-->>B: JWT (sub = user_xxx)

    B->>A: GET /applications/{id}\nAuthorization: Bearer JWT

    A->>C: Validate JWT signature
    C-->>A: Valid — ClerkId = user_xxx

    A->>D: SELECT * FROM Applications\nWHERE Id = {id}\nAND User.ClerkId = 'user_xxx'
    D-->>A: Application row + Documents + History + Reminders

    A-->>B: 200 OK — ApplicationDetailDto (JSON)
```

---

## 5. Application Status Pipeline

```mermaid
stateDiagram-v2
    [*] --> Saved : POST /applications (create)

    Saved --> Applied    : PATCH /status
    Applied --> Screening : PATCH /status
    Screening --> Interview : PATCH /status
    Interview --> Offer  : PATCH /status

    Saved --> Rejected   : PATCH /status
    Applied --> Rejected : PATCH /status
    Screening --> Rejected : PATCH /status
    Interview --> Rejected : PATCH /status

    Saved --> Withdrawn   : PATCH /status
    Applied --> Withdrawn : PATCH /status
    Screening --> Withdrawn : PATCH /status
    Interview --> Withdrawn : PATCH /status

    Rejected --> Saved : reopen
    Withdrawn --> Saved : reopen

    Offer --> [*]
    Rejected --> [*]
    Withdrawn --> [*]
```

Side effects triggered by `PATCH /status`:
- Any → `Applied` → sets `AppliedAt` timestamp + creates a `FollowUpPostApply` reminder (7 days later)

---

## 6. API Endpoints

```mermaid
graph LR
    subgraph Users ["/users"]
        U1["POST /sync\nCreate user on first login"]
        U2["GET /me/profile\nFetch profile"]
        U3["PUT /me/profile\nUpdate profile"]
        U4["POST /me/profile/parse-cv\nAI stub — extract from CV"]
    end

    subgraph Apps ["/applications"]
        A1["GET /\nList all (for current user)"]
        A2["POST /\nCreate from job description"]
        A3["GET /{id}\nDetail with documents + history"]
        A4["DELETE /{id}\nDelete application"]
        A5["PATCH /{id}/status\nChange status (writes history row)"]
        A6["POST /{id}/parse\nAI stub — extract JD fields"]
        A7["POST /{id}/score\nAI stub — match score vs profile"]
        A8["GET /{id}/documents\nList cover letters"]
        A9["POST /{id}/documents\nAI stub — generate cover letter"]
        A10["PATCH /{id}/documents/{docId}\nUpdate cover letter content"]
        A11["DELETE /{id}/documents/{docId}\nDelete cover letter"]
    end
```

---

## 7. Frontend Page Map

```mermaid
graph TD
    Root["/"] --> Dashboard
    Root --> Applications["/applications"]
    Root --> New["/applications/new"]
    Root --> Detail["/applications/:id"]
    Root --> Profile["/profile"]
    Root --> Settings["/settings"]

    Applications -->|click row| Detail
    Applications -->|click New| New
    New -->|save| Detail

    SignIn["/sign-in"] -->|auth| Root
    SignUp["/sign-up"] -->|auth| Root
```

---

## 8. AI Stubs — Where Real AI Goes

All four stubs are in the same two files. Replace the `await Task.Delay(...)` + hardcoded return with a Claude API call.

| Endpoint | File | What AI needs to do |
|---|---|---|
| `POST /applications/{id}/parse` | `ApplicationsEndpoints.cs` | Read `JobDescriptionRaw` → extract company, title, salary, stack, location |
| `POST /applications/{id}/score` | `ApplicationsEndpoints.cs` | Compare JD stack/level with user's `ResumeText` + `Stack` → return 0–100 score + explanation |
| `POST /applications/{id}/documents` | `ApplicationsEndpoints.cs` | Read JD + user resume → generate tailored cover letter |
| `POST /users/me/profile/parse-cv` | `UsersEndpoints.cs` | Read uploaded CV text → extract stack, years, GitHub, summary |
