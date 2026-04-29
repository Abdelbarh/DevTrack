namespace DevTrack.Api.Entities;

public enum ReminderStatus { Pending, Sent, Failed, Cancelled }

public static class ReminderType
{
    public const string FollowUpPostApply = "follow_up_post_apply";
    public const string FollowUpPostInterview = "follow_up_post_interview";
}

public class Reminder
{
    public Guid Id { get; set; }
    public Guid ApplicationId { get; set; }
    public Application Application { get; set; } = null!;

    public string Type { get; set; } = string.Empty;
    public DateTime ScheduledFor { get; set; }
    public DateTime? SentAt { get; set; }
    public ReminderStatus Status { get; set; } = ReminderStatus.Pending;

    public DateTime CreatedAt { get; set; }
}
