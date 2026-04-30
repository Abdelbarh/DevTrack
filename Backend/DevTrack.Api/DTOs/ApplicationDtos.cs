using DevTrack.Api.Entities;

namespace DevTrack.Api.DTOs;

// ── List / create ────────────────────────────────────────────────────────────

record ApplicationDto(
    Guid Id,
    string? CompanyName,
    string? JobTitle,
    ParsedApplicationData? ParsedData,
    int? MatchScore,
    string? MatchExplanation,
    string Status,
    DateTime? AppliedAt,
    DateTime CreatedAt,
    string JobDescriptionRaw
);

record CreateApplicationRequest(string JobDescriptionRaw);

// ── Detail ───────────────────────────────────────────────────────────────────

record ApplicationDetailDto(
    Guid Id,
    string? CompanyName,
    string? JobTitle,
    ParsedApplicationData? ParsedData,
    int? MatchScore,
    string? MatchExplanation,
    string Status,
    DateTime? AppliedAt,
    DateTime CreatedAt,
    string JobDescriptionRaw,
    IEnumerable<DocumentDto> Documents,
    IEnumerable<StatusHistoryDto> StatusHistory,
    IEnumerable<ReminderDto> Reminders
);

record DocumentDto(
    Guid Id,
    string Type,
    string Content,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

record StatusHistoryDto(
    Guid Id,
    string? FromStatus,
    string ToStatus,
    DateTime ChangedAt,
    string? Note
);

record ReminderDto(
    Guid Id,
    string Type,
    DateTime ScheduledFor,
    DateTime? SentAt,
    string Status,
    DateTime CreatedAt
);

// ── Mutations ────────────────────────────────────────────────────────────────

record UpdateApplicationStatusRequest(string NewStatus, string? Note);

record CreateDocumentRequest(string Type);

record UpdateDocumentRequest(string Content);

// ── AI stub response shapes ──────────────────────────────────────────────────

record ParseApplicationResponse(
    string? CompanyName,
    string? JobTitle,
    ParsedApplicationData? ParsedData
);

record ScoreApplicationResponse(
    int Score,
    string Explanation
);

record ParseCvResponse(
    List<string>? Stack,
    int? YearsOfExperience,
    string? GitHubUrl,
    string? ResumeText
);
