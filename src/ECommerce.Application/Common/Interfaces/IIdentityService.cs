namespace ECommerce.Application.Common.Interfaces
{
    public interface IIdentityService
    {
        Task<(bool Succeeded, string? UserId, IReadOnlyCollection<string> Errors)>
         CreateUserAsync(
           string email,
           string password,
           CancellationToken cancellationToken = default);
    }
}