using System.Buffers.Text;
using System.Security.Cryptography;
using System.Text;

using ECommerce.Application.Common.Constants;
using ECommerce.Application.Common.Exceptions;
using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Features.Authentication.DTOs;

using ECommerce.Domain.Entities.Customers;

using ECommerce.Infrastructure.Data;
using ECommerce.Infrastructure.Identity.Jwt;

using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace ECommerce.Infrastructure.Identity;

public sealed class AuthenticationService
    : IAuthenticationService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly AppDbContext _dbContext;
    private readonly JwtSettings _jwtSettings;

    public AuthenticationService(
        UserManager<ApplicationUser> userManager,
        IOptions<JwtSettings> jwtOptions,
        IJwtTokenService jwtTokenService,
        AppDbContext dbContext)
    {
        _userManager = userManager;
        _jwtTokenService = jwtTokenService;
        _dbContext = dbContext;
        _jwtSettings = jwtOptions.Value;
    }

    // =========================================================
    // REGISTER
    // =========================================================

    public async Task RegisterAsync(
        string firstName,
        string lastName,
        string email,
        string password,
        CancellationToken cancellationToken = default)
    {
        email = email
            .Trim()
            .ToLowerInvariant();

        var emailExists =
            await _userManager.FindByEmailAsync(email);

        if (emailExists != null)
        {
            throw new ConflictException(
                "A user with this email already exists.");
        }

        await using var transaction =
            await _dbContext.Database.BeginTransactionAsync(
                cancellationToken);

        try
        {
            // =====================================================
            // 1. Create Customer
            // =====================================================

            var customer =
                Customer.Create(
                    firstName,
                    lastName,
                    email);

            await _dbContext.Customers.AddAsync(
                customer,
                cancellationToken);

            // Customer.Id is needed by ApplicationUser
            await _dbContext.SaveChangesAsync(
                cancellationToken);

            // =====================================================
            // 2. Create Identity User
            // =====================================================

            var user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                CustomerId = customer.Id
            };

            var result =
                await _userManager.CreateAsync(
                    user,
                    password);

            if (!result.Succeeded)
            {
                var errors =
                    string.Join(
                        ", ",
                        result.Errors.Select(
                            e => e.Description));

                throw new IdentityException(
                    $"Failed to create user: {errors}");
            }

            // =====================================================
            // 3. Assign Customer Role
            // =====================================================

            var roleResult =
                await _userManager.AddToRoleAsync(
                    user,
                    Roles.Customer);

            if (!roleResult.Succeeded)
            {
                var errors =
                    string.Join(
                        ", ",
                        roleResult.Errors.Select(
                            e => e.Description));

                throw new IdentityException(
                    $"Failed to assign role: {errors}");
            }

            // =====================================================
            // 4. Commit
            // =====================================================

            await transaction.CommitAsync(
                cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(
                cancellationToken);

            throw;
        }
    }

    // =========================================================
    // LOGIN
    // =========================================================

    public async Task<LoginResponseDto> LoginAsync(
        string email,
        string password,
        CancellationToken cancellationToken = default)
    {
        email = email
            .Trim()
            .ToLowerInvariant();

        // =====================================================
        // 1. Find Identity User
        // =====================================================

        var user =
            await _userManager.FindByEmailAsync(
                email);

        if (user is null)
        {
            throw new UnauthorizedAccessException(
                "Invalid email or password.");
        }

        // =====================================================
        // 2. Check Password
        // =====================================================

        var passwordValid =
            await _userManager.CheckPasswordAsync(
                user,
                password);

        if (!passwordValid)
        {
            throw new UnauthorizedAccessException(
                "Invalid email or password.");
        }

        // =====================================================
        // 3. Get User Roles
        // =====================================================

        var roles =
            await _userManager.GetRolesAsync(
                user);

        // =====================================================
        // 4. Customer-specific validation
        // =====================================================

        if (user.CustomerId is not null)
        {
            var customer =
                await _dbContext.Customers
                    .AsNoTracking()
                    .FirstOrDefaultAsync(
                        c => c.Id == user.CustomerId.Value,
                        cancellationToken);

            if (customer is null)
            {
                throw new IdentityException(
                    "The user is associated with a customer that does not exist.");
            }

            if (!customer.IsActive)
            {
                throw new UnauthorizedAccessException(
                    "Your customer account is inactive.");
            }
        }
        else
        {
            // =================================================
            // Users without CustomerId are allowed only when
            // they have an administrative role.
            // =================================================

            if (!roles.Contains(Roles.Admin))
            {
                throw new IdentityException(
                    "The user is not associated with a customer.");
            }
        }

        // =====================================================
        // 5. Generate JWT
        // =====================================================

        var token =
            await _jwtTokenService.GenerateTokenAsync(
                user.Id,
                user.Email!,
                user.CustomerId,
                cancellationToken);

        // =====================================================
        // 6. Create Refresh Token
        // =====================================================

        var (
            rawRefreshToken,
            refreshEntity
        ) = NewRefreshToken(user.Id);

        await _dbContext.SaveChangesAsync(
            cancellationToken);

        // =====================================================
        // 7. Return Authentication Response
        // =====================================================

        return token with
        {
            RefreshToken = rawRefreshToken,
            RefreshTokenExpiresAt =
                refreshEntity.ExpiresAt
        };
    }

    // =========================================================
    // REFRESH TOKEN
    // =========================================================

    public async Task<LoginResponseDto> RefreshTokenAsync(
        string refreshToken,
        CancellationToken cancellationToken = default)
    {
        var hash =
            Hash(refreshToken);

        var stored =
            await _dbContext.RefreshTokens
                .FirstOrDefaultAsync(
                    x => x.TokenHash == hash,
                    cancellationToken);

        if (stored is null)
        {
            throw new UnauthorizedAccessException(
                "Invalid refresh token.");
        }

        if (stored.RevokedAt is not null)
        {
            // A previously rotated token is being reused.
            // Revoke all active sessions for this user.
            if (stored.ReplacedByTokenHash is not null)
            {
                await RevokeAllForUserAsync(
                    stored.UserId,
                    cancellationToken);
            }

            throw new UnauthorizedAccessException(
                "Refresh token is no longer valid. Please log in again.");
        }

        if (stored.ExpiresAt <= DateTime.UtcNow)
        {
            throw new UnauthorizedAccessException(
                "Refresh token has expired. Please log in again.");
        }

        var user =
            await _userManager.FindByIdAsync(
                stored.UserId);

        if (user is null)
        {
            throw new UnauthorizedAccessException(
                "Invalid refresh token.");
        }

        // =====================================================
        // Check customer status during refresh as well
        // =====================================================

        if (user.CustomerId is not null)
        {
            var customer =
                await _dbContext.Customers
                    .AsNoTracking()
                    .FirstOrDefaultAsync(
                        c => c.Id == user.CustomerId.Value,
                        cancellationToken);

            if (customer is null ||
                !customer.IsActive)
            {
                throw new UnauthorizedAccessException(
                    "Your customer account is inactive.");
            }
        }
        else
        {
            var roles =
                await _userManager.GetRolesAsync(
                    user);

            if (!roles.Contains(Roles.Admin))
            {
                throw new UnauthorizedAccessException(
                    "The user is not associated with a customer.");
            }
        }

        // =====================================================
        // Generate new access token
        // =====================================================

        var accessToken =
            await _jwtTokenService.GenerateTokenAsync(
                user.Id,
                user.Email!,
                user.CustomerId,
                cancellationToken);

        // =====================================================
        // Rotate refresh token
        // =====================================================

        var (
            rawNewToken,
            newEntity
        ) = NewRefreshToken(user.Id);

        stored.RevokedAt =
            DateTime.UtcNow;

        stored.ReplacedByTokenHash =
            newEntity.TokenHash;

        await _dbContext.SaveChangesAsync(
            cancellationToken);

        return accessToken with
        {
            RefreshToken = rawNewToken,
            RefreshTokenExpiresAt =
                newEntity.ExpiresAt
        };
    }

    // =========================================================
    // LOGOUT
    // =========================================================

    public async Task LogoutAsync(
        string refreshToken,
        CancellationToken cancellationToken = default)
    {
        var hash =
            Hash(refreshToken);

        var stored =
            await _dbContext.RefreshTokens
                .FirstOrDefaultAsync(
                    x => x.TokenHash == hash,
                    cancellationToken);

        // Logout is intentionally idempotent.
        if (stored is null ||
            stored.RevokedAt is not null)
        {
            return;
        }

        stored.RevokedAt =
            DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(
            cancellationToken);
    }

    // =========================================================
    // CREATE REFRESH TOKEN
    // =========================================================

    private (
        string Raw,
        RefreshToken Entity
        ) NewRefreshToken(
            string userId)
    {
        var raw =
            Base64Url.EncodeToString(
                RandomNumberGenerator.GetBytes(64));

        var entity = new RefreshToken
        {
            UserId = userId,

            TokenHash =
                Hash(raw),

            CreatedAt =
                DateTime.UtcNow,

            ExpiresAt =
                DateTime.UtcNow.AddDays(
                    _jwtSettings.RefreshTokenExpirationDays)
        };

        _dbContext.RefreshTokens.Add(
            entity);

        return (
            raw,
            entity);
    }

    // =========================================================
    // HASH
    // =========================================================

    private static string Hash(
        string token)
    {
        return Convert.ToHexString(
            SHA256.HashData(
                Encoding.UTF8.GetBytes(token)));
    }

    // =========================================================
    // REVOKE ALL USER TOKENS
    // =========================================================

    private async Task RevokeAllForUserAsync(
        string userId,
        CancellationToken cancellationToken)
    {
        DateTime? now =
            DateTime.UtcNow;

        await _dbContext.RefreshTokens
            .Where(
                x =>
                    x.UserId == userId &&
                    x.RevokedAt == null)
            .ExecuteUpdateAsync(
                s => s.SetProperty(
                    x => x.RevokedAt,
                    now),
                cancellationToken);
    }

    // =========================================================
    // GET PROFILE
    // =========================================================

    public async Task<UserProfileDto> GetProfileAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        var user =
            await _userManager.FindByIdAsync(
                userId);

        if (user is null)
        {
            throw new UnauthorizedAccessException(
                "User not found.");
        }

        var roles =
            await _userManager.GetRolesAsync(
                user);

        string? firstName = null;
        string? lastName = null;

        // Admin users do not have CustomerId.
        if (user.CustomerId is not null)
        {
            var customer =
                await _dbContext.Customers
                    .AsNoTracking()
                    .Where(
                        c =>
                            c.Id ==
                            user.CustomerId.Value)
                    .Select(
                        c =>
                            new
                            {
                                c.FirstName,
                                c.LastName
                            })
                    .FirstOrDefaultAsync(
                        cancellationToken);

            firstName =
                customer?.FirstName;

            lastName =
                customer?.LastName;
        }

        return new UserProfileDto(
            user.Id,
            user.Email!,
            firstName,
            lastName,
            user.CustomerId,
            roles.ToList());
    }

    // =========================================================
    // CHANGE PASSWORD
    // =========================================================

    public async Task ChangePasswordAsync(
        string userId,
        string currentPassword,
        string newPassword,
        CancellationToken cancellationToken = default)
    {
        var user =
            await _userManager.FindByIdAsync(
                userId)
            ?? throw new UnauthorizedAccessException(
                "User not found.");

        var result =
            await _userManager.ChangePasswordAsync(
                user,
                currentPassword,
                newPassword);

        if (!result.Succeeded)
        {
            var errors =
                string.Join(
                    ", ",
                    result.Errors.Select(
                        e => e.Description));

            throw new IdentityException(
                errors);
        }
    }
}