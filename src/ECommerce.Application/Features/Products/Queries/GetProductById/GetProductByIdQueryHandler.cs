using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Features.Products.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Products.Queries.GetProductById
{
    public sealed class GetProductByIdQueryHandler : IRequestHandler<GetProductByIdQuery, ProductDto?>
    {
        private readonly IProductRepository _productRepository;
        private readonly ICurrentUser _currentUser;
        private readonly IProductImageStorage _storage;

        public GetProductByIdQueryHandler(
            IProductRepository productRepository,
            ICurrentUser currentUser,
            IProductImageStorage storage)
        {
            _productRepository = productRepository;
            _currentUser = currentUser;
            _storage = storage;
        }

        public async Task<ProductDto?> Handle(GetProductByIdQuery request, CancellationToken cancellationToken)
        {
            var product = await _productRepository.GetByIdWithDetailsAsync(request.id, cancellationToken);

            if (product is null || (!product.IsActive && !_currentUser.IsAdmin))
                return null;

            return product.ToDto(_storage);
        }
    }
}