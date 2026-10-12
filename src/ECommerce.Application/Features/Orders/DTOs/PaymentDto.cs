namespace ECommerce.Application.Features.Orders.DTOs
{
    public sealed record PaymentDto(
        string Method,
        string Status,
        decimal Amount,
        string? Reference,
        DateTime? PaidAt);
}