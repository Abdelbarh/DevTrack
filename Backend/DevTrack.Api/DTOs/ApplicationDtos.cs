namespace DevTrack.Api.DTOs;

record ApplicationDto(
    Guid Id,
    string? CompanyName,
    string? JobTitle,
    List<string> ParsedStack,
    string? SeniorityLevel,
    bool? IsRemote,
    decimal? SalaryMin,
    decimal? SalaryMax,
    int? MatchScore,
    string Status,
    DateTime? AppliedAt,
    DateTime CreatedAt,
    string JobDescriptionRaw
);

record CreateApplicationRequest(string JobDescriptionRaw);
