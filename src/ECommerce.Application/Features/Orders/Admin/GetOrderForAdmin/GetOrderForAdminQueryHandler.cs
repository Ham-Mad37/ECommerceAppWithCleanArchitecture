using ECommerce.Application.Common.Exceptions;
using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Features.Orders.DTOs;
using ECommerce.Application.Features.Orders.Admin.GetOrderForAdmin;
using MediatR;

namespace ECommerce.Application.Features.Orders.Admin.GetOrderForAdmin
{
    public sealed class GetOrderForAdminQueryHandler : IRequestHandler<GetOrderForAdminQuery, AdminOrderDto>
    {
        private readonly IOrderRepository _orderRepository;
        private readonly ICustomerRepository _customerRepository;

        public GetOrderForAdminQueryHandler(IOrderRepository orderRepository, ICustomerRepository customerRepository)
        {
            _orderRepository = orderRepository;
            _customerRepository = customerRepository;
        }

        public async Task<AdminOrderDto> Handle(GetOrderForAdminQuery request, CancellationToken cancellationToken)
        {
            var order = await _orderRepository.GetByIdForAdminAsync(request.OrderId, cancellationToken)
                ?? throw new NotFoundException($"Order with ID {request.OrderId} was not found.");

            var customer = await _customerRepository.GetByIdAsync(order.CustomerId, cancellationToken)
                ?? throw new NotFoundException($"Customer with ID {order.CustomerId} was not found.");

            return new AdminOrderDto(
                order.ToDto(),
                new CustomerSummaryDto(customer.Id, $"{customer.FirstName} {customer.LastName}", customer.Email));
        }
    }
}