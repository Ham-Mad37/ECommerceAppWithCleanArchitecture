using AutoMapper;
using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Modles;
using ECommerce.Application.Features.Products.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Products.Queries.GetProducts
{
    public sealed class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, PagedResult<ProductListDto>>
    {
        private readonly IProductRepository _productRepository;
        private readonly IMapper _mapper;
        public GetProductsQueryHandler(IProductRepository productRepository,IMapper mapper)
        {
            _productRepository = productRepository;
            _mapper = mapper;
        }
        public async Task<PagedResult<ProductListDto>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
        {
            var products = await _productRepository.GetPagedAsync(request.pageNumber, request.pageSize, cancellationToken);
            var totalCount = await _productRepository.GetCountAsync(cancellationToken);

            var items = _mapper.Map<IReadOnlyCollection<ProductListDto>>(products);

            return new PagedResult<ProductListDto>(
                items,
                request.pageNumber,
                request.pageSize,
                totalCount
            );
        }
    }
}