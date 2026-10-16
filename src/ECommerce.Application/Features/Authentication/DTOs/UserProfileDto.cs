namespace ECommerce.Application.Features.Authentication.DTOs
{
    public sealed record UserProfileDto(
        string UserId,
        string Email,
        string? FirstName,
        string? LastName,
        int? CustomerId,
        IReadOnlyList<string> Roles
    );
}