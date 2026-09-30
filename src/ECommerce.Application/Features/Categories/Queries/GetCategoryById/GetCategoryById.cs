using ECommerce.Application.Features.Categories.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Categories.Queries.GetCategoryById
{
    public sealed record GetCategoryByIdQuery(int id) : IRequest<CategoryDto>;

}