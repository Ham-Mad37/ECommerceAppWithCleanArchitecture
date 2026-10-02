namespace ECommerce.Application.Common.Interfaces;
public interface ICurrentUser
{
    string? UserId { get; }
    int? CustomerId { get; }
    string? Email { get; }
    bool IsAuthenticated { get; }
}