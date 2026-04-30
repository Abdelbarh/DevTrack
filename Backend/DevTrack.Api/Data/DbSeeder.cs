using DevTrack.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DevTrack.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db, IConfiguration config)
    {
        var clerkId = config["DevTrack:TestClerkUserId"];
        if (string.IsNullOrWhiteSpace(clerkId) || clerkId == "user_YOUR_CLERK_ID_HERE")
            return; // No seed without a real Clerk ID configured

        // Wipe existing data for this user and reseed
        var existing = await db.Users.FirstOrDefaultAsync(u => u.ClerkId == clerkId);
        if (existing != null)
        {
            db.Users.Remove(existing);
            await db.SaveChangesAsync();
        }

        var now = DateTime.UtcNow;
        var userId = Guid.NewGuid();

        var user = new User
        {
            Id = userId,
            ClerkId = clerkId,
            Email = "dev@devtrack.app",
            CreatedAt = now,
            UpdatedAt = now,
        };

        var profile = new UserProfile
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Stack = ["Python", "FastAPI", "PostgreSQL", "Kafka", "Kubernetes", "OpenTelemetry"],
            YearsOfExperience = 5,
            GitHubUrl = "https://github.com/devuser",
            ResumeText =
                "Backend engineer with 5 years building distributed systems and data pipelines. " +
                "Led Kubernetes migration cutting infra costs by 30%. " +
                "Designed multi-tenant event pipeline on Kafka + PostgreSQL handling 2M events/day. " +
                "Strong in Python, FastAPI, PostgreSQL, and observability tooling.",
            CreatedAt = now,
            UpdatedAt = now,
        };

        db.Users.Add(user);
        db.UserProfiles.Add(profile);

        // ── Applications ──────────────────────────────────────────────────────

        var apps = new List<(Application App, List<ApplicationStatusHistory> History, List<ApplicationDocument> Docs)>();

        // 1 — Saved, full parsed_data, score, 2 cover letters
        var app1Id = Guid.NewGuid();
        var app1 = new Application
        {
            Id = app1Id, UserId = userId,
            JobDescriptionRaw = "Senior Backend Engineer at Lumen Labs — remote US. Python, FastAPI, Postgres. $140k–180k.",
            CompanyName = "Lumen Labs", JobTitle = "Senior Backend Engineer",
            ParsedData = new ParsedApplicationData
            {
                Stack = ["Python", "FastAPI", "PostgreSQL", "Redis"],
                SeniorityLevel = "Senior", RemotePolicy = "remote",
                SalaryMin = 140_000, SalaryMax = 180_000, SalaryCurrency = "USD",
                Location = "Remote · US", PostedAt = now.AddDays(-5),
            },
            MatchScore = 87,
            MatchExplanation = "Strong stack alignment. Python/FastAPI/PostgreSQL match exactly. Senior scope fits 5 years experience.",
            Status = ApplicationStatuses.Saved,
            CreatedAt = now.AddDays(-10), UpdatedAt = now.AddDays(-10),
        };
        apps.Add((app1,
            [new() { Id = Guid.NewGuid(), ApplicationId = app1Id, FromStatus = null, ToStatus = ApplicationStatuses.Saved, ChangedAt = now.AddDays(-10), Note = "Application created" }],
            [
                new() { Id = Guid.NewGuid(), ApplicationId = app1Id, Type = ApplicationDocumentType.CoverLetter, Content = CoverLetterContent("Lumen Labs", "Senior Backend Engineer"), CreatedAt = now.AddDays(-9), UpdatedAt = now.AddDays(-9) },
                new() { Id = Guid.NewGuid(), ApplicationId = app1Id, Type = ApplicationDocumentType.CoverLetter, Content = CoverLetterContent("Lumen Labs", "Senior Backend Engineer") + "\n\n[Revised version — more concise opening.]", CreatedAt = now.AddDays(-8), UpdatedAt = now.AddDays(-8) },
            ]
        ));

        // 2 — Applied, status history, 1 cover letter
        var app2Id = Guid.NewGuid();
        var app2 = new Application
        {
            Id = app2Id, UserId = userId,
            JobDescriptionRaw = "Staff Platform Engineer at Plural — NYC hybrid. Go, Kubernetes, multi-cloud.",
            CompanyName = "Plural", JobTitle = "Staff Platform Engineer",
            ParsedData = new ParsedApplicationData
            {
                Stack = ["Go", "Kubernetes", "Terraform", "AWS"],
                SeniorityLevel = "Staff", RemotePolicy = "hybrid",
                SalaryMin = 180_000, SalaryMax = 220_000, SalaryCurrency = "USD",
                Location = "NYC · Hybrid",
            },
            MatchScore = 72,
            MatchExplanation = "Go and Kubernetes match. Staff-level scope slightly above current experience. Terraform gap.",
            Status = ApplicationStatuses.Applied,
            AppliedAt = now.AddDays(-7),
            CreatedAt = now.AddDays(-9), UpdatedAt = now.AddDays(-7),
        };
        apps.Add((app2,
            [
                new() { Id = Guid.NewGuid(), ApplicationId = app2Id, FromStatus = null, ToStatus = ApplicationStatuses.Saved, ChangedAt = now.AddDays(-9), Note = "Application created" },
                new() { Id = Guid.NewGuid(), ApplicationId = app2Id, FromStatus = ApplicationStatuses.Saved, ToStatus = ApplicationStatuses.Applied, ChangedAt = now.AddDays(-7), Note = "Submitted via company portal" },
            ],
            [new() { Id = Guid.NewGuid(), ApplicationId = app2Id, Type = ApplicationDocumentType.CoverLetter, Content = CoverLetterContent("Plural", "Staff Platform Engineer"), CreatedAt = now.AddDays(-8), UpdatedAt = now.AddDays(-8) }]
        ));

        // 3 — Screening
        var app3Id = Guid.NewGuid();
        var app3 = new Application
        {
            Id = app3Id, UserId = userId,
            JobDescriptionRaw = "Backend Engineer, API at Anthropic — San Francisco hybrid. Python, distributed systems.",
            CompanyName = "Anthropic", JobTitle = "Backend Engineer, API",
            ParsedData = new ParsedApplicationData
            {
                Stack = ["Python", "FastAPI", "PostgreSQL", "gRPC"],
                SeniorityLevel = "Mid-Senior", RemotePolicy = "hybrid",
                Location = "SF · Hybrid",
            },
            MatchScore = 92,
            MatchExplanation = "Near-perfect stack alignment. Python/FastAPI/PostgreSQL exact match. Distributed systems focus aligns strongly.",
            Status = ApplicationStatuses.Screening,
            AppliedAt = now.AddDays(-14),
            CreatedAt = now.AddDays(-16), UpdatedAt = now.AddDays(-5),
        };
        apps.Add((app3,
            [
                new() { Id = Guid.NewGuid(), ApplicationId = app3Id, FromStatus = null, ToStatus = ApplicationStatuses.Saved, ChangedAt = now.AddDays(-16) },
                new() { Id = Guid.NewGuid(), ApplicationId = app3Id, FromStatus = ApplicationStatuses.Saved, ToStatus = ApplicationStatuses.Applied, ChangedAt = now.AddDays(-14) },
                new() { Id = Guid.NewGuid(), ApplicationId = app3Id, FromStatus = ApplicationStatuses.Applied, ToStatus = ApplicationStatuses.Screening, ChangedAt = now.AddDays(-5), Note = "Recruiter reached out for 30-min screen" },
            ],
            [new() { Id = Guid.NewGuid(), ApplicationId = app3Id, Type = ApplicationDocumentType.CoverLetter, Content = CoverLetterContent("Anthropic", "Backend Engineer, API"), CreatedAt = now.AddDays(-15), UpdatedAt = now.AddDays(-15) }]
        ));

        // 4 — Interview
        var app4Id = Guid.NewGuid();
        var app4 = new Application
        {
            Id = app4Id, UserId = userId,
            JobDescriptionRaw = "Senior Backend Engineer at Tessera Health — Berlin on-site. Python, FHIR, healthcare data.",
            CompanyName = "Tessera Health", JobTitle = "Senior Backend Engineer",
            ParsedData = new ParsedApplicationData
            {
                Stack = ["Python", "FastAPI", "PostgreSQL", "FHIR"],
                SeniorityLevel = "Senior", RemotePolicy = "on-site",
                Location = "Berlin · On-site",
            },
            MatchScore = 73,
            MatchExplanation = "Core stack matches. FHIR and healthcare data experience gap. On-site Berlin requirement is a potential blocker.",
            Status = ApplicationStatuses.Interview,
            AppliedAt = now.AddDays(-20),
            CreatedAt = now.AddDays(-22), UpdatedAt = now.AddDays(-3),
        };
        apps.Add((app4,
            [
                new() { Id = Guid.NewGuid(), ApplicationId = app4Id, FromStatus = null, ToStatus = ApplicationStatuses.Saved, ChangedAt = now.AddDays(-22) },
                new() { Id = Guid.NewGuid(), ApplicationId = app4Id, FromStatus = ApplicationStatuses.Saved, ToStatus = ApplicationStatuses.Applied, ChangedAt = now.AddDays(-20) },
                new() { Id = Guid.NewGuid(), ApplicationId = app4Id, FromStatus = ApplicationStatuses.Applied, ToStatus = ApplicationStatuses.Screening, ChangedAt = now.AddDays(-10) },
                new() { Id = Guid.NewGuid(), ApplicationId = app4Id, FromStatus = ApplicationStatuses.Screening, ToStatus = ApplicationStatuses.Interview, ChangedAt = now.AddDays(-3), Note = "Technical interview scheduled" },
            ],
            [new() { Id = Guid.NewGuid(), ApplicationId = app4Id, Type = ApplicationDocumentType.CoverLetter, Content = CoverLetterContent("Tessera Health", "Senior Backend Engineer"), CreatedAt = now.AddDays(-21), UpdatedAt = now.AddDays(-21) }]
        ));

        // 5 — Rejected
        var app5Id = Guid.NewGuid();
        var app5 = new Application
        {
            Id = app5Id, UserId = userId,
            JobDescriptionRaw = "Engineer, Issuing at Stripe — Remote US. Ruby, Rails, payments.",
            CompanyName = "Stripe", JobTitle = "Engineer, Issuing",
            ParsedData = new ParsedApplicationData
            {
                Stack = ["Ruby", "Rails", "MySQL"],
                SeniorityLevel = "Mid", RemotePolicy = "remote",
                Location = "Remote · US",
            },
            MatchScore = 42,
            MatchExplanation = "Ruby/Rails stack mismatch. Limited overlap with Python background.",
            Status = ApplicationStatuses.Rejected,
            AppliedAt = now.AddDays(-25),
            CreatedAt = now.AddDays(-28), UpdatedAt = now.AddDays(-8),
        };
        apps.Add((app5,
            [
                new() { Id = Guid.NewGuid(), ApplicationId = app5Id, FromStatus = null, ToStatus = ApplicationStatuses.Saved, ChangedAt = now.AddDays(-28) },
                new() { Id = Guid.NewGuid(), ApplicationId = app5Id, FromStatus = ApplicationStatuses.Saved, ToStatus = ApplicationStatuses.Applied, ChangedAt = now.AddDays(-25) },
                new() { Id = Guid.NewGuid(), ApplicationId = app5Id, FromStatus = ApplicationStatuses.Applied, ToStatus = ApplicationStatuses.Rejected, ChangedAt = now.AddDays(-8), Note = "No feedback provided" },
            ],
            []
        ));

        // 6 — Fresh Saved, NO parsed data, NO score, NO documents (tests empty/pending states)
        var app6Id = Guid.NewGuid();
        var app6 = new Application
        {
            Id = app6Id, UserId = userId,
            JobDescriptionRaw = "Senior Backend Engineer at Vercel — Remote. Node.js, TypeScript, edge compute.",
            CompanyName = null, JobTitle = null,
            ParsedData = null, MatchScore = null, MatchExplanation = null,
            Status = ApplicationStatuses.Saved,
            CreatedAt = now.AddHours(-2), UpdatedAt = now.AddHours(-2),
        };
        apps.Add((app6,
            [new() { Id = Guid.NewGuid(), ApplicationId = app6Id, FromStatus = null, ToStatus = ApplicationStatuses.Saved, ChangedAt = now.AddHours(-2), Note = "Application created" }],
            []
        ));

        // Persist everything
        db.Applications.AddRange(apps.Select(t => t.App));
        await db.SaveChangesAsync();

        foreach (var (_, history, docs) in apps)
        {
            db.ApplicationStatusHistories.AddRange(history);
            db.ApplicationDocuments.AddRange(docs);
        }

        // Add a follow-up reminder for the Applied app
        db.Reminders.Add(new Reminder
        {
            Id = Guid.NewGuid(),
            ApplicationId = app2Id,
            Type = ReminderTypes.FollowUpPostApply,
            ScheduledFor = app2.AppliedAt!.Value.AddDays(7),
            Status = ReminderStatuses.Pending,
            CreatedAt = app2.AppliedAt!.Value,
        });

        await db.SaveChangesAsync();
    }

    private static string CoverLetterContent(string company, string role) => $"""
        Dear Hiring Team,

        I am writing to apply for the {role} position at {company}. With five years of backend engineering
        experience — spanning Python, FastAPI, PostgreSQL, Kafka, and Kubernetes — I am excited by the
        opportunity to contribute to your team.

        In my current role, I designed and shipped a multi-tenant data pipeline processing 2M events/day
        on Kafka + PostgreSQL, reducing p99 latency by 40%. I led the migration of six services to
        Kubernetes, cutting infrastructure cost by 30% while improving deployment reliability. I believe
        these experiences align closely with the challenges described in your job posting.

        What draws me to {company} specifically is the intersection of developer tooling and reliability
        engineering. My work with OpenTelemetry and distributed tracing over the past three years has
        given me a strong foundation in observability — something I see as central to your platform's
        success.

        I would welcome the chance to discuss how my background could be a good fit. Thank you for your
        time and consideration.

        Best regards,
        [Your name]
        """;
}
