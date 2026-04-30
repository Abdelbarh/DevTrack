namespace DevTrack.Api.Entities;

public static class ReminderStatuses
{
    public const string Pending   = "pending";
    public const string Sent      = "sent";
    public const string Failed    = "failed";
    public const string Cancelled = "cancelled";
}

public static class ReminderTypes
{
    public const string FollowUpPostApply     = "follow_up_post_apply";
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
    public string Status { get; set; } = ReminderStatuses.Pending;

    public DateTime CreatedAt { get; set; }
}
