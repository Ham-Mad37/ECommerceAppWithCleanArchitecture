using MediatR;

namespace ECommerce.Application.Features.Orders.Commands.CancelOrder
{
    public sealed record CancelOrderCommand(int OrderId) : IRequest;
}