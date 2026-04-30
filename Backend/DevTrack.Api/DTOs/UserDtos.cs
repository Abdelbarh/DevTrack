namespace DevTrack.Api.DTOs;

record ProfileDto(List<string>? Stack, int? YearsOfExperience, string? GitHubUrl, string? ResumeText);
record UpdateProfileRequest(List<string>? Stack, int? YearsOfExperience, string? GitHubUrl, string? ResumeText);
