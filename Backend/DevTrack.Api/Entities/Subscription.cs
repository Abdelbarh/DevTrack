namespace DevTrack.Api.Entities;

public class Subscription
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string? StripeCustomerId { get; set; }
    public string? StripeSubscriptionId { get; set; }
    public string Tier { get; set; } = "free";
    public string Status { get; set; } = string.Empty;
    public DateTime? CurrentPeriodEnd { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
