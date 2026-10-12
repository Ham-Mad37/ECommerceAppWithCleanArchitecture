using ECommerce.Domain.Entities.Orders;

namespace ECommerce.Application.Features.Orders.DTOs
{
    public static class OrderDtoMapper
    {
        public static OrderDto ToDto(this Order order) => new(
            order.Id,
            order.CustomerId,
            order.Status.ToString(),
            order.SubTotal,
            order.ShippingCost,
            order.Discount,
            order.Total,
            order.CreatedAt,
            order.Items
                .Select(i => new OrderItemDto(i.ProductId, i.ProductName, i.UnitPrice, i.Quantity, i.LineTotal))
                .ToList(),
            order.ShippingAddress is null
                ? null
                : new ShippingAddressDto(
                    order.ShippingAddress.RecipientName,
                    order.ShippingAddress.Phone,
                    order.ShippingAddress.Line1,
                    order.ShippingAddress.Line2,
                    order.ShippingAddress.City,
                    order.ShippingAddress.State,
                    order.ShippingAddress.PostalCode,
                    order.ShippingAddress.Country),
            order.Payment is null
                ? null
                : new PaymentDto(
                    order.Payment.Method.ToString(),
                    order.Payment.Status.ToString(),
                    order.Payment.Amount,
                    order.Payment.Reference,
                    order.Payment.PaidAt));
    }
}