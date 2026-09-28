using ECommerce.Application.Common.Exceptions;
using ECommerce.Application.Common.Interfaces;
using MediatR;

namespace ECommerce.Application.Features.Products.Commands.DeactivateProduct
{
    public sealed class DeactivateProductCommandHandler : IRequestHandler<DeactivateProductComman>
    {
        private readonly IProductRepository _productRepository;
        private readonly IUnitOfWork _unitOfWork;
        public DeactivateProductCommandHandler(IProductRepository productRepository,IUnitOfWork unitOfWork)
        {
            _productRepository = productRepository;
            _unitOfWork = unitOfWork;
        }
        public async Task Handle(DeactivateProductComman request, CancellationToken cancellationToken)
        {
            var product = await _productRepository.GetByIdAsync(request.id,cancellationToken);
            if (product is null)
            {
                throw new NotFoundException($"Product with ID{request.id} was notfound. ");
            }
            product.Deactivate();
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}