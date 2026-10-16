using ECommerce.Application.Features.Authentication.DTOs;

namespace ECommerce.Application.Common.Interfaces
{
    public interface IAuthenticationService
    {
        Task RegisterAsync(
            string firstName,
            string lastName,
            string email,
            string password,
            CancellationToken cancellationToken = default
        );
        Task<LoginResponseDto> LoginAsync(
            string email,
            string password,
            CancellationToken cancellationToken = default
        );

        Task<UserProfileDto> GetProfileAsync(string userId, CancellationToken cancellationToken = default);

        Task ChangePasswordAsync(string userId, string currentPassword, string newPassword, CancellationToken cancellationToken = default);

        Task<LoginResponseDto> RefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default);

        Task LogoutAsync(string refreshToken, CancellationToken cancellationToken = default);

    }
}