using DevTrack.Api.Auth;
using DevTrack.Api.Data;
using DevTrack.Api.DTOs;
using DevTrack.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DevTrack.Api.Endpoints;

public static class ApplicationsEndpoints
{
    public static IEndpointRouteBuilder MapApplicationsEndpoints(this IEndpointRouteBuilder app)
    {
        var grp = app.MapGroup("/applications").RequireAuthorization();

        grp.MapGet("/",             GetApplications);
        grp.MapPost("/",            CreateApplication);
        grp.MapGet("/{id:guid}",    GetApplication);
        grp.MapDelete("/{id:guid}", DeleteApplication);
        grp.MapPatch("/{id:guid}/status",              UpdateStatus);
        grp.MapPost("/{id:guid}/parse",                ParseApplication);
        grp.MapPost("/{id:guid}/score",                ScoreApplication);
        grp.MapGet("/{id:guid}/documents",             GetDocuments);
        grp.MapPost("/{id:guid}/documents",            CreateDocument);
        grp.MapPatch("/{id:guid}/documents/{docId:guid}", UpdateDocument);
        grp.MapDelete("/{id:guid}/documents/{docId:guid}", DeleteDocument);

        return app;
    }

    // ── Projection helpers ────────────────────────────────────────────────────

    static ApplicationDto ToDto(Application a) => new(
        a.Id, a.CompanyName, a.JobTitle, a.ParsedData,
        a.MatchScore, a.MatchExplanation, a.Status,
        a.AppliedAt, a.CreatedAt, a.JobDescriptionRaw
    );

    static ApplicationDetailDto ToDetailDto(Application a) => new(
        a.Id, a.CompanyName, a.JobTitle, a.ParsedData,
        a.MatchScore, a.MatchExplanation, a.Status,
        a.AppliedAt, a.CreatedAt, a.JobDescriptionRaw,
        a.Documents.OrderBy(d => d.CreatedAt)
            .Select(d => new DocumentDto(d.Id, d.Type, d.Content, d.CreatedAt, d.UpdatedAt)),
        a.StatusHistory.OrderBy(h => h.ChangedAt)
            .Select(h => new StatusHistoryDto(h.Id, h.FromStatus, h.ToStatus, h.ChangedAt, h.Note)),
        a.Reminders.OrderBy(r => r.ScheduledFor)
            .Select(r => new ReminderDto(r.Id, r.Type, r.ScheduledFor, r.SentAt, r.Status, r.CreatedAt))
    );

    // ── GET /applications ─────────────────────────────────────────────────────

