namespace ECommerce.Application.Features.Orders.Admin.GetAllOrders;

using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Modles;
using ECommerce.Application.Features.Orders.DTOs;
using MediatR;
public sealed class GetAllOrdersQueryHandler : IRequestHandler<GetAllOrdersQuery, PagedResult<OrderListDto>>
{
    private readonly IOrderRepository _orderRepository;

    public GetAllOrdersQueryHandler(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }

    public async Task<PagedResult<OrderListDto>> Handle(GetAllOrdersQuery request, CancellationToken cancellationToken)
    {
        var orders = await _orderRepository.GetAdminOrdersAsync(
           request.Page,
           request.PageSize,
           request.Status,
           request.CustomerId,
           request.From,
           request.To,
           cancellationToken);

        return orders;
    }
}