namespace DevTrack.Api.Entities;

public class ApplicationStatusHistory
{
    public Guid Id { get; set; }
    public Guid ApplicationId { get; set; }
    public Application Application { get; set; } = null!;

    public string? FromStatus { get; set; }
    public string ToStatus { get; set; } = string.Empty;
    public DateTime ChangedAt { get; set; }
    public string? Note { get; set; }
}
