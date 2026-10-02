using System.ComponentModel.DataAnnotations;
using ECommerce.Application.Common.Exceptions;
using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Features.Authentication.DTOs;
using ECommerce.Domain.Entities.Customers;
using ECommerce.Infrastructure.Data;
using ECommerce.Infrastructure.Identity.Jwt;
using Microsoft.AspNetCore.Identity;

public sealed class AuthenticationService : IAuthenticationService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly AppDbContext _dbContext;

    public AuthenticationService(UserManager<ApplicationUser> userManager, IJwtTokenService jwtTokenService, AppDbContext dbContext)
    {
        _userManager = userManager;
        _jwtTokenService = jwtTokenService;
        _dbContext = dbContext;
    }

    public async Task RegisterAsync(string firstName, string lastName, string email, string password, CancellationToken cancellationToken = default)
    {
        email = email.ToLowerInvariant();
        var emailExists = await _userManager.FindByEmailAsync(email);
        if (emailExists != null)
        {
            throw new ConflictException("A user with this email already exists.");
        }
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            //1.Create customer 
            var customer = Customer.Create(firstName, lastName, email);
            await _dbContext.Customers.AddAsync(customer, cancellationToken);

            // We need Customer.Id before creating ApplicationUser.
            await _dbContext.SaveChangesAsync(
                cancellationToken);

            // 2. Create Identity User
            var user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                CustomerId = customer.Id
            };

            var result = await _userManager.CreateAsync(user, password);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new IdentityException($"Failed to create user: {errors}");
            }
            //3. Everything succeeded
            await transaction.CommitAsync(cancellationToken);

        }
        catch
        {
            // If Customer or Identity creation fails,
            // rollback everything.
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }

    }

    //login
    public async Task<LoginResponseDto> LoginAsync(
      string email,
      string password,
      CancellationToken cancellationToken = default)
    {
        email = email.Trim().ToLowerInvariant();

        var user = await _userManager.FindByEmailAsync(email);

        if (user is null)
        {
            throw new UnauthorizedAccessException(
                "Invalid email or password.");
        }

        if (!user.EmailConfirmed)
        {
            // We will remove this check for now because
            // email confirmation is not implemented yet.
        }
        var passwordValid = await _userManager.CheckPasswordAsync(
            user,
            password);

        if (!passwordValid)
        {
            throw new UnauthorizedAccessException(
                "Invalid email or password.");
        }

        if (user.CustomerId is null)
        {
            throw new IdentityException(
                "The user is not associated with a customer.");
        }

        var token = await _jwtTokenService.GenerateTokenAsync(
            user.Id,
            user.Email!,
            user.CustomerId,
            cancellationToken);

        return token;
    }
}