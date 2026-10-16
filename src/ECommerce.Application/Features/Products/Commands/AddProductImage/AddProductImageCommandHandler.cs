using ECommerce.Application.Common.Exceptions;
using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Utilities;
using ECommerce.Application.Features.Products.DTOs;
using ECommerce.Domain.Entities.Products;
using FluentValidation;
using FluentValidation.Results;
using MediatR;

namespace ECommerce.Application.Features.Products.Commands.AddProductImage
{
    public sealed class AddProductImageCommandHandler : IRequestHandler<AddProductImageCommand, ProductImageDto>
    {
        private readonly IProductRepository _productRepository;
        private readonly IProductImageStorage _storage;
        private readonly IUnitOfWork _unitOfWork;

        public AddProductImageCommandHandler(
            IProductRepository productRepository,
            IProductImageStorage storage,
            IUnitOfWork unitOfWork)
        {
            _productRepository = productRepository;
            _storage = storage;
            _unitOfWork = unitOfWork;
        }

        public async Task<ProductImageDto> Handle(AddProductImageCommand request, CancellationToken cancellationToken)
        {
            var product = await _productRepository.GetByIdWithImagesAsync(request.ProductId, cancellationToken)
                ?? throw new NotFoundException($"Product with ID {request.ProductId} was not found.");

            if (product.Images.Count >= Product.MaxImages)
                throw new ConflictException($"A product can have at most {Product.MaxImages} images.");

            // Trust the file's bytes, not its name or content type.
            var extension = ImageSignature.DetectExtension(request.Content);
            if (extension is null)
            {
                throw new ValidationException(new[]
                {
                    new ValidationFailure("file", "The file is not a valid JPEG, PNG or WebP image.")
                });
            }

            var storedName = await _storage.SaveAsync(request.Content, extension, cancellationToken);

            try
            {
                var image = product.AddImage(storedName);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                return new ProductImageDto(image.Id, _storage.GetUrl(image.FileName), image.IsPrimary, image.SortOrder);
            }
            catch
            {
                // Don't leave an orphan file behind if the database save failed.
                await _storage.DeleteAsync(storedName, CancellationToken.None);
                throw;
            }
        }
    }
}