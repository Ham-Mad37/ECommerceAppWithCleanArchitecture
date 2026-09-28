using ECommerce.Application.Common.Modles;
using ECommerce.Application.Features.Products.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Products.Queries.GetProducts
{
    public sealed record GetProductsQuery(int pageNumber = 1, int pageSize = 10) : IRequest<PagedResult<ProductListDto>>;
}