namespace ECommerce.Application.Features.Products.DTOs
{
    public sealed record ProductListDto(
        int Id,
        string Name,
        decimal Price,
        int StockQuantity,
        bool IsActive
    );
}