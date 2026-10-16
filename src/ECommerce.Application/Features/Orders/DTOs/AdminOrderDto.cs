namespace ECommerce.Application.Features.Orders.DTOs
{
    public sealed record CustomerSummaryDto(int Id, string Name, string Email);

    public sealed record AdminOrderDto(OrderDto Order, CustomerSummaryDto Customer);
}