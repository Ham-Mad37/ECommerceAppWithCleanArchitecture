namespace ECommerce.Application.Features.Orders.DTOs
{
    public sealed record OrderDto(
        int Id,
        int CustomerId,
        string Status,
        decimal SubTotal,
        decimal ShippingCost,
        decimal Discount,
        decimal Total,
        DateTime CreatedAt,
        IReadOnlyCollection<OrderItemDto> items,
        ShippingAddressDto? ShippingAddress = null,
        PaymentDto? Payment = null
    );
}