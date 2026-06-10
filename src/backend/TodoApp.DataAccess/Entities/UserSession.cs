namespace TodoApp.DataAccess.Entities;

public class UserSession
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string RefreshTokenHash { get; set; } = string.Empty;

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset ExpiresAt { get; set; }

    public DateTimeOffset? RevokedAt { get; set; }

    public Guid? ReplacedBySessionId { get; set; }

    public User User { get; set; } = null!;

    public UserSession? ReplacedBySession { get; set; }

    public ICollection<UserSession> ReplacementSessions { get; set; } = [];
}
