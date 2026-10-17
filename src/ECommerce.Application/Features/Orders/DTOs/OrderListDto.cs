namespace ECommerce.Application.Features.Orders.DTOs
{
    public sealed record OrderListDto(
        int Id,
        int CustomerId,
        string CustomerName,
        string CustomerEmail,
        string Status,
        decimal Total,
        DateTime CreatedAt,
        PaymentListDto? Payment
    );
}