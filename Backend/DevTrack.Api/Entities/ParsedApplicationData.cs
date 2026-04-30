namespace DevTrack.Api.Entities;

public record ParsedApplicationData
{
    public List<string>? Stack { get; init; }
    public string? SeniorityLevel { get; init; }
    public string? RemotePolicy { get; init; }   // "remote" | "hybrid" | "on-site"
    public decimal? SalaryMin { get; init; }
    public decimal? SalaryMax { get; init; }
    public string? SalaryCurrency { get; init; }
    public string? Location { get; init; }
    public DateTime? PostedAt { get; init; }
}
