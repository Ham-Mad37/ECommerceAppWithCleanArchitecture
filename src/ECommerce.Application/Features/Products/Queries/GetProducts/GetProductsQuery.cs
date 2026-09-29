using ECommerce.Application.Common.Modles;
using ECommerce.Application.Features.Products.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Products.Queries.GetProducts
{
    public sealed record GetProductsQuery(
        int pageNumber = 1,
        int pageSize = 10,
        string? Search = null,
        int? CategoryId = null,
         bool? IsActive = null,
        string SortBy = "id",
        string SortDirection = "asc"
    ) : IRequest<PagedResult<ProductListDto>>;
}