    static async Task<IResult> GetApplications(HttpContext ctx, AppDbContext db)
    {
        var clerkId = ctx.GetClerkId();
        var list = await db.Applications
            .Where(a => a.User.ClerkId == clerkId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();
        return Results.Ok(list.Select(ToDto));
    }

    // ── POST /applications ────────────────────────────────────────────────────

    static async Task<IResult> CreateApplication(HttpContext ctx, AppDbContext db, CreateApplicationRequest req)
    {
        var clerkId = ctx.GetClerkId();
        var user = await db.Users.FirstOrDefaultAsync(u => u.ClerkId == clerkId);
        if (user == null) return Results.NotFound();

        var app = new Application
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            JobDescriptionRaw = req.JobDescriptionRaw,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        db.Applications.Add(app);
        db.ApplicationStatusHistories.Add(new ApplicationStatusHistory
        {
            Id = Guid.NewGuid(),
            ApplicationId = app.Id,
            FromStatus = null,
            ToStatus = ApplicationStatuses.Saved,
            ChangedAt = DateTime.UtcNow,
            Note = "Application created",
        });
        await db.SaveChangesAsync();

        return Results.Created($"/applications/{app.Id}", ToDto(app));
    }

    // ── GET /applications/{id} ────────────────────────────────────────────────

    static async Task<IResult> GetApplication(Guid id, HttpContext ctx, AppDbContext db)
    {
        var clerkId = ctx.GetClerkId();
        var app = await db.Applications
            .Include(a => a.Documents)
            .Include(a => a.StatusHistory)
            .Include(a => a.Reminders)
            .FirstOrDefaultAsync(a => a.Id == id && a.User.ClerkId == clerkId);
        return app == null ? Results.NotFound() : Results.Ok(ToDetailDto(app));
    }

    // ── DELETE /applications/{id} ─────────────────────────────────────────────

    static async Task<IResult> DeleteApplication(Guid id, HttpContext ctx, AppDbContext db)
    {
        var clerkId = ctx.GetClerkId();
        var app = await db.Applications
            .FirstOrDefaultAsync(a => a.Id == id && a.User.ClerkId == clerkId);
        if (app == null) return Results.NotFound();

        db.Applications.Remove(app);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }

    // ── PATCH /applications/{id}/status ──────────────────────────────────────

    static async Task<IResult> UpdateStatus(Guid id, HttpContext ctx, AppDbContext db, UpdateApplicationStatusRequest req)
    {
        if (!ApplicationStatuses.All.Contains(req.NewStatus))
            return Results.BadRequest("Invalid status value.");

        var clerkId = ctx.GetClerkId();
        var app = await db.Applications
            .FirstOrDefaultAsync(a => a.Id == id && a.User.ClerkId == clerkId);
        if (app == null) return Results.NotFound();

        var from = app.Status;
        app.Status = req.NewStatus;
        app.UpdatedAt = DateTime.UtcNow;

        if (req.NewStatus == ApplicationStatuses.Applied && app.AppliedAt == null)
            app.AppliedAt = DateTime.UtcNow;

        db.ApplicationStatusHistories.Add(new ApplicationStatusHistory
        {
            Id = Guid.NewGuid(),
            ApplicationId = app.Id,
            FromStatus = from,
            ToStatus = req.NewStatus,
            ChangedAt = DateTime.UtcNow,
            Note = req.Note,
        });

        if (req.NewStatus == ApplicationStatuses.Applied)
        {
            db.Reminders.Add(new Reminder
            {
                Id = Guid.NewGuid(),
                ApplicationId = app.Id,
                Type = ReminderTypes.FollowUpPostApply,
                ScheduledFor = DateTime.UtcNow.AddDays(7),
                Status = ReminderStatuses.Pending,
                CreatedAt = DateTime.UtcNow,
            });
        }

        await db.SaveChangesAsync();
        return Results.NoContent();
    }

    // ── POST /applications/{id}/parse  (AI STUB) ──────────────────────────────

    static async Task<IResult> ParseApplication(Guid id, HttpContext ctx, AppDbContext db)
    {
        var clerkId = ctx.GetClerkId();
        var app = await db.Applications
            .FirstOrDefaultAsync(a => a.Id == id && a.User.ClerkId == clerkId);
        if (app == null) return Results.NotFound();

        // TODO: replace with AI service call
        await Task.Delay(1500);

        app.CompanyName = "Lumen Labs";
        app.JobTitle = "Senior Backend Engineer";
        app.ParsedData = new ParsedApplicationData
        {
            Stack = ["Python", "FastAPI", "PostgreSQL", "Redis", "Kubernetes"],
            SeniorityLevel = "Senior",
            RemotePolicy = "remote",
            SalaryMin = 140_000,
            SalaryMax = 180_000,
            SalaryCurrency = "USD",
            Location = "Remote · US",
            PostedAt = DateTime.UtcNow.AddDays(-3),
        };
        app.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Results.Ok(new ParseApplicationResponse(app.CompanyName, app.JobTitle, app.ParsedData));
    }

    // ── POST /applications/{id}/score  (AI STUB) ──────────────────────────────

    static async Task<IResult> ScoreApplication(Guid id, HttpContext ctx, AppDbContext db)
    {
        var clerkId = ctx.GetClerkId();
        var app = await db.Applications
            .FirstOrDefaultAsync(a => a.Id == id && a.User.ClerkId == clerkId);
        if (app == null) return Results.NotFound();

        // TODO: replace with AI service call
        await Task.Delay(1000);

        app.MatchScore = 87;
        app.MatchExplanation =
            "Strong alignment on the core Python/FastAPI stack and distributed systems experience. " +
            "PostgreSQL and Kubernetes match exactly. Redis and observability work noted but not primary requirements. " +
            "Senior-level scope matches 5 years of experience.";
        app.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Results.Ok(new ScoreApplicationResponse(app.MatchScore.Value, app.MatchExplanation));
    }

    // ── GET /applications/{id}/documents ─────────────────────────────────────

    static async Task<IResult> GetDocuments(Guid id, HttpContext ctx, AppDbContext db)
    {
        var clerkId = ctx.GetClerkId();
        var exists = await db.Applications.AnyAsync(a => a.Id == id && a.User.ClerkId == clerkId);
        if (!exists) return Results.NotFound();

        var docs = await db.ApplicationDocuments
            .Where(d => d.ApplicationId == id)
            .OrderBy(d => d.CreatedAt)
            .Select(d => new DocumentDto(d.Id, d.Type, d.Content, d.CreatedAt, d.UpdatedAt))
            .ToListAsync();

        return Results.Ok(docs);
    }

    // ── POST /applications/{id}/documents  (AI STUB) ─────────────────────────

    static async Task<IResult> CreateDocument(Guid id, HttpContext ctx, AppDbContext db, CreateDocumentRequest req)
    {
        var clerkId = ctx.GetClerkId();
        var app = await db.Applications
            .FirstOrDefaultAsync(a => a.Id == id && a.User.ClerkId == clerkId);
        if (app == null) return Results.NotFound();

        // TODO: replace with AI service call
        await Task.Delay(2000);

        var content = $"""
            Dear Hiring Team,

            I am excited to apply for the {app.JobTitle ?? "Software Engineer"} role at {app.CompanyName ?? "your company"}.
            With five years of backend engineering experience spanning Python, FastAPI, PostgreSQL, and Kubernetes,
            I am confident I can contribute meaningfully from day one.

            In my current role, I designed a multi-tenant data pipeline processing 2M events/day on Kafka + PostgreSQL,
            reducing p99 latency by 40%. I led the migration of six services to Kubernetes, cutting infrastructure
            cost by 30% while improving deployment reliability. These are precisely the kinds of challenges your
            job description describes.

            I am particularly drawn to {app.CompanyName ?? "your company"}'s emphasis on observability and reliability,
            which aligns directly with my OpenTelemetry and SRE work over the past three years.

            Thank you for your time and consideration. I look forward to hearing from you.

            Best regards,
            [Your name]
            """;

        var doc = new ApplicationDocument
        {
            Id = Guid.NewGuid(),
            ApplicationId = id,
            Type = req.Type,
            Content = content,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        db.ApplicationDocuments.Add(doc);
        await db.SaveChangesAsync();

        return Results.Created($"/applications/{id}/documents/{doc.Id}",
            new DocumentDto(doc.Id, doc.Type, doc.Content, doc.CreatedAt, doc.UpdatedAt));
    }

    // ── PATCH /applications/{id}/documents/{docId} ────────────────────────────

    static async Task<IResult> UpdateDocument(Guid id, Guid docId, HttpContext ctx, AppDbContext db, UpdateDocumentRequest req)
    {
        var clerkId = ctx.GetClerkId();
        var doc = await db.ApplicationDocuments
            .FirstOrDefaultAsync(d => d.Id == docId
                && d.ApplicationId == id
                && d.Application.User.ClerkId == clerkId);
        if (doc == null) return Results.NotFound();

        doc.Content = req.Content;
        doc.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Results.Ok(new DocumentDto(doc.Id, doc.Type, doc.Content, doc.CreatedAt, doc.UpdatedAt));
    }

    // ── DELETE /applications/{id}/documents/{docId} ───────────────────────────

    static async Task<IResult> DeleteDocument(Guid id, Guid docId, HttpContext ctx, AppDbContext db)
    {
        var clerkId = ctx.GetClerkId();
        var doc = await db.ApplicationDocuments
            .FirstOrDefaultAsync(d => d.Id == docId
                && d.ApplicationId == id
                && d.Application.User.ClerkId == clerkId);
        if (doc == null) return Results.NotFound();

        db.ApplicationDocuments.Remove(doc);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }
}
