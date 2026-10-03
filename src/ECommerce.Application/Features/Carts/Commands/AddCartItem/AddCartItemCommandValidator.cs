using FluentValidation;

namespace ECommerce.Application.Features.Carts.Commands.AddCartItem
{
    public sealed class AddCartItemCommandValidator : AbstractValidator<AddCartItemCommand>
    {
        public AddCartItemCommandValidator()
        {
            RuleFor(x => x.productId)
            .GreaterThan(0);
            
            RuleFor(x => x.Quantity)
            .GreaterThan(0);
        }
    }
}