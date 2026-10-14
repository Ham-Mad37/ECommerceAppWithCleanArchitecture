namespace ECommerce.Infrastructure.Identity;

public sealed class RefreshToken
{
    public int Id { get; set; }
    public string UserId { get; set; } = null!;
    public string TokenHash { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public string? ReplacedByTokenHash { get; set; }   // set when rotated
    public byte[] RowVersion { get; set; } = null!;
}