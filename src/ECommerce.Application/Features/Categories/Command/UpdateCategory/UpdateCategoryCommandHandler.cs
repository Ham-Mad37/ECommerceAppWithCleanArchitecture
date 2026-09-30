using ECommerce.Application.Common.Exceptions;
using ECommerce.Application.Common.Interfaces;
using ECommerce.Domain.Entities.Categories;
using MediatR;

namespace ECommerce.Application.Features.Categories.Command.UpdateCategoryCommand
{
    public sealed class UpdateCategoryCommandHandler : IRequestHandler<UpdateCategoryCommand>
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly IUnitOfWork _unitOfWork;
        public UpdateCategoryCommandHandler(ICategoryRepository categoryRepository,IUnitOfWork unitOfWork)
        {
            _categoryRepository = categoryRepository;
            _unitOfWork = unitOfWork;
        }
        public async Task Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
        {
            var category = await _categoryRepository.GetByIdAsync(request.Id, cancellationToken);
            if (category is null)
            {
                throw new NotFoundException($"Category with Id{request.Id} is not found.");
            }
            var name = request.Name.Trim();

            var exist = await _categoryRepository.ExistsByNameAsync(request.Name, cancellationToken);

            if (exist && !string.Equals(category.Name, name, StringComparison.OrdinalIgnoreCase))
            {
                throw new ConflictException($"Category {name} already exists.");
            }
            category.Rename(name);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}