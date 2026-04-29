namespace DevTrack.Api.Entities;

public record ParsedApplicationData
{
    public List<string>? Stack { get; init; }
    public string? SeniorityLevel { get; init; }
    public bool? IsRemote { get; init; }
    public decimal? SalaryMin { get; init; }
    public decimal? SalaryMax { get; init; }
}
