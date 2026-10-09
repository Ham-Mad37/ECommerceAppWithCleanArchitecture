using ECommerce.Application.Common.Exceptions;
using ECommerce.Application.Common.Interfaces;
using MediatR;

namespace ECommerce.Application.Features.Orders.Commands.ShipOrder
{
    public sealed class ShipOrderCommandHandler : IRequestHandler<ShipOrderCommand>
    {
        private readonly IOrderRepository _orderRepository;

        private readonly IUnitOfWork _unitOfWork;

        public ShipOrderCommandHandler(IOrderRepository orderRepository, IUnitOfWork unitOfWork)
        {
            _orderRepository = orderRepository;
            _unitOfWork = unitOfWork;
        }
        public async Task Handle(ShipOrderCommand request, CancellationToken cancellationToken)
        {
            var order = await _orderRepository.GetByIdForAdminAsync(request.OrderId, cancellationToken);
            if (order is null)
                throw new NotFoundException($"Order with ID {request.OrderId} was not found.");
            order.Ship();

            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}