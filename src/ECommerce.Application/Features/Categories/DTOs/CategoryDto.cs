namespace ECommerce.Application.Features.Categories.DTOs
{
    public sealed record CategoryDto(
        int Id,
        string Name,
        bool IsActive,
        DateTime CreatedAt,
        DateTime UpdatedAt
    );
}