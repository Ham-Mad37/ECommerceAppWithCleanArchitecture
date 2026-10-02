using ECommerce.Application.Features.Authentication.DTOs;

namespace ECommerce.Application.Common.Interfaces;
public interface IJwtTokenService
{
    Task<LoginResponseDto> GenerateTokenAsync(
            string userId,
            string email,
            int? customerId,
            CancellationToken cancellationToken = default
         );
}