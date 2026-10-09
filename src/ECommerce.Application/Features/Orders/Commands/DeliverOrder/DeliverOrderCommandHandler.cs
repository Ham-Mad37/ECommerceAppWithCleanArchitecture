
using ECommerce.Application.Common.Exceptions;
using ECommerce.Application.Common.Interfaces;
using MediatR;

namespace ECommerce.Application.Features.Orders.Commands.DeliverOrder
{
    public sealed class DeliverOrderCommandHandler : IRequestHandler<DeliverOrderCommand>
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IUnitOfWork _unitOfWork;

        public DeliverOrderCommandHandler(IOrderRepository  orderRepository,IUnitOfWork unitOfWork)
        {
            _orderRepository = orderRepository;
            _unitOfWork = unitOfWork;
        }
        public async Task Handle(DeliverOrderCommand request, CancellationToken cancellationToken)
        {
            var order = await _orderRepository.GetByIdForAdminAsync(request.OrderId, cancellationToken);

            if (order is null)
                throw new NotFoundException($"Order with ID {request.OrderId} was not found.");

            order.Deliver();

            await _unitOfWork.SaveChangesAsync();
        }
    }
}