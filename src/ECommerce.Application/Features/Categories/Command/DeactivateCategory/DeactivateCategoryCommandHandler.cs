using ECommerce.Application.Common.Exceptions;
using ECommerce.Application.Common.Interfaces;
using MediatR;

namespace ECommerce.Application.Features.Categories.Command.DeactivateCategory
{
    public sealed class DeactivateCategoryCommandHandler : IRequestHandler<DeactivateCategoryCommand>
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly IUnitOfWork _unitOfWork;
        public DeactivateCategoryCommandHandler(ICategoryRepository categoryRepository,IUnitOfWork unitOfWork)
        {
            _categoryRepository = categoryRepository;
            _unitOfWork = unitOfWork;
        }
        public async Task Handle(DeactivateCategoryCommand request, CancellationToken cancellationToken)
        {
            var category = await _categoryRepository.GetByIdAsync(request.id,cancellationToken);

            if (category is null)
                throw new NotFoundException($"Category with ID {request.id} was not Found");
            category.Deactivate();
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}