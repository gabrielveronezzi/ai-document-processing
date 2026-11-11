using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<DocumentRecord> Documents => Set<DocumentRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var document = modelBuilder.Entity<DocumentRecord>();
        document.HasKey(x => x.Id);
        document.Property(x => x.OriginalFileName).HasMaxLength(255).IsRequired();
        document.Property(x => x.StoredFileName).HasMaxLength(64).IsRequired();
        document.Property(x => x.ContentType).HasMaxLength(100).IsRequired();
        document.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
        document.HasIndex(x => x.CreatedAtUtc);
    }
}
