namespace DevTrack.Api.Entities;

public static class ApplicationStatuses
{
    public const string Saved     = "Saved";
    public const string Applied   = "Applied";
    public const string Screening = "Screening";
    public const string Interview = "Interview";
    public const string Offer     = "Offer";
    public const string Rejected  = "Rejected";
    public const string Withdrawn = "Withdrawn";

    public static readonly IReadOnlySet<string> All = new HashSet<string>
    {
        Saved, Applied, Screening, Interview, Offer, Rejected, Withdrawn
    };
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

    public string Status { get; set; } = ApplicationStatuses.Saved;
    public DateTime? AppliedAt { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<ApplicationDocument> Documents { get; set; } = [];
    public ICollection<ApplicationStatusHistory> StatusHistory { get; set; } = [];
    public ICollection<Reminder> Reminders { get; set; } = [];
}
