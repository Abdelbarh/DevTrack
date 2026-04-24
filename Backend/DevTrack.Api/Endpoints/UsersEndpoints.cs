using DevTrack.Api.Auth;
using DevTrack.Api.Data;
using DevTrack.Api.Entities;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DevTrack.Api.Endpoints;

public static class UsersEndpoints
{
    public static IEndpointRouteBuilder MapUsersEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/users").RequireAuthorization();

        group.MapPost("/sync", SyncUser);
        group.MapGet("/me/profile", GetProfile);
        group.MapPut("/me/profile", UpdateProfile);

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
            await db.SaveChangesAsync();
        }

        return Results.Ok();
    }

    static async Task<IResult> GetProfile(HttpContext ctx, AppDbContext db)
    {
        var clerkId = ctx.GetClerkId();

        var profile = await db.UserProfiles
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.User.ClerkId == clerkId);

        if (profile == null) return Results.NotFound();

        return Results.Ok(new ProfileDto(
            profile.Stack,
            profile.YearsOfExperience,
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
        return Results.Ok();
    }
}

record ProfileDto(List<string> Stack, int YearsOfExperience, string? GitHubUrl, string? ResumeText);
record UpdateProfileRequest(List<string> Stack, int YearsOfExperience, string? GitHubUrl, string? ResumeText);
