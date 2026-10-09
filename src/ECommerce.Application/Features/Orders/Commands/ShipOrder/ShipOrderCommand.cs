using MediatR;

namespace ECommerce.Application.Features.Orders.Commands.ShipOrder
{
    public sealed record ShipOrderCommand(int OrderId) : IRequest;
}