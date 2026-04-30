using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace DevTrack.Api.Data;

// Used only by EF Core CLI tools (dotnet ef migrations add / database update).
// At runtime Aspire provides the real connection string.
public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql("Host=localhost;Database=devtrack_design;Username=postgres;Password=postgres")
            .Options;
        return new AppDbContext(options);
    }
}
