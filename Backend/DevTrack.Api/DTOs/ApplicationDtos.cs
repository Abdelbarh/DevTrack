using DevTrack.Api.Entities;

namespace DevTrack.Api.DTOs;

record ApplicationDto(
    Guid Id,
    string? CompanyName,
    string? JobTitle,
    ParsedApplicationData? ParsedData,
    int? MatchScore,
    string Status,
    DateTime? AppliedAt,
    DateTime CreatedAt,
    string JobDescriptionRaw
);

record CreateApplicationRequest(string JobDescriptionRaw);

record UpdateApplicationStatusRequest(string Status);
