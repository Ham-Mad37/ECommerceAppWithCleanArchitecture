using MediatR;

namespace ECommerce.Application.Features.Orders.CreateOrder
{
    public sealed record CreateOrderCommand : IRequest<int>;
}