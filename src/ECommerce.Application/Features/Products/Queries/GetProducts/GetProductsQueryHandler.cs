using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.Common.Modles;
using ECommerce.Application.Features.Products.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Products.Queries.GetProducts
{
    public sealed class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, PagedResult<ProductListDto>>
    {
        private readonly IProductRepository _productRepository;
        private readonly ICurrentUser _currentUser;
        private readonly IProductImageStorage _storage;

        public GetProductsQueryHandler(
            IProductRepository productRepository,
            ICurrentUser currentUser,
            IProductImageStorage storage)
        {
            _productRepository = productRepository;
            _currentUser = currentUser;
            _storage = storage;
        }

        public async Task<PagedResult<ProductListDto>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
        {
            // Visitors and customers only ever see active products.
            bool? isActive = _currentUser.IsAdmin ? request.IsActive : true;

            var filter = new ProductFilter(
                request.Search,
                request.CategoryId,
                isActive,
                request.SortBy,
                request.SortDirection
            );

            var products = await _productRepository.GetPagedAsync(
                filter,
                request.pageNumber,
                request.pageSize,
                cancellationToken);

            var totalCount = await _productRepository.GetCountAsync(filter, cancellationToken);

            IReadOnlyCollection<ProductListDto> items = products
                .Select(p => p.ToListDto(_storage))
                .ToList();

            return new PagedResult<ProductListDto>(
                items,
                request.pageNumber,
                request.pageSize,
                totalCount
            );
        }
    }
}