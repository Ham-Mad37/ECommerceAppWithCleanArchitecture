using ECommerce.Application.Common.Exceptions;
using ECommerce.Application.Common.Interfaces;
using MediatR;

namespace ECommerce.Application.Features.Products.Commands.AdjustProductStock
{
    public sealed class AdjustProductStockCommandHandler : IRequestHandler<AdjustProductStockCommand>
    {
        private readonly IProductRepository _productRepository;
        private readonly IUnitOfWork _unitOfWork;

        public AdjustProductStockCommandHandler(IProductRepository productRepository,IUnitOfWork unitOfWork)
        {
            _productRepository = productRepository;
            _unitOfWork = unitOfWork;
        }
        public async Task Handle(AdjustProductStockCommand request, CancellationToken cancellationToken)
        {
            var product = await _productRepository.GetByIdForUpdateAsync(request.ProductId, cancellationToken);

            if (product is null)
                throw new NotFoundException($"Product With ID {request.ProductId} was not found.");


            if (request.Quantity > 0)
            {
                product.IncreaseStock(request.Quantity);
            }
            else if(request.Quantity<0)
            {
                product.DecreaseStock(checked(-request.Quantity));
            }
            else
            {
                throw new ConflictException("Stock adjustment quantity cannot be zero.");
            }
            await _unitOfWork.SaveChangesAsync(cancellationToken);

        }
    }
}