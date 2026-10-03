namespace ECommerce.Application.Features.Carts.DTOs;

public sealed record CartDto(
    int Id,
    IReadOnlyCollection<CartItemDto> Items,
    decimal Subtotal
);