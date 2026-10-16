namespace ECommerce.Application.Features.Carts.DTOs;

public sealed record CartItemDto(
    int ProductId,
    string ProductName,
    decimal UnitPrice,
    int Quantity,
    decimal LineTotal,
    string? ImageUrl,
    int AvailableStock
);