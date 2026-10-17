using ECommerce.Application.Common.Exceptions;
using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Features.Orders.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Orders.GetOrderById;

public sealed class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, OrderDto>
{
    private readonly IOrderRepository _orderRepository;
    private readonly ICurrentUser _currentUser;

    public GetOrderByIdQueryHandler(IOrderRepository orderRepository,ICurrentUser currentUser)
    {
        _orderRepository = orderRepository;
        _currentUser = currentUser;        
    }

    public async Task<OrderDto> Handle(GetOrderByIdQuery request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsAuthenticated)
            throw new UnauthorizedAccessException();

        if (_currentUser.CustomerId is null)
            throw new UnauthorizedAccessException(
                "The authenticated user is not associated with a customer.");
        var order = await _orderRepository.GetByIdAsync(request.OrderId, cancellationToken);

        if (order is null)
            throw new NotFoundException($"Order with ID {request.OrderId} was not found");

        return order.ToDto();
    }
}