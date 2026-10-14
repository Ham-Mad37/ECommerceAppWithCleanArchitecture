namespace ECommerce.Application.Features.Authentication.DTOs;

public sealed record LoginResponseDto(
    string AccessToken,
    DateTime ExpiresAt,
     string? RefreshToken = null,
    DateTime? RefreshTokenExpiresAt = null);