using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Features.Categories.DTOs;
using ECommerce.Application.Features.Products.Queries.GetProducts;
using MediatR;

namespace ECommerce.Application.Features.Categories.Queries.GetCategoriesQuery
{
    public sealed class GetCategoriesQueryHandler : IRequestHandler<GetCategoriesQuery, IReadOnlyCollection<CategoryListDto>>
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly ICurrentUser _currentUser;
        public GetCategoriesQueryHandler(ICategoryRepository categoryRepository,ICurrentUser currentUser)
        {
            _categoryRepository = categoryRepository;
            _currentUser = currentUser;
        }
        async Task<IReadOnlyCollection<CategoryListDto>> IRequestHandler<GetCategoriesQuery, IReadOnlyCollection<CategoryListDto>>.Handle(GetCategoriesQuery request, CancellationToken cancellationToken)
        {
            var categories = await _categoryRepository.GetAllAsync(cancellationToken);

            return categories
                .Where(c => c.IsActive || _currentUser.IsAdmin)
                .Select(c => new CategoryListDto(c.Id, c.Name, c.IsActive))
                .ToList();
            
        }
    }
}