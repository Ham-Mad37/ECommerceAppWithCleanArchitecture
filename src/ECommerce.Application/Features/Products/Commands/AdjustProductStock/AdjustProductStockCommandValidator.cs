using System.Data;
using FluentValidation;

namespace ECommerce.Application.Features.Products.Commands.AdjustProductStock
{
    public sealed class AdjustProductStockCommandValidator :AbstractValidator<AdjustProductStockCommand>
    {
        public AdjustProductStockCommandValidator()
        {
            RuleFor(x => x.ProductId)
            .GreaterThan(0);

            RuleFor(x => x.Quantity)
            .NotEqual(0)
            .WithMessage("Stock adjustment quantity cannot be zero.");
        }
    }
}