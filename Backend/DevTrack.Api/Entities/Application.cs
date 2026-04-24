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

    // Raw input
    public string JobDescriptionRaw { get; set; } = string.Empty;

    // Parsed by AI
    public string? CompanyName { get; set; }
    public string? JobTitle { get; set; }
    public List<string> ParsedStack { get; set; } = [];
    public string? SeniorityLevel { get; set; }
    public bool? IsRemote { get; set; }
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }

    // Match scoring
    public int? MatchScore { get; set; }
    public string? MatchExplanation { get; set; }

    // Pipeline
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Saved;
    public DateTime? AppliedAt { get; set; }
    public DateTime? LastInterviewAt { get; set; }

    // AI-generated content
    public string? TailoredResumeText { get; set; }
    public string? CoverLetterText { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
