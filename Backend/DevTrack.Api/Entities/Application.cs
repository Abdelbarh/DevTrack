namespace DevTrack.Api.Entities;

public enum ApplicationStatus
{
    Saved,
    Applied,
    Screening,
    Interview,
    Offer,
    Rejected,
    Withdrawn
}

public class Application
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string JobDescriptionRaw { get; set; } = string.Empty;

    public string? CompanyName { get; set; }
    public string? JobTitle { get; set; }
    public ParsedApplicationData? ParsedData { get; set; }

    public int? MatchScore { get; set; }
    public string? MatchExplanation { get; set; }

    public ApplicationStatus Status { get; set; } = ApplicationStatus.Saved;
    public DateTime? AppliedAt { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<ApplicationDocument> Documents { get; set; } = [];
    public ICollection<ApplicationStatusHistory> StatusHistory { get; set; } = [];
    public ICollection<Reminder> Reminders { get; set; } = [];
}
