using System.Security.Claims;

namespace DevTrack.Api.Auth;

public static class ClerkUserExtensions
{
    public static string GetClerkId(this HttpContext context)
    {
        var clerkId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(clerkId))
            throw new UnauthorizedAccessException("No authenticated user.");
        return clerkId;
    }
}
