namespace DevTrack.Api.Entities;

public class UserProfile
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public List<string> Stack { get; set; } = [];
    public int YearsOfExperience { get; set; }
    public string? GitHubUrl { get; set; }
    public string? ResumeText { get; set; }
    public string? CvFileUrl { get; set; }
    public DateTime? CvUploadedAt { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
