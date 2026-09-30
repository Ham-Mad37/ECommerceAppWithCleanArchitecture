using ECommerce.Application.Common.Exceptions;
using ECommerce.Application.Common.Interfaces;
using ECommerce.Domain.Entities.Categories;
using MediatR;

namespace ECommerce.Application.Features.Categories.Command.CreateCategory
{
    public sealed class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, int>
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly IUnitOfWork _unitOfWork;
        public CreateCategoryCommandHandler(ICategoryRepository categoryRepository,IUnitOfWork unitOfWork)
        {
            _categoryRepository = categoryRepository;
            _unitOfWork = unitOfWork;
        }
        public async Task<int> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
        {
            var name = request.name.Trim();
            var exists = await _categoryRepository.ExistsByNameAsync(name, cancellationToken);
            if (exists)
            {
                throw new ConflictException($"Category'{name}' alread exists.");
            }
            var category = Category.Create(name);
            await _categoryRepository.AddAsync(category, cancellationToken);

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return category.Id;
        }
    }
}