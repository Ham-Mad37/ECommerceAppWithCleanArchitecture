using FluentValidation;

namespace ECommerce.Application.Features.Products.Commands.DeactivateProduct
{
    public sealed class DesactivateProductCommandValidator:AbstractValidator<DeactivateProductComman>
    {
        public DesactivateProductCommandValidator()
        {
            RuleFor(x => x.id)
            .GreaterThan(0);
        }
    }
}