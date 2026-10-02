using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Features.Authentication.DTOs;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace ECommerce.Infrastructure.Identity.Jwt;

public sealed class JwtTokenService : IJwtTokenService
{
    private readonly JwtSettings _settings;
    private readonly UserManager<ApplicationUser> _userManager;

    public JwtTokenService(IOptions<JwtSettings> options, UserManager<ApplicationUser> userManager)
    {
        _settings = options.Value;
        _userManager = userManager;
    }

    public async Task<LoginResponseDto> GenerateTokenAsync(
        string userId,
        string email,
        int? customerId,
       CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId);

        if (user is null)
        {
            throw new InvalidOperationException(
                "User could not be found.");
        }

        var roles = await _userManager.GetRolesAsync(user);

        var expiresAt = DateTime.UtcNow.AddMinutes(
             _settings.ExpirationMinutes);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId),
            new(JwtRegisteredClaimNames.Email, email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };
        if (customerId.HasValue)
        {
            claims.Add(
                new Claim("customerId", customerId.Value.ToString()));
        }

        foreach (var role in roles)
        {
            claims.Add(
                new Claim(
                    ClaimTypes.Role,
                    role));
        }

        var key = new SymmetricSecurityKey(
           Encoding.UTF8.GetBytes(_settings.Key));

        var credentials = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials);

        var accessToken = new JwtSecurityTokenHandler()
           .WriteToken(token);

        return new LoginResponseDto(accessToken, expiresAt);
    }
}