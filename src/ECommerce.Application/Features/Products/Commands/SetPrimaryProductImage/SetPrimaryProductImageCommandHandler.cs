using ECommerce.Application.Common.Exceptions;
using ECommerce.Application.Common.Interfaces;
using MediatR;

namespace ECommerce.Application.Features.Products.Commands.SetPrimaryProductImage
{
    public sealed class SetPrimaryProductImageCommandHandler : IRequestHandler<SetPrimaryProductImageCommand>
    {
        private readonly IProductRepository _productRepository;
        private readonly IUnitOfWork _unitOfWork;

        public SetPrimaryProductImageCommandHandler(IProductRepository productRepository, IUnitOfWork unitOfWork)
        {
            _productRepository = productRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task Handle(SetPrimaryProductImageCommand request, CancellationToken cancellationToken)
        {
            var product = await _productRepository.GetByIdWithImagesAsync(request.ProductId, cancellationToken)
                ?? throw new NotFoundException($"Product with ID {request.ProductId} was not found.");

            if (product.Images.All(i => i.Id != request.ImageId))
                throw new NotFoundException($"Image with ID {request.ImageId} was not found.");

            product.SetPrimaryImage(request.ImageId);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}