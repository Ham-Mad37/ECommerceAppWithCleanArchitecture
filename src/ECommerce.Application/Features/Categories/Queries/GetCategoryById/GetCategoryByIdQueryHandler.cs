using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Features.Categories.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Categories.Queries.GetCategoryById
{
    public sealed class GetCategoryByIdQueryHandler : IRequestHandler<GetCategoryByIdQuery, CategoryDto?>
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly ICurrentUser _currentUser;
        public GetCategoryByIdQueryHandler(ICategoryRepository categoryRepository,ICurrentUser currentUser)
        {
            _categoryRepository = categoryRepository;
            _currentUser = currentUser;
        }
        public async Task<CategoryDto?> Handle(GetCategoryByIdQuery request, CancellationToken cancellationToken)
        {
            var category = await _categoryRepository.GetByIdAsync(request.id, cancellationToken);
            if (category is null || (!category.IsActive && !_currentUser.IsAdmin))
                return null;
            return new CategoryDto(
                category.Id,
                category.Name,
                category.IsActive,
                category.CreatedAt,
                category.UpdatedAt
            );
        }
    }
}