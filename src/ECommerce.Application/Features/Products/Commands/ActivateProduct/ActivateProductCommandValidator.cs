using FluentValidation;

namespace ECommerce.Application.Features.Products.Commands.ActivateProduct
{
    public sealed class ActivateProductCommandValidator : AbstractValidator<ActivateProductCommand>
    {
        public ActivateProductCommandValidator()
        {
            RuleFor(x => x.id)
            .GreaterThan(0);
        }
    }
}