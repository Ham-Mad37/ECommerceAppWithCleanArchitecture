using ECommerce.Application.Common.Exceptions;
using ECommerce.Application.Common.Interfaces;
using MediatR;

namespace ECommerce.Application.Features.Orders.Commands.ConfirmPayment
{
    public sealed class ConfirmPaymentCommandHandler : IRequestHandler<ConfirmPaymentCommand>
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IUnitOfWork _unitOfWork;

        public ConfirmPaymentCommandHandler(IOrderRepository orderRepository, IUnitOfWork unitOfWork)
        {
            _orderRepository = orderRepository;
            _unitOfWork = unitOfWork;
        }
        
        public async Task Handle(ConfirmPaymentCommand request, CancellationToken cancellationToken)
        {
            var order = await _orderRepository.GetByIdForAdminAsync(request.OrderId, cancellationToken)
                ?? throw new NotFoundException($"Order with ID {request.OrderId} was not found.");

            order.ConfirmPayment(request.Reference);

            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}