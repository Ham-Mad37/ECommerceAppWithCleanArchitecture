using ECommerce.Application.Common.Exceptions;
using ECommerce.Application.Common.Interfaces;
using MediatR;

namespace ECommerce.Application.Features.Orders.Commands.CancelOrder
{
    public sealed class CancelOrderCommandHandler : IRequestHandler<CancelOrderCommand>
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IProductRepository _productRepository;
        private readonly ICurrentUser _currentUser;
        private readonly IUnitOfWork _unitOfWork;

        public CancelOrderCommandHandler(IOrderRepository orderRepository,
            IProductRepository productRepository,
            ICurrentUser currentUser,
            IUnitOfWork unitOfWork)
        {
            _orderRepository = orderRepository;
            _productRepository = productRepository;
            _currentUser = currentUser;
            _unitOfWork = unitOfWork;
        }
        public async Task Handle(CancelOrderCommand request, CancellationToken cancellationToken)
        {
            if (!_currentUser.IsAuthenticated)
                throw new UnauthorizedAccessException();

            if (_currentUser.CustomerId is null)
                throw new UnauthorizedAccessException(
                    "The authenticated user is not associated with a customer.");

            var customerId = _currentUser.CustomerId.Value;

            var order = await _orderRepository.GetByIdForUpdateAsync(request.OrderId,
                customerId,
                cancellationToken);

            if (order is null)
                throw new NotFoundException($"Order with ID {request.OrderId} was not found");

            await _unitOfWork.ExecuteInTransactionAsync(async () =>
            {
                foreach (var orderItem in order.Items)
                {
                    var product = await _productRepository.GetByIdForUpdateAsync(orderItem.ProductId, cancellationToken);

                    if (product is null)
                    {
                        throw new NotFoundException(
                            $"Product with id {orderItem.ProductId} was not found.");
                    }

                    product.IncreaseStock(orderItem.Quantity);
                }

                order.Cancel();

                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }, cancellationToken);
        }

    }
}