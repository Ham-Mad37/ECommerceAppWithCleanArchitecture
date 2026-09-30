using ECommerce.Application.Common.Exceptions;
using ECommerce.Application.Common.Interfaces;
using MediatR;

namespace ECommerce.Application.Features.Products.Commands.ActivateProduct
{
    public sealed class ActivateProductCommandHandler : IRequestHandler<ActivateProductCommand>
    {
        private readonly IProductRepository _productRepository;
        private readonly IUnitOfWork _unitOfWork;
        public ActivateProductCommandHandler(IProductRepository productRepository,IUnitOfWork unitOfWork)
        {
            _productRepository = productRepository;
            _unitOfWork = unitOfWork;
        }
        public async Task Handle(ActivateProductCommand request, CancellationToken cancellationToken)
        {
            var product = await _productRepository.GetByIdAsync(request.id);
            if (product is null)
            {
                throw new NotFoundException($"Prduct with ID{request.id} was not found.");
            }
            product.Activate();
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}