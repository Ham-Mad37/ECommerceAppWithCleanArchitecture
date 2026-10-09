namespace ECommerce.Application.Features.Orders.DTOs
{
    public sealed record OrderItemDto(
        int ProductId,
        string ProductName,
        decimal UnitPrice,
        int Quantity,
        decimal LineTotal
    );
}