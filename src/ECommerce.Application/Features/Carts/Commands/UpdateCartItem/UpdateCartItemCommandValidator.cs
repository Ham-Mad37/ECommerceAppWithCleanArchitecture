
using FluentValidation;

namespace ECommerce.Application.Features.Carts.Commands.UpdateCartItem
{
    public sealed class UpdateCartItemCommandValidator : AbstractValidator<UpdateCartItemCommand>
    {
        public UpdateCartItemCommandValidator()
        {
            RuleFor(x => x.ProductId)
            .GreaterThan(0);

            RuleFor(x => x.Quantity)
            .GreaterThan(0);
        }
    }
}