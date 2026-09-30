using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Features.Categories.DTOs;
using ECommerce.Application.Features.Products.Queries.GetProducts;
using MediatR;

namespace ECommerce.Application.Features.Categories.Queries.GetCategoriesQuery
{
    public sealed class GetCategoriesQueryHandler : IRequestHandler<GetCategoriesQuery, IReadOnlyCollection<CategoryListDto>>
    {
        private readonly ICategoryRepository _categoryRepository;
        public GetCategoriesQueryHandler(ICategoryRepository categoryRepository)
        {
                _categoryRepository = categoryRepository;
        }
        async Task<IReadOnlyCollection<CategoryListDto>> IRequestHandler<GetCategoriesQuery, IReadOnlyCollection<CategoryListDto>>.Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
        {
            var categories = await _categoryRepository.GetAllAsync(cancellationToken);

            return categories.Select(catrgory => new CategoryListDto(
                catrgory.Id,
                catrgory.Name,
                catrgory.IsActive)).ToList();
            
        }
    }
}