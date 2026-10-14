namespace ECommerce.Application.Features.Dashboard.DTOs;
public sealed record LowStockProductDto(
        int ProductId,
        string Name,
        string CategoryName,
        int StockQuantity);