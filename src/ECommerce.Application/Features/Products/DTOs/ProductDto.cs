namespace ECommerce.Application.Features.Products.DTOs
{
    public sealed record ProductDto(
        int Id,
        string Name,
        string? Description,
        decimal Price,
        int StockQuantity,
        int CategoryId,
        bool IsActive,
        DateTime CreatedAt,
        DateTime UpdatedAt
    );
}