namespace ECommerce.Application.Features.Orders.GetOrderById;

using ECommerce.Application.Features.Orders.DTOs;
using MediatR;

public sealed record GetOrderByIdQuery(int OrderId)
: IRequest<OrderDto>;