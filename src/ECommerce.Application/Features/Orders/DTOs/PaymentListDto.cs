namespace ECommerce.Application.Features.Orders.DTOs;

public sealed record PaymentListDto(
    string Method,
    string Status,
    decimal Amount,
    string? Reference
);