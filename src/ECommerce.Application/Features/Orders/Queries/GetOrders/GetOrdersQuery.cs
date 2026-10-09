using ECommerce.Application.Features.Orders.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Orders.Queries.GetOrder
{
    public sealed record GetOrdersQuery : IRequest<IReadOnlyList<OrderDto>>;
}