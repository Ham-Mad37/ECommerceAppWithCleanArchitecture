using ECommerce.Application.Common.Exceptions;
using ECommerce.Application.Common.Interfaces;
using MediatR;

namespace ECommerce.Application.Features.Categories.Command.ActivateCategory
{
    public sealed class ActivateCategoryCommandHandler : IRequestHandler<ActivateCategoryCommand>
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly IUnitOfWork _unitOfWork;
        public ActivateCategoryCommandHandler(ICategoryRepository categoryRepository,IUnitOfWork unitOfWork)
        {
            _categoryRepository = categoryRepository;
            _unitOfWork = unitOfWork;
        }
        public async Task Handle(ActivateCategoryCommand request, CancellationToken cancellationToken)
        {
            var category = await _categoryRepository.GetByIdAsync(request.id, cancellationToken);
            if (category is null)
                throw new NotFoundException($"Category with ID {request.id} was not found. ");
            category.Activate();
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
    }
}