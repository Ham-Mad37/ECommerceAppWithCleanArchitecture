using ECommerce.Application.Common.Exceptions;
using ECommerce.Application.Common.Interfaces;
using MediatR;

namespace ECommerce.Application.Features.Products.Commands.DeleteProductImage
{
   

    public sealed class DeleteProductImageCommandHandler : IRequestHandler<DeleteProductImageCommand>
    {
        private readonly IProductRepository _productRepository;
        private readonly IProductImageStorage _storage;
        private readonly IUnitOfWork _unitOfWork;

        public DeleteProductImageCommandHandler(
            IProductRepository productRepository,
            IProductImageStorage storage,
            IUnitOfWork unitOfWork)
        {
            _productRepository = productRepository;
            _storage = storage;
            _unitOfWork = unitOfWork;
        }

        public async Task Handle(DeleteProductImageCommand request, CancellationToken cancellationToken)
        {
            var product = await _productRepository.GetByIdWithImagesAsync(request.ProductId, cancellationToken)
                ?? throw new NotFoundException($"Product with ID {request.ProductId} was not found.");

            if (product.Images.All(i => i.Id != request.ImageId))
                throw new NotFoundException($"Image with ID {request.ImageId} was not found.");

            var fileName = product.RemoveImage(request.ImageId);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // Delete the file only after the database change succeeded.
            await _storage.DeleteAsync(fileName, cancellationToken);
        }
    }
}