using FluentValidation;

namespace ECommerce.Application.Features.Categories.Command.CreateCategory
{
    public sealed class CreateCategoryCommandValidator :AbstractValidator<CreateCategoryCommand>
    {
        public CreateCategoryCommandValidator()
        {
            RuleFor(x => x.name)
            .NotEmpty()
            .MaximumLength(100);
        }
    }
}