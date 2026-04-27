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
        var group = app.MapGroup("/applications").RequireAuthorization();

        group.MapGet("/", GetApplications);
        group.MapPost("/", CreateApplication);

        return app;
    }

    static async Task<IResult> GetApplications(HttpContext ctx, AppDbContext db)
    {
        var clerkId = ctx.GetClerkId();

        var applications = await db.Applications
            .Where(a => a.User.ClerkId == clerkId)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new ApplicationDto(
                a.Id, a.CompanyName, a.JobTitle, a.ParsedStack,
                a.SeniorityLevel, a.IsRemote, a.SalaryMin, a.SalaryMax,
                a.MatchScore, a.Status.ToString(), a.AppliedAt, a.CreatedAt, a.JobDescriptionRaw
            ))
            .ToListAsync();

        return Results.Ok(applications);
    }

    static async Task<IResult> CreateApplication(HttpContext ctx, AppDbContext db, CreateApplicationRequest req)
    {
        var clerkId = ctx.GetClerkId();
        var user = await db.Users.FirstOrDefaultAsync(u => u.ClerkId == clerkId);
        if (user == null) return Results.NotFound();

        var application = new Application
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            JobDescriptionRaw = req.JobDescriptionRaw,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        db.Applications.Add(application);
        await db.SaveChangesAsync();

        return Results.Created($"/applications/{application.Id}", new ApplicationDto(
            application.Id, application.CompanyName, application.JobTitle, application.ParsedStack,
            application.SeniorityLevel, application.IsRemote, application.SalaryMin, application.SalaryMax,
            application.MatchScore, application.Status.ToString(), application.AppliedAt,
            application.CreatedAt, application.JobDescriptionRaw
        ));
    }
}
