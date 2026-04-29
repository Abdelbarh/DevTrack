namespace DevTrack.Api.Entities;

public class User
{
    public Guid Id { get; set; }
    public string ClerkId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public UserProfile? Profile { get; set; }
    public Subscription? Subscription { get; set; }
    public ICollection<Application> Applications { get; set; } = [];
}
