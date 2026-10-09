using ECommerce.Application.Common.Exceptions;
using ECommerce.Application.Common.Interfaces;
using MediatR;

namespace ECommerce.Application.Features.Orders.Commands.StartProcessingOrder
{
    public sealed class StartProcessingOrderCommandHandler : IRequestHandler<StartProcessingOrderCommand>
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IUnitOfWork _unitOfWork;

        public StartProcessingOrderCommandHandler(IOrderRepository orderRepository,IUnitOfWork unitOfWork)
        {
            _orderRepository = orderRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task Handle(StartProcessingOrderCommand request, CancellationToken cancellationToken)
        {
            var order = await _orderRepository.GetByIdForAdminAsync(request.OrderId, cancellationToken);
            if (order is null)
                throw new NotFoundException($"Order with ID {request.OrderId} was not found.");
            order.StartProcessing();

            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}