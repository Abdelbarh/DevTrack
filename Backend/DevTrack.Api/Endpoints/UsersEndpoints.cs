using DevTrack.Api.Auth;
using DevTrack.Api.Data;
using DevTrack.Api.DTOs;
using DevTrack.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Security.Claims;

namespace DevTrack.Api.Endpoints;

public static class UsersEndpoints
{
    public static IEndpointRouteBuilder MapUsersEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/users").RequireAuthorization();

        group.MapPost("/sync",              SyncUser);
        group.MapGet("/me/profile",         GetProfile);
        group.MapPut("/me/profile",         UpdateProfile);
        group.MapPost("/me/profile/parse-cv", (Delegate)ParseCv);

        return app;
    }

    static async Task<IResult> SyncUser(HttpContext ctx, AppDbContext db)
    {
        var clerkId = ctx.GetClerkId();
        var email = ctx.User.FindFirstValue("email")
                 ?? ctx.User.FindFirstValue(ClaimTypes.Email)
                 ?? string.Empty;

        var exists = await db.Users.AnyAsync(u => u.ClerkId == clerkId);
        if (!exists)
        {
            var user = new User
            {
                Id = Guid.NewGuid(),
                ClerkId = clerkId,
                Email = email,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };
            var profile = new UserProfile
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };
            db.Users.Add(user);
            db.UserProfiles.Add(profile);
            try { await db.SaveChangesAsync(); }
            catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: "23505" })
            {
                // Race condition: concurrent request already created this user
            }
        }

        return Results.NoContent();
    }

    static async Task<IResult> GetProfile(HttpContext ctx, AppDbContext db)
    {
        var clerkId = ctx.GetClerkId();
        var profile = await db.UserProfiles
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.User.ClerkId == clerkId);

        if (profile == null) return Results.NotFound();

        return Results.Ok(new ProfileDto(
            profile.Stack ?? [],
            profile.YearsOfExperience ?? 0,
            profile.GitHubUrl,
            profile.ResumeText
        ));
    }

    static async Task<IResult> UpdateProfile(HttpContext ctx, AppDbContext db, UpdateProfileRequest req)
    {
        var clerkId = ctx.GetClerkId();
        var profile = await db.UserProfiles
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.User.ClerkId == clerkId);

        if (profile == null) return Results.NotFound();

        profile.Stack = req.Stack;
        profile.YearsOfExperience = req.YearsOfExperience;
        profile.GitHubUrl = req.GitHubUrl;
        profile.ResumeText = req.ResumeText;
        profile.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return Results.NoContent();
    }

    // ── POST /users/me/profile/parse-cv  (AI STUB) ───────────────────────────

    static async Task<IResult> ParseCv(HttpContext ctx)
    {
        // TODO: replace with AI service call — read IFormFile, extract structured data
        await Task.Delay(2000);

        return Results.Ok(new ParseCvResponse(
            Stack: ["Python", "FastAPI", "PostgreSQL", "Kafka", "Kubernetes", "OpenTelemetry"],
            YearsOfExperience: 5,
            GitHubUrl: "https://github.com/devuser",
            ResumeText:
                "Backend engineer with 5 years of experience building distributed systems and data pipelines. " +
                "Strong in Python, FastAPI, and PostgreSQL. Led Kubernetes migration cutting infrastructure costs by 30%. " +
                "Designed multi-tenant event pipeline processing 2M events/day. " +
                "Passionate about observability, reliability engineering, and clean API design."
        ));
    }
}
