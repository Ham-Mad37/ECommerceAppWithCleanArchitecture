using ECommerce.Application.Features.Categories.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Categories.Queries.GetCategoriesQuery
{
    public sealed record GetCategoriesQuery : IRequest<IReadOnlyCollection<CategoryListDto>>;
}