using Microsoft.EntityFrameworkCore;
using TodoApp.DataAccess.Entities;

namespace TodoApp.DataAccess.Persistence;

public class TodoAppDbContext(DbContextOptions<TodoAppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();

    public DbSet<TaskItem> TaskItems => Set<TaskItem>();

    public DbSet<Category> Categories => Set<Category>();

    public DbSet<UserSession> UserSessions => Set<UserSession>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        ConfigureUser(modelBuilder);
        ConfigureUserSession(modelBuilder);
        ConfigureTaskItem(modelBuilder);
        ConfigureCategory(modelBuilder);
    }

    private static void ConfigureUser(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");

            entity.HasKey(user => user.Id);

            entity.Property(user => user.Id)
                .HasDefaultValueSql("NEWID()");

            entity.Property(user => user.Email)
                .IsRequired()
                .HasMaxLength(256);

            entity.HasIndex(user => user.Email)
                .IsUnique();

            entity.Property(user => user.PasswordHash)
                .IsRequired()
                .HasMaxLength(512);

            entity.Property(user => user.DisplayName)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(user => user.CreatedAt)
                .HasDefaultValueSql("SYSUTCDATETIME()");

            entity.Property(user => user.UpdatedAt)
                .HasDefaultValueSql("SYSUTCDATETIME()");
        });
    }

    private static void ConfigureUserSession(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserSession>(entity =>
        {
            entity.ToTable("UserSessions");

            entity.HasKey(session => session.Id);

            entity.Property(session => session.Id)
                .HasDefaultValueSql("NEWID()");

            entity.Property(session => session.RefreshTokenHash)
                .IsRequired()
                .HasMaxLength(512);

            entity.HasIndex(session => session.RefreshTokenHash)
                .IsUnique();

            entity.Property(session => session.CreatedAt)
                .HasDefaultValueSql("SYSUTCDATETIME()");

            entity.Property(session => session.ExpiresAt)
                .IsRequired();

            entity.Property(session => session.RevokedAt);

            entity.HasIndex(session => session.UserId);

            entity.HasIndex(session => session.ExpiresAt);

            entity.HasOne(session => session.User)
                .WithMany(user => user.Sessions)
                .HasForeignKey(session => session.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(session => session.ReplacedBySession)
                .WithMany(session => session.ReplacementSessions)
                .HasForeignKey(session => session.ReplacedBySessionId)
                .OnDelete(DeleteBehavior.NoAction);
        });
    }

    private static void ConfigureTaskItem(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TaskItem>(entity =>
        {
            entity.ToTable("TaskItems");

            entity.HasKey(taskItem => taskItem.Id);

            entity.Property(taskItem => taskItem.Id)
                .HasDefaultValueSql("NEWID()");

            entity.Property(taskItem => taskItem.Title)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(taskItem => taskItem.Description)
                .HasMaxLength(2000);

            entity.Property(taskItem => taskItem.IsCompleted)
                .HasDefaultValue(false);

            entity.Property(taskItem => taskItem.CreatedAt)
                .HasDefaultValueSql("SYSUTCDATETIME()");

            entity.Property(taskItem => taskItem.UpdatedAt)
                .HasDefaultValueSql("SYSUTCDATETIME()");

            entity.HasIndex(taskItem => taskItem.UserId);

            entity.HasIndex(taskItem => taskItem.CategoryId);

            entity.HasOne(taskItem => taskItem.User)
                .WithMany(user => user.Tasks)
                .HasForeignKey(taskItem => taskItem.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(taskItem => taskItem.Category)
                .WithMany(category => category.Tasks)
                .HasPrincipalKey(category => new { category.UserId, category.Id })
                .HasForeignKey(taskItem => new { taskItem.UserId, taskItem.CategoryId })
                .OnDelete(DeleteBehavior.NoAction);
        });
    }

    private static void ConfigureCategory(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Category>(entity =>
        {
            entity.ToTable("Categories");

            entity.HasKey(category => category.Id);

            entity.Property(category => category.Id)
                .HasDefaultValueSql("NEWID()");

            entity.Property(category => category.Name)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(category => category.Color)
                .HasMaxLength(32);

            entity.Property(category => category.CreatedAt)
                .HasDefaultValueSql("SYSUTCDATETIME()");

            entity.Property(category => category.UpdatedAt)
                .HasDefaultValueSql("SYSUTCDATETIME()");

            entity.HasIndex(category => category.UserId);

            entity.HasIndex(category => new { category.UserId, category.Name })
                .IsUnique();

            entity.HasAlternateKey(category => new { category.UserId, category.Id });

            entity.HasOne(category => category.User)
                .WithMany(user => user.Categories)
                .HasForeignKey(category => category.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
