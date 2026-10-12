using MediatR;

namespace ECommerce.Application.Features.Orders.Commands.ConfirmPayment
{
    public sealed record ConfirmPaymentCommand(int OrderId, string? Reference) : IRequest;
}