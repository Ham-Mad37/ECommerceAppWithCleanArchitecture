using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Features.Orders.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Orders.Queries.GetOrder;

public sealed class GetOrdersQueryHandler : IRequestHandler<GetOrdersQuery, IReadOnlyList<OrderDto>>
{
    private readonly IOrderRepository _orderRepository;
    private readonly ICurrentUser _currentUser;
    
public GetOrdersQueryHandler(IOrderRepository orderRepository,ICurrentUser currentUser)
{
        _orderRepository = orderRepository;
        _currentUser = currentUser;
}
     public async Task<IReadOnlyList<OrderDto>> Handle(GetOrdersQuery request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated)
            throw new UnauthorizedAccessException();

        if (_currentUser.CustomerId is null)
            throw new UnauthorizedAccessException(
                "The authenticated user is not associated with a customer.");
                
        var orders = await _orderRepository.GetByCustomerIdAsync(
            _currentUser.CustomerId.Value, cancellationToken
        );

        return orders.Select(order => order.ToDto()).ToList();
    }
}