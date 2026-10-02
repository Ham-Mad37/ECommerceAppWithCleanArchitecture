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
    }
}