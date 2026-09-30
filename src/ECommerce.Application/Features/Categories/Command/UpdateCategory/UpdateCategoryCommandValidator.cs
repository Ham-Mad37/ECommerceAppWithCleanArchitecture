using FluentValidation;

namespace ECommerce.Application.Features.Categories.Command.UpdateCategoryCommand
{
    public sealed class UpdateCategoryCommandValidator :AbstractValidator<UpdateCategoryCommand>
    {
        public UpdateCategoryCommandValidator()
        {
            RuleFor(x => x.Id)
            .GreaterThan(0);

            RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(100);
        }
    }
}