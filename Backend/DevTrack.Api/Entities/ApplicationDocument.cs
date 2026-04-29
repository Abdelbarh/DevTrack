namespace DevTrack.Api.Entities;

public static class ApplicationDocumentType
{
    public const string CoverLetter = "cover_letter";
    public const string Resume = "resume";
}

public class ApplicationDocument
{
    public Guid Id { get; set; }
    public Guid ApplicationId { get; set; }
    public Application Application { get; set; } = null!;

    public string Type { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
