using System.Text.Json;
using DevTrack.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DevTrack.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
    public DbSet<Application> Applications => Set<Application>();
    public DbSet<ApplicationDocument> ApplicationDocuments => Set<ApplicationDocument>();
    public DbSet<ApplicationStatusHistory> ApplicationStatusHistories => Set<ApplicationStatusHistory>();
    public DbSet<Reminder> Reminders => Set<Reminder>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();

    private static readonly JsonSerializerOptions _jsonOptions = new(JsonSerializerDefaults.Web);

    protected override void OnModelCreating(ModelBuilder model)
    {
        model.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.HasIndex(u => u.ClerkId).IsUnique();
            e.Property(u => u.CreatedAt).HasDefaultValueSql("now()");
            e.Property(u => u.UpdatedAt).HasDefaultValueSql("now()");
        });

        model.Entity<UserProfile>(e =>
        {
            e.HasKey(p => p.Id);
            e.HasOne(p => p.User).WithOne(u => u.Profile)
                .HasForeignKey<UserProfile>(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            e.Property(p => p.Stack).HasColumnType("text[]");
            e.Property(p => p.CreatedAt).HasDefaultValueSql("now()");
            e.Property(p => p.UpdatedAt).HasDefaultValueSql("now()");
        });

        model.Entity<Application>(e =>
        {
            e.HasKey(a => a.Id);
            e.HasOne(a => a.User).WithMany(u => u.Applications)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            e.Property(a => a.Status).HasConversion<string>().HasDefaultValue(ApplicationStatus.Saved);
            e.Property(a => a.ParsedData)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => v == null ? null! : JsonSerializer.Serialize(v, _jsonOptions),
                    v => v == null ? null : JsonSerializer.Deserialize<ParsedApplicationData>(v, _jsonOptions)
                );
            e.Property(a => a.CreatedAt).HasDefaultValueSql("now()");
            e.Property(a => a.UpdatedAt).HasDefaultValueSql("now()");
            e.HasIndex(a => new { a.UserId, a.Status });
            e.HasIndex(a => new { a.UserId, a.CreatedAt });
        });

        model.Entity<ApplicationDocument>(e =>
        {
            e.HasKey(d => d.Id);
            e.HasOne(d => d.Application).WithMany(a => a.Documents)
                .HasForeignKey(d => d.ApplicationId)
                .OnDelete(DeleteBehavior.Cascade);
            e.Property(d => d.CreatedAt).HasDefaultValueSql("now()");
            e.Property(d => d.UpdatedAt).HasDefaultValueSql("now()");
            e.HasIndex(d => new { d.ApplicationId, d.Type });
        });

        model.Entity<ApplicationStatusHistory>(e =>
        {
            e.HasKey(h => h.Id);
            e.HasOne(h => h.Application).WithMany(a => a.StatusHistory)
                .HasForeignKey(h => h.ApplicationId)
                .OnDelete(DeleteBehavior.Cascade);
            e.Property(h => h.FromStatus).HasConversion<string>();
            e.Property(h => h.ToStatus).HasConversion<string>();
            e.Property(h => h.ChangedAt).HasDefaultValueSql("now()");
        });

        model.Entity<Reminder>(e =>
        {
            e.HasKey(r => r.Id);
            e.HasOne(r => r.Application).WithMany(a => a.Reminders)
                .HasForeignKey(r => r.ApplicationId)
                .OnDelete(DeleteBehavior.Cascade);
            e.Property(r => r.Status).HasConversion<string>().HasDefaultValue(ReminderStatus.Pending);
            e.Property(r => r.CreatedAt).HasDefaultValueSql("now()");
            e.HasIndex(r => new { r.Status, r.ScheduledFor });
        });

        model.Entity<Subscription>(e =>
        {
            e.HasKey(s => s.Id);
            e.HasOne(s => s.User).WithOne(u => u.Subscription)
                .HasForeignKey<Subscription>(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(s => s.UserId).IsUnique();
            e.Property(s => s.Tier).HasDefaultValue("free");
            e.Property(s => s.CreatedAt).HasDefaultValueSql("now()");
            e.Property(s => s.UpdatedAt).HasDefaultValueSql("now()");
        });
    }
}
