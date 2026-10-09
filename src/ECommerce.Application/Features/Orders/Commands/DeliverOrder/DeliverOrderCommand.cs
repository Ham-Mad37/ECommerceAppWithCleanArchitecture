using MediatR;

namespace ECommerce.Application.Features.Orders.Commands.DeliverOrder
{
    public sealed record DeliverOrderCommand(int OrderId) : IRequest;
}