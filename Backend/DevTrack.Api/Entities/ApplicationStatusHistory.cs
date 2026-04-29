namespace DevTrack.Api.Entities;

public class ApplicationStatusHistory
{
    public Guid Id { get; set; }
    public Guid ApplicationId { get; set; }
    public Application Application { get; set; } = null!;

    public ApplicationStatus? FromStatus { get; set; }
    public ApplicationStatus ToStatus { get; set; }
    public DateTime ChangedAt { get; set; }
    public string? Note { get; set; }
}
