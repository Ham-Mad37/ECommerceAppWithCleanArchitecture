using ECommerce.Application.Features.Orders.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Orders.Admin.GetOrderForAdmin
{
    public sealed record GetOrderForAdminQuery(int OrderId) : IRequest<AdminOrderDto>;
}

