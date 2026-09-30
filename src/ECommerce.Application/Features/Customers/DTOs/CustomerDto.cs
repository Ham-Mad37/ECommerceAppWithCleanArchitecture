namespace ECommerce.Application.Features.Customers.DTOs
{
    public sealed record CustomerDto(
        int Id,
        string FirstName,
        string LastName,
        string Email,
        bool IsActive,
        DateTime CreatedAt,
        DateTime UpdatedAt
    );
}